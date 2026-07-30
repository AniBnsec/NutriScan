const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logmealService = require('./logmealService');

const PROMPT = `You are a world-class nutritionist and master AI food recognition system with deep expertise in Indian and international cuisines.

Examine this food image with high precision and identify ALL visible food and beverage items.

For each food item:
1. Provide the exact, specific name of the dish or item (e.g., "Paneer Butter Masala", "Chicken Biryani", "Masala Dosa", "Dal Tadka", "Basmati Rice", "Whole Wheat Roti", "Grilled Chicken Breast").
2. Estimate the realistic portion size in grams (or ml for liquids/drinks).
3. Assign a confidence score between 0.85 and 1.00.
4. Categorize as: protein | carb | vegetable | fruit | dairy | fat | beverage | dessert | other.
5. Provide a short visual description.

Return ONLY a raw valid JSON array without any markdown formatting or commentary:
[
  {
    "name": "Paneer Butter Masala",
    "portion_g": 200,
    "confidence": 0.95,
    "category": "protein",
    "description": "Rich creamy tomato gravy with cottage cheese cubes"
  }
]

If no food is visible in the image, return: []`;

function getMimeType(filePath) {
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif',
    '.webp': 'image/webp', '.heic': 'image/heic', '.heif': 'image/heic',
  };
  return map[path.extname(filePath).toLowerCase()] || 'image/jpeg';
}

function parseJsonArray(text) {
  if (!text) return null;
  let jsonText = text.trim();
  const match = jsonText.match(/\[[\s\S]*\]/);
  if (match) jsonText = match[0];
  try {
    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (e) {
    return null;
  }
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

// ─────────────────────────────────────────────────────────────
// 1. VISION FOOD RECOGNITION PIPELINE (Gemini -> Groq -> OpenAI -> LogMeal -> Demo)
// ─────────────────────────────────────────────────────────────

async function analyzeFoodImageMultiModel(imagePath) {
  const startTime = Date.now();
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = getMimeType(imagePath);
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  // Priority 1: LogMeal API
  if (process.env.LOGMEAL_API_TOKEN || process.env.LOGMEAL_COMPANY_TOKEN) {
    try {
      console.log('🤖 [1/5] Trying LogMeal API...');
      const result = await logmealService.analyzeFoodImage(imagePath);
      if (result?.foods?.length > 0) {
        console.log('✅ Recognized food via LogMeal API!');
        return { ...result, provider: 'LogMeal' };
      }
    } catch (err) {
      if (err.message.includes('No valid food detected')) {
        throw err;
      }
      console.warn('⚠️ LogMeal API failed, proceeding to Gemini Vision fallback:', err.message);
    }
  }

  // Priority 2: Gemini Vision AI
  if (process.env.GEMINI_API_KEY) {
    const modelsToTry = ['gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    for (const modelName of modelsToTry) {
      try {
        console.log(`🤖 [2/5] Trying Gemini Vision API (${modelName})...`);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          PROMPT,
          { inlineData: { data: base64Image, mimeType } }
        ]);
        const text = result.response.text();
        const foods = parseJsonArray(text);
        if (foods) {
          console.log(`✅ Recognized food via Gemini Vision AI (${modelName})!`);
          return { foods, duration: Date.now() - startTime, provider: `Gemini (${modelName})` };
        }
      } catch (err) {
        console.warn(`⚠️ Gemini Vision (${modelName}) failed:`, err.message);
      }
    }
  }

  // Priority 3: Groq Vision AI
  if (process.env.GROQ_API_KEY) {
    try {
      console.log('🤖 [3/5] Trying Groq Vision API...');
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.2-11b-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: PROMPT },
                { type: 'image_url', image_url: { url: dataUrl } }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY.trim()}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      const content = response.data?.choices?.[0]?.message?.content;
      const foods = parseJsonArray(content);
      if (foods) {
        console.log('✅ Recognized food via Groq Vision AI!');
        return { foods, duration: Date.now() - startTime, provider: 'Groq (llama-3.2-vision)' };
      }
    } catch (err) {
      console.warn('⚠️ Groq Vision failed:', err.response?.data?.error?.message || err.message);
    }
  }

  // Priority 4: OpenAI Vision AI
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('🤖 [4/5] Trying OpenAI Vision API...');
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: PROMPT },
                { type: 'image_url', image_url: { url: dataUrl } }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY.trim()}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      const content = response.data?.choices?.[0]?.message?.content;
      const foods = parseJsonArray(content);
      if (foods) {
        console.log('✅ Recognized food via OpenAI Vision AI!');
        return { foods, duration: Date.now() - startTime, provider: 'OpenAI (gpt-4o-mini)' };
      }
    } catch (err) {
      console.warn('⚠️ OpenAI Vision failed:', err.response?.data?.error?.message || err.message);
    }
  }

  // If all vision recognition providers failed
  throw new Error('Food recognition failed. Please upload a clear, well-lit photo of food.');
}

