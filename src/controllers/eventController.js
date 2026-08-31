const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Event = require('../models/Event');
const { Payment } = require('../models/index');

// @desc    Get all events with filters
// @route   GET /api/v1/events
exports.getEvents = async (req, res) => {
  const { category, status, search, page = 1, limit = 12, featured, sort = '-date' } = req.query;

  const query = {};
  if (category) query.category = category;
  if (status) query.status = status;
  if (featured === 'true') query.isFeatured = true;
  if (search) query.$text = { $search: search };

  // Public-facing: only show non-draft events
  if (!req.user || req.user.role === 'student') {
    query.status = { $in: ['upcoming', 'ongoing', 'completed'] };
  }

  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .select('-registrations')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('createdBy', 'name avatar');

  res.json({
    success: true,
    count: events.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    events,
  });
};

// @desc    Get single event
// @route   GET /api/v1/events/:slug
exports.getEvent = async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug })
    .populate('createdBy', 'name avatar');

  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

  // Increment views
  await Event.findByIdAndUpdate(event._id, { $inc: { views: 1 } });

  // Don't send full registration list to non-admins
  const eventData = event.toObject();
  if (!req.user || req.user.role === 'student') {
    delete eventData.registrations;
  }

  // Check if current user is registered
  if (req.user) {
    eventData.isRegistered = event.registrations.some(
      r => r.user.toString() === req.user._id.toString()
    );
  }

  res.json({ success: true, event: eventData });
};

// @desc    Create event
// @route   POST /api/v1/events
exports.createEvent = async (req, res) => {
  const event = await Event.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Event created successfully.', event });
};

// @desc    Update event
// @route   PUT /api/v1/events/:id
exports.updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  res.json({ success: true, message: 'Event updated.', event });
};

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
exports.deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  await event.deleteOne();
  res.json({ success: true, message: 'Event deleted successfully.' });
};

// @desc    Register for free event
// @route   POST /api/v1/events/:id/register
exports.registerFree = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  if (event.isPaid) return res.status(400).json({ success: false, message: 'This is a paid event. Use the payment route.' });
  if (event.isSoldOut) return res.status(400).json({ success: false, message: 'Event is sold out.' });

  const alreadyRegistered = event.registrations.some(r => r.user.toString() === req.user._id.toString());
  if (alreadyRegistered) return res.status(400).json({ success: false, message: 'Already registered for this event.' });

  const ticketId = `NCK-${event._id.toString().slice(-4).toUpperCase()}-${uuidv4().slice(0, 8).toUpperCase()}`;
  const qrData = JSON.stringify({ ticketId, eventId: event._id, userId: req.user._id });
  const qrCode = await QRCode.toDataURL(qrData);

  event.registrations.push({
    user: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    status: 'confirmed',
    ticketId,
    qrCode,
  });
  event.registeredCount += 1;
  await event.save();

  res.status(201).json({
    success: true,
    message: 'Successfully registered for the event!',
    ticket: { ticketId, qrCode, event: event.title },
  });
};

// @desc    Get event registrations (admin)
// @route   GET /api/v1/events/:id/registrations
exports.getRegistrations = async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('registrations.user', 'name email phone college year branch');

  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

  res.json({ success: true, count: event.registrations.length, registrations: event.registrations });
};

// @desc    Mark attendance
// @route   PATCH /api/v1/events/:id/attendance/:ticketId
exports.markAttendance = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

  const reg = event.registrations.find(r => r.ticketId === req.params.ticketId);
  if (!reg) return res.status(404).json({ success: false, message: 'Ticket not found.' });
  if (reg.status === 'attended') return res.status(400).json({ success: false, message: 'Already marked as attended.' });

  reg.status = 'attended';
  await event.save();

  res.json({ success: true, message: 'Attendance marked.', registration: reg });
};
