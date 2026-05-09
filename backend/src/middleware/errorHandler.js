const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  // Multer file size exceeded
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({ error: "File too large. Maximum size is 5 MB." });
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  // Custom file type errors from fileFilter
  if (err.status === 400 && err.message.includes("image"))
    return res.status(400).json({ error: err.message });

  // JWT errors
  if (err.name === "JsonWebTokenError")
    return res.status(401).json({ error: "Invalid token" });
  if (err.name === "TokenExpiredError")
    return res.status(401).json({ error: "Token expired" });

  // MySQL duplicate entry
  if (err.code === "ER_DUP_ENTRY")
    return res.status(409).json({ error: "Duplicate entry" });

  // MySQL FK constraint
  if (err.code === "ER_NO_REFERENCED_ROW_2")
    return res.status(400).json({ error: "Referenced record does not exist" });

  // Generic 500
  console.error("[ERROR]", err.message || err);
  const isDev = process.env.NODE_ENV !== "production";
  res.status(err.status || 500).json({
    error: isDev ? err.message : "An unexpected error occurred",
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
