const express = require("express");
const router  = express.Router();
const auth    = require("../../middleware/auth");
const role    = require("../../middleware/role");
const db      = require("../../config/db");

// ── GET /api/admin/stats (admin only) ────────────────────────────
router.get("/stats", auth, role("admin"), async (req, res, next) => {
  try {
    const [[{ total_lost }]]      = await db.query("SELECT COUNT(*) AS total_lost FROM lost_items");
    const [[{ total_found }]]     = await db.query("SELECT COUNT(*) AS total_found FROM found_items");
    const [[{ total_recovered }]] = await db.query("SELECT COUNT(*) AS total_recovered FROM lost_items WHERE status = 'recovered'");
    const [[{ total_matches }]]   = await db.query("SELECT COUNT(*) AS total_matches FROM matches");
    const [[{ pending_claims }]]  = await db.query("SELECT COUNT(*) AS pending_claims FROM claims WHERE status = 'pending'");
    const [[{ total_users }]]     = await db.query("SELECT COUNT(*) AS total_users FROM users");
    const [[{ high_conf }]]       = await db.query("SELECT COUNT(*) AS high_conf FROM matches WHERE score >= 70");

    res.json({
      total_lost,
      total_found,
      total_recovered,
      total_matches,
      pending_claims,
      total_users,
      high_confidence_matches: high_conf,
      recovery_rate: total_lost > 0 ? ((total_recovered / total_lost) * 100).toFixed(1) : "0",
    });
  } catch (err) { next(err); }
});

// ── GET /api/admin/users ─────────────────────────────────────────
router.get("/users", auth, role("admin"), async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.is_verified, u.created_at,
              COUNT(DISTINCT li.id) AS lost_count,
              COUNT(DISTINCT fi.id) AS found_count
       FROM users u
       LEFT JOIN lost_items  li ON li.user_id = u.id
       LEFT JOIN found_items fi ON fi.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /api/admin/activity (admin: all | user: own) ─────────────
router.get("/activity", auth, async (req, res, next) => {
  try {
    let sql, params;
    if (req.user.role === "admin") {
      sql = `SELECT al.*, u.name AS user_name, u.email AS user_email
             FROM activity_logs al
             LEFT JOIN users u ON al.user_id = u.id
             ORDER BY al.created_at DESC LIMIT 200`;
      params = [];
    } else {
      sql = `SELECT al.*, u.name AS user_name, u.email AS user_email
             FROM activity_logs al
             LEFT JOIN users u ON al.user_id = u.id
             WHERE al.user_id = ?
             ORDER BY al.created_at DESC LIMIT 100`;
      params = [req.user.id];
    }
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// ── PUT /api/admin/users/:id/role ────────────────────────────────
router.put("/users/:id/role", auth, role("admin"), async (req, res, next) => {
  try {
    const { role: newRole } = req.body;
    if (!["student", "staff", "admin"].includes(newRole))
      return res.status(400).json({ error: "Invalid role" });
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ error: "Cannot change your own role" });
    await db.query("UPDATE users SET role = ? WHERE id = ?", [newRole, req.params.id]);

    await db.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?,?,?,?)",
      [req.user.id, "USER_ROLE_CHANGED", "users", req.params.id]
    );
    res.json({ message: `Role updated to ${newRole}` });
  } catch (err) { next(err); }
});

// ── DELETE /api/admin/users/:id ──────────────────────────────────
router.delete("/users/:id", auth, role("admin"), async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ error: "Cannot delete your own account" });
    await db.query("UPDATE users SET is_verified = 0 WHERE id = ?", [req.params.id]);

    await db.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?,?,?,?)",
      [req.user.id, "USER_DEACTIVATED", "users", req.params.id]
    );
    res.json({ message: "User deactivated" });
  } catch (err) { next(err); }
});

// ── POST /api/admin/match/run — manual match trigger ─────────────
router.post("/match/run", auth, role("admin"), async (req, res, next) => {
  try {
    const { runMatchingEngine } = require("../../services/matchingEngine");
    runMatchingEngine();
    res.json({ message: "Match engine triggered" });
  } catch (err) { next(err); }
});

module.exports = router;
