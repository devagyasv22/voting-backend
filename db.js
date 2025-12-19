const mongoose = require('mongoose');

const mongoURL = process.env.MONGO_URI;

if (!mongoURL) {
  console.error("MongoDB URI missing in .env");
  process.exit(1);
}

mongoose.connect(mongoURL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = mongoose;
