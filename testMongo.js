const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/lostfound_plus', { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log('Successfully connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
