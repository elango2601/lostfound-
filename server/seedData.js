require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const LostItem = require('./models/LostItem');
const FoundItem = require('./models/FoundItem');
const Claim = require('./models/Claim');
const AuditLog = require('./models/AuditLog');
const Notification = require('./models/Notification');

const categories = ['Electronics', 'Wallets', 'Keys', 'Documents', 'Other'];
const locations = ['Library', 'Cafeteria', 'Main Hall', 'Gym', 'Parking Lot', 'Dormitory', 'Science Building'];
const statusesLost = ['LOST', 'MATCHED', 'CLAIMED', 'RECOVERED', 'CLOSED'];
const statusesFound = ['FOUND', 'MATCHED', 'CLAIMED', 'RETURNED', 'CLOSED'];

const randomDate = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Wiping old data (except users)...');

    await LostItem.deleteMany();
    await FoundItem.deleteMany();
    await Claim.deleteMany();
    await AuditLog.deleteMany();
    await Notification.deleteMany();

    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please run seed.js first.');
      process.exit(1);
    }
    const standardUser = users.find(u => u.role === 'user') || users[0];
    const adminUser = users.find(u => u.role === 'admin') || users[0];

    console.log('Seeding Lost Items...');
    const lostItems = [];
    for (let i = 1; i <= 25; i++) {
      const dateLost = randomDate();
      const status = randomElement(statusesLost);
      const doc = await LostItem.create({
        reportedBy: standardUser._id,
        title: `Missing ${randomElement(categories)} - ${i}`,
        description: `I lost my item near the ${randomElement(locations)}. It is very important to me!`,
        category: randomElement(categories),
        location: randomElement(locations),
        dateLost: dateLost,
        status: status,
        brand: 'GenericBrand',
        color: 'Black',
      });
      await LostItem.findByIdAndUpdate(doc._id, { createdAt: dateLost, updatedAt: dateLost }, { timestamps: false });
      lostItems.push(doc);
    }

    console.log('Seeding Found Items...');
    const foundItems = [];
    for (let i = 1; i <= 25; i++) {
      const dateFound = randomDate();
      const status = i % 4 === 0 ? 'CLAIMED' : randomElement(statusesFound);
      const doc = await FoundItem.create({
        reportedBy: adminUser._id,
        title: `Found ${randomElement(categories)} - ${i}`,
        description: `Found this item near the ${randomElement(locations)}. Handed it over to security.`,
        category: randomElement(categories),
        location: randomElement(locations),
        dateFound: dateFound,
        status: status,
        brand: 'SomeBrand',
        color: 'White',
      });
      await FoundItem.findByIdAndUpdate(doc._id, { createdAt: dateFound, updatedAt: dateFound }, { timestamps: false });
      foundItems.push(doc);
    }

    console.log('Seeding Claims & Audit Logs...');
    for (let i = 0; i < 8; i++) {
      const claim = await Claim.create({
        itemId: foundItems[i]._id,
        itemType: 'FoundItem',
        claimantId: standardUser._id,
        description: 'I have the serial number and original receipt matching the description.',
        status: 'PENDING'
      });

      await AuditLog.create({
        itemId: claim._id,
        actorId: standardUser._id,
        action: 'CREATE_CLAIM',
        newStatus: 'PENDING'
      });
    }

    console.log('Database successfully populated with rich demo data!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
