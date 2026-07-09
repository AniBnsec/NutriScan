const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const auth = require('../middleware/auth');

// MET database — 60+ exercises
const MET_DB = {
  // Cardio
  'walking (slow, 3 km/h)': { met: 2.5, cat: 'cardio' },
  'walking (moderate, 5 km/h)': { met: 3.5, cat: 'cardio' },
  'walking (brisk, 6 km/h)': { met: 4.3, cat: 'cardio' },
  'jogging (light)': { met: 6, cat: 'cardio' },
  'running (8 km/h)': { met: 8, cat: 'cardio' },
  'running (10 km/h)': { met: 10, cat: 'cardio' },
  'running (12 km/h)': { met: 12, cat: 'cardio' },
  'running (fast, 15+ km/h)': { met: 14, cat: 'cardio' },
  'cycling (leisure, 15 km/h)': { met: 4, cat: 'cardio' },
  'cycling (moderate, 20 km/h)': { met: 8, cat: 'cardio' },
  'cycling (vigorous, 25+ km/h)': { met: 10, cat: 'cardio' },
  'swimming (freestyle, moderate)': { met: 7, cat: 'cardio' },
  'swimming (breaststroke)': { met: 5.3, cat: 'cardio' },
  'jump rope': { met: 10, cat: 'cardio' },
  'HIIT': { met: 10, cat: 'cardio' },
  'stair climbing': { met: 9, cat: 'cardio' },
  'elliptical trainer': { met: 5, cat: 'cardio' },
  'rowing machine': { met: 7, cat: 'cardio' },
  'aerobics (low impact)': { met: 5, cat: 'cardio' },
  'aerobics (high impact)': { met: 7, cat: 'cardio' },
  'zumba': { met: 6.5, cat: 'cardio' },
  'dancing (general)': { met: 4.5, cat: 'cardio' },
  'dancing (vigorous)': { met: 6, cat: 'cardio' },
  'treadmill (light)': { met: 5, cat: 'cardio' },
  // Strength
  'weightlifting (light)': { met: 3, cat: 'strength' },
  'weightlifting (moderate)': { met: 5, cat: 'strength' },
  'weightlifting (vigorous)': { met: 6, cat: 'strength' },
  'bodyweight exercises': { met: 4, cat: 'strength' },
  'push-ups': { met: 3.8, cat: 'strength' },
  'pull-ups': { met: 4, cat: 'strength' },
  'squats': { met: 5, cat: 'strength' },
  'deadlift': { met: 6, cat: 'strength' },
  'calisthenics': { met: 5, cat: 'strength' },
  'resistance bands': { met: 3.5, cat: 'strength' },
  'kettlebell training': { met: 8, cat: 'strength' },
  'crossfit': { met: 8, cat: 'strength' },
  // Flexibility
  'yoga (hatha)': { met: 2.5, cat: 'flexibility' },
  'yoga (vinyasa)': { met: 4, cat: 'flexibility' },
  'pilates': { met: 3.5, cat: 'flexibility' },
  'stretching': { met: 2.3, cat: 'flexibility' },
  'tai chi': { met: 3, cat: 'flexibility' },
  // Indian Sports
  'cricket': { met: 5, cat: 'sports' },
  'kabaddi': { met: 7.5, cat: 'sports' },
  'kho kho': { met: 6, cat: 'sports' },
  'badminton (casual)': { met: 4.5, cat: 'sports' },
  'badminton (competitive)': { met: 7, cat: 'sports' },
  // Global Sports
  'football / soccer': { met: 7, cat: 'sports' },
  'basketball': { met: 8, cat: 'sports' },
  'tennis (singles)': { met: 7, cat: 'sports' },
  'table tennis': { met: 4, cat: 'sports' },
  'volleyball': { met: 4, cat: 'sports' },
  'squash': { met: 12, cat: 'sports' },
  // Other
  'hiking': { met: 5.3, cat: 'other' },
  'rock climbing': { met: 8, cat: 'other' },
  'boxing (sparring)': { met: 9, cat: 'other' },
  'martial arts / karate': { met: 10, cat: 'other' },
  'housework (vigorous)': { met: 3.5, cat: 'other' },
  'gardening': { met: 3.5, cat: 'other' },
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

// GET /api/exercise/list — Exercise database
router.get('/list', auth, (req, res) => {
  const list = Object.entries(MET_DB).map(([name, data]) => ({ name, met: data.met, category: data.cat }));
  res.json({ exercises: list });
});

// GET /api/exercise/today
router.get('/today', auth, async (req, res) => {
  try {
    const today = getTodayDate();
    const exercises = await Exercise.find({ userId: req.user._id, date: today }).sort({ createdAt: -1 });
    const totalBurned = exercises.reduce((a, e) => a + e.caloriesBurned, 0);
    res.json({ exercises, totalBurned, date: today });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/exercise/history?days=7
router.get('/history', auth, async (req, res) => {
  try {
    const days = +req.query.days || 7;
    const from = new Date();
    from.setDate(from.getDate() - days);
    const fromDate = from.toISOString().split('T')[0];
    const exercises = await Exercise.find({ userId: req.user._id, date: { $gte: fromDate } }).sort({ date: -1 });
    // Aggregate by day
    const byDay = {};
    exercises.forEach(e => {
      byDay[e.date] = (byDay[e.date] || 0) + e.caloriesBurned;
    });
    res.json({ exercises, byDay });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/exercise — Log exercise
router.post('/', auth, async (req, res) => {
  try {
    const { name, duration, notes } = req.body;
    if (!name || !duration) return res.status(400).json({ message: 'Name and duration required' });

    const metData = MET_DB[name.toLowerCase()] || { met: 5, cat: 'other' };
    const weightKg = req.user.weight || 70;
    const caloriesBurned = Math.round(metData.met * weightKg * (duration / 60));

    const exercise = await Exercise.create({
      userId: req.user._id,
      date: getTodayDate(),
      name,
      category: metData.cat,
      duration: +duration,
      caloriesBurned,
      met: metData.met,
      notes: notes || '',
    });
    res.status(201).json({ exercise });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/exercise/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Exercise.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
module.exports.MET_DB = MET_DB;
