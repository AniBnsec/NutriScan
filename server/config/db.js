const mongoose = require('mongoose');

// Disable Mongoose query buffering to fail fast with clear errors instead of hanging 10s
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('⚠️ MONGODB_URI not provided.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('💡 Check MongoDB Atlas password & make sure Network Access allows 0.0.0.0/0.');
  }
};

module.exports = connectDB;

