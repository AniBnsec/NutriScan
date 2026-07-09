const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const DailyLog = require('../models/DailyLog');
const WeightLog = require('../models/WeightLog');
const auth = require('../middleware/auth');


// GET /api/dashboard/today
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [log, meals] = await Promise.all([
      DailyLog.findOne({ userId: req.user._id, date: today }),
      Meal.find({
        userId: req.user._id,
        createdAt: { $gte: new Date(today + 'T00:00:00Z'), $lte: new Date(today + 'T23:59:59Z') },
      }).sort({ createdAt: -1 }),
    ]);
    res.json({
      date: today,
      totals: log?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
      mealCount: log?.mealCount || 0,
      water: log?.water || 0,
      meals,
      goals: {
        calories: req.user.calorieGoal || 2000,
        protein: req.user.proteinGoal || 150,
        carbs: req.user.carbGoal || 250,
        fat: req.user.fatGoal || 65,
        fiber: req.user.fiberGoal || 25,
      },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/dashboard/water — update water intake
router.put('/water', auth, async (req, res) => {
  try {
    const { amount } = req.body; // amount in ml (250 = 1 glass)
    const today = new Date().toISOString().split('T')[0];
    const log = await DailyLog.findOneAndUpdate(
      { userId: req.user._id, date: today },
      { $inc: { water: amount }, $setOnInsert: { userId: req.user._id, date: today } },
      { upsert: true, new: true }
    );
    const water = Math.max(0, log.water);
    if (log.water < 0) {
      await DailyLog.findOneAndUpdate({ userId: req.user._id, date: today }, { water: 0 });
    }
    res.json({ water: Math.max(0, water) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/dashboard/weekly — last 7 days
router.get('/weekly', auth, async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    const logs = await DailyLog.find({ userId: req.user._id, date: { $in: days } });
    const logMap = {};
    logs.forEach(l => { logMap[l.date] = l; });
    const weekly = days.map(date => ({
      date,
      day: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
      calories: logMap[date]?.totals?.calories || 0,
      protein: logMap[date]?.totals?.protein || 0,
      carbs: logMap[date]?.totals?.carbs || 0,
      fat: logMap[date]?.totals?.fat || 0,
      mealCount: logMap[date]?.mealCount || 0,
    }));
    res.json({ weekly, goal: req.user.calorieGoal || 2000 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/dashboard/stats — all-time stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalMeals = await Meal.countDocuments({ userId: req.user._id });
    const logs = await DailyLog.find({ userId: req.user._id });
    const avgCalories = logs.length
      ? Math.round(logs.reduce((a, l) => a + (l.totals?.calories || 0), 0) / logs.length)
      : 0;
    const streak = calcStreak(logs.map(l => l.date));
    res.json({ totalMeals, totalDays: logs.length, avgCalories, streak });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/dashboard/analytics — 30-day trends + top foods
router.get('/analytics', auth, async (req, res) => {
  try {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const logs = await DailyLog.find({ userId: req.user._id, date: { $in: days } });
    const logMap = {};
    logs.forEach(l => { logMap[l.date] = l; });

    const trend = days.map(date => ({
      date,
      label: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calories: logMap[date]?.totals?.calories || 0,
      protein: logMap[date]?.totals?.protein || 0,
      carbs: logMap[date]?.totals?.carbs || 0,
      fat: logMap[date]?.totals?.fat || 0,
      fiber: logMap[date]?.totals?.fiber || 0,
    }));

    // Top foods via aggregation
    const topFoods = await Meal.aggregate([
      { $match: { userId: req.user._id } },
      { $unwind: '$foods' },
      { $group: {
        _id: '$foods.name',
        count: { $sum: 1 },
        avgCalories: { $avg: '$foods.nutrition.calories' },
        category: { $first: '$foods.category' },
      }},
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Summary stats
    const activeLogs = logs.filter(l => (l.totals?.calories || 0) > 0);
    const avgCalories = activeLogs.length
      ? Math.round(activeLogs.reduce((a, l) => a + l.totals.calories, 0) / activeLogs.length)
      : 0;

    const maxDay = logs.reduce((best, l) => (!best || (l.totals?.calories || 0) > (best.totals?.calories || 0)) ? l : best, null);
    const goalClosestDay = activeLogs.reduce((best, l) => {
      const diff = Math.abs((l.totals?.calories || 0) - (req.user.calorieGoal || 2000));
      const bestDiff = Math.abs((best?.totals?.calories || 0) - (req.user.calorieGoal || 2000));
      return diff < bestDiff ? l : best;
    }, activeLogs[0]);

    res.json({
      trend,
      topFoods,
      summary: {
        avgCalories,
        activeDays: activeLogs.length,
        maxCalDay: maxDay?.date,
        maxCalories: maxDay?.totals?.calories || 0,
        bestDay: goalClosestDay?.date,
        avgProtein: activeLogs.length ? Math.round(activeLogs.reduce((a, l) => a + (l.totals?.protein || 0), 0) / activeLogs.length) : 0,
        avgCarbs: activeLogs.length ? Math.round(activeLogs.reduce((a, l) => a + (l.totals?.carbs || 0), 0) / activeLogs.length) : 0,
        avgFat: activeLogs.length ? Math.round(activeLogs.reduce((a, l) => a + (l.totals?.fat || 0), 0) / activeLogs.length) : 0,
      },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

function calcStreak(dates) {
  if (!dates.length) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let expected = today;
  for (const date of sorted) {
    if (date === expected) {
      streak++;
      const d = new Date(expected + 'T12:00:00');
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split('T')[0];
    } else break;
  }
  return streak;
}

// GET /api/dashboard/weight/history?days=90
router.get('/weight/history', auth, async (req, res) => {
  try {
    const days = +req.query.days || 90;
    const from = new Date();
    from.setDate(from.getDate() - days);
    const fromDate = from.toISOString().split('T')[0];
    const history = await WeightLog.find({ userId: req.user._id, date: { $gte: fromDate } }).sort({ date: -1 });
    res.json({ history });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/dashboard/weight — Log weight entry
router.post('/weight', auth, async (req, res) => {
  try {
    const { weight, bodyFat, note } = req.body;
    if (!weight || weight < 20 || weight > 500) return res.status(400).json({ message: 'Invalid weight' });
    const today = new Date().toISOString().split('T')[0];
    const entry = await WeightLog.findOneAndUpdate(
      { userId: req.user._id, date: today },
      { weight, bodyFat: bodyFat || null, note: note || '', userId: req.user._id, date: today },
      { upsert: true, new: true }
    );
    // Update user's current weight
    await require('../models/User').findByIdAndUpdate(req.user._id, { weight });
    res.json({ entry });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

