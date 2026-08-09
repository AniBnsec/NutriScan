const express = require('express');
const router = express.Router();
const fs = require('fs');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/menu/scan — Scan restaurant menu image
router.post('/scan', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const imageData = fs.readFileSync(req.file.path);
    const base64Image = imageData.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const userGoal = req.body.goal || 'balanced';

    const prompt = `You are an expert nutritionist AI analyzing a restaurant menu image.

Read ALL visible menu items from this image carefully. For each item provide:
- id: unique string like "m1", "m2"
- name: exact dish name as written on the menu
- section: menu section/category (e.g. "Starters", "Main Course", "Desserts", "Beverages")
- description: short 1-line description of the dish
- calories: estimated calories (integer)
- protein: estimated protein in grams (integer)
- carbs: estimated carbs in grams (integer)
- fat: estimated fat in grams (integer)
- healthRating: "emerald" if healthy (high protein/low calorie/nutrient dense), "yellow" if moderate, "red" if unhealthy (high fat/sugar/processed)
- score: AI health score string like "92% Optimal" or "45% Avoid"
- tags: array of 2-3 short tags like ["High Protein", "Keto", "Vegan", "Low Carb", "High Fiber", "Deep Fried", "High Sugar", "High Sodium"]
- warning: null or short warning string like "⚠️ High Sodium (2100mg)" if applicable

User's dietary goal: ${userGoal}

Return ONLY a raw valid JSON array. No markdown. No explanation. No trailing text:
[
  {
    "id": "m1",
    "name": "Grilled Chicken Salad",
    "section": "Salads",
    "description": "Fresh greens with grilled chicken, tomatoes, and balsamic dressing",
    "calories": 320,
    "protein": 38,
    "carbs": 12,
    "fat": 10,
    "healthRating": "emerald",
    "score": "96% Optimal",
    "tags": ["High Protein", "Low Carb"],
    "warning": null
  }
]

If no readable menu items are visible return: []`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: base64Image } }
    ]);

    const text = result.response.text();
    let items = [];
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) items = JSON.parse(match[0]);
    } catch {
      items = [];
    }

    res.json({ items, count: items.length });
  } catch (e) {
    console.error('Menu scan error:', e.message);
    res.status(500).json({ message: 'Menu scan failed: ' + e.message });
  }
});

module.exports = router;
