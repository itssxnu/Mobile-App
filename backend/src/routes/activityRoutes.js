const express = require('express');
const router = express.Router();
const {
    createActivity,
    getActivities,
    getActivityById,
    updateActivity,
    deleteActivity
} = require('../controllers/activityController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const uploadActivityImage = require('../middleware/activityUploadMiddleware');

router.route('/')
    .get(getActivities)
    .post(protect, authorizeRoles('ADMIN', 'PROVIDER'), uploadActivityImage.single('actionShot'), createActivity);

router.route('/:id')
    .get(getActivityById)
    .put(protect, authorizeRoles('ADMIN', 'PROVIDER'), uploadActivityImage.single('actionShot'), updateActivity)
    .delete(protect, authorizeRoles('ADMIN', 'PROVIDER'), deleteActivity);

module.exports = router;
