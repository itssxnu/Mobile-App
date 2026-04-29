const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const attractionUpload = require("../middleware/attractionUploadMiddleware");
const {
  createAttraction,
  getAttractions,
  getAttraction,
  updateAttraction,
  deleteAttraction,
} = require("../controllers/attractionController");

router
  .route("/")
  .get(getAttractions)
  .post(protect, attractionUpload.single("photo"), createAttraction);

router
  .route("/:id")
  .get(getAttraction)
  .put(protect, updateAttraction)
  .delete(protect, deleteAttraction);

module.exports = router;
