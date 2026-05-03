const multer = require('multer');
const { createCloudinaryStorage, imageFileFilter } = require('../config/cloudinaryConfig');

const storage = createCloudinaryStorage('guides');

const uploadGuideImage = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFileFilter,
});

module.exports = uploadGuideImage;
