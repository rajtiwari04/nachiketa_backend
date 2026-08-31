const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'superadmin'],
    default: 'student',
  },
  avatar: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    trim: true,
  },
  college: {
    type: String,
    trim: true,
  },
  year: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', 'Alumni', ''],
  },
  branch: {
    type: String,
    trim: true,
  },
  rollNumber: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  socialLinks: {
    linkedin: String,
    github: String,
    instagram: String,
    twitter: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isMember: {
    type: Boolean,
    default: false,
  },
  membershipExpiry: Date,
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  passwordResetToken: String,
  passwordResetExpiry: Date,
  lastLogin: Date,
  registeredEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Index ────────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isMember: 1 });

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
