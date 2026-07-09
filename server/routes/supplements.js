const express = require('express');
const router = express.Router();
const { Supplement, SupplementLog } = require('../models/Supplement');
const auth = require('../middleware/auth');

const PRESET_SUPPLEMENTS = [
  { name: 'Vitamin D3', dose: '1000', unit: 'IU', preferredTime: 'morning', color: '#ffd166' },
  { name: 'Vitamin B12', dose: '500', unit: 'mcg', preferredTime: 'morning', color: '#ff6b6b' },
  { name: 'Omega-3 Fish Oil', dose: '1000', unit: 'mg', preferredTime: 'with_meal', color: '#4fc3f7' },
  { name: 'Magnesium', dose: '400', unit: 'mg', preferredTime: 'night', color: '#7c6af7' },
  { name: 'Zinc', dose: '15', unit: 'mg', preferredTime: 'morning', color: '#00e5a0' },
  { name: 'Iron', dose: '18', unit: 'mg', preferredTime: 'morning', color: '#ff9f43' },
  { name: 'Calcium', dose: '500', unit: 'mg', preferredTime: 'with_meal', color: '#f9a8d4' },
  { name: 'Vitamin C', dose: '500', unit: 'mg', preferredTime: 'morning', color: '#fbbf24' },
  { name: 'Ashwagandha', dose: '600', unit: 'mg', preferredTime: 'night', color: '#a3e635' },
  { name: 'Biotin', dose: '5000', unit: 'mcg', preferredTime: 'morning', color: '#f472b6' },
  { name: 'Multivitamin', dose: '1', unit: 'tablet', preferredTime: 'with_meal', color: '#60a5fa' },
  { name: 'Protein Powder', dose: '30', unit: 'g', preferredTime: 'with_meal', color: '#34d399' },
  { name: 'Creatine', dose: '5', unit: 'g', preferredTime: 'with_meal', color: '#fb923c' },
];

const getTodayDate = () => new Date().toISOString().split('T')[0];

// GET /api/supplements/presets
router.get('/presets', auth, (req, res) => res.json({ presets: PRESET_SUPPLEMENTS }));

// GET /api/supplements — User's supplement list
router.get('/', auth, async (req, res) => {
  try {
    const supplements = await Supplement.find({ userId: req.user._id, isActive: true });
    res.json({ supplements });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/supplements — Add supplement
router.post('/', auth, async (req, res) => {
  try {
    const { name, dose, unit, preferredTime, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const supplement = await Supplement.create({ userId: req.user._id, name, dose, unit, preferredTime, color });
    res.status(201).json({ supplement });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/supplements/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Supplement.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isActive: false });
    res.json({ message: 'Removed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/supplements/today — Today's log with taken status
router.get('/today', auth, async (req, res) => {
  try {
    const today = getTodayDate();
    const supplements = await Supplement.find({ userId: req.user._id, isActive: true });
    const logs = await SupplementLog.find({ userId: req.user._id, date: today });
    const logMap = {};
    logs.forEach(l => { logMap[l.supplementId.toString()] = l; });

    const list = supplements.map(s => ({
      supplement: s,
      taken: logMap[s._id.toString()]?.taken || false,
      logId: logMap[s._id.toString()]?._id || null,
    }));

    const takenCount = list.filter(l => l.taken).length;
    res.json({ list, takenCount, total: list.length, date: today });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/supplements/:id/toggle — Toggle taken for today
router.post('/:id/toggle', auth, async (req, res) => {
  try {
    const today = getTodayDate();
    const existing = await SupplementLog.findOne({ userId: req.user._id, supplementId: req.params.id, date: today });

    if (existing) {
      existing.taken = !existing.taken;
      existing.takenAt = existing.taken ? new Date() : null;
      await existing.save();
      res.json({ taken: existing.taken });
    } else {
      const log = await SupplementLog.create({
        userId: req.user._id, supplementId: req.params.id, date: today, taken: true, takenAt: new Date()
      });
      res.json({ taken: log.taken });
    }
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
