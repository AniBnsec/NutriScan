const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DailyLog = require('../models/DailyLog');
const { chatWithCoachMultiModel } = require('../services/multiModelAiService');

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
- Address the user by first name occasionally`;

    const { reply, provider } = await chatWithCoachMultiModel(message, history, {
      systemPrompt,
      userName: u.name.split(' ')[0],
      userGoal: u.calorieGoal || 2000,
      todayCalories: todayLog?.totals?.calories || 0,
      mealCount: todayLog?.mealCount || 0
    });

    res.json({ reply, provider, context: { calories: todayLog?.totals?.calories || 0, mealCount: todayLog?.mealCount || 0 } });
  } catch (e) {
    console.error('Coach error:', e.message);
    res.json({ reply: `I'm having trouble connecting right now (Error: ${e.message}). Keep tracking your nutrition! 🥗` });
  }
});

module.exports = router;

