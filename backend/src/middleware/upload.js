const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// Ensure uploads directory exists (absolute path)
const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXT  = /\.(jpeg|jpg|png|webp)$/i;

const fileFilter = (req, file, cb) => {
  const extOk  = ALLOWED_EXT.test(path.extname(file.originalname));
  const mimeOk = ALLOWED_MIME.includes(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(Object.assign(new Error("Only JPG, PNG, and WebP images are allowed"), { status: 400 }), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;
