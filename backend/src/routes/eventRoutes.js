const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const uploadEventImage = require('../middleware/eventUploadMiddleware');

router.route('/')
    .get(getEvents)
    .post(protect, authorizeRoles('ADMIN', 'PROVIDER'), uploadEventImage.single('eventPoster'), createEvent);

router.route('/:id')
    .get(getEventById)
    .put(protect, authorizeRoles('ADMIN', 'PROVIDER'), uploadEventImage.single('eventPoster'), updateEvent)
    .delete(protect, authorizeRoles('ADMIN', 'PROVIDER'), deleteEvent);

module.exports = router;
