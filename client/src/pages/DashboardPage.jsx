import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { getNutritionAlerts, calcHealthScore, getScoreColor, getScoreLabel, MEAL_EMOJIS, MEAL_COLORS } from '../utils/helpers';
import { useTranslation } from '../i18n/index.jsx';

const WEEK_COLORS = ['#00e5a0', '#4fc3f7', '#7c6af7', '#ffd166', '#ff6b6b', '#f06292', '#00b4d8'];
const GLASS_ML = 250;
const WATER_GOAL = 2000;

function WaterTracker({ water = 0, onAdd, onRemove }) {
  const glasses = Math.round(water / GLASS_ML);
  const goalGlasses = WATER_GOAL / GLASS_ML;
  const pct = Math.min((water / WATER_GOAL) * 100, 100);
  const { t } = useTranslation();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('dashboard.water')}</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4fc3f7' }}>{water}ml / {WATER_GOAL}ml</div>
      </div>
      {/* Glasses */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {Array.from({ length: goalGlasses }).map((_, i) => (
          <div
            key={i}
            style={{ width: 32, height: 38, borderRadius: '4px 4px 8px 8px', border: `2px solid ${i < glasses ? '#4fc3f7' : 'rgba(255,255,255,0.1)'}`, background: i < glasses ? 'rgba(79,195,247,0.25)' : 'rgba(255,255,255,0.03)', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
          >
            {i < glasses && (
              <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(79,195,247,0.3)' }} />
            )}
          </div>
        ))}
      </div>
      {/* Progress */}
      <div className="progress-track" style={{ marginBottom: 12 }}>
        <motion.div className="progress-fill" style={{ background: '#4fc3f7' }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost" onClick={onRemove} style={{ flex: 1, justifyContent: 'center' }}>
          {t('dashboard.removeGlass')}
        </button>
        <button className="btn" onClick={onAdd} style={{ flex: 2, justifyContent: 'center', background: 'rgba(79,195,247,0.15)', color: '#4fc3f7', border: '1px solid rgba(79,195,247,0.25)' }}>
          {t('dashboard.addGlass')}
        </button>
      </div>
    </div>
  );
}

function GoalRing({ value, goal, label, color, unit = '' }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const { t } = useTranslation();
  return (
    <div className="glass stat-card goal-card" style={{ alignItems: 'center', textAlign: 'center' }}>
      <div className="goal-ring-chart" style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: pct, fill: color }]} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(255,255,255,0.05)' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="goal-ring-pct" style={{ fontWeight: 800, color }}>{Math.round(pct)}%</span>
        </div>
      </div>
      <div className="goal-ring-val" style={{ fontWeight: 700, fontFamily: 'Space Grotesk', marginTop: 12 }}>{value}{unit}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-faint)', marginTop: 2 }}>{t('dashboard.ofGoal', { goal: goal + unit })}</div>
      <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass" style={{ padding: '10px 14px', fontSize: '0.82rem' }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.fill }}>{p.name}: {p.value} kcal</p>)}
    </div>
  );
};

