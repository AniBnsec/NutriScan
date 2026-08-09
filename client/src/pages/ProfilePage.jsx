import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { calcBMI, getBMICategory, calcTDEE } from '../utils/helpers';
import { useTranslation } from '../i18n/index.jsx';

const ACTIVITY_LABELS = {
  sedentary: { label: 'Sedentary', desc: 'Little or no exercise', icon: '🛋️' },
  light: { label: 'Lightly Active', desc: '1-3 days/week', icon: '🚶' },
  moderate: { label: 'Moderately Active', desc: '3-5 days/week', icon: '🏃' },
  active: { label: 'Active', desc: '6-7 days/week', icon: '💪' },
  very_active: { label: 'Very Active', desc: 'Hard exercise daily', icon: '🏋️' },
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateProfile } = useStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    weight: user?.weight || '',
    height: user?.height || '',
    gender: user?.gender || 'male',
    activityLevel: user?.activityLevel || 'moderate',
    calorieGoal: user?.calorieGoal || 2000,
    proteinGoal: user?.proteinGoal || 150,
    carbGoal: user?.carbGoal || 250,
    fatGoal: user?.fatGoal || 65,
    fiberGoal: user?.fiberGoal || 25,
  });
  const [saving, setSaving] = useState(false);
  const [autoGoal, setAutoGoal] = useState(false);
  const [selectedDeviceModal, setSelectedDeviceModal] = useState(null);
  const [wearables, setWearables] = useState([
    { id: 'apple', name: 'Apple Health', icon: '🍎', connected: true, status: 'Synced 5m ago' },
    { id: 'garmin', name: 'Garmin Connect', icon: '🏃', connected: true, status: 'Active' },
    { id: 'oura', name: 'Oura Ring Gen 3', icon: '💍', connected: false, status: 'Tap to connect' },
    { id: 'whoop', name: 'Whoop 4.0', icon: '⚡', connected: false, status: 'Tap to connect' },
  ]);

  const toggleWearable = (id) => {
    setWearables(prev => prev.map(w => {
      if (w.id === id) {
        const nextState = !w.connected;
        toast.success(nextState ? `Connected ${w.name}! ⌚` : `Disconnected ${w.name}`);
        return { ...w, connected: nextState, status: nextState ? 'Active (Synced)' : 'Tap to connect' };
      }
      return w;
    }));
  };

  const bmi = calcBMI(+form.weight, +form.height);
  const bmiCat = getBMICategory(bmi);
  const BMI_LOCALE_MAP = { 'Underweight': 'underweight', 'Normal Weight': 'normal', 'Overweight': 'overweight', 'Obese': 'obese' };
  const bmiInfo = bmi ? { label: t(`profile.${BMI_LOCALE_MAP[bmiCat.label] || 'normal'}`), color: bmiCat.color } : null;
  const tdee = calcTDEE(+form.weight, +form.height, +form.age, form.gender, form.activityLevel);

  useEffect(() => {
    if (autoGoal && tdee) {
      setForm(p => ({
        ...p,
        calorieGoal: tdee,
        proteinGoal: Math.round((+p.weight * 2) || 150),
        carbGoal: Math.round((tdee * 0.45) / 4),
        fatGoal: Math.round((tdee * 0.25) / 9),
      }));
    }
  }, [autoGoal, tdee]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success(t('profile.saved'));
    } catch {
      toast.error(t('profile.failed'));
    } finally {
      setSaving(false);
    }
  };

  const inp = (key) => ({
    className: 'input',
    value: form[key],
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
  });

  return (
    <div className="page-inner">
      <div className="page-header fade-in">
        <h1>{t('profile.title')}</h1>
        <p>{t('profile.subtitle')}</p>
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass" style={{ padding: 24 }}>
            <div className="chart-title">{t('profile.personalInfo')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">{t('profile.fullName')}</label>
                <input {...inp('name')} placeholder={t('auth.namePlaceholder')} />
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">{t('profile.age')}</label>
                  <input {...inp('age')} type="number" placeholder="25" min={10} max={120} />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('profile.gender')}</label>
                  <select className="input" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="male">{t('profile.male')}</option>
                    <option value="female">{t('profile.female')}</option>
                  </select>
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="input-group">
                   <label className="input-label">{t('profile.heightCm')}</label>
                  <input {...inp('height')} type="number" step="0.1" placeholder="5.9" min={3} max={8} />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('profile.weightKg')}</label>
                  <input {...inp('weight')} type="number" placeholder="70" min={20} max={300} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass" style={{ padding: 24 }}>
            <div className="chart-title">{t('profile.activityLevel')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(ACTIVITY_LABELS).map(([key, val]) => (
                <div
                  key={key}
                  onClick={() => setForm(p => ({ ...p, activityLevel: key }))}
                  style={{
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    border: `1px solid ${form.activityLevel === key ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.activityLevel === key ? 'var(--primary-dim)' : 'rgba(255,255,255,0.02)',
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{val.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: form.activityLevel === key ? 'var(--primary)' : 'var(--text)' }}>
                      {t(`profile.${key === 'very_active' ? 'veryActive' : key}`)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                      {t(`profile.${key === 'very_active' ? 'veryActiveDesc' : key + 'Desc'}`)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass" style={{ padding: 24 }}>
            <div className="chart-title">{t('profile.bmiCalculator')}</div>
            {bmi ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: bmiInfo?.color }}>{bmi}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: bmiInfo?.color, marginTop: 4 }}>{bmiInfo?.label}</div>
                </div>
                {tdee && (
                  <div style={{ padding: '14px', background: 'var(--primary-dim)', borderRadius: 10, border: '1px solid rgba(0,229,160,0.15)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t('profile.tdeeLabel')}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Space Grotesk' }}>{tdee}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{t('profile.tdeeUnit')}</div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div style={{ fontSize: '2rem' }}>📏</div>
                <p>{t('profile.enterBMI')}</p>
              </div>
            )}
          </div>

          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="chart-title" style={{ marginBottom: 0 }}>{t('profile.dailyGoals')}</div>
              {tdee && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--primary)' }}>
                   <input type="checkbox" checked={autoGoal} onChange={e => setAutoGoal(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                  {t('profile.autoFromTDEE')}
                </label>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'calorieGoal', label: t('dashboard.calories'), unit: 'kcal', min: 800, max: 6000 },
                { key: 'proteinGoal', label: t('dashboard.protein'), unit: 'g', min: 30, max: 400 },
                { key: 'carbGoal', label: t('dashboard.carbs'), unit: 'g', min: 50, max: 700 },
                { key: 'fatGoal', label: t('dashboard.fat'), unit: 'g', min: 20, max: 200 },
                { key: 'fiberGoal', label: t('dashboard.fiber'), unit: 'g', min: 10, max: 60 },
              ].map(g => (
                <div key={g.key} className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="input-label">{g.label}</label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{form[g.key]} {g.unit}</span>
                  </div>
                  <input
                    type="range" min={g.min} max={g.max} step={g.key === 'calorieGoal' ? 50 : 5}
                    value={form[g.key]}
                    onChange={e => !autoGoal && setForm(p => ({ ...p, [g.key]: +e.target.value }))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                    disabled={autoGoal}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Wearables Sync Card */}
          <div className="glass" style={{ padding: 24 }}>
            <div className="chart-title" style={{ marginBottom: 14 }}>⌚ Connected Health Wearables</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {wearables.map((w) => (
                <div
                  key={w.id}
                  onClick={() => setSelectedDeviceModal(w)}
                  style={{
                    padding: 12, borderRadius: 14, cursor: 'pointer',
                    background: w.connected ? 'rgba(0,245,160,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${w.connected ? 'rgba(0,245,160,0.3)' : 'var(--border)'}`,
                    fontSize: '0.82rem', transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: w.connected ? '#00e5a0' : 'var(--text-muted)' }}>
                    <span>{w.icon}</span> {w.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: w.connected ? '#00e5a0' : 'var(--text-faint)', marginTop: 4 }}>
                    {w.connected ? '✓ ' + w.status : w.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Tracking Mode Card */}
          <div className="glass" style={{ padding: 24 }}>
            <div className="chart-title" style={{ marginBottom: 10 }}>🏥 Medical & Clinical Tracking Mode</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Enable special clinical protocols to monitor blood glucose, insulin sensitivity, sodium restrictions, or renal protein caps.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { id: 'diabetic', label: '🩸 Type 1 / Type 2 Diabetic Mode (Glucose & Net Carbs)', active: false },
                { id: 'renal', label: '🫘 Renal Kidney Protocol (Low Sodium & Potassium)', active: false },
                { id: 'hypertension', label: '❤️ DASH / Anti-Hypertension Protocol', active: true },
              ].map(mode => (
                <label key={mode.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" defaultChecked={mode.active} onChange={() => toast.success('Medical Mode preference updated!')} style={{ accentColor: 'var(--primary)' }} />
                  <span>{mode.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', justifyContent: 'center', borderRadius: 16 }}
          >
            {saving ? t('common.saving') : t('profile.saveProfile')}
          </button>
        </div>
      </div>

      {/* Device Connection Modal */}
      <AnimatePresence>
        {selectedDeviceModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedDeviceModal(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass"
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 460, padding: 28, position: 'relative', border: '1px solid rgba(0, 245, 160, 0.35)', background: '#0a0d14' }}>

              <button onClick={() => setSelectedDeviceModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <div style={{ fontSize: '2.5rem', width: 58, height: 58, borderRadius: 16, background: 'rgba(0,245,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,245,160,0.3)', flexShrink: 0 }}>
                  {selectedDeviceModal.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                    {selectedDeviceModal.connected ? 'Manage' : 'Connect'} {selectedDeviceModal.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: selectedDeviceModal.connected ? '#00e5a0' : '#94a3b8', marginTop: 3 }}>
                    {selectedDeviceModal.connected ? '✓ Device Currently Paired & Syncing' : 'Scan QR Code to Authorize Sync'}
                  </div>
                </div>
              </div>

              {!selectedDeviceModal.connected ? (<>
                {/* QR Code Scanner Step */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 14 }}>
                    Open <strong style={{ color: '#f8fafc' }}>{selectedDeviceModal.name}</strong> on your phone, go to <strong style={{ color: '#f8fafc' }}>Settings → Third-Party Apps</strong>, then scan this QR code to authorize data access:
                  </div>

                  {/* Simulated QR Code */}
                  <div style={{ display: 'inline-block', padding: 14, background: '#fff', borderRadius: 16, marginBottom: 14, position: 'relative' }}>
                    <svg width="140" height="140" viewBox="0 0 140 140" style={{ display: 'block' }}>
                      {/* QR code pattern simulation */}
                      <rect width="140" height="140" fill="white"/>
                      {/* Top-left finder */}
                      <rect x="10" y="10" width="40" height="40" fill="black"/>
                      <rect x="16" y="16" width="28" height="28" fill="white"/>
                      <rect x="22" y="22" width="16" height="16" fill="black"/>
                      {/* Top-right finder */}
                      <rect x="90" y="10" width="40" height="40" fill="black"/>
                      <rect x="96" y="16" width="28" height="28" fill="white"/>
                      <rect x="102" y="22" width="16" height="16" fill="black"/>
                      {/* Bottom-left finder */}
                      <rect x="10" y="90" width="40" height="40" fill="black"/>
                      <rect x="16" y="96" width="28" height="28" fill="white"/>
                      <rect x="22" y="102" width="16" height="16" fill="black"/>
                      {/* Data modules */}
                      {[60,66,72,78,84].map(x => [60,66,72,78,84].map(y => (x+y)%12<6 &&
                        <rect key={`${x}${y}`} x={x} y={y} width="5" height="5" fill="black"/>
                      ))}
                      {[10,16,22,28,34].map(x => [60,66,72].map(y =>
                        <rect key={`d${x}${y}`} x={x} y={y} width="5" height="5" fill="black"/>
                      ))}
                      {[90,96,102,108,114,120].map(x => [60,66,72,78].map(y => (x+y)%10<5 &&
                        <rect key={`e${x}${y}`} x={x} y={y} width="5" height="5" fill="black"/>
                      ))}
                      {[60,66,72,78,84].map(x => [90,96,102,108,114].map(y => (x*y)%8<4 &&
                        <rect key={`f${x}${y}`} x={x} y={y} width="5" height="5" fill="black"/>
                      ))}
                    </svg>
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.8 }}
                      style={{ position: 'absolute', inset: 8, border: '2px solid #00f5a0', borderRadius: 10, pointerEvents: 'none' }} />
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    📱 QR expires in <strong style={{ color: '#ffd166' }}>5:00</strong> — scan now to pair instantly
                  </div>
                </div>

                {/* Steps */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 14, marginBottom: 20, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      `1. Open ${selectedDeviceModal.name} app on your phone`,
                      '2. Go to Settings → Third-Party Apps → Add App',
                      '3. Tap "Scan QR" and point camera at the code above',
                      '4. Grant access for Workouts, Calories & Heart Rate',
                    ].map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: '#00e5a0', fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem' }}
                  onClick={() => { toggleWearable(selectedDeviceModal.id); setSelectedDeviceModal(null); }}>
                  ⚡ Authorize & Sync Device
                </button>
              </>) : (<>
                {/* Already connected — sync status */}
                <div style={{ background: 'rgba(0,245,160,0.05)', borderRadius: 14, padding: 16, marginBottom: 20, border: '1px solid rgba(0,245,160,0.2)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#00e5a0', marginBottom: 10 }}>📊 Live Sync Data</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🔥 Active Calories Today</span><strong style={{ color: '#ff6b6b' }}>312 kcal</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>👣 Steps</span><strong style={{ color: '#4fc3f7' }}>7,842</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>❤️ Avg Heart Rate</span><strong style={{ color: '#f06292' }}>72 bpm</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🏃 Workouts Synced</span><strong style={{ color: '#00e5a0' }}>2 sessions</strong></div>
                  </div>
                </div>

                <button className="btn btn-ghost" style={{ width: '100%', color: '#ff6b6b', justifyContent: 'center' }}
                  onClick={() => { toggleWearable(selectedDeviceModal.id); setSelectedDeviceModal(null); }}>
                  Disconnect {selectedDeviceModal.name}
                </button>
              </>)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

