const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
  vitaminA: { type: Number, default: 0 },
  vitaminC: { type: Number, default: 0 },
  vitaminD: { type: Number, default: 0 },
  vitaminB12: { type: Number, default: 0 },
  iron: { type: Number, default: 0 },
  calcium: { type: Number, default: 0 },
  potassium: { type: Number, default: 0 },
}, { _id: false });

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  portion_g: { type: Number, required: true },
  confidence: { type: Number, default: 0.8 },
  category: { type: String, default: 'other' },
  description: { type: String, default: '' },
  nutrition: { type: nutritionSchema, default: () => ({}) },
}, { _id: false });

const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, default: 'Meal' },
  image: { type: String, default: null },
  imageThumb: { type: String, default: null },
  foods: [foodItemSchema],
  totals: { type: nutritionSchema, default: () => ({}) },
  aiModel: { type: String, default: 'gemini-1.5-flash' },
  scanDuration: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: function () {
      const h = new Date().getHours();
      if (h < 11) return 'breakfast';
      if (h < 15) return 'lunch';
      if (h < 18) return 'snack';
      return 'dinner';
    },
  },
}, { timestamps: true });

mealSchema.pre('save', function (next) {
  const t = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0, iron: 0, calcium: 0, potassium: 0 };
  this.foods.forEach(food => {
    Object.keys(t).forEach(k => { t[k] += food.nutrition[k] || 0; });
  });
  Object.keys(t).forEach(k => { t[k] = Math.round(t[k] * 10) / 10; });
  this.totals = t;
  next();
});

module.exports = mongoose.model('Meal', mealSchema);