export default function DashboardPage() {
  const { todayData, weeklyData, stats, dashLoading, fetchToday, updateWater, user } = useStore();
  const { t } = useTranslation();
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    setTheme(saved);
    fetchToday();
  }, []);

  const handleDownloadPDF = () => {
    const element = document.querySelector('.page-inner');
    if (!element || !window.html2pdf) {
      window.print();
      return;
    }
    const hideElements = document.querySelectorAll('.hide-print');
    hideElements.forEach(el => el.style.display = 'none');
    
    const opt = {
      margin: 10,
      filename: `NutriScan_Report_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: theme === 'light' ? '#f4f7f6' : '#0f1219' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    window.html2pdf().set(opt).from(element).save().then(() => {
      hideElements.forEach(el => el.style.display = '');
    });
  };

  const td = todayData;
  const goals = td?.goals || { calories: user?.calorieGoal || 2000, protein: 150, carbs: 250, fat: 65, fiber: 25 };
  const alerts = getNutritionAlerts(td?.totals, goals);

  const handleWaterAdd = async () => {
    try { await updateWater(GLASS_ML); toast.success('💧 ' + t('dashboard.water').replace('💧 ', '') + '!'); }
    catch { toast.error('Failed to update water'); }
  };
  const handleWaterRemove = async () => {
    if ((td?.water || 0) < GLASS_ML) return;
    try { await updateWater(-GLASS_ML); }
    catch { toast.error('Failed to update water'); }
  };

  if (dashLoading) return (
    <div className="page-inner" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.loading')}</p>
      </div>
    </div>
  );

  return (
    <div className="page-inner">
      <div className="page-header fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ flex: '1 1 min-content' }}>
          <h1 style={{ wordBreak: 'break-word' }}>{t('dashboard.title')}</h1>
          <p>Good {getGreeting(t)}, <strong>{user?.name?.split(' ')[0]}</strong>!<br/>Here's your nutrition today.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="hide-print btn btn-ghost" onClick={toggleTheme} style={{ padding: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          <button className="hide-print btn btn-ghost" onClick={handleDownloadPDF}>
            <span style={{ fontSize: '1.2rem' }}>📄</span> <span className="hide-on-mobile">Download</span>
          </button>
          <Link to="/scanner" className="btn btn-primary hide-print">{t('dashboard.scanFood')}</Link>
        </div>
      </div>

      {/* Nutrition Alerts */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }} className="stagger">
          {alerts.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ padding: '10px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', fontWeight: 500,
                background: a.type === 'danger' ? 'rgba(255,107,107,0.1)' : a.type === 'info' ? 'rgba(79,195,247,0.1)' : 'rgba(255,209,102,0.1)',
                border: `1px solid ${a.type === 'danger' ? 'rgba(255,107,107,0.2)' : a.type === 'info' ? 'rgba(79,195,247,0.2)' : 'rgba(255,209,102,0.2)'}`,
                color: a.type === 'danger' ? '#ff6b6b' : a.type === 'info' ? '#4fc3f7' : '#ffd166',
              }}>
              <span style={{ fontSize: '1.1rem' }}>{a.icon}</span>
              {a.msg}
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        <div className="glass stat-card">
          <div className="stat-label">{t('dashboard.totalCalories')}</div>
          <div className="stat-value" style={{ color: '#ffb347' }}>{td?.totals?.calories || 0}</div>
          <div className="stat-sub">{t('dashboard.ofGoal', { goal: goals.calories + ' kcal' })}</div>
        </div>
        <div className="glass stat-card">
          <div className="stat-label">{t('dashboard.mealsToday')}</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{td?.mealCount || 0}</div>
          <div className="stat-sub">{t('dashboard.loggedToday')}</div>
        </div>
        <div className="glass stat-card">
          <div className="stat-label">{t('dashboard.dayStreak')}</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats?.streak || 0}</div>
          <div className="stat-sub">{t('dashboard.consecutiveDays')}</div>
        </div>
        <div className="glass stat-card">
          <div className="stat-label">{t('dashboard.totalMeals')}</div>
          <div className="stat-value" style={{ color: 'var(--secondary)' }}>{stats?.totalMeals || 0}</div>
          <div className="stat-sub">{t('dashboard.allTimeLogged')}</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20, alignItems: 'start', marginBottom: 20 }}>
        {/* Macro Rings */}
        <div className="glass chart-wrap">
          <div className="chart-title">{t('dashboard.goalProgress')}</div>
          <div className="grid-4" style={{ gap: 10, marginBottom: 20 }}>
            <GoalRing value={td?.totals?.calories || 0} goal={goals.calories} label={t('dashboard.calories')} color="#ffb347" />
            <GoalRing value={td?.totals?.protein || 0} goal={goals.protein} label={t('dashboard.protein')} color="#ff6b6b" unit="g" />
            <GoalRing value={td?.totals?.carbs || 0} goal={goals.carbs} label={t('dashboard.carbs')} color="#4fc3f7" unit="g" />
            <GoalRing value={td?.totals?.fat || 0} goal={goals.fat} label={t('dashboard.fat')} color="#ffd166" unit="g" />
          </div>
          {[
            { label: t('dashboard.fiber'), val: td?.totals?.fiber || 0, goal: goals.fiber, unit: 'g', color: '#00e5a0' },
            { label: t('dashboard.sugar'), val: td?.totals?.sugar || 0, goal: 50, unit: 'g', color: '#f06292' },
            { label: t('dashboard.sodium'), val: td?.totals?.sodium || 0, goal: 2300, unit: 'mg', color: '#ce93d8' },
          ].map(m => (
            <div key={m.label} className="progress-wrap" style={{ marginBottom: 8 }}>
              <div className="progress-header">
                <span className="progress-label" style={{ color: m.color }}>{m.label}</span>
                <span className="progress-value">{m.val}{m.unit} / {m.goal}{m.unit}</span>
              </div>
              <div className="progress-track">
                <motion.div className="progress-fill" style={{ background: m.color }} initial={{ width: 0 }} animate={{ width: `${Math.min((m.val / m.goal) * 100, 100)}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
          ))}

          {/* Water Tracker */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <WaterTracker water={td?.water || 0} onAdd={handleWaterAdd} onRemove={handleWaterRemove} />
          </div>
        </div>

        {/* Today's Meals */}
        <div className="glass chart-wrap">
          <div className="chart-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            {t('dashboard.todaysMeals')}
            <Link to="/history" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>{t('dashboard.viewAll')}</Link>
          </div>
          {!td?.meals?.length ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="empty-icon">🍽️</div>
              <h3>{t('dashboard.noMeals')}</h3>
              <p>{t('dashboard.noMealsDesc')}</p>
              <Link to="/scanner" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>{t('dashboard.scanNow')}</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {td.meals.map((meal, i) => {
                const score = calcHealthScore(meal.totals);
                return (
                  <motion.div key={meal._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.5rem', width: 38, textAlign: 'center', flexShrink: 0 }}>
                      {MEAL_EMOJIS[meal.mealType] || '🍽️'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{meal.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {meal.foods?.length} foods · {new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, color: '#ffb347', fontSize: '0.9rem' }}>{meal.totals?.calories} kcal</div>
                      <div style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: 6, background: `${getScoreColor(score)}18`, color: getScoreColor(score), fontWeight: 600 }}>
                        {getScoreLabel(score)} {score}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="glass chart-wrap">
        <div className="chart-title">{t('dashboard.weeklyTrend')}</div>
        {weeklyData?.weekly ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData.weekly} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="calories" name="Calories" radius={[6, 6, 0, 0]}>
                {weeklyData.weekly.map((_, i) => (
                  <Cell key={i} fill={i === 6 ? 'var(--primary)' : WEEK_COLORS[i % WEEK_COLORS.length]} fillOpacity={i === 6 ? 1 : 0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="empty-state" style={{ padding: '32px 16px' }}><p>{t('dashboard.noWeeklyData')}</p></div>}
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.78rem', color: 'var(--text-faint)' }}>
          {t('dashboard.dailyGoal')} <span style={{ color: 'var(--primary)' }}>{goals.calories} kcal</span> · {t('dashboard.brightBar')}
        </div>
      </div>
    </div>
  );
}

function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 5 || h >= 22) return t ? t('dashboard.night') : 'night';
  if (h < 12) return t ? t('dashboard.morning') : 'morning';
  if (h < 17) return t ? t('dashboard.afternoon') : 'afternoon';
  return t ? t('dashboard.evening') : 'evening';
}
