import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/client';
import useStore from '../store/useStore';

const CATEGORY_ICONS = { cardio: '🏃', strength: '💪', flexibility: '🧘', sports: '⚽', other: '🏋️' };
const CATEGORY_COLORS = { cardio: '#ff6b6b', strength: '#ffd166', flexibility: '#00e5a0', sports: '#4fc3f7', other: '#7c6af7' };

export default function ExercisePage() {
  const { user } = useStore();
  const [exercises, setExercises] = useState([]);
  const [db, setDb] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [duration, setDuration] = useState(30);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const totalBurned = exercises.reduce((a, e) => a + e.caloriesBurned, 0);

  useEffect(() => {
    Promise.all([
      api.get('/exercise/today'),
      api.get('/exercise/list'),
    ]).then(([todayRes, listRes]) => {
      setExercises(todayRes.data.exercises || []);
      setDb(listRes.data.exercises || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = query.length >= 1
    ? db.filter(e => e.name.includes(query.toLowerCase()) && (activeFilter === 'all' || e.category === activeFilter)).slice(0, 8)
    : db.filter(e => activeFilter === 'all' || e.category === activeFilter).slice(0, 6);

  const previewCalories = selected ? Math.round(selected.met * (user?.weight || 70) * (duration / 60)) : 0;

  const handleAdd = async () => {
    if (!selected) return toast.error('Select an exercise');
    setSaving(true);
    try {
      const { data } = await api.post('/exercise', { name: selected.name, duration });
      setExercises(prev => [data.exercise, ...prev]);
      toast.success(`${data.exercise.name} logged! 🔥 ${data.exercise.caloriesBurned} kcal burned`);
      setSelected(null); setQuery('');
    } catch { toast.error('Failed to log exercise'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/exercise/${id}`);
    setExercises(prev => prev.filter(e => e._id !== id));
    toast.success('Removed');
  };

  return (
    <div className="page-inner">
      <div className="page-header fade-in">
        <h1>🏋️ Exercise Tracker</h1>
        <p>Log workouts and see your net calorie balance</p>
      </div>

      {/* Stats */}
      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        <div className="glass stat-card">
          <div className="stat-label">Calories Burned</div>
          <div className="stat-value" style={{ color: '#ff6b6b' }}>{totalBurned}</div>
          <div className="stat-sub">kcal today</div>
        </div>
        <div className="glass stat-card">
          <div className="stat-label">Workouts Today</div>
          <div className="stat-value" style={{ color: '#ffd166' }}>{exercises.length}</div>
          <div className="stat-sub">sessions logged</div>
        </div>
        <div className="glass stat-card">
          <div className="stat-label">Total Minutes</div>
          <div className="stat-value" style={{ color: '#4fc3f7' }}>{exercises.reduce((a, e) => a + e.duration, 0)}</div>
          <div className="stat-sub">min exercised</div>
        </div>
        <div className="glass stat-card">
          <div className="stat-label">Net Calories</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {totalBurned > 0 ? `−${totalBurned}` : '0'}
          </div>
          <div className="stat-sub">adjustment to goal</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Add Exercise */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass" style={{ padding: 24 }}>
            <div className="chart-title">Add Exercise</div>
            {/* Category filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {['all', 'cardio', 'strength', 'flexibility', 'sports', 'other'].map(c => (
                <button key={c} className={`btn btn-sm ${activeFilter === c ? 'btn-primary' : 'btn-ghost'}`} style={{ textTransform: 'capitalize' }} onClick={() => setActiveFilter(c)}>
                  {c !== 'all' ? CATEGORY_ICONS[c] : ''} {c}
                </button>
              ))}
            </div>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input className="input" placeholder="🔍 Search exercise..." value={query} onChange={e => { setQuery(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} onBlur={() => setTimeout(() => setShowDropdown(false), 150)} />
              <AnimatePresence>
                {showDropdown && filtered.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'rgba(15,17,26,0.98)', border: '1px solid var(--border)', borderRadius: 12, zIndex: 100, overflow: 'hidden', backdropFilter: 'blur(20px)', maxHeight: 280, overflowY: 'auto' }}>
                    {filtered.map(ex => (
                      <div key={ex.name} onMouseDown={() => { setSelected(ex); setQuery(ex.name); setShowDropdown(false); }}
                        style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span>{CATEGORY_ICONS[ex.category]}</span>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500, textTransform: 'capitalize' }}>{ex.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>MET {ex.met} · {ex.category}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: CATEGORY_COLORS[ex.category] }}>
                          ~{Math.round(ex.met * (user?.weight || 70) * (duration / 60))} kcal
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{CATEGORY_ICONS[selected.category]} {selected.name}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff6b6b', fontFamily: 'Space Grotesk' }}>🔥 {previewCalories} kcal</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flexShrink: 0 }}>Duration:</label>
                  <input type="range" min={5} max={180} step={5} value={duration} onChange={e => setDuration(+e.target.value)} style={{ flex: 1, accentColor: 'var(--primary)' }} />
                  <span style={{ width: 55, textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Space Grotesk' }}>{duration} min</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginBottom: 10 }}>
                  Based on your weight: {user?.weight || 70} kg · MET: {selected.met}
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAdd} disabled={saving}>
                  {saving ? 'Logging...' : `+ Log ${selected.name}`}
                </button>
              </motion.div>
            )}
          </div>

          {/* Calorie info */}
          <div className="glass" style={{ padding: 20, background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.12)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ff6b6b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>💡 How Calories Are Calculated</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>Formula:</strong> MET × Body Weight (kg) × Duration (hours)<br />
              <strong style={{ color: 'var(--text)' }}>Example:</strong> Running 8 km/h × 70 kg × 0.5 hr = 280 kcal
            </div>
          </div>
        </div>

        {/* Today's workouts */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="chart-title">Today's Workouts</div>
          {loading ? <div className="skeleton" style={{ height: 200 }} /> :
          exercises.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">🏋️</div>
              <h3>No workouts yet</h3>
              <p>Log your first exercise to start tracking</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {exercises.map((ex, i) => (
                <motion.div key={ex._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${CATEGORY_COLORS[ex.category]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    {CATEGORY_ICONS[ex.category]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.9rem' }}>{ex.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.duration} min · {ex.category}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: '#ff6b6b', fontFamily: 'Space Grotesk' }}>−{ex.caloriesBurned}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>kcal</div>
                  </div>
                  <button onClick={() => handleDelete(ex._id)} style={{ background: 'none', border: 'none', color: 'rgba(255,107,107,0.6)', cursor: 'pointer', fontSize: '0.85rem', padding: 4 }}>✕</button>
                </motion.div>
              ))}
              <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Burned</span>
                <span style={{ fontWeight: 800, color: '#ff6b6b', fontSize: '1.1rem', fontFamily: 'Space Grotesk' }}>−{totalBurned} kcal</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
