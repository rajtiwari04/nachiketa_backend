// ─── Auth Routes ──────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const {
  register, login, getMe, verifyEmail,
  forgotPassword, resetPassword, updatePassword, logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);

module.exports = router;
