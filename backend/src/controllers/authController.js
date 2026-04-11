const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Make sure JWT_SECRET is available
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "Yes" : "No");

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in .env file");
  }
  return jwt.sign({ id: userId }, secret, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let profilePhoto = "";
    if (req.file) {
      profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password, profilePhoto });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

<<<<<<< HEAD
// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);
      
      res.json({
        success: true,
        message: "Login successful",
        token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
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

module.exports = { registerUser, loginUser };
=======
// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        // Verify token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID // Need this in .env later
        });

        const { email, name, picture } = ticket.getPayload();

        // Find existing user
        let user = await User.findOne({ email });

        if (!user) {
            // Generate a random password since they use Google
            const randomPassword = crypto.randomBytes(16).toString('hex');

            user = await User.create({
                name,
                email,
                password: randomPassword,
                profilePhoto: picture
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePhoto: user.profilePhoto,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};

module.exports = { registerUser };
>>>>>>> 9bcf77f5edade3ed4ebc57a8a96a4f1e0e2b6634
