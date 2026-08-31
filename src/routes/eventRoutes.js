const express = require('express');
const router = express.Router();
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  registerFree, getRegistrations, markAttendance,
} = require('../controllers/eventController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getEvents);
router.get('/:slug', optionalAuth, getEvent);

router.post('/', protect, authorize('admin', 'superadmin'), createEvent);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateEvent);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteEvent);

router.post('/:id/register', protect, registerFree);
router.get('/:id/registrations', protect, authorize('admin', 'superadmin'), getRegistrations);
router.patch('/:id/attendance/:ticketId', protect, authorize('admin', 'superadmin'), markAttendance);

module.exports = router;
