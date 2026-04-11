const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");

// POST /api/auth/register
router.post("/register", upload.single("profilePhoto"), registerUser);

// POST /api/auth/login (MEMBER 1)
router.post("/login", loginUser);

module.exports = router;