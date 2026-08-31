// blogRoutes.js
const express = require('express');
const { Blog } = require('../models/index');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', async (req, res) => {
  const { page = 1, limit = 9, category, search, featured } = req.query;
  const query = { status: 'published' };
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (search) query.$text = { $search: search };

  const total = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .populate('author', 'name avatar')
    .select('-content')
    .sort('-publishedAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, blogs, totalPages: Math.ceil(total / limit) });
});

router.get('/:slug', async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
    .populate('author', 'name avatar bio');
  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
  await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
  res.json({ success: true, blog });
});

router.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const blog = await Blog.create({ ...req.body, author: req.user._id });
  res.status(201).json({ success: true, blog });
});

router.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, blog });
});

router.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Blog deleted.' });
});

module.exports = router;
