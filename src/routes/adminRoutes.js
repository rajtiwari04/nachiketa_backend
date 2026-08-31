const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const { Blog, Contact, Payment, Membership } = require('../models/index');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin', 'superadmin'));

// @desc Dashboard analytics
router.get('/analytics', async (req, res) => {
  const [
    totalUsers, totalEvents, totalBlogs,
    activeMembers, totalRevenue, newContacts,
    upcomingEvents, recentPayments,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Event.countDocuments(),
    Blog.countDocuments({ status: 'published' }),
    User.countDocuments({ isMember: true }),
    Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Contact.countDocuments({ status: 'new' }),
    Event.find({ status: 'upcoming' }).select('title date registeredCount maxSeats').sort('date').limit(5),
    Payment.find({ status: 'paid' }).sort('-createdAt').limit(10).populate('user', 'name email'),
  ]);

  res.json({
    success: true,
    analytics: {
      totalUsers,
      totalEvents,
      totalBlogs,
      activeMembers,
      totalRevenue: totalRevenue[0]?.total || 0,
      newContacts,
      upcomingEvents,
      recentPayments,
    },
  });
});

// @desc Monthly revenue chart data
router.get('/revenue-chart', async (req, res) => {
  const data = await Payment.aggregate([
    { $match: { status: 'paid', createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  res.json({ success: true, data });
});

module.exports = router;
