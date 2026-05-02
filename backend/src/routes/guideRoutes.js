const express = require('express');
const router = express.Router();
const {
    createGuide,
    getGuides,
    getGuideById,
    updateGuide,
    deleteGuide
} = require('../controllers/guideController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const uploadGuideImage = require('../middleware/guideUploadMiddleware');

router.route('/')
    .get(getGuides)
    .post(protect, authorizeRoles('ADMIN', 'PROVIDER'), uploadGuideImage.single('profileHeadshot'), createGuide);

router.route('/:id')
    .get(getGuideById)
    .put(protect, authorizeRoles('ADMIN', 'PROVIDER'), uploadGuideImage.single('profileHeadshot'), updateGuide)
    .delete(protect, authorizeRoles('ADMIN', 'PROVIDER'), deleteGuide);

module.exports = router;
