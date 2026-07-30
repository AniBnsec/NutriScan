const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'nutriscan_secret_key_2024', { expiresIn: '30d' });

const formatUser = (u) => ({
  id: u._id, name: u.name, email: u.email,
  calorieGoal: u.calorieGoal, proteinGoal: u.proteinGoal, carbGoal: u.carbGoal,
  fatGoal: u.fatGoal, fiberGoal: u.fiberGoal,
  age: u.age, weight: u.weight, height: u.height,
  gender: u.gender, activityLevel: u.activityLevel,
  targetWeight: u.targetWeight, weightGoalType: u.weightGoalType, weeklyGoalRate: u.weeklyGoalRate,
  dietMode: u.dietMode, language: u.language, theme: u.theme,
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, calorieGoal } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Please provide name, email and password' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, calorieGoal: calorieGoal || 2000 });
    res.status(201).json({ token: generateToken(user._id), user: formatUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: generateToken(user._id), user: formatUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => res.json({ user: formatUser(req.user) }));

// PATCH /api/auth/profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const allowed = ['name', 'calorieGoal', 'proteinGoal', 'carbGoal', 'fatGoal', 'fiberGoal', 'age', 'weight', 'height', 'gender', 'activityLevel', 'targetWeight', 'weightGoalType', 'weeklyGoalRate', 'dietMode', 'language', 'theme'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user: formatUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
