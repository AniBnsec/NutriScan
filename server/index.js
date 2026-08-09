require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Check DB connection middleware
const mongoose = require('mongoose');
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection in progress or failed authentication. Please verify MONGODB_URI password & Atlas IP Whitelist (0.0.0.0/0).'
    });
  }
  next();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/exercise', require('./routes/exercise'));
app.use('/api/supplements', require('./routes/supplements'));
app.use('/api/coach', require('./routes/coach'));
app.use('/api/planner', require('./routes/planner'));
app.use('/api/fridge', require('./routes/fridge'));
app.use('/api/menu', require('./routes/menu'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Nutrition Scanner API running', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'NutriScan API is running.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
});
