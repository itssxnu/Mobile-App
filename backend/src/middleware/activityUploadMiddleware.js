const multer = require('multer');
const { createCloudinaryStorage, imageFileFilter } = require('../config/cloudinaryConfig');

const storage = createCloudinaryStorage('activities');

const uploadActivityImage = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFileFilter,
});

module.exports = uploadActivityImage;
