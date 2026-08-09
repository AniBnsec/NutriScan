const express = require('express');
const router = express.Router();
const fs = require('fs');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/fridge/scan — Scan fridge image and detect ingredients
router.post('/scan', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const imageData = fs.readFileSync(req.file.path);
    const base64Image = imageData.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert refrigerator content analyzer. Examine this fridge/pantry image carefully.

Identify ALL visible food items, ingredients, condiments, beverages, and produce.

For each item return:
- name: specific item name (e.g. "Chicken Breast", "Broccoli", "Cheddar Cheese", "Greek Yogurt")
- qty: estimated quantity/amount visible (e.g. "500g", "3 pieces", "1 bottle", "half full")
- category: one of: protein | vegetable | fruit | dairy | grain | condiment | beverage | other
- icon: single most relevant emoji

Return ONLY a raw valid JSON array. No markdown. No explanation:
[
  { "name": "Eggs", "qty": "6 eggs", "category": "protein", "icon": "🥚" }
]

If no food items are visible, return: []`;

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

    // Add unique IDs and selected=true
    items = items.map((item, i) => ({
      id: `item-${Date.now()}-${i}`,
      name: item.name || 'Unknown Item',
      qty: item.qty || '',
      category: item.category || 'other',
      icon: item.icon || '🥘',
      selected: true,
    }));

    res.json({ items, count: items.length });
  } catch (e) {
    console.error('Fridge scan error:', e.message);
    res.status(500).json({ message: 'Fridge scan failed: ' + e.message });
  }
});

// POST /api/fridge/recipes — Generate AI recipes from selected ingredients
router.post('/recipes', auth, async (req, res) => {
  try {
    const { ingredients = [], targetCalories = 600, targetProtein = 35 } = req.body;

    if (!ingredients.length) {
      return res.status(400).json({ message: 'No ingredients provided' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const ingredientList = ingredients.map(i => `${i.name} (${i.qty})`).join(', ');

    const prompt = `You are a world-class nutritionist and chef AI.

Available Ingredients: ${ingredientList}

User's Macro Target for this meal:
- Max Calories: ${targetCalories} kcal
- Min Protein: ${targetProtein}g

Create 2 realistic, delicious recipe ideas using ONLY the available ingredients listed above.
Each recipe must be achievable with common pantry staples (salt, pepper, oil assumed).

Return ONLY a raw valid JSON array with exactly 2 recipes. No markdown. No explanation:
[
  {
    "id": "rec-1",
    "name": "Recipe Name",
    "cookTime": "15 mins",
    "prepTime": "5 mins",
    "difficulty": "Easy",
    "calories": 420,
    "protein": 38,
    "carbs": 12,
    "fat": 18,
    "aiScore": "97% Macro Match",
    "ingredientsUsed": ["Chicken Breast", "Spinach"],
    "steps": [
      "Step 1 detailed instruction.",
      "Step 2 detailed instruction.",
      "Step 3 detailed instruction.",
      "Step 4 detailed instruction."
    ]
  }
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let recipes = [];
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) recipes = JSON.parse(match[0]);
    } catch {
      recipes = [];
    }

    // Attach stock food photos based on category keywords
    const FOOD_IMAGES = [
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ];

    recipes = recipes.map((r, i) => ({
      ...r,
      image: FOOD_IMAGES[i % FOOD_IMAGES.length],
    }));

    res.json({ recipes });
  } catch (e) {
    console.error('Recipe generation error:', e.message);
    res.status(500).json({ message: 'Recipe generation failed: ' + e.message });
  }
});

module.exports = router;
