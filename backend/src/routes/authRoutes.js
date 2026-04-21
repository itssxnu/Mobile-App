const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyEmail, resendVerification, forgotPassword, resetPassword, googleLogin } = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");

// POST /api/auth/register
router.post("/register", upload.single("profilePhoto"), registerUser);

// POST /api/auth/login (MEMBER 1)
router.post("/login", loginUser);

// OTP Verification endpoints
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/google", googleLogin);

module.exports = router;