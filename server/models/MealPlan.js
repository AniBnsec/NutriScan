const mongoose = require('mongoose');

// Weekly meal plan
const mealPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  week: { type: String, required: true }, // YYYY-Www e.g. 2024-W28
  days: [{
    date: String, // YYYY-MM-DD
    slots: [{
      mealType: { type: String, enum: ['breakfast', 'lunch', 'snack', 'dinner'] },
      name: String,
      foods: Array,
      estimatedCalories: { type: Number, default: 0 },
      logged: { type: Boolean, default: false },
    }]
  }],
}, { timestamps: true });
mealPlanSchema.index({ userId: 1, week: 1 });

// Reusable meal templates
const mealTemplateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  dietType: { type: String, enum: ['general', 'keto', 'vegan', 'high_protein', 'low_carb', 'mediterranean', 'indian'], default: 'general' },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'snack', 'dinner', 'any'], default: 'any' },
  foods: Array,
  estimatedCalories: { type: Number, default: 0 },
  estimatedProtein: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
const MealTemplate = mongoose.model('MealTemplate', mealTemplateSchema);
module.exports = { MealPlan, MealTemplate };
