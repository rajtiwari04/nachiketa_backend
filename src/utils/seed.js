require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: 'student' }, isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }, isMember: { type: Boolean, default: false },
  college: String, year: String, branch: String,
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const teamSchema = new mongoose.Schema({
  name: String, designation: String, department: String, avatar: String,
  bio: String, email: String, year: String, branch: String,
  order: { type: Number, default: 0 }, isActive: { type: Boolean, default: true },
  socialLinks: { linkedin: String, instagram: String }, session: String,
});
const TeamMember = mongoose.models.TeamMember || mongoose.model('TeamMember', teamSchema);

const eventSchema = new mongoose.Schema({
  title: String, slug: { type: String, unique: true }, description: String,
  shortDescription: String, banner: String, category: String, tags: [String],
  date: Date, time: String, venue: { name: String, address: String },
  isPaid: Boolean, price: Number, memberPrice: Number, maxSeats: Number,
  registeredCount: { type: Number, default: 0 }, status: String,
  isFeatured: Boolean, certificateProvided: Boolean, registrations: [],
  speakers: [], whatYouLearn: [String], prerequisites: [String], views: Number,
}, { timestamps: true });
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

const blogSchema = new mongoose.Schema({
  title: String, slug: { type: String, unique: true }, excerpt: String,
  content: String, coverImage: String, author: mongoose.Schema.Types.ObjectId,
  category: String, tags: [String], status: String, isFeatured: Boolean,
  views: Number, readTime: Number, publishedAt: Date,
}, { timestamps: true });
const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

const sponsorSchema = new mongoose.Schema({
  name: String, logo: String, website: String, tier: String,
  description: String, isActive: Boolean, order: Number,
});
const Sponsor = mongoose.models.Sponsor || mongoose.model('Sponsor', sponsorSchema);

