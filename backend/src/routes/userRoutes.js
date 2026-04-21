const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { 
  getMe, 
  updateMe, 
  deleteProfilePhoto, 
  deleteAccount, 
  upgradeAccount,
  getAllUsers,
  updateUserRole,
  deleteUserById
} = require("../controllers/userController");

// All routes are protected (require login)
router.use(protect);

router.get("/me", getMe);
router.put("/me", upload.single("profilePhoto"), updateMe);
router.delete("/me/photo", deleteProfilePhoto);
router.delete("/me", deleteAccount);
router.put("/upgrade", upgradeAccount);

// ==========================================
// ADMIN ROUTES
// ==========================================
router.get("/", authorizeRoles("ADMIN"), getAllUsers);
router.put("/:id/role", authorizeRoles("ADMIN"), updateUserRole);
router.delete("/:id", authorizeRoles("ADMIN"), deleteUserById);

module.exports = router;