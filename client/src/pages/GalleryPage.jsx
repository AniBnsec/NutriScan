import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { calcHealthScore, getScoreColor, MEAL_EMOJIS } from '../utils/helpers';

export default function GalleryPage() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/meals?limit=100').then(r => {
      setMeals((r.data.meals || []).filter(m => m.image));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? meals : meals.filter(m => m.mealType === filter);

  const MEAL_TYPES = ['all', 'breakfast', 'lunch', 'snack', 'dinner'];
  const MEAL_EMOJIS = { breakfast: '🌅', lunch: '☀️', snack: '🍎', dinner: '🌙' };

  return (
    <div className="page-inner">
      <div className="page-header fade-in">
        <h1>📸 Food Gallery</h1>
        <p>Browse all your food photos from scanned meals</p>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {MEAL_TYPES.map(t => (
          <button key={t} className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(t)} style={{ textTransform: 'capitalize' }}>
            {t !== 'all' ? MEAL_EMOJIS[t] : ''} {t === 'all' ? `All (${meals.length})` : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 16 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass empty-state">
          <div className="empty-icon">📸</div>
          <h3>No food photos yet</h3>
          <p>Scan food with a photo to build your gallery</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {filtered.map((meal, i) => {
            const score = calcHealthScore(meal.totals);
            return (
              <motion.div key={meal._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(meal)} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', aspectRatio: '1' }}
                whileHover={{ scale: 1.03 }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: 'var(--surface-light)' }}>
                  {MEAL_EMOJIS[meal.mealType] || '🍽️'}
                </div>
                {/* Overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{meal.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{meal.totals?.calories} kcal</div>
                </div>
                {/* Score badge */}
                <div style={{ position: 'absolute', top: 8, right: 8, padding: '3px 7px', borderRadius: 8, background: `${getScoreColor(score)}cc`, fontSize: '0.65rem', fontWeight: 700, color: '#000' }}>
                  ⭐{score}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }} onClick={e => e.stopPropagation()}
              style={{ maxWidth: 600, width: '100%', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10rem', background: 'var(--surface-light)' }}>
                {MEAL_EMOJIS[selected.mealType] || '🍽️'}
              </div>
              <div className="glass" style={{ padding: 20, borderRadius: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{selected.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
                  {[
                    { label: 'Calories', val: `${selected.totals?.calories} kcal`, color: '#ffb347' },
                    { label: 'Protein', val: `${selected.totals?.protein}g`, color: '#ff6b6b' },
                    { label: 'Carbs', val: `${selected.totals?.carbs}g`, color: '#4fc3f7' },
                    { label: 'Fat', val: `${selected.totals?.fat}g`, color: '#ffd166' },
                  ].map(m => (
                    <div key={m.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, color: m.color, fontFamily: 'Space Grotesk' }}>{m.val}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
