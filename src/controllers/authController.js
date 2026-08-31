const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id, user.role);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: user.toPublicJSON(),
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
exports.register = async (req, res) => {
  const { name, email, password, phone, college, year, branch, rollNumber } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const user = await User.create({
    name, email, password, phone, college, year, branch, rollNumber,
    emailVerificationToken: crypto.createHash('sha256').update(verificationToken).digest('hex'),
    emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000,
  });

  // Send verification email
  try {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await emailService.sendVerificationEmail(user.email, user.name, verifyUrl);
  } catch (err) {
    // Don't fail registration if email fails
    console.error('Email send failed:', err.message);
  }

  sendTokenResponse(user, 201, res, 'Registration successful. Please verify your email.');
};

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Your account has been deactivated. Contact support.' });
  }

  sendTokenResponse(user, 200, res, 'Login successful.');
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('registeredEvents', 'title date status slug');
  res.json({ success: true, user: user.toPublicJSON() });
};

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully.' });
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Don't reveal if user exists
    return res.json({ success: true, message: 'If that email is registered, you will receive a reset link.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ success: false, message: 'Email could not be sent.' });
  }

  res.json({ success: true, message: 'Password reset link sent to your email.' });
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful.');
};

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
exports.updatePassword = async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(req.body.currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully.');
};

// @desc    Logout (client-side token deletion, server returns success)
// @route   POST /api/v1/auth/logout
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};
