const express = require("express");
const router  = express.Router();
const auth    = require("../../middleware/auth");
const upload  = require("../../middleware/upload");
const db      = require("../../config/db");

// ── GET /api/lost-items?search=&category=&status=&page=&limit= ──
router.get("/", async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `SELECT li.*, u.name AS reporter_name
               FROM lost_items li
               JOIN users u ON li.user_id = u.id
               WHERE 1=1`;
    const params = [];

    if (search && search.trim()) {
      // Use LIKE for short terms (FULLTEXT needs >= 4 chars minimum word length)
      const term = search.trim();
      sql += " AND (li.title LIKE ? OR li.description LIKE ? OR li.category LIKE ? OR li.location_lost LIKE ?)";
      const like = `%${term}%`;
      params.push(like, like, like, like);
    }
    if (category) { sql += " AND li.category = ?"; params.push(category); }
    if (status)   { sql += " AND li.status = ?";   params.push(status);   }
    sql += ` ORDER BY li.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(sql, params);

    // Count for pagination
    let countSql = "SELECT COUNT(*) AS total FROM lost_items li WHERE 1=1";
    const countParams = [];
    if (search && search.trim()) {
      const like = `%${search.trim()}%`;
      countSql += " AND (li.title LIKE ? OR li.description LIKE ? OR li.category LIKE ? OR li.location_lost LIKE ?)";
      countParams.push(like, like, like, like);
    }
    if (category) { countSql += " AND li.category = ?"; countParams.push(category); }
    if (status)   { countSql += " AND li.status = ?";   countParams.push(status);   }
    const [[{ total }]] = await db.query(countSql, countParams);

    res.json({ items: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
});

// ── POST /api/lost-items ──────────────────────────────────────────
router.post("/", auth, upload.single("image"), async (req, res, next) => {
  try {
    const { title, description, category, location_lost, date_lost } = req.body;

    if (!title || !title.trim())
      return res.status(400).json({ error: "title is required" });

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [r] = await db.query(
      `INSERT INTO lost_items
         (user_id, title, description, category, location_lost, date_lost, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        description?.trim() || null,
        category     || null,
        location_lost?.trim() || null,
        date_lost    || null,
        image_url,
      ]
    );

    await db.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?,?,?,?)",
      [req.user.id, "ITEM_REPORTED_LOST", "lost_items", r.insertId]
    );

    const io = req.app.get("io");
    if (io) { io.emit("items:changed"); io.emit("stats:changed"); io.emit("activity:changed"); }

    // Trigger async match for this specific item
    setImmediate(() => {
      try {
        const { runMatchingEngine } = require("../../services/matchingEngine");
        runMatchingEngine();
      } catch (_) {}
    });

    res.status(201).json({ id: r.insertId, message: "Lost item reported successfully", image_url });
  } catch (err) {
    if (req.file) {
      const fs = require("fs"), path = require("path");
      fs.unlink(path.join(__dirname, "..", "..", "uploads", req.file.filename), () => {});
    }
    next(err);
  }
});

// ── GET /api/lost-items/:id ───────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT li.*, u.name AS reporter_name, u.email AS reporter_email
       FROM lost_items li
       JOIN users u ON li.user_id = u.id
       WHERE li.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Lost item not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ── PUT /api/lost-items/:id ───────────────────────────────────────
router.put("/:id", auth, async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT user_id FROM lost_items WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    if (rows[0].user_id !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    const { title, description, category, location_lost, date_lost } = req.body;
    await db.query(
      `UPDATE lost_items SET
         title         = COALESCE(?, title),
         description   = COALESCE(?, description),
         category      = COALESCE(?, category),
         location_lost = COALESCE(?, location_lost),
         date_lost     = COALESCE(?, date_lost)
       WHERE id = ?`,
      [title?.trim() || null, description?.trim() || null, category || null,
       location_lost?.trim() || null, date_lost || null, req.params.id]
    );

    const io = req.app.get("io");
    if (io) { io.emit("items:changed"); }
    res.json({ message: "Updated" });
  } catch (err) { next(err); }
});

// ── DELETE /api/lost-items/:id ────────────────────────────────────
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT user_id, image_url FROM lost_items WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    if (rows[0].user_id !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    if (rows[0].image_url) {
      const fs = require("fs"), path = require("path");
      fs.unlink(path.join(__dirname, "..", "..", rows[0].image_url), () => {});
    }

    await db.query("DELETE FROM lost_items WHERE id = ?", [req.params.id]);
    await db.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?,?,?,?)",
      [req.user.id, "ITEM_DELETED_LOST", "lost_items", req.params.id]
    );

    const io = req.app.get("io");
    if (io) { io.emit("items:changed"); io.emit("stats:changed"); io.emit("activity:changed"); }
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
});

module.exports = router;
