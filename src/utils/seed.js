require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const { Blog, TeamMember, Sponsor, Achievement } = require('../models/index');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB');

    // ─── Admin User ───────────────────────────────────────────────────────────
    const existing = await User.findOne({ email: 'admin@nachiketa.in' });
    if (!existing) {
      await User.create({
        name: 'Nachiketa Admin',
        email: 'admin@nachiketa.in',
        password: 'Admin@123456',
        role: 'superadmin',
        isEmailVerified: true,
        isActive: true,
        college: 'Nachiketa Institute',
        year: '4th',
        branch: 'CSE',
      });
      console.log('✅ Admin user created: admin@nachiketa.in / Admin@123456');
    } else {
      // Update password in case it changed
      existing.password = 'Admin@123456';
      existing.role = 'superadmin';
      existing.isEmailVerified = true;
      await existing.save();
      console.log('✅ Admin user updated');
    }

    // ─── Sample Events ────────────────────────────────────────────────────────
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      await Event.insertMany([
        {
          title: 'Web Development Bootcamp',
          slug: 'web-development-bootcamp-2025',
          description: 'A 3-day intensive bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Perfect for beginners and intermediate developers looking to sharpen their skills.',
          shortDescription: 'Learn full-stack web development in 3 days.',
          category: 'workshop',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          time: '10:00 AM - 5:00 PM',
          venue: { name: 'LHC Auditorium', address: 'Main Campus, Block A' },
          isPaid: false,
          maxSeats: 100,
          registeredCount: 42,
          status: 'upcoming',
          isFeatured: true,
          certificateProvided: true,
          whatYouLearn: ['HTML & CSS fundamentals', 'JavaScript ES6+', 'React basics', 'Node.js & Express', 'REST APIs'],
          prerequisites: ['Basic computer knowledge', 'Laptop required'],
          tags: ['web', 'coding', 'react'],
        },
        {
          title: 'TechFest 2025 — Hackathon',
          slug: 'techfest-2025-hackathon',
          description: '36-hour hackathon where teams compete to build innovative solutions for real-world problems. Prizes worth ₹1,00,000 up for grabs!',
          shortDescription: '36-hour hackathon with ₹1L prize pool.',
          category: 'hackathon',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          time: '9:00 AM (36 hrs)',
          venue: { name: 'Innovation Hub', address: 'Tech Block, Ground Floor' },
          isPaid: true,
          price: 199,
          memberPrice: 99,
          maxSeats: 200,
          registeredCount: 78,
          status: 'upcoming',
          isFeatured: true,
          certificateProvided: true,
          tags: ['hackathon', 'innovation', 'prize'],
        },
        {
          title: 'AI & Machine Learning Seminar',
          slug: 'ai-ml-seminar-2025',
          description: 'Industry experts share the latest trends in AI and Machine Learning. Topics include LLMs, computer vision, and career paths in AI.',
          shortDescription: 'Industry experts on AI/ML trends and careers.',
          category: 'seminar',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          time: '2:00 PM - 6:00 PM',
          venue: { name: 'Seminar Hall', address: 'Academic Block, 2nd Floor' },
          isPaid: false,
          maxSeats: 150,
          registeredCount: 120,
          status: 'upcoming',
          isFeatured: false,
          tags: ['AI', 'ML', 'career'],
          speakers: [
            { name: 'Dr. Priya Sharma', designation: 'AI Research Lead, Google', bio: 'PhD in Machine Learning from IIT Delhi.' },
            { name: 'Rahul Mehta', designation: 'ML Engineer, Microsoft', bio: '8 years in applied ML.' },
          ],
        },
        {
          title: 'Annual Cultural Night',
          slug: 'annual-cultural-night-2025',
          description: 'Celebrate creativity! An evening of music, dance, drama, and art performances by Nachiketa members. Open to all.',
          shortDescription: 'Evening of music, dance, and arts.',
          category: 'cultural',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          time: '6:00 PM - 10:00 PM',
          venue: { name: 'Open Air Theatre', address: 'College Ground' },
          isPaid: true,
          price: 99,
          memberPrice: 49,
          maxSeats: 500,
          registeredCount: 310,
          status: 'upcoming',
          isFeatured: true,
          tags: ['cultural', 'music', 'dance'],
        },
        {
          title: 'Resume & Interview Masterclass',
          slug: 'resume-interview-masterclass-2025',
          description: 'A hands-on session covering resume building, LinkedIn optimization, and mock interview techniques with real industry recruiters.',
          shortDescription: 'Resume writing and interview prep with recruiters.',
          category: 'workshop',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          time: '11:00 AM - 2:00 PM',
          venue: { name: 'Placement Cell', address: 'Admin Block' },
          isPaid: false,
          maxSeats: 80,
          registeredCount: 80,
          status: 'completed',
          isFeatured: false,
          tags: ['career', 'resume', 'placement'],
        },
      ]);
      console.log('✅ Sample events created');
    }

    // ─── Sample Blogs ─────────────────────────────────────────────────────────
    const blogCount = await Blog.countDocuments();
    const adminUser = await User.findOne({ email: 'admin@nachiketa.in' });
    if (blogCount === 0 && adminUser) {
      await Blog.insertMany([
        {
          title: 'How to Prepare for a Hackathon: A Complete Guide',
          slug: 'how-to-prepare-for-hackathon-2025',
          excerpt: 'Hackathons are one of the best ways to learn, network, and showcase your skills. Here is everything you need to know to compete effectively.',
          content: `# How to Prepare for a Hackathon

Hackathons are intense, exciting, and incredibly rewarding. Whether you're a first-timer or a seasoned competitor, preparation is key.

## 1. Choose the Right Team
Diversity is your superpower. Combine coders, designers, and domain experts. Aim for 3-4 people with complementary skills.

## 2. Practice Rapid Prototyping
Speed matters. Practice building MVPs quickly using tools like Firebase, Supabase, or no-code platforms for non-core features.

## 3. Study the Problem Space
Most hackathons provide themes in advance. Research the domain, talk to potential users, and come with 2-3 idea seeds.

## 4. Prepare Your Toolkit
Set up your development environment before the event. Have boilerplate code ready, APIs bookmarked, and your IDE configured.

## 5. Focus on the Pitch
A great idea with a poor pitch loses. Practice your 3-minute demo. Show the problem, your solution, and the impact.

Good luck — and remember, the best hackathon experience is one where you learn something new!`,
          author: adminUser._id,
          category: 'tips',
          status: 'published',
          isFeatured: true,
          readTime: 6,
          tags: ['hackathon', 'tips', 'programming'],
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'TechFest 2024 — Recap and Highlights',
          slug: 'techfest-2024-recap',
          excerpt: 'Over 500 students, 40 hours of events, and memories that will last a lifetime. Here is a full recap of our biggest event of the year.',
          content: `# TechFest 2024 — Recap

What a weekend! TechFest 2024 broke every record we set in previous years.

## By the Numbers
- **500+** attendees
- **12** events across 2 days
- **₹2,00,000** in prizes distributed
- **30** college teams participated
- **8** industry sponsors

## Highlights

### Hackathon
Team CodeStorm from IIT Kanpur won the grand prize with their AI-powered waste sorting system. Judges were blown away by the accuracy and real-world applicability.

### Keynote
Dr. Ananya Krishnan, CTO of Zerodha, delivered an inspiring talk on "Building for Bharat" — how fintech is reshaping India.

### Cultural Evening
The closing night featured performances by 15 student groups, a DJ set, and a spectacular drone light show.

## What's Next?
TechFest 2025 is already in planning. Bigger prizes, more workshops, and more surprises. Stay tuned!`,
          author: adminUser._id,
          category: 'events',
          status: 'published',
          isFeatured: true,
          readTime: 4,
          tags: ['techfest', 'events', 'recap'],
          publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'The Nachiketa Story: 8 Years of Impact',
          slug: 'nachiketa-8-years-story',
          excerpt: 'From a small group of passionate students to a 2000-member community — the journey of Nachiketa Society.',
          content: `# The Nachiketa Story

In 2016, five students sat in a hostel room with one shared frustration: their college curriculum wasn't teaching them what the industry needed.

So they started Nachiketa.

## The Early Days
The first event was a 20-person coding session in a borrowed classroom. No budget, no sponsors, no formal structure — just passion and a shared Google Sheet.

## Growth
By 2018, Nachiketa had 200 members and its first corporate sponsor. By 2020, we ran our first hackathon with ₹50,000 in prizes.

## Today
8 years later, we have 2,000+ active members, 150+ events under our belt, and alumni at Google, Microsoft, Amazon, and startups across India.

The mission hasn't changed: help students bridge the gap between education and industry.

We're just getting started.`,
          author: adminUser._id,
          category: 'society',
          status: 'published',
          isFeatured: false,
          readTime: 5,
          tags: ['society', 'history', 'community'],
          publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Top 10 Resources to Learn DSA in 2025',
          slug: 'top-10-dsa-resources-2025',
          excerpt: 'Data structures and algorithms are the backbone of technical interviews. Here are the best resources to master DSA this year.',
          content: `# Top 10 Resources to Learn DSA in 2025

Whether you're preparing for placements or just want to think algorithmically, these resources are the best of the best.

1. **LeetCode** — 2000+ problems, company-tagged, with discussion boards
2. **Striver's SDE Sheet** — 180 must-do problems with video explanations
3. **Abdul Bari on YouTube** — Best for understanding concepts visually
4. **CLRS (Introduction to Algorithms)** — The bible for theory
5. **NeetCode.io** — Clean explanations and pattern-based learning
6. **Codeforces** — For competitive programming practice
7. **GeeksforGeeks** — Great for quick reference
8. **CS50 (Harvard)** — Free, excellent for fundamentals
9. **Errichto on YouTube** — Advanced competitive programming
10. **The Algorithm Design Manual** — Practical, real-world problems

## Suggested 3-Month Plan
- Month 1: Arrays, Strings, Hashing, Two Pointers
- Month 2: Trees, Graphs, Dynamic Programming
- Month 3: Mixed practice, mock interviews, company-specific prep

Consistency beats intensity. 2 hours daily > 14 hours once a week.`,
          author: adminUser._id,
          category: 'tips',
          status: 'published',
          isFeatured: false,
          readTime: 7,
          tags: ['DSA', 'placement', 'resources'],
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ]);
      console.log('✅ Sample blogs created');
    }

    // ─── Sample Team Members ──────────────────────────────────────────────────
    const teamCount = await TeamMember.countDocuments();
    if (teamCount === 0) {
      await TeamMember.insertMany([
        { name: 'Arjun Verma',    designation: 'President',          department: 'core',       order: 1, session: '2024-25', year: '4th', branch: 'CSE', bio: 'Final year CSE student passionate about AI and community building.', socialLinks: { linkedin: '#', github: '#' } },
        { name: 'Priya Singh',    designation: 'Vice President',     department: 'core',       order: 2, session: '2024-25', year: '4th', branch: 'ECE', bio: 'ECE student with a love for IoT and hardware hacking.' },
        { name: 'Rahul Gupta',    designation: 'Technical Head',     department: 'technical',  order: 1, session: '2024-25', year: '3rd', branch: 'CSE', bio: 'Full stack developer and open source contributor.' },
        { name: 'Sneha Patel',    designation: 'Creative Director',  department: 'creative',   order: 1, session: '2024-25', year: '3rd', branch: 'Design', bio: 'UI/UX designer who believes design is problem-solving.' },
        { name: 'Vikram Rao',     designation: 'Marketing Head',     department: 'marketing',  order: 1, session: '2024-25', year: '3rd', branch: 'MBA', bio: 'Marketing enthusiast and event strategist.' },
        { name: 'Ananya Joshi',   designation: 'Events Manager',     department: 'management', order: 1, session: '2024-25', year: '2nd', branch: 'CSE', bio: 'Master organizer with an eye for detail.' },
        { name: 'Karan Mehta',    designation: 'Developer',          department: 'technical',  order: 2, session: '2024-25', year: '2nd', branch: 'IT',  bio: 'React and Node.js developer.' },
        { name: 'Divya Kumar',    designation: 'Content Writer',     department: 'creative',   order: 2, session: '2024-25', year: '2nd', branch: 'English', bio: 'Writer and storyteller.' },
        { name: 'Prof. A. Sharma','designation': 'Faculty Advisor',  department: 'advisor',    order: 1, session: '2024-25', bio: '15 years of teaching experience in Computer Science.', isActive: true },
      ]);
      console.log('✅ Sample team members created');
    }

    // ─── Sample Sponsors ──────────────────────────────────────────────────────
    const sponsorCount = await Sponsor.countDocuments();
    if (sponsorCount === 0) {
      await Sponsor.insertMany([
        { name: 'TechCorp India',   logo: 'https://placehold.co/200x80/6366f1/ffffff?text=TechCorp',  tier: 'platinum', website: 'https://example.com', isActive: true, order: 1 },
        { name: 'InnovateLab',      logo: 'https://placehold.co/200x80/a855f7/ffffff?text=InnovateLab',tier: 'gold',     website: 'https://example.com', isActive: true, order: 2 },
        { name: 'CloudBase',        logo: 'https://placehold.co/200x80/22c55e/ffffff?text=CloudBase',  tier: 'gold',     website: 'https://example.com', isActive: true, order: 3 },
        { name: 'DevTools Pro',     logo: 'https://placehold.co/200x80/f43f5e/ffffff?text=DevTools',   tier: 'silver',   website: 'https://example.com', isActive: true, order: 4 },
        { name: 'StartupHub',       logo: 'https://placehold.co/200x80/f59e0b/ffffff?text=StartupHub', tier: 'partner',  website: 'https://example.com', isActive: true, order: 5 },
      ]);
      console.log('✅ Sample sponsors created');
    }

    // ─── Sample Achievements ──────────────────────────────────────────────────
    const achieveCount = await Achievement.countDocuments();
    if (achieveCount === 0) {
      await Achievement.insertMany([
        { title: 'Smart India Hackathon — National Winner',      description: 'Our team won the Smart India Hackathon 2024 Grand Finale, defeating 500+ teams from across India.', category: 'competition', date: new Date('2024-12-15'), position: '1st Place', isFeatured: true, participants: [{ name: 'Team CodeStorm', role: 'Winners' }], organizer: 'Govt. of India' },
        { title: 'Best Technical Society Award',                  description: 'Nachiketa was awarded the Best Technical Society by the university for outstanding student engagement and events.', category: 'recognition', date: new Date('2024-11-01'), isFeatured: true, organizer: 'University' },
        { title: 'HackJNU 2024 — Runners Up',                    description: 'Our team secured 2nd place at HackJNU 2024 with a healthcare AI solution.', category: 'competition', date: new Date('2024-09-20'), position: '2nd Place', participants: [{ name: 'Team MedAI', role: 'Runners Up' }], organizer: 'JNU' },
        { title: '2000 Members Milestone',                         description: 'Nachiketa crossed 2000 active members, becoming the largest technical society in the university.', category: 'milestone', date: new Date('2024-08-01'), isFeatured: true, organizer: 'Nachiketa Society' },
        { title: 'Google Developer Student Club Collaboration',   description: 'Partnered with GDSC for a 3-day developer bootcamp attended by 400+ students.', category: 'recognition', date: new Date('2024-07-15'), organizer: 'Google' },
      ]);
      console.log('✅ Sample achievements created');
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('─────────────────────────────────');
    console.log('Admin credentials:');
    console.log('  Email:    admin@nachiketa.in');
    console.log('  Password: Admin@123456');
    console.log('─────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
