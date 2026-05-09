const express = require("express");
const router  = express.Router();
const auth    = require("../../middleware/auth");
const upload  = require("../../middleware/upload");
const db      = require("../../config/db");

// ── GET /api/found-items?search=&category=&status=&page=&limit= ──
router.get("/", async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `SELECT fi.*, u.name AS reporter_name
               FROM found_items fi
               JOIN users u ON fi.user_id = u.id
               WHERE 1=1`;
    const params = [];

    if (search && search.trim()) {
      const like = `%${search.trim()}%`;
      sql += " AND (fi.title LIKE ? OR fi.description LIKE ? OR fi.category LIKE ? OR fi.location_found LIKE ?)";
      params.push(like, like, like, like);
    }
    if (category) { sql += " AND fi.category = ?";  params.push(category); }
    if (status)   { sql += " AND fi.status = ?";    params.push(status);   }
    sql += ` ORDER BY fi.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(sql, params);

    let countSql = "SELECT COUNT(*) AS total FROM found_items fi WHERE 1=1";
    const countParams = [];
    if (search && search.trim()) {
      const like = `%${search.trim()}%`;
      countSql += " AND (fi.title LIKE ? OR fi.description LIKE ? OR fi.category LIKE ? OR fi.location_found LIKE ?)";
      countParams.push(like, like, like, like);
    }
    if (category) { countSql += " AND fi.category = ?"; countParams.push(category); }
    if (status)   { countSql += " AND fi.status = ?";   countParams.push(status);   }
    const [[{ total }]] = await db.query(countSql, countParams);

    res.json({ items: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
});

// ── POST /api/found-items ─────────────────────────────────────────
router.post("/", auth, upload.single("image"), async (req, res, next) => {
  try {
    const { title, description, category, location_found, date_found } = req.body;

    if (!title || !title.trim())
      return res.status(400).json({ error: "title is required" });

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [r] = await db.query(
      `INSERT INTO found_items
         (user_id, title, description, category, location_found, date_found, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        description?.trim() || null,
        category      || null,
        location_found?.trim() || null,
        date_found    || null,
        image_url,
      ]
    );

    await db.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?,?,?,?)",
      [req.user.id, "ITEM_REPORTED_FOUND", "found_items", r.insertId]
    );

    const io = req.app.get("io");
    if (io) { io.emit("items:changed"); io.emit("stats:changed"); io.emit("activity:changed"); }

    // Trigger async matching
    setImmediate(() => {
      try {
        const { runMatchingEngine } = require("../../services/matchingEngine");
        runMatchingEngine();
      } catch (_) {}
    });

    res.status(201).json({ id: r.insertId, message: "Found item reported successfully", image_url });
  } catch (err) {
    if (req.file) {
      const fs = require("fs"), path = require("path");
      fs.unlink(path.join(__dirname, "..", "..", "uploads", req.file.filename), () => {});
    }
    next(err);
  }
});

// ── GET /api/found-items/:id ──────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT fi.*, u.name AS reporter_name, u.email AS reporter_email
       FROM found_items fi
       JOIN users u ON fi.user_id = u.id
       WHERE fi.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Found item not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ── PUT /api/found-items/:id ──────────────────────────────────────
router.put("/:id", auth, async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT user_id FROM found_items WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    if (rows[0].user_id !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    const { title, description, category, location_found, date_found } = req.body;
    await db.query(
      `UPDATE found_items SET
         title          = COALESCE(?, title),
         description    = COALESCE(?, description),
         category       = COALESCE(?, category),
         location_found = COALESCE(?, location_found),
         date_found     = COALESCE(?, date_found)
       WHERE id = ?`,
      [title?.trim() || null, description?.trim() || null, category || null,
       location_found?.trim() || null, date_found || null, req.params.id]
    );

    const io = req.app.get("io");
    if (io) { io.emit("items:changed"); }
    res.json({ message: "Updated" });
  } catch (err) { next(err); }
});

// ── DELETE /api/found-items/:id ───────────────────────────────────
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT user_id, image_url FROM found_items WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    if (rows[0].user_id !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    if (rows[0].image_url) {
      const fs = require("fs"), path = require("path");
      fs.unlink(path.join(__dirname, "..", "..", rows[0].image_url), () => {});
    }

    await db.query("DELETE FROM found_items WHERE id = ?", [req.params.id]);
    await db.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?,?,?,?)",
      [req.user.id, "ITEM_DELETED_FOUND", "found_items", req.params.id]
    );

    const io = req.app.get("io");
    if (io) { io.emit("items:changed"); io.emit("stats:changed"); io.emit("activity:changed"); }
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
});

module.exports = router;
