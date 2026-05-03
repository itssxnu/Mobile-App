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
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            // format: async (req, file) => 'jpeg', // auto-format
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        },
    });
};

module.exports = {
    cloudinary,
    createCloudinaryStorage,
};
