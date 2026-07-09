import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import useStore from '../store/useStore';
import api from '../api/client';

const CATEGORY_COLORS = { protein: '#ff6b6b', carb: '#4fc3f7', vegetable: '#00e5a0', fruit: '#ffd166', dairy: '#f9a8d4', fat: '#fed7aa', other: '#94a3b8' };

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass" style={{ padding: '10px 14px', fontSize: '0.8rem' }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {Math.round(p.value)}{p.name === 'Calories' ? ' kcal' : 'g'}</p>)}
    </div>
  );
};

export default function AnalyticsPage() {
  const { user } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('calories');

  useEffect(() => {
    api.get('/dashboard/analytics')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading 30-day analytics...</p>
      </div>
    </div>
  );

  const { trend = [], topFoods = [], summary = {} } = data || {};

  // Thin down labels for x-axis
  const chartData = trend.map((d, i) => ({ ...d, label: i % 5 === 0 ? d.label : '' }));

  return (
    <div className="page-inner">
      <div className="page-header fade-in">
        <h1>📈 Analytics</h1>
        <p>Your 30-day nutrition trends and eating patterns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        {[
          { label: 'Avg Daily Calories', val: summary.avgCalories || 0, unit: 'kcal', color: '#ffb347' },
          { label: 'Active Days', val: summary.activeDays || 0, unit: '/ 30 days', color: 'var(--primary)' },
          { label: 'Avg Protein', val: summary.avgProtein || 0, unit: 'g/day', color: '#ff6b6b' },
          { label: 'Avg Carbs', val: summary.avgCarbs || 0, unit: 'g/day', color: '#4fc3f7' },
        ].map(s => (
          <div key={s.label} className="glass stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-sub">{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Chart Toggle */}
      <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'calories', label: '🔥 Calories' },
            { key: 'macros', label: '💪 Macros' },
          ].map(t => (
            <button
              key={t.key}
              className={`btn btn-sm ${activeChart === t.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveChart(t.key)}
            >
              {t.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-faint)', lineHeight: '32px' }}>
            Last 30 days · Calorie goal: {user?.calorieGoal || 2000} kcal
          </div>
        </div>

        {trend.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <div className="empty-icon">📊</div>
            <h3>Not enough data yet</h3>
            <p>Log meals for a few days to see your trends</p>
          </div>
        ) : activeChart === 'calories' ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              {/* Goal reference line */}
              <Line type="monotone" dataKey={() => user?.calorieGoal || 2000} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" dot={false} name="Goal" />
              <Line type="monotone" dataKey="calories" stroke="#ffb347" strokeWidth={2.5} dot={{ fill: '#ffb347', r: 3 }} activeDot={{ r: 5 }} name="Calories" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} />
              <Area type="monotone" dataKey="protein" stackId="1" stroke="#ff6b6b" fill="rgba(255,107,107,0.2)" name="Protein" />
              <Area type="monotone" dataKey="carbs" stackId="1" stroke="#4fc3f7" fill="rgba(79,195,247,0.2)" name="Carbs" />
              <Area type="monotone" dataKey="fat" stackId="1" stroke="#ffd166" fill="rgba(255,209,102,0.2)" name="Fat" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Foods */}
      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <div className="glass" style={{ padding: 24 }}>
          <div className="chart-title">🏆 Most Eaten Foods</div>
          {topFoods.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <p>No meals logged yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topFoods.map((food, i) => (
                <motion.div
                  key={food._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${CATEGORY_COLORS[food.category] || '#94a3b8'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 500, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food._id}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)', flexShrink: 0, marginLeft: 8 }}>×{food.count}</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(food.count / (topFoods[0]?.count || 1)) * 100}%` }}
                        transition={{ delay: i * 0.06 + 0.3, duration: 0.7 }}
                        style={{ height: '100%', background: CATEGORY_COLORS[food.category] || '#94a3b8', borderRadius: 99 }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', flexShrink: 0 }}>
                    ~{Math.round(food.avgCalories || 0)} kcal
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Best / Worst days */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="chart-title">📋 30-Day Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '📊', label: 'Average Daily Calories', val: `${summary.avgCalories || 0} kcal`, color: '#ffb347' },
              { icon: '🥩', label: 'Average Protein', val: `${summary.avgProtein || 0}g`, color: '#ff6b6b' },
              { icon: '🍚', label: 'Average Carbs', val: `${summary.avgCarbs || 0}g`, color: '#4fc3f7' },
              { icon: '🫙', label: 'Average Fat', val: `${summary.avgFat || 0}g`, color: '#ffd166' },
              { icon: '📅', label: 'Active Days', val: `${summary.activeDays || 0} of 30 days`, color: 'var(--primary)' },
              { icon: '🏆', label: 'Peak Calorie Day', val: summary.maxCalDay ? `${summary.maxCalories} kcal on ${new Date(summary.maxCalDay + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'N/A', color: 'var(--accent)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>{s.label}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: s.color, fontFamily: 'Space Grotesk' }}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
