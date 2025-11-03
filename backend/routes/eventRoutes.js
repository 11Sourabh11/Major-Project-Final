const express = require('express');
const router = express.Router();
const {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    addAttendee
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

// Event routes
router.post('/', authorize('photographer', 'admin'), createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.put('/:id', authorize('photographer', 'admin'), updateEvent);
router.delete('/:id', authorize('photographer', 'admin'), deleteEvent);
router.post('/:id/attendees', addAttendee);

module.exports = router;