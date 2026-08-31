const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('registeredEvents', 'title date status slug banner');
  res.json({ success: true, user: user.toPublicJSON() });
});

router.put('/profile', protect, async (req, res) => {
  const allowed = ['name', 'phone', 'college', 'year', 'branch', 'rollNumber', 'bio', 'socialLinks', 'avatar'];
  const updates = {};
  allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user: user.toPublicJSON() });
});

// Admin: list users
router.get('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  const total = await User.countDocuments(query);
  const users = await User.find(query).select('-password').sort('-createdAt')
    .skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, users });
});

// Admin: toggle user status
router.patch('/:id/toggle-status', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user: user.toPublicJSON() });
});

module.exports = router;
