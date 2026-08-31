require('dotenv').config();
require('express-async-errors');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

const authRoutes        = require('./routes/authRoutes');
const userRoutes        = require('./routes/userRoutes');
const eventRoutes       = require('./routes/eventRoutes');
const blogRoutes        = require('./routes/blogRoutes');
const galleryRoutes     = require('./routes/galleryRoutes');
const membershipRoutes  = require('./routes/membershipRoutes');
const paymentRoutes     = require('./routes/paymentRoutes');
const teamRoutes        = require('./routes/teamRoutes');
const sponsorRoutes     = require('./routes/sponsorRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const contactRoutes     = require('./routes/contactRoutes');
const adminRoutes       = require('./routes/adminRoutes');
// Fix: destructure the named export
const { uploadRouter }  = require('./routes/uploadRoutes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(compression());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(globalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Nachiketa API is running', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth',         authLimiter, authRoutes);
app.use('/api/v1/users',        userRoutes);
app.use('/api/v1/events',       eventRoutes);
app.use('/api/v1/blogs',        blogRoutes);
app.use('/api/v1/gallery',      galleryRoutes);
app.use('/api/v1/memberships',  membershipRoutes);
app.use('/api/v1/payments',     paymentRoutes);
app.use('/api/v1/team',         teamRoutes);
app.use('/api/v1/sponsors',     sponsorRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/contact',      contactRoutes);
app.use('/api/v1/admin',        adminRoutes);
app.use('/api/v1/upload',       uploadRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  logger.info('✅ MongoDB connected successfully');
  app.listen(PORT, () => {
    logger.info(`🚀 Nachiketa API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
})
.catch((err) => {
  logger.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;
