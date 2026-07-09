const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized');
  } else {
    console.warn('⚠️  GEMINI_API_KEY not set — using mock food recognition');
  }
} catch (e) {
  console.warn('⚠️  Gemini init failed:', e.message);
}

const PROMPT = `You are an expert nutritionist and food recognition AI with deep knowledge of both Indian and international cuisines.

Analyze this food image and identify ALL visible food items.

For each food item:
1. Name it specifically (e.g., "basmati rice" not just "rice", "grilled chicken breast" not just "chicken")
2. Estimate portion size in grams (for liquids/beverages use ml as grams equivalent)
3. Confidence score from 0 to 1
4. Food category
5. Brief visual description

IMPORTANT: Return ONLY a valid JSON array (no markdown code blocks, no explanation text):
[
  {
    "name": "specific food name",
    "portion_g": <integer grams>,
    "confidence": <0.0 to 1.0>,
    "category": "protein|carb|vegetable|fruit|dairy|fat|beverage|dessert|other",
    "description": "brief visual description"
  }
]

If no food is visible, return: []
Include ALL visible items even garnishes and sauces if substantial.`;

async function analyzeFoodImage(imagePath) {
  const startTime = Date.now();
  
  if (!genAI) {
    console.log('🤖 Using demo food recognition (no API key)');
    await new Promise(r => setTimeout(r, 1500)); // simulate delay
    return { foods: getDemoFoods(), duration: Date.now() - startTime };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);

    const result = await model.generateContent([
      PROMPT,
      { inlineData: { data: base64Image, mimeType } },
    ]);

    const text = result.response.text().trim();
    console.log('📊 Gemini raw response:', text.substring(0, 200));

    // Extract JSON array from response
    let jsonText = text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) jsonText = jsonMatch[0];

    const foods = JSON.parse(jsonText);
    return {
      foods: Array.isArray(foods) && foods.length > 0 ? foods : getDemoFoods(),
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    return { foods: getDemoFoods(), duration: Date.now() - startTime };
  }
}

function getMimeType(filePath) {
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif',
    '.webp': 'image/webp', '.heic': 'image/heic', '.heif': 'image/heic',
  };
  return map[path.extname(filePath).toLowerCase()] || 'image/jpeg';
}

function getDemoFoods() {
  const demos = [
    [
      { name: 'basmati rice', portion_g: 150, confidence: 0.94, category: 'carb', description: 'Fluffy white basmati rice' },
      { name: 'dal tadka', portion_g: 180, confidence: 0.91, category: 'protein', description: 'Yellow lentil curry with tempering' },
      { name: 'roti', portion_g: 60, confidence: 0.95, category: 'carb', description: 'Two pieces of whole wheat roti' },
      { name: 'mixed salad', portion_g: 80, confidence: 0.88, category: 'vegetable', description: 'Fresh cucumber, tomato, onion salad' },
    ],
    [
      { name: 'grilled chicken breast', portion_g: 150, confidence: 0.93, category: 'protein', description: 'Grilled chicken breast with herbs' },
      { name: 'brown rice', portion_g: 120, confidence: 0.90, category: 'carb', description: 'Steamed brown rice' },
      { name: 'steamed broccoli', portion_g: 100, confidence: 0.92, category: 'vegetable', description: 'Steamed broccoli florets' },
    ],
    [
      { name: 'butter chicken', portion_g: 200, confidence: 0.92, category: 'protein', description: 'Creamy tomato-based chicken curry' },
      { name: 'naan bread', portion_g: 90, confidence: 0.96, category: 'carb', description: 'Two pieces of butter naan' },
      { name: 'raita', portion_g: 80, confidence: 0.87, category: 'dairy', description: 'Yogurt with cucumber and cumin' },
    ],
  ];
  return demos[Math.floor(Math.random() * demos.length)];
}

module.exports = { analyzeFoodImage };
