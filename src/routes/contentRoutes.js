const express = require('express');
const { Gallery, TeamMember, Sponsor, Achievement, Contact } = require('../models/index');
const { protect, authorize } = require('../middleware/authMiddleware');

// ─── Gallery Router ───────────────────────────────────────────────────────────
const galleryRouter = express.Router();

galleryRouter.get('/', async (req, res) => {
  const { category, page = 1, limit = 20 } = req.query;
  const query = category ? { category } : {};
  const total = await Gallery.countDocuments(query);
  const images = await Gallery.find(query).sort('-createdAt')
    .skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, images });
});

galleryRouter.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const image = await Gallery.create({ ...req.body, uploadedBy: req.user._id });
  res.status(201).json({ success: true, image });
});

galleryRouter.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await Gallery.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Image deleted.' });
});

// ─── Team Router ──────────────────────────────────────────────────────────────
const teamRouter = express.Router();

teamRouter.get('/', async (req, res) => {
  const { section, division, department, session, includeInactive } = req.query;
  const query = {};
  if (includeInactive !== 'true') {
    query.isActive = true;
  }
  if (section) query.section = section;
  if (division) query.division = division;
  if (department) query.department = department;
  if (session) query.session = session;

  const members = await TeamMember.find(query).sort('order');
  res.json({ success: true, members });
});

teamRouter.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const member = new TeamMember(req.body);
  await member.save();
  res.status(201).json({ success: true, member });
});

teamRouter.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const member = await TeamMember.findById(req.params.id);
  if (!member) {
    return res.status(404).json({ success: false, message: 'Team member not found.' });
  }
  Object.assign(member, req.body);
  await member.save();
  res.json({ success: true, member });
});

teamRouter.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await TeamMember.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Team member removed.' });
});

// ─── Sponsor Router ───────────────────────────────────────────────────────────
const sponsorRouter = express.Router();

sponsorRouter.get('/', async (req, res) => {
  const sponsors = await Sponsor.find({ isActive: true }).sort('order');
  res.json({ success: true, sponsors });
});

sponsorRouter.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const sponsor = await Sponsor.create(req.body);
  res.status(201).json({ success: true, sponsor });
});

sponsorRouter.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const sponsor = await Sponsor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, sponsor });
});

sponsorRouter.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await Sponsor.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Sponsor removed.' });
});

// ─── Achievement Router ───────────────────────────────────────────────────────
const achievementRouter = express.Router();

achievementRouter.get('/', async (req, res) => {
  const { category } = req.query;
  const query = category ? { category } : {};
  const achievements = await Achievement.find(query).sort('-date');
  res.json({ success: true, achievements });
});

achievementRouter.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const achievement = await Achievement.create(req.body);
  res.status(201).json({ success: true, achievement });
});

achievementRouter.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, achievement });
});

achievementRouter.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await Achievement.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Achievement removed.' });
});

// ─── Contact Router ───────────────────────────────────────────────────────────
const contactRouter = express.Router();

contactRouter.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
  }
  await Contact.create({ name, email, phone, subject, message });
  res.status(201).json({ success: true, message: 'Message sent successfully. We will get back to you soon.' });
});

contactRouter.get('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const total = await Contact.countDocuments(query);
  const contacts = await Contact.find(query).sort('-createdAt')
    .skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, contacts });
});

contactRouter.patch('/:id/status', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json({ success: true, contact });
});

module.exports = { galleryRouter, teamRouter, sponsorRouter, achievementRouter, contactRouter };
