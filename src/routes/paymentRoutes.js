const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentHistory, getAllPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/admin/all', protect, authorize('admin', 'superadmin'), getAllPayments);

module.exports = router;
