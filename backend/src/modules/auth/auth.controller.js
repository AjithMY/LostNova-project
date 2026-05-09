const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const db = require("../../config/db");

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

/* ── REGISTER ─────────────────────────────────────────── */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;

    // Block duplicate emails
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) return res.status(409).json({ error: "Email already registered" });

    // Only allow 'student' or 'staff' via self-registration (admin must be set manually)
    const safeRole = ["student", "staff"].includes(role) ? role : "student";

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, hash, safeRole]
    );

    const user = { id: result.insertId, name, email, role: safeRole };
    const token = signToken(user);

    // Log activity
    await db.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?,?,?,?)",
      [user.id, "USER_REGISTERED", "users", user.id]
    );

    res.status(201).json({ token, user });
  } catch (err) { next(err); }
};

/* ── LOGIN ────────────────────────────────────────────── */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // Log login
    await db.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address) VALUES (?,?,?,?,?)",
      [user.id, "USER_LOGIN", "users", user.id, req.ip]
    );

    const { password_hash, ...safeUser } = user;
    res.json({ token: signToken(safeUser), user: safeUser });
  } catch (err) { next(err); }
};

/* ── GET CURRENT USER ─────────────────────────────────── */
const getMe = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, avatar_url, is_verified, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe };
