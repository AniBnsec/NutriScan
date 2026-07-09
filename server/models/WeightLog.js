const mongoose = require('mongoose');
const weightLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  weight: { type: Number, required: true }, // kg
  bodyFat: { type: Number, default: null }, // percentage
  note: { type: String, maxlength: 200, default: '' },
}, { timestamps: true });
weightLogSchema.index({ userId: 1, date: -1 });
module.exports = mongoose.model('WeightLog', weightLogSchema);