// ─────────────────────────────────────────────────────────────
// 2. COACH CHAT MULTI-MODEL ASSISTANT (Groq -> Gemini -> OpenAI -> Cohere)
// ─────────────────────────────────────────────────────────────

async function chatWithCoachMultiModel(message, history = [], userPromptContext = {}) {
  const { systemPrompt, userName = 'there', userGoal = 2000, todayCalories = 0, mealCount = 0 } = userPromptContext;

  // Formatting history for OpenAI / Groq format
  const messagesFormatted = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map(h => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.content
    })),
    { role: 'user', content: message }
  ];

  // Priority 1: Groq Chat AI
  if (process.env.GROQ_API_KEY) {
    try {
      console.log('💬 [1/4] Coach Chat using Groq API...');
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: messagesFormatted,
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY.trim()}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      const reply = response.data?.choices?.[0]?.message?.content;
      if (reply) {
        return { reply, provider: 'Groq (llama-3.3-70b)' };
      }
    } catch (err) {
      console.warn('⚠️ Groq Coach Chat failed:', err.response?.data?.error?.message || err.message);
    }
  }

  // Priority 2: Gemini Chat AI
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('💬 [2/4] Coach Chat using Gemini API...');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const chatHistory = history.slice(-6).map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));
      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: `Hello ${userName}! I'm NutriCoach, your personal AI nutrition advisor.` }] },
          ...chatHistory,
        ]
      });
      const result = await chat.sendMessage(message);
      const reply = result.response.text();
      if (reply) {
        return { reply, provider: 'Gemini (gemini-1.5-flash)' };
      }
    } catch (err) {
      console.warn('⚠️ Gemini Coach Chat failed:', err.message);
    }
  }

  // Priority 3: OpenAI Chat AI
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('💬 [3/4] Coach Chat using OpenAI API...');
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: messagesFormatted,
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY.trim()}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      const reply = response.data?.choices?.[0]?.message?.content;
      if (reply) {
        return { reply, provider: 'OpenAI (gpt-4o-mini)' };
      }
    } catch (err) {
      console.warn('⚠️ OpenAI Coach Chat failed:', err.response?.data?.error?.message || err.message);
    }
  }

  // Priority 4: Cohere Chat AI
  if (process.env.COHERE_API_KEY) {
    try {
      console.log('💬 [4/4] Coach Chat using Cohere API...');
      const response = await axios.post(
        'https://api.cohere.com/v1/chat',
        {
          model: 'command-r-plus',
          message: message,
          preamble: systemPrompt,
          chat_history: history.slice(-6).map(h => ({
            role: h.role === 'model' ? 'CHATBOT' : 'USER',
            message: h.content
          }))
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.COHERE_API_KEY.trim()}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      const reply = response.data?.text;
      if (reply) {
        return { reply, provider: 'Cohere (command-r-plus)' };
      }
    } catch (err) {
      console.warn('⚠️ Cohere Coach Chat failed:', err.response?.data?.message || err.message);
    }
  }

  throw new Error('AI Coach service temporarily unavailable. Please check your API keys.');
}

module.exports = {
  analyzeFoodImageMultiModel,
  chatWithCoachMultiModel
};
