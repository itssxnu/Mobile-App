const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { createCloudinaryStorage } = require('../config/cloudinaryConfig');

// Configure storage
const storage = createCloudinaryStorage('attractions');

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
  }
};

const attractionUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for landscape photos
  fileFilter: fileFilter,
});

module.exports = attractionUpload;
