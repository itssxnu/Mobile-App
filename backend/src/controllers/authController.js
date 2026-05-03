const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require('crypto');
const { 
  sendVerificationEmail,
  sendLoginVerificationEmail,
  sendResendVerificationEmail,
  sendPasswordResetEmail
} = require("../utils/sendEmail");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    let profilePhoto = null;
    if (req.file) {
      profilePhoto = req.file.path;
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If the existing user is unverified, delete and let them re-register
      if (!existingUser.isVerified) {
        await User.deleteOne({ _id: existingUser._id });
      } else {
        return res.status(409).json({ message: "An account with this email already exists." });
      }
    }

    // NOTE: Email verification is disabled because Render free tier blocks outbound SMTP.
    // Users are auto-verified on registration. To re-enable:
    //   1. Set isVerified: false below
    //   2. Uncomment the sendVerificationEmail block
    //   3. Update frontend to handle 'unverified: true' response
    const user = await User.create({
      name, email, password, phone, profilePhoto,
      isVerified: true   // Auto-verify — no OTP email required
    });

    /* --- RE-ENABLE EMAIL VERIFICATION WHEN SMTP IS AVAILABLE ---
    const otp = user.generateVerificationOtp();
    await user.save({ validateBeforeSave: false });
    try {
      await sendVerificationEmail(user.email, otp);
      return res.status(201).json({
        success: true,
        message: "Registration successful! Please verify your email.",
        email: user.email,
        unverified: true
      });
    } catch (err) {
      console.error("Email could not be sent:", err);
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: "Registration failed: could not send verification email." });
    }
    --- END EMAIL VERIFICATION BLOCK --- */

    // Auto-verified: return token immediately so user can log in straight away
    res.status(201).json({
      success: true,
      message: "Registration successful! You can now log in.",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        providerType: user.providerType,
        profilePhoto: user.profilePhoto,
      },
    });

  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Check if user is verified
      if (!user.isVerified) {
        const otp = user.generateVerificationOtp();
        await user.save({ validateBeforeSave: false });

        try {
          await sendLoginVerificationEmail(user.email, otp);
          return res.status(403).json({
            success: false,
            message: "Email not verified. A new code has been sent to your email.",
            unverified: true,
            email: user.email
          });
        } catch (err) {
          return res.status(500).json({ message: "Could not send verification email." });
        }
      }

      res.json({
        success: true,
        message: "Login successful",
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          providerType: user.providerType,
          profilePhoto: user.profilePhoto,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @desc    Verify Email via OTP
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const otpString = String(otp).trim();
    const hashedOtp = crypto.createHash("sha256").update(otpString).digest("hex");

    const user = await User.findOne({
      email,
      verificationOtp: hashedOtp,
      verificationOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully!",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        providerType: user.providerType,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @desc    Resend Verification OTP
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified." });
    }

    const otp = user.generateVerificationOtp();
    await user.save({ validateBeforeSave: false });

    await sendResendVerificationEmail(user.email, otp);

    res.json({ success: true, message: "Verification code resent." });
  } catch (err) {
    console.error("Resend verify error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// --- STUBS FOR OTHER MEMBERS ---
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    // Generate reset token using the method in User schema
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    try {
      // Bypassing SMTP for Render free tier demo
      // await sendPasswordResetEmail(user.email, resetToken);

      res.status(200).json({
        success: true,
        message: "Demo Mode: Use this token to reset your password",
        token: resetToken // Exposing token for the demo PWA
      });
    } catch (err) {
      console.error("Email could not be sent:", err);
      // Reset the tokens if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: "Email could not be sent. Please check SMTP configuration." });
    }

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

const resetPassword = async (req, res) => {
  try {
    // Hash the URL token to match against the DB
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been updated successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: "No ID token provided." });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    let isNewUser = false;
    if (!user) {
      // Create new user automatically
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(16).toString("hex"), // Random secure password
        profilePhoto: picture,
        isVerified: true, // Google accounts are implicitly verified
        phone: "" // Needs phone setup
      });
      isNewUser = true;
    }

    // Determine if phone number is missing
    const missingPhone = !user.phone || user.phone.trim() === "";

    res.status(200).json({
      success: true,
      message: "Google login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        providerType: user.providerType,
        profilePhoto: user.profilePhoto,
      },
      missingPhone
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid Google token." });
  }
};

module.exports = { registerUser, loginUser, verifyEmail, resendVerification, forgotPassword, resetPassword, googleLogin };

