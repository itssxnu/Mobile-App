const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically (multer standard)
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./src/routes/authRoutes"));

app.use("/api/users", require("./src/routes/userRoutes"));
// app.use("/api/users", require("./src/routes/userRoutes")); // COMMENT THIS OUT FOR NOW

// TODO: Add module routes below as each team member completes their slice
app.use("/api/homestays",  require("./src/routes/homestayRoutes"));
app.use("/api/attractions", require("./src/routes/attractionRoutes"));
// app.use("/api/guides", require("./src/routes/guideRoutes"));
app.use("/api/activities", require("./src/routes/activityRoutes"));
// app.use("/api/events", require("./src/routes/eventRoutes"));
app.use("/api/reviews", require("./src/routes/reviewRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "HD Resorts API running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Caught:", err);
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});