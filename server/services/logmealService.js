const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
require('dotenv').config();

async function analyzeFoodImage(imagePath) {
  const startTime = Date.now();
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Please add it to your Render environment variables.');
  }

  try {
    console.log('🤖 Sending image to Gemini Vision API...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Determine mime type based on extension
    let mimeType = 'image/jpeg';
    if (imagePath.toLowerCase().endsWith('.png')) mimeType = 'image/png';
    if (imagePath.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';

    const imagePart = {
      inlineData: {
        data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
        mimeType: mimeType
      },
    };

    const prompt = `You are an expert AI Nutritionist. Analyze this image of a meal.
Identify all the food items present. 
If there is NO food in the image, you MUST return exactly the word: NO_FOOD_DETECTED.
Otherwise, return a JSON array of the detected foods. DO NOT wrap it in markdown block, just raw JSON string.
Format for each item in the array:
{
  "name": "Food Name (e.g. Rice, Momos, English Breakfast)",
  "portion_g": estimated portion size in grams (e.g. 150),
  "category": "protein" | "carb" | "vegetable" | "fruit" | "dairy" | "fat" | "beverage" | "dessert" | "other",
  "logmealNutrition": {
    "calories": estimated kcal,
    "protein": estimated protein in g,
    "carbs": estimated carbs in g,
    "fat": estimated fat in g,
    "fiber": estimated fiber in g,
    "sugar": estimated sugar in g,
    "sodium": estimated sodium in mg
  }
}
Only return the JSON array, nothing else.`;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text().trim();

    if (text.includes('NO_FOOD_DETECTED')) {
      throw new Error('No valid food detected in the image. Please try a clearer photo of a meal.');
    }

    let jsonStr = text;
    if (jsonStr.startsWith('\`\`\`json')) jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    if (jsonStr.startsWith('\`\`\`')) jsonStr = jsonStr.replace(/\`\`\`/g, '').trim();

    const foods = JSON.parse(jsonStr);
    
    // Add confidence score to match original API
    foods.forEach(f => f.confidence = 0.95);

    console.log('✅ Gemini Vision successfully analyzed the food!');

    return {
      foods: foods,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error('❌ Gemini Vision API error:', error.message);
    
    if (error.message.includes('No valid food detected')) {
        throw error;
    }
    
    if (error.message.includes('API key not valid')) {
        throw new Error('Your Gemini API Key is invalid. Please check Render environment variables.');
    }
    
    throw new Error(`AI Scan Failed: ${error.message}`);
  }
}

module.exports = { analyzeFoodImage };
