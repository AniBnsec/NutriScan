import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/client';
import useStore from '../store/useStore';
import { calcBMI, getBMICategory } from '../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass" style={{ padding: '10px 14px', fontSize: '0.82rem' }}>
      <p style={{ fontWeight: 600 }}>{label}</p>
      <p style={{ color: '#4fc3f7' }}>Weight: {payload[0]?.value} kg</p>
      {payload[1]?.value && <p style={{ color: '#ffd166' }}>BMI: {payload[1].value}</p>}
    </div>
  );
};

export default function WeightPage() {
  const { user } = useStore();
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ weight: user?.weight || '', bodyFat: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/dashboard/weight/history?days=90')
      .then(r => { setHistory(r.data.history || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.weight || +form.weight < 20 || +form.weight > 500) return toast.error('Enter a valid weight');
    setSaving(true);
    try {
      const { data } = await api.post('/dashboard/weight', { weight: +form.weight, bodyFat: form.bodyFat ? +form.bodyFat : null, note: form.note });
      setHistory(prev => {
        const filtered = prev.filter(h => h.date !== data.entry.date);
        return [data.entry, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
      });
      setForm(p => ({ ...p, note: '' }));
      toast.success('Weight logged! ✅');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const chartData = [...history].reverse().map(h => ({
    date: new Date(h.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    weight: h.weight,
    bmi: calcBMI(h.weight, user?.height),
  }));

  const current = history[0];
  const startWeight = history[history.length - 1];
  const change = current && startWeight ? (current.weight - startWeight.weight).toFixed(1) : 0;
  const currentBMI = calcBMI(current?.weight || user?.weight, user?.height);
  const bmiCat = getBMICategory(currentBMI);
  const goalWeight = user?.targetWeight;
  const remaining = goalWeight && current ? Math.abs(current.weight - goalWeight).toFixed(1) : null;

  return (
    <div className="page-inner">
      <div className="page-header fade-in">
        <h1>⚖️ Weight Tracker</h1>
        <p>Track your weight trend over time with visual charts</p>
      </div>

      {/* Stats */}
      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        {[
          { label: 'Current Weight', val: current?.weight ? `${current.weight} kg` : '—', color: '#4fc3f7' },
          { label: 'BMI', val: currentBMI || '—', sub: bmiCat?.label, color: bmiCat?.color || 'var(--primary)' },
          { label: '90-Day Change', val: change ? `${+change > 0 ? '+' : ''}${change} kg` : '—', color: +change > 0 ? '#ff6b6b' : '#00e5a0' },
          { label: 'Goal Weight', val: goalWeight ? `${goalWeight} kg` : 'Not set', sub: remaining ? `${remaining} kg to go` : '', color: '#ffd166' },
        ].map(s => (
          <div key={s.label} className="glass stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
            {s.sub && <div className="stat-sub">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Chart */}
        <div className="glass chart-wrap">
          <div className="chart-title">Weight Trend (Last 90 Days)</div>
          {chartData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 16px' }}>
              <div className="empty-icon">📊</div>
              <h3>No data yet</h3>
              <p>Log your first weight entry to see the chart</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 6)} />
                <YAxis yAxisId="w" domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {goalWeight && <ReferenceLine yAxisId="w" y={goalWeight} stroke="#ffd166" strokeDasharray="4 4" label={{ value: `Goal: ${goalWeight}kg`, fill: '#ffd166', fontSize: 11, position: 'insideTopRight' }} />}
                <Line yAxisId="w" type="monotone" dataKey="weight" stroke="#4fc3f7" strokeWidth={2.5} dot={{ fill: '#4fc3f7', r: 3 }} activeDot={{ r: 5 }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Log + History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Log form */}
          <div className="glass" style={{ padding: 24 }}>
            <div className="chart-title">Log Today's Weight</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Weight (kg) *</label>
                <input className="input" type="number" min={20} max={500} step={0.1} placeholder="e.g. 72.5" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Body Fat % (optional)</label>
                <input className="input" type="number" min={3} max={60} step={0.5} placeholder="e.g. 18.5" value={form.bodyFat} onChange={e => setForm(p => ({ ...p, bodyFat: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Note (optional)</label>
                <input className="input" placeholder="e.g. Morning, after workout..." value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : '💾 Log Weight'}
              </button>
            </div>
          </div>

          {/* History list */}
          <div className="glass" style={{ padding: 24 }}>
            <div className="chart-title">Recent Entries</div>
            {loading ? <div className="skeleton" style={{ height: 160 }} /> :
            history.length === 0 ? <div className="empty-state" style={{ padding: '16px 0' }}><p>No entries yet</p></div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(0, 10).map((h, i) => {
                  const bmi = calcBMI(h.weight, user?.height);
                  const cat = getBMICategory(bmi);
                  const diff = i < history.length - 1 ? (h.weight - history[i + 1].weight).toFixed(1) : null;
                  return (
                    <motion.div key={h._id || h.date} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{h.weight} kg</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{new Date(h.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                      {bmi && <div style={{ fontSize: '0.78rem', color: cat?.color }}>BMI {bmi}</div>}
                      {diff !== null && (
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: +diff > 0 ? '#ff6b6b' : '#00e5a0' }}>
                          {+diff > 0 ? '+' : ''}{diff} kg
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
