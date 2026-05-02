const express = require('express');
const router = express.Router();
const {
    createReview,
    getReviewsByTarget,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const uploadReviewImage = require('../middleware/reviewUploadMiddleware');

router.route('/')
    .post(protect, uploadReviewImage.single('reviewPhoto'), createReview);

router.route('/:targetId')
    .get(getReviewsByTarget);

router.route('/:id')
    .put(protect, uploadReviewImage.single('reviewPhoto'), updateReview)
    .delete(protect, deleteReview);

module.exports = router;
