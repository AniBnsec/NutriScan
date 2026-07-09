import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/client';

const TIME_LABELS = { morning: '🌅 Morning', afternoon: '☀️ Afternoon', evening: '🌆 Evening', night: '🌙 Night', with_meal: '🍽️ With Meal' };

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState([]);
  const [todayList, setTodayList] = useState([]);
  const [presets, setPresets] = useState([]);
  const [form, setForm] = useState({ name: '', dose: '', unit: 'mg', preferredTime: 'morning', color: '#00e5a0' });
  const [view, setView] = useState('today'); // today | manage | add
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([api.get('/supplements/today'), api.get('/supplements'), api.get('/supplements/presets')])
      .then(([todayRes, listRes, presetRes]) => {
        setTodayList(todayRes.data.list || []);
        setSupplements(listRes.data.supplements || []);
        setPresets(presetRes.data.presets || []);
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const toggleTaken = async (supplementId) => {
    const { data } = await api.post(`/supplements/${supplementId}/toggle`);
    setTodayList(prev => prev.map(item =>
      item.supplement._id === supplementId ? { ...item, taken: data.taken } : item
    ));
    toast(data.taken ? '✅ Taken!' : 'Unmarked', { duration: 1500 });
  };

  const addSupplement = async () => {
    if (!form.name) return toast.error('Enter supplement name');
    try {
      await api.post('/supplements', form);
      toast.success(`${form.name} added! 💊`);
      setForm({ name: '', dose: '', unit: 'mg', preferredTime: 'morning', color: '#00e5a0' });
      fetchData();
      setView('today');
    } catch { toast.error('Failed to add'); }
  };

  const addPreset = async (preset) => {
    try {
      await api.post('/supplements', preset);
      toast.success(`${preset.name} added!`);
      fetchData();
    } catch { toast.error('Failed to add'); }
  };

  const removeSupplement = async (id) => {
    await api.delete(`/supplements/${id}`);
    setTodayList(prev => prev.filter(i => i.supplement._id !== id));
    setSupplements(prev => prev.filter(s => s._id !== id));
    toast.success('Removed');
  };

  const taken = todayList.filter(i => i.taken).length;
  const total = todayList.length;

  return (
    <div className="page-inner">
      <div className="page-header fade-in" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>💊 Supplement Tracker</h1>
          <p>Track your daily vitamins and supplements</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['today', 'manage', 'add'].map(v => (
            <button key={v} className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView(v)} style={{ textTransform: 'capitalize' }}>
              {v === 'today' ? '📋 Today' : v === 'manage' ? '⚙️ Manage' : '+ Add'}
            </button>
          ))}
        </div>
      </div>

      {view === 'today' && (
        <>
          {/* Progress */}
          <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>{taken} of {total} supplements taken today</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Space Grotesk', color: 'var(--primary)' }}>
                {total > 0 ? Math.round((taken / total) * 100) : 0}%
              </div>
            </div>
            <div className="progress-track">
              <motion.div className="progress-fill" style={{ background: 'var(--primary)' }} initial={{ width: 0 }}
                animate={{ width: `${total > 0 ? (taken / total) * 100 : 0}%` }} transition={{ duration: 0.8 }} />
            </div>
            {taken === total && total > 0 && (
              <div style={{ marginTop: 10, textAlign: 'center', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                🎉 All supplements taken! Great job!
              </div>
            )}
          </div>

          {loading ? <div className="skeleton" style={{ height: 300 }} /> :
          total === 0 ? (
            <div className="glass empty-state">
              <div className="empty-icon">💊</div>
              <h3>No supplements added</h3>
              <p>Add your daily vitamins to start tracking</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setView('add')}>+ Add Supplements</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(
                todayList.reduce((g, item) => {
                  const t = item.supplement.preferredTime || 'morning';
                  if (!g[t]) g[t] = [];
                  g[t].push(item);
                  return g;
                }, {})
              ).sort().map(([time, items]) => (
                <div key={time}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    {TIME_LABELS[time] || time}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map((item) => (
                      <motion.div key={item.supplement._id} whileTap={{ scale: 0.98 }}
                        onClick={() => toggleTaken(item.supplement._id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
                          background: item.taken ? `${item.supplement.color || '#00e5a0'}12` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${item.taken ? (item.supplement.color || '#00e5a0') + '30' : 'var(--border)'}`,
                          transition: 'all 0.25s' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: item.taken ? (item.supplement.color || '#00e5a0') : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.25s' }}>
                          {item.taken ? '✓' : ''}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: item.taken ? 'var(--text-muted)' : 'var(--text)', textDecoration: item.taken ? 'line-through' : 'none' }}>
                            {item.supplement.name}
                          </div>
                          {item.supplement.dose && <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{item.supplement.dose} {item.supplement.unit}</div>}
                        </div>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.supplement.color || '#00e5a0', flexShrink: 0 }} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === 'manage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {supplements.length === 0 ? (
            <div className="glass empty-state"><div className="empty-icon">💊</div><p>No supplements added yet</p></div>
          ) : supplements.map(s => (
            <div key={s._id} className="glass" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color || '#00e5a0', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{s.dose} {s.unit} · {TIME_LABELS[s.preferredTime]}</div>
              </div>
              <button onClick={() => removeSupplement(s._id)} style={{ background: 'none', border: 'none', color: 'rgba(255,107,107,0.7)', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {view === 'add' && (
        <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
          <div className="glass" style={{ padding: 24 }}>
            <div className="chart-title">Add Custom Supplement</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input" placeholder="Name (e.g. Vitamin D3)" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <div className="grid-2" style={{ gap: 10 }}>
                <input className="input" placeholder="Dose" value={form.dose} onChange={e => setForm(p => ({ ...p, dose: e.target.value }))} />
                <select className="input" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                  {['mg', 'mcg', 'IU', 'g', 'ml', 'tablet', 'capsule'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <select className="input" value={form.preferredTime} onChange={e => setForm(p => ({ ...p, preferredTime: e.target.value }))}>
                {Object.entries(TIME_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label className="input-label">Color:</label>
                <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: 40, height: 36, border: 'none', background: 'none', cursor: 'pointer' }} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={addSupplement}>+ Add Supplement</button>
            </div>
          </div>

          <div className="glass" style={{ padding: 24 }}>
            <div className="chart-title">Popular Supplements</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {presets.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{p.dose} {p.unit}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => addPreset(p)}>+ Add</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
