const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google & Cloudflare Public DNS to bypass local ISP/router SRV DNS block
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

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

