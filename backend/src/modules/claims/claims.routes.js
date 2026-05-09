const express = require("express");
const router  = express.Router();
const auth    = require("../../middleware/auth");
const role    = require("../../middleware/role");
const db      = require("../../config/db");

// POST /api/claims  — submit a claim for a match
router.post("/", auth, async (req, res, next) => {
  try {
    const { match_id, message } = req.body;
    if (!match_id) return res.status(400).json({ error: "match_id is required" });

    // Verify match exists
    const [match] = await db.query("SELECT * FROM matches WHERE id = ?", [match_id]);
    if (!match.length) return res.status(404).json({ error: "Match not found" });

    const [r] = await db.query(
      "INSERT INTO claims (match_id, claimant_id, message, status) VALUES (?,?,?,'pending')",
      [match_id, req.user.id, message || null]
    );
    await db.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?,?,?,?)",
      [req.user.id, "CLAIM_SUBMITTED", "claims", r.insertId]
    );

    const io = req.app.get("io");
    if (io) { io.emit("claims:changed"); io.emit("activity:changed"); }

    res.status(201).json({ id: r.insertId, message: "Claim submitted successfully" });
  } catch (err) { next(err); }
});

// GET /api/claims  — admin: all claims; user: their own claims
router.get("/", auth, async (req, res, next) => {
  try {
    let sql, params;
    if (req.user.role === "admin") {
      sql = `SELECT c.*, u.name AS claimant_name, u.email AS claimant_email,
                    li.title AS lost_title, fi.title AS found_title
             FROM claims c
             JOIN users u        ON c.claimant_id    = u.id
             JOIN matches m      ON c.match_id        = m.id
             JOIN lost_items li  ON m.lost_item_id   = li.id
             JOIN found_items fi ON m.found_item_id  = fi.id
             ORDER BY c.created_at DESC`;
      params = [];
    } else {
      sql = `SELECT c.*, li.title AS lost_title, fi.title AS found_title
             FROM claims c
             JOIN matches m      ON c.match_id        = m.id
             JOIN lost_items li  ON m.lost_item_id   = li.id
             JOIN found_items fi ON m.found_item_id  = fi.id
             WHERE c.claimant_id = ?
             ORDER BY c.created_at DESC`;
      params = [req.user.id];
    }
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// PUT /api/claims/:id  — admin approves or rejects
router.put("/:id", auth, role("admin"), async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected'
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });

    const [rows] = await db.query("SELECT * FROM claims WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Claim not found" });

    await db.query(
      "UPDATE claims SET status = ?, reviewed_by = ? WHERE id = ?",
      [status, req.user.id, req.params.id]
    );

    // If approved, mark the lost + found items as recovered
    if (status === "approved") {
      const claim = rows[0];
      const [match] = await db.query("SELECT * FROM matches WHERE id = ?", [claim.match_id]);
      if (match.length) {
        await db.query("UPDATE lost_items  SET status = 'recovered' WHERE id = ?", [match[0].lost_item_id]);
        await db.query("UPDATE found_items SET status = 'recovered' WHERE id = ?", [match[0].found_item_id]);
        // Notify claimant
        await db.query(
          "INSERT INTO notifications (user_id, type, title, body) VALUES (?,?,?,?)",
          [claim.claimant_id, "claim", "Claim Approved! 🎉", "Your ownership claim has been verified and approved. Please collect your item."]
        );
      }
    }

    await db.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?,?,?,?)",
      [req.user.id, status === "approved" ? "CLAIM_APPROVED" : "CLAIM_REJECTED", "claims", req.params.id]
    );

    const io = req.app.get("io");
    if (io) {
      io.emit("claims:changed");
      io.emit("items:changed");
      io.emit("stats:changed");
      io.emit("activity:changed");
      // Notify the claimant in real-time
      if (rows[0].claimant_id) io.to(`user:${rows[0].claimant_id}`).emit("notifications:changed");
    }

    res.json({ message: `Claim ${status}` });
  } catch (err) { next(err); }
});

module.exports = router;
