const express = require('express');
const router = express.Router();
const {
    createHomestay,
    getHomestays,
    getHomestayById,
    updateHomestay,
    deleteHomestay
} = require('../controllers/homestayController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const uploadHomestayImage = require('../middleware/homestayUploadMiddleware');

router.route('/')
    .get(getHomestays)
    .post(protect, authorizeRoles('ADMIN', 'PROVIDER'), uploadHomestayImage.single('propertyCoverPhoto'), createHomestay);

router.route('/:id')
    .get(getHomestayById)
    .put(protect, authorizeRoles('ADMIN', 'PROVIDER'), uploadHomestayImage.single('propertyCoverPhoto'), updateHomestay)
    .delete(protect, authorizeRoles('ADMIN', 'PROVIDER'), deleteHomestay);

module.exports = router;
