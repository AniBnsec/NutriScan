import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import api from '../api/client';
import { calcHealthScore, getScoreColor, getScoreLabel } from '../utils/helpers';

function MacroBattle({ label, a, b, unit = 'g', higherWins = true }) {
  const max = Math.max(a || 0, b || 0, 1);
  const aWins = higherWins ? (a || 0) >= (b || 0) : (a || 0) <= (b || 0);
  const bWins = higherWins ? (b || 0) >= (a || 0) : (b || 0) <= (a || 0);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, fontSize: '0.82rem' }}>
        <span style={{ fontWeight: aWins ? 700 : 400, color: aWins ? '#4fc3f7' : 'var(--text-muted)' }}>{a || 0}{unit}</span>
        <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>{label}</span>
        <span style={{ fontWeight: bWins ? 700 : 400, color: bWins ? '#ff6b6b' : 'var(--text-muted)' }}>{b || 0}{unit}</span>
      </div>
      <div style={{ display: 'flex', gap: 4, height: 8 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: `${((a || 0) / max) * 100}%`, height: '100%', borderRadius: '99px 0 0 99px', background: '#4fc3f7', transition: 'width 0.8s' }} />
        </div>
        <div style={{ width: 2, background: 'var(--border)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: `${((b || 0) / max) * 100}%`, height: '100%', borderRadius: '0 99px 99px 0', background: '#ff6b6b', transition: 'width 0.8s' }} />
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [meals, setMeals] = useState([]);
  const [mealA, setMealA] = useState(null);
  const [mealB, setMealB] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/meals?limit=50').then(r => { setMeals(r.data.meals || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const a = mealA ? meals.find(m => m._id === mealA) : null;
  const b = mealB ? meals.find(m => m._id === mealB) : null;
  const scoreA = a ? calcHealthScore(a.totals) : 0;
  const scoreB = b ? calcHealthScore(b.totals) : 0;

  const radarData = a && b ? [
    { metric: 'Calories', A: Math.round(((a.totals?.calories || 0) / 800) * 100), B: Math.round(((b.totals?.calories || 0) / 800) * 100) },
    { metric: 'Protein', A: Math.round(((a.totals?.protein || 0) / 50) * 100), B: Math.round(((b.totals?.protein || 0) / 50) * 100) },
    { metric: 'Fiber', A: Math.round(((a.totals?.fiber || 0) / 15) * 100), B: Math.round(((b.totals?.fiber || 0) / 15) * 100) },
    { metric: 'Carbs', A: Math.round(((a.totals?.carbs || 0) / 80) * 100), B: Math.round(((b.totals?.carbs || 0) / 80) * 100) },
    { metric: 'Fat', A: Math.round(((a.totals?.fat || 0) / 30) * 100), B: Math.round(((b.totals?.fat || 0) / 30) * 100) },
  ] : [];

  return (
    <div className="page-inner">
      <div className="page-header fade-in">
        <h1>📊 Meal Comparison</h1>
        <p>Compare two meals side by side to find the healthier choice</p>
      </div>

      {/* Meal selectors */}
      <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
        {[{ label: '🔵 Meal A', value: mealA, set: setMealA, color: '#4fc3f7' }, { label: '🔴 Meal B', value: mealB, set: setMealB, color: '#ff6b6b' }].map(s => (
          <div key={s.label} className="glass" style={{ padding: 20, border: `1px solid ${s.color}20` }}>
            <div style={{ fontWeight: 700, color: s.color, marginBottom: 12, fontSize: '0.9rem' }}>{s.label}</div>
            <select className="input" value={s.value || ''} onChange={e => s.set(e.target.value)}>
              <option value="">— Select a meal —</option>
              {meals.map(m => (
                <option key={m._id} value={m._id}>
                  {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {m.name} ({m.totals?.calories} kcal)
                </option>
              ))}
            </select>
            {s.value && meals.find(m => m._id === s.value) && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: `${s.color}10`, borderRadius: 10 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{meals.find(m => m._id === s.value)?.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>{meals.find(m => m._id === s.value)?.foods?.length} food items</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {(!a || !b) ? (
        <div className="glass empty-state">
          <div className="empty-icon">⚖️</div>
          <h3>Select two meals to compare</h3>
          <p>Choose meals from your history using the dropdowns above</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Health score winner */}
          <div className="glass" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase' }}>Overall Health Score</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: '#4fc3f7' }}>{scoreA}</div>
                <div style={{ fontSize: '0.8rem', color: '#4fc3f7' }}>{getScoreLabel(scoreA)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', maxWidth: 100, wordBreak: 'break-word' }}>{a.name}</div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: scoreA > scoreB ? '#4fc3f7' : scoreB > scoreA ? '#ff6b6b' : 'var(--text-muted)' }}>
                {scoreA > scoreB ? '◀ Wins' : scoreB > scoreA ? 'Wins ▶' : 'TIE 🤝'}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: '#ff6b6b' }}>{scoreB}</div>
                <div style={{ fontSize: '0.8rem', color: '#ff6b6b' }}>{getScoreLabel(scoreB)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', maxWidth: 100, wordBreak: 'break-word' }}>{b.name}</div>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 20 }}>
            {/* Macro battle */}
            <div className="glass" style={{ padding: 24 }}>
              <div className="chart-title">Nutrient Comparison</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: 12 }}>
                <span style={{ color: '#4fc3f7', fontWeight: 600 }}>Meal A</span>
                <span style={{ color: '#ff6b6b', fontWeight: 600 }}>Meal B</span>
              </div>
              <MacroBattle label="Calories" a={a.totals?.calories} b={b.totals?.calories} unit=" kcal" higherWins={false} />
              <MacroBattle label="Protein" a={a.totals?.protein} b={b.totals?.protein} higherWins={true} />
              <MacroBattle label="Carbs" a={a.totals?.carbs} b={b.totals?.carbs} higherWins={false} />
              <MacroBattle label="Fat" a={a.totals?.fat} b={b.totals?.fat} higherWins={false} />
              <MacroBattle label="Fiber" a={a.totals?.fiber} b={b.totals?.fiber} higherWins={true} />
              <MacroBattle label="Sugar" a={a.totals?.sugar} b={b.totals?.sugar} higherWins={false} />
              <MacroBattle label="Sodium" a={a.totals?.sodium} b={b.totals?.sodium} unit="mg" higherWins={false} />
            </div>

            {/* Radar */}
            <div className="glass" style={{ padding: 24 }}>
              <div className="chart-title">Nutrition Radar</div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Radar name="Meal A" dataKey="A" stroke="#4fc3f7" fill="#4fc3f7" fillOpacity={0.2} />
                  <Radar name="Meal B" dataKey="B" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, fontSize: '0.78rem' }}>
                <span style={{ color: '#4fc3f7' }}>● Meal A: {a.name}</span>
                <span style={{ color: '#ff6b6b' }}>● Meal B: {b.name}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
