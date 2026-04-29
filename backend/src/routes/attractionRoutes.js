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
  .post(
    protect,
    attractionUpload.fields([
      { name: "coverPhoto", maxCount: 1 },
      { name: "additionalPhotos", maxCount: 10 },
    ]),
    createAttraction
  );

router
  .route("/:id")
  .get(getAttraction)
  .put(protect, updateAttraction)
  .delete(protect, deleteAttraction);

module.exports = router;
