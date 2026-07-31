import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { calcHealthScore, getScoreColor, getScoreLabel, exportMealsToCSV, FOOD_EMOJIS, MEAL_EMOJIS, MEAL_COLORS } from '../utils/helpers';
import { useTranslation } from '../i18n/index.jsx';

function MealDetailModal({ meal, onClose }) {
  if (!meal) return null;
  const t = meal.totals;
  const score = calcHealthScore(t);
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="glass" style={{ width: '100%', maxWidth: 560, maxHeight: '85vh', overflow: 'auto', padding: 28, borderRadius: 20 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: '1.5rem' }}>{MEAL_EMOJIS[meal.mealType] || '🍽️'}</span>
                <h3 style={{ fontSize: '1.1rem' }}>{meal.name}</h3>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date(meal.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                {' · '}{new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: '4px 10px', borderRadius: 8, background: `${getScoreColor(score)}18`, color: getScoreColor(score), fontSize: '0.82rem', fontWeight: 700 }}>
                ⭐ {score} – {getScoreLabel(score)}
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
            </div>
          </div>

          {/* Nutrition totals */}
          <div style={{ padding: 20, background: 'linear-gradient(135deg,rgba(0,229,160,0.06),rgba(124,106,247,0.06))', border: '1px solid rgba(0,229,160,0.12)', borderRadius: 14, marginBottom: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, fontFamily: 'Space Grotesk', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {t?.calories || 0}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>kcal total</div>
            </div>
            <div className="macro-grid">
              {[
                { key: 'Protein', val: t?.protein, unit: 'g', color: '#ff6b6b' },
                { key: 'Carbs', val: t?.carbs, unit: 'g', color: '#4fc3f7' },
                { key: 'Fat', val: t?.fat, unit: 'g', color: '#ffd166' },
                { key: 'Fiber', val: t?.fiber, unit: 'g', color: '#00e5a0' },
                { key: 'Sugar', val: t?.sugar, unit: 'g', color: '#f06292' },
                { key: 'Sodium', val: t?.sodium, unit: 'mg', color: '#ce93d8' },
              ].map(m => (
                <div key={m.key} className="macro-item">
                  <div className="value" style={{ color: m.color }}>{m.val || 0}</div>
                  <div className="unit">{m.unit}</div>
                  <div className="key">{m.key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Foods */}
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Foods ({meal.foods?.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {meal.foods?.map((food, i) => (
              <div key={i} className="glass food-item-card">
                <div className="food-emoji" style={{ background: 'rgba(124,106,247,0.1)' }}>{FOOD_EMOJIS[food.category] || '🍽️'}</div>
                <div className="food-details">
                  <div className="food-name">{food.name}</div>
                  <div className="food-portion">~{food.portion_g}g · {food.nutrition?.calories || 0} kcal</div>
                  <div className="food-macros">
                    <span className="food-macro macro-protein">P: {food.nutrition?.protein || 0}g</span>
                    <span className="food-macro macro-carbs">C: {food.nutrition?.carbs || 0}g</span>
                    <span className="food-macro macro-fat">F: {food.nutrition?.fat || 0}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function HistoryPage() {
  const { meals, mealsLoading, mealsTotal, fetchMeals, deleteMeal } = useStore();
  const [selected, setSelected] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [deleting, setDeleting] = useState(null);
  const { t } = useTranslation();

  useEffect(() => { fetchMeals(1, dateFilter); }, [dateFilter]);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    toast(
      (tToast) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 600 }}>{t('history.deleteMeal') || 'Delete this meal?'}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => toast.dismiss(tToast.id)}>Cancel</button>
            <button className="btn btn-primary btn-sm" style={{ background: '#ff6b6b', borderColor: '#ff6b6b' }} onClick={() => {
              toast.dismiss(tToast.id);
              setDeleting(id);
              deleteMeal(id)
                .then(() => {
                  toast.success(t('history.mealDeleted'));
                  if (selected?._id === id) setSelected(null);
                })
                .catch(() => toast.error('Failed to delete'))
                .finally(() => setDeleting(null));
            }}>Delete</button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    );
  };

  const handleExport = () => {
    if (!meals.length) return toast.error(t('history.noExport'));
    exportMealsToCSV(meals);
    toast.success(t('history.csvDownloaded'));
  };

  return (
    <div className="page-inner">
      <div className="page-header fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>{t('history.title')}</h1>
          <p>{t('history.totalMeals', { count: mealsTotal })}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" className="input" style={{ width: 'auto' }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          {dateFilter && <button className="btn btn-ghost btn-sm" onClick={() => setDateFilter('')}>{t('history.clearFilter')}</button>}
          <button className="btn btn-ghost btn-sm" onClick={handleExport} title="Export to CSV">{t('history.exportCSV')}</button>
          <Link to="/scanner" className="btn btn-primary btn-sm">{t('history.addMeal')}</Link>
        </div>
      </div>

      {mealsLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass" style={{ height: 160 }}>
              <div className="skeleton" style={{ height: '100%', borderRadius: 'var(--radius)' }} />
            </div>
          ))}
        </div>
      ) : meals.length === 0 ? (
        <div className="glass empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>{dateFilter ? t('history.noMealsDate') : t('history.noMeals')}</h3>
          <p>{t('history.noMealsDesc')}</p>
          <Link to="/scanner" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>{t('history.scanFirst')}</Link>
        </div>
      ) : (
        <div className="grid-auto stagger">
          {meals.map((meal, i) => {
            const score = calcHealthScore(meal.totals);
            return (
              <motion.div key={meal._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass meal-card" onClick={() => setSelected(meal)} style={{ position: 'relative', cursor: 'pointer' }}>
                {/* Type + Score */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="meal-type-badge" style={{ background: `${MEAL_COLORS[meal.mealType]}20`, color: MEAL_COLORS[meal.mealType] }}>
                    {MEAL_EMOJIS[meal.mealType]} {meal.mealType}
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: 6, background: `${getScoreColor(score)}18`, color: getScoreColor(score), fontWeight: 700 }}>
                      ⭐{score}
                    </span>
                    <button className="btn btn-icon btn-sm" onClick={e => handleDelete(meal._id, e)} disabled={deleting === meal._id}
                      style={{ opacity: 0.5, fontSize: '0.78rem', padding: '3px 7px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.15)', color: '#ff6b6b' }}>
                      {deleting === meal._id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="meal-card-img" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: 'var(--surface-light)', borderRadius: 10, width: 60, height: 60, overflow: 'hidden' }}>
                    {meal.image && (
                      <img 
                        src={meal.image.startsWith('http') ? meal.image : `${import.meta.env.VITE_API_URL || ''}${meal.image}`} 
                        alt={meal.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, zIndex: 1 }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div style={{ position: 'relative', zIndex: 0 }}>
                      {MEAL_EMOJIS[meal.mealType] || '🍽️'}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{meal.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>{meal.foods?.length} food items</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                      {new Date(meal.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}
                      {' · '}{new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Nutrition row */}
                <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffb347', fontFamily: 'Space Grotesk' }}>{meal.totals?.calories}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>kcal</div>
                  </div>
                  {[
                    { label: 'P', val: meal.totals?.protein, unit: 'g', color: '#ff6b6b' },
                    { label: 'C', val: meal.totals?.carbs, unit: 'g', color: '#4fc3f7' },
                    { label: 'F', val: meal.totals?.fat, unit: 'g', color: '#ffd166' },
                  ].map(m => (
                    <div key={m.label} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: m.color, fontFamily: 'Space Grotesk' }}>{m.val}{m.unit}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Food tags */}
                <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
                  {meal.foods?.slice(0, 3).map((f, fi) => (
                    <span key={fi} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '2px 7px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {f.name}
                    </span>
                  ))}
                  {meal.foods?.length > 3 && <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', padding: '2px 4px' }}>+{meal.foods.length - 3}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <MealDetailModal meal={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
