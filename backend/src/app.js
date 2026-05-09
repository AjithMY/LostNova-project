const express    = require("express");
const http       = require("http");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const rateLimit  = require("express-rate-limit");
const compression= require("compression");
const path       = require("path");
const { Server } = require("socket.io");
require("dotenv").config();

// ── Routes ──────────────────────────────────────────────
const authRoutes   = require("./modules/auth/auth.routes");
const lostRoutes   = require("./modules/lostItems/lostItems.routes");
const foundRoutes  = require("./modules/foundItems/foundItems.routes");
const matchRoutes  = require("./modules/matches/matches.routes");
const claimRoutes  = require("./modules/claims/claims.routes");
const notifRoutes  = require("./modules/notifications/notifications.routes");
const adminRoutes  = require("./modules/admin/admin.routes");
const errorHandler = require("./middleware/errorHandler");

const app    = express();
const server = http.createServer(app);

// ── Socket.IO ───────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  pingTimeout: 60000,
});

// Make io available to route handlers via req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Join user-specific room on auth
  socket.on("auth", (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`[Socket] ${socket.id} joined room user:${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ── Security ────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: "Too many requests, please slow down." },
}));

// ── Compression ─────────────────────────────────────────
app.use(compression());

// ── Body Parsing ────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ─────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// ── Static Files ─────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ── API Routes ───────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/lost-items",    lostRoutes);
app.use("/api/found-items",   foundRoutes);
app.use("/api/matches",       matchRoutes);
app.use("/api/claims",        claimRoutes);
app.use("/api/notifications", notifRoutes);
app.use("/api/admin",         adminRoutes);

// ── Health Check ──────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: "1.0.0", env: process.env.NODE_ENV });
});

// ── Public Stats (no auth needed for dashboard overview) ──
const db = require("./config/db");
app.get("/api/stats", async (req, res, next) => {
  try {
    const [[{ total_lost }]]      = await db.query("SELECT COUNT(*) AS total_lost FROM lost_items");
    const [[{ total_found }]]     = await db.query("SELECT COUNT(*) AS total_found FROM found_items");
    const [[{ total_recovered }]] = await db.query("SELECT COUNT(*) AS total_recovered FROM lost_items WHERE status = 'recovered'");
    const [[{ pending_matches }]] = await db.query("SELECT COUNT(*) AS pending_matches FROM matches WHERE status = 'pending'");
    res.json({ total_lost, total_found, total_recovered, pending_matches });
  } catch (err) { next(err); }
});

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 LostNova API  →  http://localhost:${PORT}`);
  console.log(`   Environment  :  ${process.env.NODE_ENV || "development"}`);
  console.log(`   Socket.IO    :  ✓ Active`);

  // ── AI Matching Engine (cron) ──────────────────────────
  if (process.env.NODE_ENV !== "test") {
    const { setIO } = require("./services/matchingEngine");
    setIO(io);
    console.log("   Match Engine :  ✓ Active (every 5 min)");
  }
});

module.exports = { app, server, io };