const achievementSchema = new mongoose.Schema({
  title: String, description: String, image: String, category: String,
  date: Date, participants: [], organizer: String, isFeatured: Boolean, position: String,
});
const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB');

    // ── Admin User ────────────────────────────────────────────────────────────
    let adminUser = await User.findOne({ email: 'admin@nachiketa.in' });
    if (!adminUser) {
      adminUser = new User({
        name: 'Nachiketa Admin', email: 'admin@nachiketa.in',
        password: 'Admin@123456', role: 'superadmin',
        isEmailVerified: true, isActive: true,
        college: 'Nachiketa Institute', year: '4th', branch: 'Community Lead',
      });
      await adminUser.save();
      console.log('✅ Admin created: admin@nachiketa.in / Admin@123456');
    } else {
      adminUser.password = 'Admin@123456';
      adminUser.role = 'superadmin';
      adminUser.isEmailVerified = true;
      await adminUser.save();
      console.log('✅ Admin updated');
    }

    // ── Team Members ──────────────────────────────────────────────────────────
    await TeamMember.deleteMany({});
    await TeamMember.insertMany([
      {
        name: 'Arjun Verma', designation: 'President', department: 'core',
        order: 1, session: '2024-25', year: '4th Year', branch: 'Social Sciences',
        bio: 'Passionate student advocate dedicated to creating awareness and building an empowered student community.',
        socialLinks: { linkedin: 'https://linkedin.com/in/arjunverma', instagram: 'https://instagram.com/arjunverma' },
      },
      {
        name: 'Priya Singh', designation: 'Vice President', department: 'core',
        order: 2, session: '2024-25', year: '4th Year', branch: 'Humanities',
        bio: 'Focused on student health, mental wellbeing initiatives, and community engagement programs.',
        socialLinks: { linkedin: 'https://linkedin.com/in/priyasingh', instagram: 'https://instagram.com/priyasingh' },
      },
      {
        name: 'Rahul Gupta', designation: 'Awareness & Program Head', department: 'management',
        order: 1, session: '2024-25', year: '3rd Year', branch: 'Economics',
        bio: 'Organizer of interactive awareness sessions on student rights, responsibilities, and government schemes.',
        socialLinks: { linkedin: 'https://linkedin.com/in/rahulgupta', instagram: 'https://instagram.com/rahulgupta' },
      },
      {
        name: 'Sneha Patel', designation: 'Creative & Cultural Lead', department: 'creative',
        order: 1, session: '2024-25', year: '3rd Year', branch: 'Design',
        bio: 'Creating expressive spaces for students through cultural meets, creative workshops, and open conversations.',
        socialLinks: { linkedin: 'https://linkedin.com/in/snehapatel', instagram: 'https://instagram.com/snehapatel' },
      },
      {
        name: 'Vikram Rao', designation: 'Community Outreach Head', department: 'marketing',
        order: 1, session: '2024-25', year: '3rd Year', branch: 'Management',
        bio: 'Connecting students across departments to build an inclusive and supportive society network.',
        socialLinks: { linkedin: 'https://linkedin.com/in/vikramrao', instagram: 'https://instagram.com/vikramrao' },
      },
      {
        name: 'Prof. A. Sharma', designation: 'Faculty Advisor', department: 'advisor',
        order: 1, session: '2024-25', isActive: true,
        bio: 'Supporting student-led awareness initiatives, character development, and social responsibility.',
        email: 'asharma@college.edu',
        socialLinks: { linkedin: 'https://linkedin.com/in/profsharma', instagram: '' },
      },
    ]);
    console.log('✅ Team members updated for Nachiketa Awareness Society');

    // ── Events / Programs ─────────────────────────────────────────────────────
    await Event.deleteMany({});
    await Event.insertMany([
      {
        title: 'Rights, Responsibilities & Civic Awareness Drive', slug: 'rights-responsibilities-awareness-2025',
        description: 'An interactive session helping students understand their fundamental rights, civic duties, public resources, and everyday responsibilities as informed citizens.',
        shortDescription: 'Interactive session on student rights, responsibilities, and civic duties.',
        category: 'rights', date: new Date(Date.now() + 7 * 86400000), time: '10:00 AM - 1:00 PM',
        venue: { name: 'Main Auditorium', address: 'Student Activity Block' },
        isPaid: false, maxSeats: 150, registeredCount: 65, status: 'upcoming',
        isFeatured: true, certificateProvided: true,
        whatYouLearn: ['Understanding student rights & duties', 'How to access public resources', 'Navigating administrative procedures', 'Active citizenship in college'],
        prerequisites: ['Open to all interested students'], tags: ['rights', 'awareness', 'civic'],
      },
      {
        title: '7 Day Nutrition & Healthy Living Bootcamp', slug: '7-day-nutrition-bootcamp-2025',
        description: 'A 7-day comprehensive health and nutrition initiative involving practical sessions on balanced diet, daily healthy habits, mental wellbeing, and live cooking demonstrations of quick nutritious student meals.',
        shortDescription: '7-day health initiative with nutrition sessions and live cooking demos.',
        category: 'wellbeing', date: new Date(Date.now() + 14 * 86400000), time: '8:00 AM - 10:00 AM',
        venue: { name: 'Community Center Kitchen & Hall', address: 'Campus Ground Floor' },
        isPaid: false, maxSeats: 100, registeredCount: 88,
        status: 'upcoming', isFeatured: true, certificateProvided: true, tags: ['health', 'nutrition', 'bootcamp'],
        speakers: [
          { name: 'Dr. Ananya Roy', designation: 'Nutritionist & Wellness Expert' },
          { name: 'Chef Rajesh Kumar', designation: 'Healthy Cooking Facilitator' },
        ],
      },
      {
        title: 'Self-Discovery & Personality Development Session', slug: 'self-discovery-personality-dev-2025',
        description: 'A thoughtful workshop focused on self-reflection, personal strengths, communication confidence, emotional intelligence, and decision-making for young adults.',
        shortDescription: 'Workshop on self-reflection, confidence, communication, and decision-making.',
        category: 'self-discovery', date: new Date(Date.now() + 21 * 86400000), time: '2:00 PM - 5:00 PM',
        venue: { name: 'Seminar Hall B', address: 'Academic Block' },
        isPaid: false, maxSeats: 120, registeredCount: 95, status: 'upcoming', isFeatured: false,
        tags: ['growth', 'confidence', 'personality'],
      },
      {
        title: 'Government Welfare Schemes & Opportunities Awareness', slug: 'government-schemes-opportunities-2025',
        description: 'Discover valuable government scholarships, student welfare schemes, skill development initiatives, and public opportunities that students often miss out on.',
        shortDescription: 'Guidance on student welfare schemes, scholarships, and opportunities.',
        category: 'awareness', date: new Date(Date.now() - 5 * 86400000), time: '11:00 AM - 2:00 PM',
        venue: { name: 'Conference Room 2', address: 'Student Center' },
        isPaid: false, maxSeats: 100, registeredCount: 100, status: 'completed',
        isFeatured: false, tags: ['schemes', 'opportunities', 'awareness'],
      },
    ]);
    console.log('✅ Nachiketa Awareness Society sample events created');

    // ── Blogs ─────────────────────────────────────────────────────────────────
    await Blog.deleteMany({});
    await Blog.insertMany([
      {
        title: 'Rights and Responsibilities Every Student Should Know',
        slug: 'rights-and-responsibilities-every-student-should-know',
        excerpt: 'Awareness begins with knowing what you are entitled to and what your duties are toward society.',
        content: `# Rights and Responsibilities Every Student Should Know\n\nMany students step into college without a clear understanding of their civic rights or institutional responsibilities.\n\n## 1. Know Your Fundamental Rights\nUnderstanding rights ensures you can stand up for fairness and equality.\n\n## 2. Active Responsibilities\nAwareness becomes meaningful when it leads to responsible action in your campus and community.\n\n## 3. Civic Participation\nBeing an informed citizen starts with curiosity and responsible choices.`,
        author: adminUser._id, category: 'rights', status: 'published',
        isFeatured: true, readTime: 5, tags: ['rights', 'awareness', 'civic'],
        publishedAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        title: 'Simple Nutrition & Health Habits for College Life',
        slug: 'simple-nutrition-and-health-habits-for-college-life',
        excerpt: 'Healthy living starts with small, daily choices. Here are practical nutrition insights for students.',
        content: `# Practical Nutrition Habits for Students\n\nGood health is the foundation of energy, focus, and long-term wellbeing.\n\n## 1. Balanced Meals on a Student Budget\nHow to choose nutritious foods without overspending.\n\n## 2. Hydration & Mindful Eating\nSimple daily habits that boost concentration and reduce fatigue.`,
        author: adminUser._id, category: 'wellbeing', status: 'published',
        isFeatured: true, readTime: 4, tags: ['health', 'nutrition', 'wellbeing'],
        publishedAt: new Date(Date.now() - 10 * 86400000),
      },
      {
        title: 'The Nachiketa Journey: Building an Informed Student Community',
        slug: 'the-nachiketa-journey-building-an-informed-student-community',
        excerpt: 'How student curiosity and shared effort created a space for awareness, growth, and connection.',
        content: `# The Nachiketa Story\n\nEstablished in 2024, Nachiketa Awareness Society was created to bridge the awareness gap among students.\n\nToday, with over 200+ student members, we conduct interactive sessions on health, rights, self-discovery, and cultural expression.`,
        author: adminUser._id, category: 'society', status: 'published',
        isFeatured: false, readTime: 4, tags: ['society', 'story'],
        publishedAt: new Date(Date.now() - 20 * 86400000),
      },
    ]);
    console.log('✅ Nachiketa Awareness Society sample blogs created');

    // ── Sponsors ──────────────────────────────────────────────────────────────
    await Sponsor.deleteMany({});
    await Sponsor.insertMany([
      { name: 'Student Wellbeing Trust', logo: 'https://placehold.co/200x80/6366f1/ffffff?text=WellbeingTrust', tier: 'platinum', website: 'https://example.com', isActive: true, order: 1 },
      { name: 'Civic Awareness Foundation', logo: 'https://placehold.co/200x80/a855f7/ffffff?text=CivicFoundation', tier: 'gold', website: 'https://example.com', isActive: true, order: 2 },
      { name: 'Community Youth Network', logo: 'https://placehold.co/200x80/22c55e/ffffff?text=YouthNetwork', tier: 'partner', website: 'https://example.com', isActive: true, order: 3 },
    ]);
    console.log('✅ Nachiketa sample sponsors created');

    // ── Achievements ──────────────────────────────────────────────────────────
    await Achievement.deleteMany({});
    await Achievement.insertMany([
      { title: '200 Active Members Milestone', description: 'Grew to over 200 dedicated student members across multiple departments in 2024.', category: 'milestone', date: new Date('2024-11-01'), position: '200+ Members', isFeatured: true, organizer: 'Nachiketa Awareness Society' },
      { title: '7 Day Nutrition Bootcamp Success', description: 'Organized a successful campus-wide health & nutrition awareness drive with live cooking demos.', category: 'program', date: new Date('2024-10-15'), position: '100+ Participants', isFeatured: true, organizer: 'Nachiketa Health Wing' },
      { title: 'Civic Rights & Responsibilities Drive', description: 'Conducted interactive awareness sessions on student rights, public welfare schemes, and civic duties.', category: 'recognition', date: new Date('2024-09-10'), isFeatured: true, organizer: 'Nachiketa Outreach' },
    ]);
    console.log('✅ Nachiketa sample achievements created');

    console.log('\n🎉 Nachiketa Awareness Society Seed complete!');
    console.log('─────────────────────────────────');
    console.log('  Email:    admin@nachiketa.in');
    console.log('  Password: Admin@123456');
    console.log('─────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();