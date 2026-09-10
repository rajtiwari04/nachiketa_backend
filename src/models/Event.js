const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  paymentId: String,
  orderId: String,
  amount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'attended'], default: 'pending' },
  ticketId: { type: String, unique: true, sparse: true },
  qrCode: String,
  registeredAt: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Event title is required'], trim: true, maxlength: 120 },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: [true, 'Description is required'] },
  shortDescription: { type: String, maxlength: 200 },
  banner: { type: String },
  gallery: [String],
  category: {
    type: String,
    enum: ['workshop', 'seminar', 'hackathon', 'cultural', 'sports', 'technical', 'social', 'other'],
    required: true,
  },
  tags: [String],
  date: { type: Date, required: [true, 'Event date is required'] },
  endDate: Date,
  time: { type: String },
  venue: {
    name: { type: String, required: [true, 'Venue name is required'] },
    address: { type: String, default: '' },
    mapLink: { type: String, default: '' },
  },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  memberPrice: { type: Number, default: 0 },
  maxSeats: { type: Number, default: null },
  registeredCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'draft',
  },
  isFeatured: { type: Boolean, default: false },
  registrations: [registrationSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  speakers: [{
    name: String,
    designation: String,
    avatar: String,
    bio: String,
  }],
  prerequisites: [String],
  whatYouLearn: [String],
  certificateProvided: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────
eventSchema.virtual('seatsAvailable').get(function() {
  if (!this.maxSeats) return null;
  return Math.max(0, this.maxSeats - this.registeredCount);
});

eventSchema.virtual('isSoldOut').get(function() {
  if (!this.maxSeats) return false;
  return this.registeredCount >= this.maxSeats;
});

// ─── Normalization & Slug generation ──────────────────────────────────────────
eventSchema.pre('validate', function(next) {
  // Normalize venue object from potential string or flat venue fields
  if (typeof this.venue === 'string') {
    this.venue = { name: this.venue, address: '' };
  }
  if (!this.venue || typeof this.venue !== 'object') {
    this.venue = { name: '', address: '' };
  }
  if (!this.venue.name && this._doc?.venueName) {
    this.venue.name = this._doc.venueName;
  }
  if (!this.venue.address && this._doc?.venueAddress) {
    this.venue.address = this._doc.venueAddress;
  }

  // Populate time if not explicitly provided
  if (!this.time) {
    if (this.date) {
      try {
        const d = new Date(this.date);
        if (!isNaN(d.getTime())) {
          this.time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else {
          this.time = 'Time TBA';
        }
      } catch {
        this.time = 'Time TBA';
      }
    } else {
      this.time = 'Time TBA';
    }
  }

  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
eventSchema.index({ slug: 1 });
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ isFeatured: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Event', eventSchema);
