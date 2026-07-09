/**
 * Client-side utility functions
 * Health scoring, CSV export, BMI, TDEE calculations
 */

// ── Health Score ──────────────────────────────────────────
export function calcHealthScore(nutrition) {
  if (!nutrition || (nutrition.calories || 0) < 10) return 0;

  let score = 0;

  // Protein (0–25 pts): 20g+ per meal = full
  score += Math.min(25, ((nutrition.protein || 0) / 20) * 25);

  // Fiber (0–20 pts): 8g+ per meal = full
  score += Math.min(20, ((nutrition.fiber || 0) / 8) * 20);

  // Sodium control (0–20 pts): lower is better, 1200mg+ = 0
  score += Math.max(0, 20 - ((nutrition.sodium || 0) / 1200) * 20);

  // Sugar control (0–15 pts): lower is better, 40g+ = 0
  score += Math.max(0, 15 - ((nutrition.sugar || 0) / 40) * 15);

  // Calorie range (0–20 pts): 400–700 kcal ideal per meal
  const diff = Math.abs((nutrition.calories || 0) - 550);
  score += Math.max(0, 20 - (diff / 550) * 20);

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function getScoreColor(score) {
  if (score >= 75) return '#00e5a0';
  if (score >= 50) return '#ffd166';
  if (score >= 25) return '#ff9f43';
  return '#ff6b6b';
}

export function getScoreLabel(score) {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 25) return 'Fair';
  return 'Poor';
}

// ── CSV Export ────────────────────────────────────────────
export function exportMealsToCSV(meals) {
  const headers = [
    'Date', 'Time', 'Meal Name', 'Type', 'Foods',
    'Calories(kcal)', 'Protein(g)', 'Carbs(g)', 'Fat(g)',
    'Fiber(g)', 'Sugar(g)', 'Sodium(mg)', 'Health Score'
  ];

  const rows = meals.map(meal => [
    new Date(meal.createdAt).toLocaleDateString('en-IN'),
    new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    meal.name || meal.mealType || 'Meal',
    meal.mealType || '',
    (meal.foods || []).map(f => `${f.name}(${f.portion_g}g)`).join('; '),
    meal.totals?.calories || 0,
    meal.totals?.protein || 0,
    meal.totals?.carbs || 0,
    meal.totals?.fat || 0,
    meal.totals?.fiber || 0,
    meal.totals?.sugar || 0,
    meal.totals?.sodium || 0,
    calcHealthScore(meal.totals),
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nutrition-report-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── BMI Calculator ────────────────────────────────────────
export function calcBMI(weight, height) {
  if (!weight || !height) return null;
  const cm = height < 10 ? height * 30.48 : height;
  const h = cm / 100; // cm to m
  return Math.round((weight / (h * h)) * 10) / 10;
}

export function getBMICategory(bmi) {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: 'Underweight', color: '#4fc3f7', range: '< 18.5' };
  if (bmi < 25) return { label: 'Normal Weight', color: '#00e5a0', range: '18.5 – 24.9' };
  if (bmi < 30) return { label: 'Overweight', color: '#ffd166', range: '25 – 29.9' };
  return { label: 'Obese', color: '#ff6b6b', range: '≥ 30' };
}

// ── TDEE Calculator (Mifflin-St Jeor) ────────────────────
export function calcTDEE(weight, height, age, gender = 'male', activity = 'moderate') {
  if (!weight || !height || !age) return null;
  const cm = height < 10 ? height * 30.48 : height;
  const bmr = gender === 'female'
    ? 10 * weight + 6.25 * cm - 5 * age - 161
    : 10 * weight + 6.25 * cm - 5 * age + 5;
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activity] || 1.55));
}

// ── Nutrition Alerts ──────────────────────────────────────
export function getNutritionAlerts(totals, goals) {
  const alerts = [];
  if (!totals) return alerts;

  if ((totals.sodium || 0) > 2300)
    alerts.push({ type: 'warning', icon: '🧂', msg: `High sodium: ${totals.sodium}mg (limit 2300mg)` });

  if ((totals.sugar || 0) > 50)
    alerts.push({ type: 'warning', icon: '🍬', msg: `High sugar: ${totals.sugar}g (limit 50g)` });

  if ((totals.calories || 0) > (goals?.calories || 2000) * 1.1)
    alerts.push({ type: 'danger', icon: '🔥', msg: `Over calorie goal by ${Math.round(totals.calories - goals.calories)} kcal` });

  const hour = new Date().getHours();
  if (hour >= 18 && (totals.calories || 0) < (goals?.calories || 2000) * 0.4)
    alerts.push({ type: 'info', icon: '💡', msg: `Low intake today — only ${totals.calories} of ${goals?.calories} kcal goal` });

  return alerts;
}

// ── Food Emoji by Category ────────────────────────────────
export const FOOD_EMOJIS = {
  protein: '🍗', carb: '🍚', vegetable: '🥗', fruit: '🍎',
  dairy: '🥛', fat: '🧈', beverage: '🥤', dessert: '🍰', other: '🍽️',
};

export const MEAL_EMOJIS = {
  breakfast: '🌅', lunch: '☀️', snack: '🍎', dinner: '🌙',
};

export const MEAL_COLORS = {
  breakfast: '#ffd166', lunch: '#4fc3f7', snack: '#00e5a0', dinner: '#7c6af7',
};
