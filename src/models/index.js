const mongoose = require('mongoose');

// ─── Blog ─────────────────────────────────────────────────────────────────────
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  slug: { type: String, unique: true, lowercase: true },
  excerpt: { type: String, maxlength: 300 },
  content: { type: String, required: true },
  coverImage: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['technology', 'events', 'society', 'achievements', 'tips', 'other'], default: 'other' },
  tags: [String],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  readTime: { type: Number, default: 5 },
  publishedAt: Date,
}, { timestamps: true });

blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') + '-' + Date.now();
  }
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
  next();
});
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

// ─── Gallery ──────────────────────────────────────────────────────────────────
const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  imageUrl: { type: String, required: true },
  thumbnailUrl: String,
  category: { type: String, enum: ['events', 'team', 'achievements', 'campus', 'other'], default: 'other' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  isFeatured: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
}, { timestamps: true });
gallerySchema.index({ category: 1 });

const Gallery = mongoose.model('Gallery', gallerySchema);

// ─── Team Member ──────────────────────────────────────────────────────────────
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  designation: { type: String, required: true },
  department: { type: String, enum: ['core', 'technical', 'creative', 'marketing', 'management', 'advisor'], required: true },
  avatar: String,
  bio: { type: String, maxlength: 500 },
  email: String,
  phone: String,
  year: String,
  branch: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  socialLinks: { linkedin: String, github: String, instagram: String, twitter: String },
  session: { type: String, required: true },
}, { timestamps: true });

teamSchema.index({ department: 1, order: 1 });
const TeamMember = mongoose.model('TeamMember', teamSchema);

// ─── Sponsor ──────────────────────────────────────────────────────────────────
const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, required: true },
  website: String,
  tier: { type: String, enum: ['platinum', 'gold', 'silver', 'bronze', 'partner'], default: 'partner' },
  description: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Sponsor = mongoose.model('Sponsor', sponsorSchema);

// ─── Achievement ──────────────────────────────────────────────────────────────
const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: String,
  category: { type: String, enum: ['award', 'competition', 'recognition', 'milestone', 'other'], default: 'other' },
  date: { type: Date, required: true },
  participants: [{ name: String, role: String }],
  organizer: String,
  isFeatured: { type: Boolean, default: false },
  position: String,
}, { timestamps: true });

achievementSchema.index({ date: -1 });
const Achievement = mongoose.model('Achievement', achievementSchema);

// ─── Contact ──────────────────────────────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  phone: String,
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'replied', 'resolved'], default: 'new' },
  adminNote: String,
  repliedAt: Date,
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

// ─── Membership ───────────────────────────────────────────────────────────────
const membershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['basic', 'premium', 'lifetime'], required: true },
  price: { type: Number, required: true },
  paymentId: String,
  orderId: String,
  status: { type: String, enum: ['pending', 'active', 'expired', 'cancelled'], default: 'pending' },
  startDate: Date,
  expiryDate: Date,
  benefits: [String],
  receiptUrl: String,
}, { timestamps: true });

membershipSchema.index({ user: 1 });
membershipSchema.index({ status: 1, expiryDate: 1 });
const Membership = mongoose.model('Membership', membershipSchema);

// ─── Payment ──────────────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['event', 'membership'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

paymentSchema.index({ user: 1, type: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { Blog, Gallery, TeamMember, Sponsor, Achievement, Contact, Membership, Payment };
