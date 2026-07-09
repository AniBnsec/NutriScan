const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { MealPlan, MealTemplate } = require('../models/MealPlan');
const Meal = require('../models/Meal');

// Default meal templates
const DEFAULT_TEMPLATES = [
  {
    name: 'Indian Vegetarian Day', dietType: 'indian', mealType: 'any', isDefault: true, estimatedCalories: 1800,
    description: 'Balanced Indian veg meals with dal, sabzi, roti',
    foods: [{ name: 'roti', portion_g: 120 }, { name: 'dal tadka', portion_g: 200 }, { name: 'mixed salad', portion_g: 100 }]
  },
  {
    name: 'High Protein Day', dietType: 'high_protein', mealType: 'any', isDefault: true, estimatedCalories: 2000,
    description: '160g+ protein: chicken, eggs, paneer',
    foods: [{ name: 'chicken breast', portion_g: 200 }, { name: 'eggs', portion_g: 150 }, { name: 'paneer', portion_g: 100 }]
  },
  {
    name: 'Keto Day', dietType: 'keto', mealType: 'any', isDefault: true, estimatedCalories: 1800,
    description: 'Low carb, high fat ketogenic meals',
    foods: [{ name: 'eggs', portion_g: 200 }, { name: 'salmon', portion_g: 150 }, { name: 'butter', portion_g: 30 }]
  },
  {
    name: 'Vegan Power Day', dietType: 'vegan', mealType: 'any', isDefault: true, estimatedCalories: 1700,
    description: 'Plant-based protein and nutrients',
    foods: [{ name: 'tofu', portion_g: 200 }, { name: 'lentils', portion_g: 200 }, { name: 'spinach', portion_g: 150 }]
  },
  {
    name: 'Light & Clean', dietType: 'general', mealType: 'any', isDefault: true, estimatedCalories: 1400,
    description: 'Low calorie clean eating day',
    foods: [{ name: 'mixed salad', portion_g: 200 }, { name: 'grilled chicken', portion_g: 150 }, { name: 'oatmeal', portion_g: 100 }]
  },
];

function getWeekId(date) {
  const d = date ? new Date(date) : new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - jan1) / 86400000) + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// GET /api/planner/templates
router.get('/templates', auth, async (req, res) => {
  try {
    const userTemplates = await MealTemplate.find({ userId: req.user._id });
    const defaults = DEFAULT_TEMPLATES.map((t, i) => ({ ...t, _id: `default_${i}`, isDefault: true }));
    res.json({ templates: [...defaults, ...userTemplates] });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/planner/templates — Save custom template
router.post('/templates', auth, async (req, res) => {
  try {
    const { name, description, dietType, mealType, foods, estimatedCalories } = req.body;
    if (!name || !foods?.length) return res.status(400).json({ message: 'Name and foods required' });
    const template = await MealTemplate.create({ userId: req.user._id, name, description, dietType, mealType, foods, estimatedCalories });
    res.status(201).json({ template });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/planner/week?date=YYYY-MM-DD
router.get('/week', auth, async (req, res) => {
  try {
    const week = req.query.week || getWeekId(req.query.date);
    let plan = await MealPlan.findOne({ userId: req.user._id, week });
    if (!plan) {
      // Generate empty week
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        // Find Monday of current week
        const dayOfWeek = d.getDay();
        const diff = i - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
        d.setDate(d.getDate() + diff);
        days.push({ date: d.toISOString().split('T')[0], slots: [] });
      }
      plan = { userId: req.user._id, week, days, _id: null };
    }
    res.json({ plan, week });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/planner/week — Save week plan
router.put('/week', auth, async (req, res) => {
  try {
    const { week, days } = req.body;
    const plan = await MealPlan.findOneAndUpdate(
      { userId: req.user._id, week },
      { days },
      { upsert: true, new: true }
    );
    res.json({ plan });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/planner/log — Convert planned meal to actual meal log
router.post('/log', auth, async (req, res) => {
  try {
    const { name, foods, mealType } = req.body;
    if (!foods?.length) return res.status(400).json({ message: 'No foods' });
    const { enrichFoodsWithNutrition } = require('../services/nutritionService');
    const enriched = enrichFoodsWithNutrition(foods.map(f => ({ name: f.name, portion_g: f.portion_g || 100, category: 'other', confidence: 1 })));
    const Meal = require('../models/Meal');
    const DailyLog = require('../models/DailyLog');
    const meal = await Meal.create({ userId: req.user._id, name, foods: enriched, mealType });
    const today = new Date().toISOString().split('T')[0];
    const dayStart = new Date(today + 'T00:00:00.000Z');
    const dayEnd = new Date(today + 'T23:59:59.999Z');
    const dayMeals = await Meal.find({ userId: req.user._id, createdAt: { $gte: dayStart, $lte: dayEnd } });
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
    dayMeals.forEach(m => { Object.keys(totals).forEach(k => { totals[k] += m.totals[k] || 0; }); });
    await DailyLog.findOneAndUpdate({ userId: req.user._id, date: today }, { totals, mealCount: dayMeals.length }, { upsert: true, new: true });
    res.status(201).json({ meal });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
