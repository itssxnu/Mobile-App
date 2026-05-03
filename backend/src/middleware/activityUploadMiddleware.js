const multer = require('multer');
const path = require('path');

const { createCloudinaryStorage } = require('../config/cloudinaryConfig');

const storage = createCloudinaryStorage('activities');

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const uploadActivityImage = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = uploadActivityImage;
