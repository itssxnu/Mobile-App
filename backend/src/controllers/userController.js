const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// Get current user profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update current user profile
const updateMe = async (req, res) => {
  try {
    const { name } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    
    // Handle profile photo upload
    if (req.file) {
      // Delete old photo if exists
      const oldUser = await User.findById(req.user.id);
      if (oldUser.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, "../uploads/profiles/", path.basename(oldUser.profilePhoto));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      updates.profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");
    
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete profile photo
const deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.profilePhoto) {
      const photoPath = path.join(__dirname, "../uploads/profiles/", path.basename(user.profilePhoto));
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
      user.profilePhoto = null;
      await user.save();
    }
    res.status(200).json({ success: true, message: "Profile photo deleted" });
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMe, updateMe, deleteProfilePhoto };