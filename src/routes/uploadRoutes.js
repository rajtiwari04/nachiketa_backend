const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { protect, authorize } = require('../middleware/authMiddleware');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'), false);
  },
});

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `nachiketa/${folder}`, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
    stream.end(buffer);
  });

router.post('/image', protect, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  const folder = req.body.folder || 'general';
  const result = await uploadToCloudinary(req.file.buffer, folder);
  res.json({ success: true, url: result.secure_url, publicId: result.public_id });
});

router.delete('/image/:publicId', protect, authorize('admin', 'superadmin'), async (req, res) => {
  await cloudinary.uploader.destroy(req.params.publicId);
  res.json({ success: true, message: 'Image deleted.' });
});

// Membership routes stub
const membershipRouter = express.Router();
const { Membership } = require('../models/index');

membershipRouter.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: [
      { id: 'basic', name: 'Basic', price: 299, duration: '6 months', benefits: ['Event discounts', 'Priority registration', 'Member newsletter', 'Community access'] },
      { id: 'premium', name: 'Premium', price: 699, duration: '1 year', benefits: ['All Basic benefits', 'Free event entries', 'Workshop access', 'Certificate priority', 'Exclusive merchandise'] },
      { id: 'lifetime', name: 'Lifetime', price: 1999, duration: 'Lifetime', benefits: ['All Premium benefits', 'Lifetime access', 'Alumni network', 'Mentorship program', 'Society archive access'] },
    ],
  });
});

membershipRouter.get('/my-membership', protect, async (req, res) => {
  const membership = await Membership.findOne({ user: req.user._id, status: 'active' }).sort('-createdAt');
  res.json({ success: true, membership });
});

module.exports = { uploadRouter: router, membershipRouter };
