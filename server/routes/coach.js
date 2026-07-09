const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const DailyLog = require('../models/DailyLog');

let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (e) { console.log('Gemini not available for coach'); }

// POST /api/coach/chat
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    // Build user nutrition context
    const today = new Date().toISOString().split('T')[0];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    const logs = await DailyLog.find({ userId: req.user._id, date: { $in: days } });
    const todayLog = logs.find(l => l.date === today);
    const avgCal = logs.length ? Math.round(logs.reduce((a, l) => a + (l.totals?.calories || 0), 0) / logs.length) : 0;
    const avgProtein = logs.length ? Math.round(logs.reduce((a, l) => a + (l.totals?.protein || 0), 0) / logs.length) : 0;

    const u = req.user;
    const systemPrompt = `You are NutriCoach, a friendly and knowledgeable AI nutrition advisor. You provide evidence-based, practical nutrition advice.

USER PROFILE:
- Name: ${u.name}
- Age: ${u.age || 'unknown'}
- Weight: ${u.weight ? u.weight + 'kg' : 'not set'}
- Height: ${u.height ? u.height + 'cm' : 'not set'}
- Calorie Goal: ${u.calorieGoal || 2000} kcal/day
- Protein Goal: ${u.proteinGoal || 150}g/day
- Diet Mode: ${u.dietMode || 'general'}
- Goal: ${u.weightGoalType || 'maintain'}

TODAY'S NUTRITION (${today}):
- Calories: ${todayLog?.totals?.calories || 0} / ${u.calorieGoal || 2000} kcal
- Protein: ${todayLog?.totals?.protein || 0}g / ${u.proteinGoal || 150}g
- Carbs: ${todayLog?.totals?.carbs || 0}g
- Fat: ${todayLog?.totals?.fat || 0}g
- Fiber: ${todayLog?.totals?.fiber || 0}g
- Sodium: ${todayLog?.totals?.sodium || 0}mg
- Meals logged today: ${todayLog?.mealCount || 0}

7-DAY AVERAGES:
- Avg calories: ${avgCal} kcal
- Avg protein: ${avgProtein}g

INSTRUCTIONS:
- Be concise (2-4 sentences usually)
- Use emojis sparingly for friendliness
- Give specific, actionable advice based on the user's ACTUAL data above
- If asked about today's data, refer to the real numbers above
- Address the user by first name occasionally
- If the API key is limited, still give helpful general advice`;

    if (!genAI) {
      // Fallback responses
      const fallbacks = {
        protein: `Great question, ${u.name.split(' ')[0]}! 💪 You need ${u.proteinGoal || 150}g of protein daily. Good sources include chicken breast (31g/100g), eggs (13g each), paneer (18g/100g), and dal (9g/100g). Try adding a protein source to every meal.`,
        calorie: `Today you've had ${todayLog?.totals?.calories || 0} of your ${u.calorieGoal || 2000} kcal goal. ${(todayLog?.totals?.calories || 0) < (u.calorieGoal || 2000) ? 'You still have room for a nutritious meal!' : 'Great job hitting your goal!'}`,
        default: `Based on your profile, I recommend focusing on hitting your ${u.calorieGoal || 2000} kcal goal with balanced macros. You're doing ${(todayLog?.mealCount || 0) > 0 ? 'great' : 'okay'} today with ${todayLog?.mealCount || 0} meals logged. Keep it up! 🥗`,
      };
      const lower = message.toLowerCase();
      let reply = fallbacks.default;
      if (lower.includes('protein')) reply = fallbacks.protein;
      else if (lower.includes('calorie') || lower.includes('goal')) reply = fallbacks.calorie;
      return res.json({ reply, context: { calories: todayLog?.totals?.calories || 0 } });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build chat history for context
    const chatHistory = history.slice(-6).map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: `Hello ${u.name.split(' ')[0]}! I'm NutriCoach, your personal AI nutrition advisor. I can see your nutrition data and I'm ready to help you reach your health goals. What would you like to know?` }] },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();
    res.json({ reply, context: { calories: todayLog?.totals?.calories || 0, mealCount: todayLog?.mealCount || 0 } });
  } catch (e) {
    console.error('Coach error:', e.message);
    res.json({ reply: `I'm having trouble connecting right now, but based on your data I can see you've logged ${req.body.context?.mealCount || 0} meals today. Keep tracking your nutrition for best results! 🥗` });
  }
});

module.exports = router;
