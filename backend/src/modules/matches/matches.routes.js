const express = require("express");
const router  = express.Router();
const auth    = require("../../middleware/auth");
const db      = require("../../config/db");

// ── GET /api/matches — matches for logged-in user (lost OR found reporter) ──
router.get("/", auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*,
              m.ai_explanation,
              m.matched_at AS created_at,
              li.id        AS lost_item_id_ref,
              li.title     AS lost_title,
              li.category  AS lost_category,
              li.location_lost,
              li.description AS lost_description,
              li.date_lost,
              li.image_url AS lost_image,
              li.user_id   AS lost_reporter_id,
              fi.id        AS found_item_id_ref,
              fi.title     AS found_title,
              fi.category  AS found_category,
              fi.location_found,
              fi.description AS found_description,
              fi.date_found,
              fi.image_url AS found_image,
              fi.user_id   AS found_reporter_id,
              ul.name      AS lost_reporter_name,
              uf.name      AS found_reporter_name,
              (SELECT COUNT(*) FROM claims c WHERE c.match_id = m.id AND c.claimant_id = ?) AS user_has_claimed
       FROM matches m
       JOIN lost_items  li ON m.lost_item_id  = li.id
       JOIN found_items fi ON m.found_item_id = fi.id
       JOIN users ul ON li.user_id = ul.id
       JOIN users uf ON fi.user_id = uf.id
       WHERE li.user_id = ? OR fi.user_id = ?
       ORDER BY m.score DESC, m.matched_at DESC
       LIMIT 100`,
      [req.user.id, req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /api/matches/all — admin: all matches ────────────────────
router.get("/all", auth, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
    const [rows] = await db.query(
      `SELECT m.*,
              m.ai_explanation,
              li.title AS lost_title,  li.category AS lost_category,
              fi.title AS found_title, fi.category AS found_category,
              ul.name AS lost_reporter_name,
              uf.name AS found_reporter_name
       FROM matches m
       JOIN lost_items  li ON m.lost_item_id  = li.id
       JOIN found_items fi ON m.found_item_id = fi.id
       JOIN users ul ON li.user_id = ul.id
       JOIN users uf ON fi.user_id = uf.id
       ORDER BY m.score DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── POST /api/matches/:id/confirm — user confirms match ─────────
router.post("/:id/confirm", auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, li.user_id AS lost_owner, fi.user_id AS found_owner
       FROM matches m
       JOIN lost_items  li ON m.lost_item_id  = li.id
       JOIN found_items fi ON m.found_item_id = fi.id
       WHERE m.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Match not found" });
    const match = rows[0];
    const isOwner = match.lost_owner === req.user.id || match.found_owner === req.user.id;
    if (!isOwner && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    await db.query("UPDATE matches SET status = 'confirmed' WHERE id = ?", [req.params.id]);

    // Notify both parties
    const io = req.app.get("io");
    for (const uid of [match.lost_owner, match.found_owner]) {
      await db.query(
        "INSERT IGNORE INTO notifications (user_id, type, title, body) VALUES (?, 'match', ?, ?)",
        [uid, "Match Confirmed ✓", "A match has been confirmed. You can now submit an ownership claim."]
      );
      if (io) io.to(`user:${uid}`).emit("notifications:changed");
    }
    if (io) io.emit("matches:changed");

    res.json({ message: "Match confirmed" });
  } catch (err) { next(err); }
});

// ── POST /api/matches/:id/reject — user rejects match ───────────
router.post("/:id/reject", auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, li.user_id AS lost_owner, fi.user_id AS found_owner
       FROM matches m
       JOIN lost_items  li ON m.lost_item_id  = li.id
       JOIN found_items fi ON m.found_item_id = fi.id
       WHERE m.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Match not found" });
    const match = rows[0];
    const isOwner = match.lost_owner === req.user.id || match.found_owner === req.user.id;
    if (!isOwner && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    await db.query("UPDATE matches SET status = 'rejected' WHERE id = ?", [req.params.id]);

    const io = req.app.get("io");
    if (io) io.emit("matches:changed");

    res.json({ message: "Match rejected" });
  } catch (err) { next(err); }
});

// ── POST /api/matches/run — manually trigger matching engine (admin) ──
router.post("/run", auth, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
    const { runMatchingEngine } = require("../../services/matchingEngine");
    runMatchingEngine(); // fire and forget
    res.json({ message: "Matching engine triggered" });
  } catch (err) { next(err); }
});

module.exports = router;
