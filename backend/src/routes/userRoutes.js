const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { getMe, updateMe, deleteProfilePhoto } = require("../controllers/userController");

// All routes are protected (require login)
router.use(protect);

router.get("/me", getMe);
router.put("/me", upload.single("profilePhoto"), updateMe);
router.delete("/me/photo", deleteProfilePhoto);

module.exports = router;