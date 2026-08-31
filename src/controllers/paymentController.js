const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const Event = require('../models/Event');
const { Payment, Membership } = require('../models/index');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create Order ─────────────────────────────────────────────────────────────
// @route   POST /api/v1/payments/create-order
exports.createOrder = async (req, res) => {
  const { type, referenceId } = req.body; // type: 'event' | 'membership'
  let amount, currency = 'INR', metadata = {};

  if (type === 'event') {
    const event = await Event.findById(referenceId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (!event.isPaid) return res.status(400).json({ success: false, message: 'This is a free event.' });
    if (event.isSoldOut) return res.status(400).json({ success: false, message: 'Event is sold out.' });

    const alreadyRegistered = event.registrations.some(r => r.user.toString() === req.user._id.toString());
    if (alreadyRegistered) return res.status(400).json({ success: false, message: 'Already registered.' });

    // Members get discounted price
    amount = req.user.isMember && event.memberPrice ? event.memberPrice : event.price;
    amount = amount * 100; // Convert to paise
    metadata = { eventTitle: event.title };

  } else if (type === 'membership') {
    const plans = { basic: 299, premium: 699, lifetime: 1999 };
    const plan = req.body.plan;
    if (!plans[plan]) return res.status(400).json({ success: false, message: 'Invalid membership plan.' });
    amount = plans[plan] * 100;
    metadata = { plan };
  } else {
    return res.status(400).json({ success: false, message: 'Invalid payment type.' });
  }

  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt: `rcpt_${uuidv4().slice(0, 16)}`,
    notes: { userId: req.user._id.toString(), type, referenceId, ...metadata },
  });

  // Save payment record
  await Payment.create({
    user: req.user._id,
    type,
    referenceId,
    amount: amount / 100,
    currency,
    razorpayOrderId: order.id,
    status: 'created',
    metadata,
  });

  res.status(201).json({
    success: true,
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    },
    key: process.env.RAZORPAY_KEY_ID,
  });
};

// ─── Verify Payment ───────────────────────────────────────────────────────────
// @route   POST /api/v1/payments/verify
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type, referenceId } = req.body;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed' }
    );
    return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
  }

  // Update payment record
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'paid' },
    { new: true }
  );

  if (type === 'event') {
    const event = await Event.findById(referenceId);
    if (event) {
      const ticketId = `NCK-${event._id.toString().slice(-4).toUpperCase()}-${uuidv4().slice(0, 8).toUpperCase()}`;
      const qrData = JSON.stringify({ ticketId, eventId: event._id, userId: req.user._id });
      const qrCode = await QRCode.toDataURL(qrData);

      event.registrations.push({
        user: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: payment.amount,
        status: 'confirmed',
        ticketId,
        qrCode,
      });
      event.registeredCount += 1;
      await event.save();

      return res.json({
        success: true,
        message: 'Payment successful! You are registered.',
        ticket: { ticketId, qrCode },
      });
    }

  } else if (type === 'membership') {
    const plan = payment.metadata?.plan || 'basic';
    const durations = { basic: 180, premium: 365, lifetime: 36500 };
    const expiry = new Date(Date.now() + durations[plan] * 24 * 60 * 60 * 1000);

    await Membership.create({
      user: req.user._id,
      plan,
      price: payment.amount,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'active',
      startDate: new Date(),
      expiryDate: expiry,
    });

    await User.findByIdAndUpdate(req.user._id, {
      isMember: true,
      membershipExpiry: expiry,
    });

    return res.json({
      success: true,
      message: 'Membership activated successfully!',
      expiryDate: expiry,
    });
  }

  res.json({ success: true, message: 'Payment verified successfully.' });
};

// ─── Payment History ──────────────────────────────────────────────────────────
// @route   GET /api/v1/payments/history
exports.getPaymentHistory = async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(50);
  res.json({ success: true, payments });
};

// ─── Admin: All Payments ──────────────────────────────────────────────────────
// @route   GET /api/v1/payments/admin/all
exports.getAllPayments = async (req, res) => {
  const { page = 1, limit = 20, status, type } = req.query;
  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;

  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email phone');

  res.json({ success: true, total, payments });
};
