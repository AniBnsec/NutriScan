import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  const bmi = calcBMI(+form.weight, +form.height);
  const bmiCat = getBMICategory(bmi);
  const bmiInfo = bmi ? { label: t(`profile.${bmiCat.label.toLowerCase()}`), color: bmiCat.color } : null;
  const tdee = calcTDEE(+form.weight, +form.height, +form.age, form.gender, form.activityLevel);

  useEffect(() => {
    if (autoGoal && tdee) {
      setForm(p => ({
        ...p,
        calorieGoal: tdee,
        proteinGoal: Math.round(+form.weight * 2 || 150),
        carbGoal: Math.round((tdee * 0.45) / 4),
        fatGoal: Math.round((tdee * 0.25) / 9),
      }));
    }
  }, [autoGoal, tdee, form.weight]);

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
                <input {...inp('name')} placeholder={t('profile.namePlaceholder')} />
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
                  <label className="input-label">{t('profile.height')} (ft)</label>
                  <input {...inp('height')} type="number" step="0.1" placeholder="5.9" min={3} max={8} />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('profile.weight')} (kg)</label>
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
              <div className="chart-title" style={{ marginBottom: 0 }}>{t('profile.nutritionGoals')}</div>
              {tdee && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--primary)' }}>
                  <input type="checkbox" checked={autoGoal} onChange={e => setAutoGoal(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                  {t('profile.autoTDEE')}
                </label>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'calorieGoal', label: t('profile.calories'), unit: 'kcal', min: 800, max: 6000 },
                { key: 'proteinGoal', label: t('profile.protein'), unit: 'g', min: 30, max: 400 },
                { key: 'carbGoal', label: t('profile.carbs'), unit: 'g', min: 50, max: 700 },
                { key: 'fatGoal', label: t('profile.fat'), unit: 'g', min: 20, max: 200 },
                { key: 'fiberGoal', label: t('profile.fiber'), unit: 'g', min: 10, max: 60 },
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

          <button
            className="btn btn-primary btn-lg"
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {saving ? t('common.saving') : t('profile.saveProfile')}
          </button>
        </div>
      </div>
    </div>
  );
}
