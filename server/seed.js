require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const users = [
      { name: 'Admin User', email: 'admin@lostfound.com', passwordHash, role: 'admin' },
      { name: 'Moderator User', email: 'mod@lostfound.com', passwordHash, role: 'moderator' },
      { name: 'Standard User', email: 'user@lostfound.com', passwordHash, role: 'user' }
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`Created user: ${u.email}`);
      } else {
        console.log(`User already exists: ${u.email}`);
      }
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedUsers();
