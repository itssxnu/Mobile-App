const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    role: {
      type: String,
      enum: ["USER", "PROVIDER", "ADMIN"],
      default: "USER",
    },
    providerType: {
      type: String,
      enum: ["HOST", "GUIDE", "ACTIVITY", "EVENT", "ATTRACTION"],
      required: function() { return this.role === 'PROVIDER'; }
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOtp: String,
    verificationOtpExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.generateVerificationOtp = function () {
  // Generate a 6 digit random number
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash it before saving to DB
  this.verificationOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Set expiry to 10 minutes
  this.verificationOtpExpire = Date.now() + 10 * 60 * 1000;

  return otp; // Return plain text OTP to send via email
};

module.exports = mongoose.model("User", userSchema);
