const express = require('express');
const router = express.Router();
const path = require('path');
const Meal = require('../models/Meal');
const DailyLog = require('../models/DailyLog');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { analyzeFoodImage } = require('../services/geminiService');
const { enrichFoodsWithNutrition } = require('../services/nutritionService');

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

async function updateDailyLog(userId, meal) {
  const date = meal.createdAt
    ? new Date(meal.createdAt).toISOString().split('T')[0]
    : getTodayDate();
  const log = await DailyLog.findOneAndUpdate(
    { userId, date },
    { $setOnInsert: { userId, date } },
    { upsert: true, new: true }
  );
  // Recalculate totals from all meals that day
  const dayStart = new Date(date + 'T00:00:00.000Z');
  const dayEnd = new Date(date + 'T23:59:59.999Z');
  const dayMeals = await Meal.find({ userId, createdAt: { $gte: dayStart, $lte: dayEnd } });
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, vitaminA: 0, vitaminC: 0, iron: 0, calcium: 0, potassium: 0 };
  dayMeals.forEach(m => { Object.keys(totals).forEach(k => { totals[k] += m.totals[k] || 0; }); });
  Object.keys(totals).forEach(k => { totals[k] = Math.round(totals[k] * 10) / 10; });
  await DailyLog.findOneAndUpdate({ userId, date }, { totals, mealCount: dayMeals.length }, { new: true });
}

// POST /api/meals/scan — AI food recognition
router.post('/scan', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const imagePath = req.file.path;
    const { foods: rawFoods, duration } = await analyzeFoodImage(imagePath);
    const enrichedFoods = enrichFoodsWithNutrition(rawFoods);

    // Build totals
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0, iron: 0, calcium: 0, potassium: 0 };
    enrichedFoods.forEach(f => { Object.keys(totals).forEach(k => { totals[k] += f.nutrition[k] || 0; }); });
    Object.keys(totals).forEach(k => { totals[k] = Math.round(totals[k] * 10) / 10; });

    res.json({ foods: enrichedFoods, totals, duration, imagePath: `/uploads/${path.basename(imagePath)}` });
  } catch (e) {
    console.error('Scan error:', e);
    res.status(500).json({ message: e.message });
  }
});

// POST /api/meals — Save a meal
router.post('/', auth, async (req, res) => {
  try {
    const { name, foods, image, notes, mealType } = req.body;
    if (!foods || foods.length === 0) return res.status(400).json({ message: 'No foods provided' });

    const meal = await Meal.create({ userId: req.user._id, name, foods, image, notes, mealType });
    await updateDailyLog(req.user._id, meal);
    res.status(201).json({ meal });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/meals/manual — Save a meal from manual food search (no image)
router.post('/manual', auth, async (req, res) => {
  try {
    const { name, foods, notes, mealType } = req.body;
    if (!foods || foods.length === 0) return res.status(400).json({ message: 'No foods provided' });

    // Enrich nutrition from food names using the nutrition service
    const enrichedFoods = enrichFoodsWithNutrition(
      foods.map(f => ({ name: f.name, portion_g: f.portion_g || 100, category: f.category || 'other', confidence: 1 }))
    );

    const meal = await Meal.create({
      userId: req.user._id,
      name: name || capitalize(mealType || 'meal'),
      foods: enrichedFoods,
      notes,
      mealType: mealType || 'lunch',
    });
    await updateDailyLog(req.user._id, meal);
    res.status(201).json({ meal });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }


// GET /api/meals — List all meals (paginated)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, date } = req.query;
    const query = { userId: req.user._id };
    if (date) {
      query.createdAt = {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lte: new Date(date + 'T23:59:59.999Z'),
      };
    }
    const meals = await Meal.find(query)
      .sort({ createdAt: -1 })
      .limit(+limit)
      .skip((+page - 1) * +limit);
    const total = await Meal.countDocuments(query);
    res.json({ meals, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/meals/today — Today's meals
router.get('/today', auth, async (req, res) => {
  try {
    const today = getTodayDate();
    const meals = await Meal.find({
      userId: req.user._id,
      createdAt: { $gte: new Date(today + 'T00:00:00.000Z'), $lte: new Date(today + 'T23:59:59.999Z') },
    }).sort({ createdAt: -1 });
    res.json({ meals });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/meals/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ meal });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/meals/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    await updateDailyLog(req.user._id, meal);
    res.json({ message: 'Meal deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
