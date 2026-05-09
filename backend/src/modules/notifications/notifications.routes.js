const express = require("express");
const router  = express.Router();
const auth    = require("../../middleware/auth");
const db      = require("../../config/db");

// GET /api/notifications/unread-count  ← MUST be before /:id routes
router.get("/unread-count", auth, async (req, res, next) => {
  try {
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0",
      [req.user.id]
    );
    res.json({ count: Number(count) });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/mark-all-read  ← MUST be before /:id routes
router.patch("/mark-all-read", auth, async (req, res, next) => {
  try {
    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
      [req.user.id]
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) { next(err); }
});

// GET /api/notifications
router.get("/", auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", auth, async (req, res, next) => {
  try {
    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Marked as read" });
  } catch (err) { next(err); }
});

module.exports = router;
