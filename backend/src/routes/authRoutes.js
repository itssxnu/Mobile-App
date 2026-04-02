const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/authController");

// POST /api/auth/register
router.post("/register", registerUser);

// NOTE: POST /api/auth/login  → to be implemented by the Login team member
// NOTE: GET  /api/auth/me     → to be implemented (protected route)

module.exports = router;
