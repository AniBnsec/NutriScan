const mongoose = require('mongoose');

// Supplement definition (user's supplement schedule)
const supplementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  dose: { type: String, default: '' },
  unit: { type: String, default: 'mg' },
  preferredTime: { type: String, enum: ['morning', 'afternoon', 'evening', 'night', 'with_meal'], default: 'morning' },
  color: { type: String, default: '#00e5a0' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Daily supplement log (taken/not taken per day)
const supplementLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supplementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplement', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  taken: { type: Boolean, default: false },
  takenAt: { type: Date, default: null },
}, { timestamps: true });

supplementLogSchema.index({ userId: 1, date: 1 });
supplementSchema.index({ userId: 1 });

const Supplement = mongoose.model('Supplement', supplementSchema);
const SupplementLog = mongoose.model('SupplementLog', supplementLogSchema);
module.exports = { Supplement, SupplementLog };
