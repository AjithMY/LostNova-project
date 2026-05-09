const express = require("express");
const router  = express.Router();
const { body } = require("express-validator");
const { register, login, getMe } = require("./auth.controller");
const authMiddleware = require("../../middleware/auth");
const bcrypt = require("bcryptjs");
const db     = require("../../config/db");

router.post("/register", [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
], register);

router.post("/login", [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
], login);

router.get("/me", authMiddleware, getMe);

// ── PUT /api/auth/password — change own password ─────────────────
router.put("/password", authMiddleware, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ error: "current_password and new_password are required" });
    if (new_password.length < 8)
      return res.status(400).json({ error: "New password must be at least 8 characters" });

    const [rows] = await db.query("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

    const hash = await bcrypt.hash(new_password, 12);
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, req.user.id]);

    await db.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?,?,?,?)",
      [req.user.id, "PASSWORD_CHANGED", "users", req.user.id]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) { next(err); }
});

module.exports = router;
