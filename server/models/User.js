const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: null },
  calorieGoal: { type: Number, default: 2000 },
  proteinGoal: { type: Number, default: 150 },
  carbGoal: { type: Number, default: 250 },
  fatGoal: { type: Number, default: 65 },
  fiberGoal: { type: Number, default: 25 },
  age: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    default: 'moderate',
  },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  targetWeight: { type: Number, default: null },
  weightGoalType: { type: String, enum: ['lose', 'gain', 'maintain'], default: 'maintain' },
  weeklyGoalRate: { type: Number, default: 0.5 }, // kg per week
  dietMode: { type: String, enum: ['general', 'keto', 'vegan', 'high_protein', 'low_carb', 'mediterranean', 'intermittent_fasting'], default: 'general' },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
