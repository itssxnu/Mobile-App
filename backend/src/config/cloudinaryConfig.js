const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a generic storage factory for different folders
const createCloudinaryStorage = (folderName) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `hd-resorts/${folderName}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        },
    });
};

// Permissive file filter — accepts any image mimetype.
// Cloudinary validates the format on its end.
// The strict extname check breaks blobs uploaded from the web browser.
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream') {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Factory that creates a ready-to-use multer instance for a given folder
const createUploader = (folderName, fieldConfig) => {
    return multer({
        storage: createCloudinaryStorage(folderName),
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        fileFilter: imageFileFilter,
    });
};

module.exports = {
    cloudinary,
    createCloudinaryStorage,
    imageFileFilter,
    createUploader,
};
