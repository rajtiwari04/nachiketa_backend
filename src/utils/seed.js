require('dotenv').config();
const mongoose = require('mongoose');

// Inline minimal models to avoid import issues
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
        college: 'Nachiketa Institute', year: '4th', branch: 'CSE',
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

    // ── Team Members (LinkedIn + Instagram only — no GitHub) ──────────────────
    const teamCount = await TeamMember.countDocuments();
    if (teamCount === 0) {
      await TeamMember.insertMany([
        {
          name: 'Arjun Verma', designation: 'President', department: 'core',
          order: 1, session: '2024-25', year: '4th', branch: 'CSE',
          bio: 'Final year CSE student passionate about AI and community building.',
          socialLinks: {
            linkedin:  'https://linkedin.com/in/arjunverma',
            instagram: 'https://instagram.com/arjunverma',
          },
        },
        {
          name: 'Priya Singh', designation: 'Vice President', department: 'core',
          order: 2, session: '2024-25', year: '4th', branch: 'ECE',
          bio: 'ECE student with a love for IoT and hardware hacking.',
          socialLinks: {
            linkedin:  'https://linkedin.com/in/priyasingh',
            instagram: 'https://instagram.com/priyasingh',
          },
        },
        {
          name: 'Rahul Gupta', designation: 'Technical Head', department: 'technical',
          order: 1, session: '2024-25', year: '3rd', branch: 'CSE',
          bio: 'Full stack developer and open source contributor.',
          socialLinks: {
            linkedin:  'https://linkedin.com/in/rahulgupta',
            instagram: 'https://instagram.com/rahulgupta',
          },
        },
        {
          name: 'Sneha Patel', designation: 'Creative Director', department: 'creative',
          order: 1, session: '2024-25', year: '3rd', branch: 'Design',
          bio: 'UI/UX designer who believes design is problem-solving.',
          socialLinks: {
            linkedin:  'https://linkedin.com/in/snehapatel',
            instagram: 'https://instagram.com/snehapatel',
          },
        },
        {
          name: 'Vikram Rao', designation: 'Marketing Head', department: 'marketing',
          order: 1, session: '2024-25', year: '3rd', branch: 'MBA',
          bio: 'Marketing enthusiast and event strategist.',
          socialLinks: {
            linkedin:  'https://linkedin.com/in/vikramrao',
            instagram: 'https://instagram.com/vikramrao',
          },
        },
        {
          name: 'Ananya Joshi', designation: 'Events Manager', department: 'management',
          order: 1, session: '2024-25', year: '2nd', branch: 'CSE',
          bio: 'Master organizer with an eye for detail.',
          socialLinks: {
            linkedin:  'https://linkedin.com/in/ananyajoshi',
            instagram: 'https://instagram.com/ananyajoshi',
          },
        },
        {
          name: 'Karan Mehta', designation: 'Developer', department: 'technical',
          order: 2, session: '2024-25', year: '2nd', branch: 'IT',
          bio: 'React and Node.js developer.',
          socialLinks: {
            linkedin:  'https://linkedin.com/in/karanmehta',
            instagram: 'https://instagram.com/karanmehta',
          },
        },
        {
          name: 'Divya Kumar', designation: 'Content Writer', department: 'creative',
          order: 2, session: '2024-25', year: '2nd', branch: 'English',
          bio: 'Writer and storyteller.',
          socialLinks: {
            linkedin:  'https://linkedin.com/in/divyakumar',
            instagram: 'https://instagram.com/divyakumar',
          },
        },
        {
          name: 'Prof. A. Sharma', designation: 'Faculty Advisor', department: 'advisor',
          order: 1, session: '2024-25', isActive: true,
          bio: '15 years of teaching experience in Computer Science.',
          email: 'asharma@college.edu',
          socialLinks: {
            linkedin:  'https://linkedin.com/in/profsharma',
            instagram: '',
          },
        },
      ]);
      console.log('✅ Team members created (LinkedIn + Instagram only)');
    } else {
      // Update existing members: remove github, ensure linkedin + instagram fields exist
      const members = await TeamMember.find({});
      for (const m of members) {
        if (!m.socialLinks) m.socialLinks = {};
        // Remove github field if it exists (set to undefined)
        if (m.socialLinks.github !== undefined) {
          m.socialLinks = {
            linkedin:  m.socialLinks.linkedin  || '',
            instagram: m.socialLinks.instagram || '',
          };
          await m.save();
        }
      }
      console.log(`✅ Team updated: ${members.length} members — GitHub removed, LinkedIn+Instagram kept`);
    }

    // ── Events ────────────────────────────────────────────────────────────────
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      await Event.insertMany([
        {
          title: 'Web Development Bootcamp', slug: 'web-development-bootcamp-2025',
          description: 'A 3-day intensive bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Perfect for beginners and intermediate developers looking to sharpen their skills.',
          shortDescription: 'Learn full-stack web development in 3 days.',
          category: 'workshop', date: new Date(Date.now() + 7 * 86400000), time: '10:00 AM - 5:00 PM',
          venue: { name: 'LHC Auditorium', address: 'Main Campus, Block A' },
          isPaid: false, maxSeats: 100, registeredCount: 42, status: 'upcoming',
          isFeatured: true, certificateProvided: true,
          whatYouLearn: ['HTML & CSS fundamentals', 'JavaScript ES6+', 'React basics', 'Node.js & Express'],
          prerequisites: ['Basic computer knowledge', 'Laptop required'], tags: ['web', 'coding'],
        },
        {
          title: 'TechFest 2025 — Hackathon', slug: 'techfest-2025-hackathon',
          description: '36-hour hackathon where teams compete to build innovative solutions for real-world problems. Prizes worth ₹1,00,000 up for grabs!',
          shortDescription: '36-hour hackathon with ₹1L prize pool.',
          category: 'hackathon', date: new Date(Date.now() + 14 * 86400000), time: '9:00 AM (36 hrs)',
          venue: { name: 'Innovation Hub', address: 'Tech Block, Ground Floor' },
          isPaid: true, price: 199, memberPrice: 99, maxSeats: 200, registeredCount: 78,
          status: 'upcoming', isFeatured: true, certificateProvided: true, tags: ['hackathon', 'prize'],
        },
        {
          title: 'AI & Machine Learning Seminar', slug: 'ai-ml-seminar-2025',
          description: 'Industry experts share the latest trends in AI and Machine Learning. Topics include LLMs, computer vision, and career paths in AI.',
          shortDescription: 'Industry experts on AI/ML trends and careers.',
          category: 'seminar', date: new Date(Date.now() + 21 * 86400000), time: '2:00 PM - 6:00 PM',
          venue: { name: 'Seminar Hall', address: 'Academic Block, 2nd Floor' },
          isPaid: false, maxSeats: 150, registeredCount: 120, status: 'upcoming', isFeatured: false,
          tags: ['AI', 'ML', 'career'],
          speakers: [
            { name: 'Dr. Priya Sharma', designation: 'AI Research Lead, Google' },
            { name: 'Rahul Mehta', designation: 'ML Engineer, Microsoft' },
          ],
        },
        {
          title: 'Annual Cultural Night', slug: 'annual-cultural-night-2025',
          description: 'Celebrate creativity! An evening of music, dance, drama, and art performances by Nachiketa members.',
          shortDescription: 'Evening of music, dance, and arts.',
          category: 'cultural', date: new Date(Date.now() + 30 * 86400000), time: '6:00 PM - 10:00 PM',
          venue: { name: 'Open Air Theatre', address: 'College Ground' },
          isPaid: true, price: 99, memberPrice: 49, maxSeats: 500, registeredCount: 310,
          status: 'upcoming', isFeatured: true, tags: ['cultural', 'music'],
        },
        {
          title: 'Resume & Interview Masterclass', slug: 'resume-interview-masterclass-2025',
          description: 'A hands-on session covering resume building, LinkedIn optimization, and mock interview techniques.',
          shortDescription: 'Resume writing and interview prep with recruiters.',
          category: 'workshop', date: new Date(Date.now() - 3 * 86400000), time: '11:00 AM - 2:00 PM',
          venue: { name: 'Placement Cell', address: 'Admin Block' },
          isPaid: false, maxSeats: 80, registeredCount: 80, status: 'completed',
          isFeatured: false, tags: ['career', 'resume'],
        },
      ]);
      console.log('✅ Sample events created');
    }

    // ── Blogs ─────────────────────────────────────────────────────────────────
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      await Blog.insertMany([
        {
          title: 'How to Prepare for a Hackathon: A Complete Guide',
          slug: 'how-to-prepare-for-hackathon-2025',
          excerpt: 'Hackathons are one of the best ways to learn, network, and showcase your skills. Here is everything you need to know.',
          content: `# How to Prepare for a Hackathon\n\nHackathons are intense, exciting, and incredibly rewarding.\n\n## 1. Choose the Right Team\nDiversity is your superpower. Combine coders, designers, and domain experts.\n\n## 2. Practice Rapid Prototyping\nSpeed matters. Practice building MVPs quickly.\n\n## 3. Focus on the Pitch\nA great idea with a poor pitch loses. Practice your 3-minute demo.\n\nGood luck!`,
          author: adminUser._id, category: 'tips', status: 'published',
          isFeatured: true, readTime: 6, tags: ['hackathon', 'tips'],
          publishedAt: new Date(Date.now() - 2 * 86400000),
        },
        {
          title: 'TechFest 2024 — Recap and Highlights',
          slug: 'techfest-2024-recap',
          excerpt: 'Over 500 students, 40 hours of events, and memories that will last a lifetime.',
          content: `# TechFest 2024 — Recap\n\nWhat a weekend! TechFest 2024 broke every record.\n\n## By the Numbers\n- 500+ attendees\n- 12 events across 2 days\n- ₹2,00,000 in prizes\n- 30 college teams\n\n## Highlights\nTeam CodeStorm won the grand prize with their AI-powered waste sorting system.\n\n## What's Next?\nTechFest 2025 is already in planning!`,
          author: adminUser._id, category: 'events', status: 'published',
          isFeatured: true, readTime: 4, tags: ['techfest', 'recap'],
          publishedAt: new Date(Date.now() - 10 * 86400000),
        },
        {
          title: 'The Nachiketa Story: 8 Years of Impact',
          slug: 'nachiketa-8-years-story',
          excerpt: 'From a small group of passionate students to a 2000-member community.',
          content: `# The Nachiketa Story\n\nIn 2016, five students sat in a hostel room with one shared frustration: their college curriculum wasn't teaching what the industry needed.\n\nSo they started Nachiketa.\n\n## Today\n8 years later, we have 2,000+ active members, 150+ events, and alumni at Google, Microsoft, Amazon.`,
          author: adminUser._id, category: 'society', status: 'published',
          isFeatured: false, readTime: 5, tags: ['society', 'history'],
          publishedAt: new Date(Date.now() - 20 * 86400000),
        },
        {
          title: 'Top 10 Resources to Learn DSA in 2025',
          slug: 'top-10-dsa-resources-2025',
          excerpt: 'Data structures and algorithms are the backbone of technical interviews. Here are the best resources.',
          content: `# Top 10 Resources to Learn DSA in 2025\n\n1. **LeetCode** — 2000+ problems\n2. **Striver's SDE Sheet** — 180 must-do problems\n3. **Abdul Bari on YouTube** — Best for visual learners\n4. **CLRS** — The bible for theory\n5. **NeetCode.io** — Pattern-based learning\n\n## Suggested 3-Month Plan\n- Month 1: Arrays, Strings, Hashing\n- Month 2: Trees, Graphs, DP\n- Month 3: Mock interviews`,
          author: adminUser._id, category: 'tips', status: 'published',
          isFeatured: false, readTime: 7, tags: ['DSA', 'placement'],
          publishedAt: new Date(Date.now() - 5 * 86400000),
        },
      ]);
      console.log('✅ Sample blogs created');
    }

    // ── Sponsors ──────────────────────────────────────────────────────────────
    const sponsorCount = await Sponsor.countDocuments();
    if (sponsorCount === 0) {
      await Sponsor.insertMany([
        { name: 'TechCorp India', logo: 'https://placehold.co/200x80/6366f1/ffffff?text=TechCorp',   tier: 'platinum', website: 'https://example.com', isActive: true, order: 1 },
        { name: 'InnovateLab',   logo: 'https://placehold.co/200x80/a855f7/ffffff?text=InnovateLab', tier: 'gold',     website: 'https://example.com', isActive: true, order: 2 },
        { name: 'CloudBase',     logo: 'https://placehold.co/200x80/22c55e/ffffff?text=CloudBase',   tier: 'gold',     website: 'https://example.com', isActive: true, order: 3 },
        { name: 'DevTools Pro',  logo: 'https://placehold.co/200x80/f43f5e/ffffff?text=DevTools',    tier: 'silver',   website: 'https://example.com', isActive: true, order: 4 },
        { name: 'StartupHub',   logo: 'https://placehold.co/200x80/f59e0b/ffffff?text=StartupHub',  tier: 'partner',  website: 'https://example.com', isActive: true, order: 5 },
      ]);
      console.log('✅ Sample sponsors created');
    }

    // ── Achievements ──────────────────────────────────────────────────────────
    const achieveCount = await Achievement.countDocuments();
    if (achieveCount === 0) {
      await Achievement.insertMany([
        { title: 'Smart India Hackathon — National Winner', description: 'Won the Smart India Hackathon 2024 Grand Finale, defeating 500+ teams from across India.', category: 'competition', date: new Date('2024-12-15'), position: '1st Place', isFeatured: true, organizer: 'Govt. of India' },
        { title: 'Best Technical Society Award', description: 'Awarded the Best Technical Society by the university for outstanding student engagement.', category: 'recognition', date: new Date('2024-11-01'), isFeatured: true, organizer: 'University' },
        { title: 'HackJNU 2024 — Runners Up', description: 'Secured 2nd place at HackJNU 2024 with a healthcare AI solution.', category: 'competition', date: new Date('2024-09-20'), position: '2nd Place', organizer: 'JNU' },
        { title: '2000 Members Milestone', description: 'Crossed 2000 active members, becoming the largest technical society in the university.', category: 'milestone', date: new Date('2024-08-01'), isFeatured: true, organizer: 'Nachiketa Society' },
        { title: 'Google Developer Student Club Collaboration', description: 'Partnered with GDSC for a 3-day developer bootcamp attended by 400+ students.', category: 'recognition', date: new Date('2024-07-15'), organizer: 'Google' },
      ]);
      console.log('✅ Sample achievements created');
    }

    console.log('\n🎉 Seed complete!');
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