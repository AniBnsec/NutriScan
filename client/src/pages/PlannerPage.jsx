import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/client';
import useStore from '../store/useStore';

const MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_EMOJIS = { breakfast: '🌅', lunch: '☀️', snack: '🍎', dinner: '🌙' };
const MEAL_COLORS = { breakfast: '#ffd166', lunch: '#4fc3f7', snack: '#00e5a0', dinner: '#7c6af7' };
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DIET_COLORS = { general: '#94a3b8', keto: '#f59e0b', vegan: '#22c55e', high_protein: '#ef4444', low_carb: '#3b82f6', mediterranean: '#a855f7', indian: '#f97316' };

function getWeekDays() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - diff + i);
    return d.toISOString().split('T')[0];
  });
}

function getWeekId() {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - jan1) / 86400000) + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export default function PlannerPage() {
  const { user } = useStore();
  const [plan, setPlan] = useState({ days: getWeekDays().map(date => ({ date, slots: [] })) });
  const [templates, setTemplates] = useState([]);
  const [showAddSlot, setShowAddSlot] = useState(null); // { dayIdx, mealType }
  const [slotForm, setSlotForm] = useState({ name: '', estimatedCalories: 0 });
  const [saving, setSaving] = useState(false);
  const [logging, setLogging] = useState(null);
  const weekDays = getWeekDays();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([api.get('/planner/week'), api.get('/planner/templates')])
      .then(([weekRes, tRes]) => {
        if (weekRes.data.plan?.days) setPlan(weekRes.data.plan);
        setTemplates(tRes.data.templates || []);
      }).catch(() => {});
  }, []);

  const addSlot = (dayIdx, mealType) => {
    if (!slotForm.name) return toast.error('Enter a meal name');
    const newPlan = { ...plan };
    if (!newPlan.days[dayIdx].slots) newPlan.days[dayIdx].slots = [];
    newPlan.days[dayIdx].slots.push({ mealType, name: slotForm.name, estimatedCalories: +slotForm.estimatedCalories || 0, foods: [], logged: false });
    setPlan({ ...newPlan });
    setShowAddSlot(null);
    setSlotForm({ name: '', estimatedCalories: 0 });
  };

  const removeSlot = (dayIdx, slotIdx) => {
    const newPlan = { ...plan };
    newPlan.days[dayIdx].slots.splice(slotIdx, 1);
    setPlan({ ...newPlan });
  };

  const logSlot = async (dayIdx, slotIdx) => {
    const slot = plan.days[dayIdx].slots[slotIdx];
    setLogging(`${dayIdx}-${slotIdx}`);
    try {
      await api.post('/planner/log', { name: slot.name, mealType: slot.mealType, foods: slot.foods?.length ? slot.foods : [{ name: slot.name, portion_g: 200 }] });
      const newPlan = { ...plan };
      newPlan.days[dayIdx].slots[slotIdx].logged = true;
      setPlan({ ...newPlan });
      toast.success(`${slot.name} logged to today! ✅`);
    } catch { toast.error('Failed to log meal'); }
    finally { setLogging(null); }
  };

  const savePlan = async () => {
    setSaving(true);
    try {
      await api.put('/planner/week', { week: getWeekId(), days: plan.days });
      toast.success('Weekly plan saved! 📅');
    } catch { toast.error('Failed to save plan'); }
    finally { setSaving(false); }
  };

  const applyTemplate = (template, dayIdx) => {
    const newPlan = { ...plan };
    if (!newPlan.days[dayIdx].slots) newPlan.days[dayIdx].slots = [];
    newPlan.days[dayIdx].slots.push({
      mealType: template.mealType === 'any' ? 'lunch' : template.mealType,
      name: template.name,
      estimatedCalories: template.estimatedCalories || 0,
      foods: template.foods || [],
      logged: false,
    });
    setPlan({ ...newPlan });
    toast.success(`Template "${template.name}" added!`);
  };

  const dayCalories = (dayIdx) => (plan.days[dayIdx]?.slots || []).reduce((a, s) => a + (s.estimatedCalories || 0), 0);

  return (
    <div className="page-inner" style={{ maxWidth: '100%' }}>
      <div className="page-header fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>🎯 Meal Planner</h1>
          <p>Plan your meals for the week. Click any slot to add a meal.</p>
        </div>
        <button className="btn btn-primary" onClick={savePlan} disabled={saving}>{saving ? 'Saving...' : '💾 Save Week'}</button>
      </div>

      {/* Templates strip */}
      <div className="glass" style={{ padding: 16, marginBottom: 20, overflowX: 'auto' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>🔄 Quick Templates — Click to add to any day</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {templates.slice(0, 8).map((t, i) => (
            <div key={i} style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${DIET_COLORS[t.dietType] || '#94a3b8'}30`, background: `${DIET_COLORS[t.dietType] || '#94a3b8'}10`, cursor: 'pointer', fontSize: '0.82rem' }}
              onClick={() => applyTemplate(t, weekDays.indexOf(today) >= 0 ? weekDays.indexOf(today) : 0)}>
              <div style={{ fontWeight: 600, color: DIET_COLORS[t.dietType] || '#94a3b8' }}>{t.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>~{t.estimatedCalories} kcal</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(140px, 1fr))', gap: 10, overflowX: 'auto' }}>
        {weekDays.map((date, dayIdx) => {
          const slots = plan.days[dayIdx]?.slots || [];
          const dayTotal = dayCalories(dayIdx);
          const isToday = date === today;
          return (
            <div key={date} className="glass" style={{ padding: 12, borderRadius: 14, border: `1px solid ${isToday ? 'var(--primary)' : 'var(--border)'}`, minHeight: 300 }}>
              {/* Day header */}
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isToday ? 'var(--primary)' : 'var(--text)' }}>{DAY_NAMES[dayIdx]}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                {dayTotal > 0 && <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginTop: 4 }}>{dayTotal} kcal</div>}
              </div>
              {/* Calorie bar */}
              <div className="progress-track" style={{ marginBottom: 10 }}>
                <div className="progress-fill" style={{ background: 'var(--primary)', width: `${Math.min((dayTotal / (user?.calorieGoal || 2000)) * 100, 100)}%` }} />
              </div>

              {/* Slots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {slots.map((slot, si) => (
                  <div key={si} style={{ padding: '8px 10px', borderRadius: 10, background: `${MEAL_COLORS[slot.mealType]}12`, border: `1px solid ${MEAL_COLORS[slot.mealType]}25`, position: 'relative' }}>
                    <div style={{ fontSize: '0.72rem', color: MEAL_COLORS[slot.mealType], fontWeight: 600, textTransform: 'capitalize', marginBottom: 2 }}>
                      {MEAL_EMOJIS[slot.mealType]} {slot.mealType}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.2 }}>{slot.name}</div>
                    {slot.estimatedCalories > 0 && <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: 2 }}>~{slot.estimatedCalories} kcal</div>}
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      {isToday && !slot.logged && (
                        <button className="btn btn-sm" onClick={() => logSlot(dayIdx, si)} disabled={logging === `${dayIdx}-${si}`}
                          style={{ flex: 1, fontSize: '0.65rem', padding: '3px 6px', background: `${MEAL_COLORS[slot.mealType]}20`, color: MEAL_COLORS[slot.mealType], border: 'none', justifyContent: 'center' }}>
                          {logging === `${dayIdx}-${si}` ? '...' : '✓ Log'}
                        </button>
                      )}
                      {slot.logged && <span style={{ fontSize: '0.65rem', color: 'var(--primary)' }}>✅ Logged</span>}
                      <button onClick={() => removeSlot(dayIdx, si)} style={{ background: 'none', border: 'none', color: 'rgba(255,107,107,0.5)', cursor: 'pointer', fontSize: '0.7rem', padding: '3px 5px' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add slot buttons */}
              <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {MEAL_TYPES.map(type => (
                  <button key={type} onClick={() => setShowAddSlot({ dayIdx, mealType: type })}
                    style={{ width: '100%', padding: '5px', background: `${MEAL_COLORS[type]}08`, border: `1px dashed ${MEAL_COLORS[type]}30`, borderRadius: 8, cursor: 'pointer', fontSize: '0.65rem', color: MEAL_COLORS[type], textAlign: 'center', marginBottom: 2 }}>
                    + {MEAL_EMOJIS[type]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add slot modal */}
      <AnimatePresence>
        {showAddSlot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setShowAddSlot(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="glass" style={{ width: '100%', maxWidth: 380, padding: 28, borderRadius: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>
                {MEAL_EMOJIS[showAddSlot.mealType]} Add {showAddSlot.mealType} for {DAY_NAMES[showAddSlot.dayIdx]}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="input" placeholder="Meal name (e.g. Dal Rice, Chicken Salad)" value={slotForm.name} onChange={e => setSlotForm(p => ({ ...p, name: e.target.value }))} autoFocus />
                <input className="input" type="number" placeholder="Estimated calories (optional)" value={slotForm.estimatedCalories || ''} onChange={e => setSlotForm(p => ({ ...p, estimatedCalories: e.target.value }))} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddSlot(null)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={() => addSlot(showAddSlot.dayIdx, showAddSlot.mealType)}>Add Meal</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
