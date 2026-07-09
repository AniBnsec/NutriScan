const mongoose = require('mongoose');
const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  name: { type: String, required: true },
  category: { type: String, enum: ['cardio', 'strength', 'flexibility', 'sports', 'other'], default: 'cardio' },
  duration: { type: Number, required: true }, // minutes
  caloriesBurned: { type: Number, default: 0 },
  met: { type: Number, default: 5 },
  notes: { type: String, default: '' },
}, { timestamps: true });
exerciseSchema.index({ userId: 1, date: -1 });
module.exports = mongoose.model('Exercise', exerciseSchema);
