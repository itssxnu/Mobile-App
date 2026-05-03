const multer = require("multer");
const { createCloudinaryStorage, imageFileFilter } = require('../config/cloudinaryConfig');

const storage = createCloudinaryStorage('profiles');

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

module.exports = upload;