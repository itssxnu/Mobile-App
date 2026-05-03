const User = require("../models/User");
const { cloudinary } = require('../config/cloudinaryConfig');

// Helper to extract Cloudinary public_id from a URL
const getPublicId = (url) => {
  if (!url || !url.includes('cloudinary')) return null;
  const parts = url.split('/');
  const filename = parts.pop().split('.')[0];
  const folder = parts.slice(parts.indexOf('upload') + 2).join('/');
  return folder ? `${folder}/${filename}` : filename;
};

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
    const { name, phone } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    
    // Handle profile photo upload
    if (req.file) {
      // Delete old photo from Cloudinary if exists
      const oldUser = await User.findById(req.user.id);
      if (oldUser.profilePhoto) {
        const publicId = getPublicId(oldUser.profilePhoto);
        if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
      updates.profilePhoto = req.file.path;
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
      const publicId = getPublicId(user.profilePhoto);
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});
      user.profilePhoto = null;
      await user.save();
    }
    res.status(200).json({ success: true, message: "Profile photo deleted" });
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user account permanently
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete profile photo from Cloudinary if it exists
    if (user.profilePhoto) {
      const publicId = getPublicId(user.profilePhoto);
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({ success: true, message: "User account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upgrade account to Provider
const upgradeAccount = async (req, res) => {
  try {
    const { providerType } = req.body;
    
    if (!providerType) {
      return res.status(400).json({ message: "Provider type is required" });
    }

    const validTypes = ["HOST", "GUIDE", "ACTIVITY", "EVENT"];
    if (!validTypes.includes(providerType.toUpperCase())) {
      return res.status(400).json({ message: "Invalid provider type" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "PROVIDER") {
      return res.status(400).json({ message: "User is already a provider" });
    }

    user.role = "PROVIDER";
    user.providerType = providerType.toUpperCase();
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Successfully upgraded to Provider",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        providerType: user.providerType,
        profilePhoto: user.profilePhoto,
      }
    });
  } catch (error) {
    console.error("Upgrade account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role, providerType } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validRoles = ["USER", "PROVIDER", "ADMIN"];
    if (!validRoles.includes(role?.toUpperCase())) {
      return res.status(400).json({ message: "Invalid role" });
    }

    user.role = role.toUpperCase();
    
    if (user.role === "PROVIDER") {
      const validTypes = ["HOST", "GUIDE", "ACTIVITY", "EVENT"];
      if (!validTypes.includes(providerType?.toUpperCase())) {
        return res.status(400).json({ message: "Invalid provider type" });
      }
      user.providerType = providerType.toUpperCase();
    } else {
      user.providerType = undefined;
    }

    await user.save();
    
    res.status(200).json({ success: true, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      providerType: user.providerType
    }});
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user (by Admin)
const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete profile photo from Cloudinary if it exists
    if (user.profilePhoto) {
      const publicId = getPublicId(user.profilePhoto);
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ success: true, message: "User physically deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  getMe, 
  updateMe, 
  deleteProfilePhoto, 
  deleteAccount, 
  upgradeAccount,
  getAllUsers,
  updateUserRole,
  deleteUserById
};