import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { requestNotificationPermission, scheduleReminders, cancelReminders } from '../utils/notifications';
import { useTranslation } from '../i18n/index.jsx';
import api from '../api/client';

const DIET_MODES = [
  { key: 'general',               icon: '🥗', color: '#94a3b8' },
  { key: 'keto',                  icon: '🥩', color: '#f59e0b' },
  { key: 'vegan',                 icon: '🌱', color: '#22c55e' },
  { key: 'high_protein',          icon: '💪', color: '#ef4444' },
  { key: 'low_carb',              icon: '🥦', color: '#3b82f6' },
  { key: 'mediterranean',         icon: '🫒', color: '#a855f7' },
  { key: 'intermittent_fasting',  icon: '⏰', color: '#f97316' },
];

const REMINDER_KEYS = ['breakfast', 'lunch', 'snack', 'dinner'];
const REMINDER_DEFAULTS = { breakfast: '08:00', lunch: '13:00', snack: '16:00', dinner: '20:00' };

export default function SettingsPage() {
  const { user, updateProfile } = useStore();
  const { t, lang, setLang, languages } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [dietMode, setDietMode] = useState(user?.dietMode || 'general');
  const [remindersEnabled, setRemindersEnabled] = useState(localStorage.getItem('reminders_enabled') === 'true');
  const [reminderTimes, setReminderTimes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('reminder_times') || '{}'); }
    catch { return {}; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    toast.success(next === 'dark' ? t('settings.darkActivated') : t('settings.lightActivated'));
  };

  const handleDietSave = async () => {
    setSaving(true);
    try {
      const goalUpdates = { dietMode };
      if (user?.weight) {
        if (dietMode === 'high_protein') goalUpdates.proteinGoal = Math.round(user.weight * 2.2);
        if (dietMode === 'keto') { goalUpdates.carbGoal = 20; goalUpdates.fatGoal = Math.round((user.calorieGoal * 0.7) / 9); }
        if (dietMode === 'low_carb') goalUpdates.carbGoal = 100;
      }
      await updateProfile({ ...goalUpdates, language: lang });
      toast.success(t('settings.dietSaved'));
    } catch { toast.error(t('settings.saveFailed')); }
    finally { setSaving(false); }
  };

  const handleToggleReminders = async (enabled) => {
    if (enabled) {
      const permission = await requestNotificationPermission();
      if (!permission) { toast.error(t('settings.notifDenied')); return; }
      scheduleReminders(reminderTimes);
      localStorage.setItem('reminders_enabled', 'true');
      setRemindersEnabled(true);
      toast.success(t('settings.remindersEnabled'));
    } else {
      cancelReminders();
      localStorage.setItem('reminders_enabled', 'false');
      setRemindersEnabled(false);
      toast.success(t('settings.remindersDisabled'));
    }
  };

  const handleReminderTimeChange = (key, value) => {
    const updated = { ...reminderTimes, [key]: value };
    setReminderTimes(updated);
    localStorage.setItem('reminder_times', JSON.stringify(updated));
    if (remindersEnabled) scheduleReminders(updated);
  };

  const sendTestNotification = () => {
    if (!('Notification' in window)) return toast.error(t('settings.notifNotSupported'));
    if (Notification.permission === 'granted') {
      new Notification(t('settings.testNotifTitle'), { body: t('settings.testNotifBody'), icon: '/icons/icon-192.png' });
    } else {
      toast.error(t('settings.enableFirst'));
    }
  };

  return (
    <div className="page-inner">
      <div className="page-header fade-in">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Appearance */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="chart-title">{t('settings.appearance')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{t('settings.themeDesc')}</div>
            </div>
            <button onClick={handleThemeToggle} style={{
              width: 56, height: 28, borderRadius: 99, cursor: 'pointer', border: 'none', position: 'relative',
              background: theme === 'dark' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', transition: 'background 0.3s'
            }}>
              <motion.div animate={{ x: theme === 'dark' ? 28 : 2 }}
                style={{ position: 'absolute', top: 2, width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="chart-title">{t('settings.language')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {languages.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                style={{
                  padding: '14px 10px', borderRadius: 12, cursor: 'pointer',
                  border: `2px solid ${lang === l.code ? 'var(--primary)' : 'var(--border)'}`,
                  background: lang === l.code ? 'var(--primary-dim)' : 'rgba(255,255,255,0.03)',
                  transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                }}>
                <div style={{ fontSize: '1.6rem' }}>{l.flag}</div>
                <div style={{ fontWeight: 700, fontSize: '0.78rem', color: lang === l.code ? 'var(--primary)' : 'var(--text)' }}>{l.native}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{l.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Diet Mode */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="chart-title">{t('settings.dietMode')}</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>{t('settings.dietDesc')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
            {DIET_MODES.map(d => (
              <div key={d.key} onClick={() => setDietMode(d.key)}
                style={{ padding: '14px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${dietMode === d.key ? d.color : 'var(--border)'}`, background: dietMode === d.key ? `${d.color}12` : 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{d.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: dietMode === d.key ? d.color : 'var(--text)', marginBottom: 2 }}>{t(`settings.diets.${d.key}`)}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-faint)' }}>{t(`settings.diets.${d.key}Desc`)}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={handleDietSave} disabled={saving}>
            {saving ? t('common.saving') : t('settings.saveDiet')}
          </button>
        </div>

        {/* Meal Reminders */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="chart-title" style={{ marginBottom: 0 }}>{t('settings.reminders')}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={sendTestNotification}>{t('settings.testReminder')}</button>
              <button onClick={() => handleToggleReminders(!remindersEnabled)} style={{
                width: 56, height: 28, borderRadius: 99, cursor: 'pointer', border: 'none', position: 'relative',
                background: remindersEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.15)', transition: 'background 0.3s'
              }}>
                <motion.div animate={{ x: remindersEnabled ? 28 : 2 }}
                  style={{ position: 'absolute', top: 2, width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {REMINDER_KEYS.map(key => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: remindersEnabled ? 1 : 0.4 }}>
                <div style={{ width: 140, fontSize: '0.88rem', fontWeight: 500, flexShrink: 0 }}>{t(`settings.${key}`)}</div>
                <input type="time" className="input" style={{ width: 120 }} value={reminderTimes[key] || REMINDER_DEFAULTS[key]}
                  onChange={e => handleReminderTimeChange(key, e.target.value)} disabled={!remindersEnabled} />
              </div>
            ))}
          </div>
          {!remindersEnabled && <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: 12 }}>{t('settings.remindersOffMsg')}</p>}
        </div>

        {/* ── Danger Zone ── */}
        <div className="glass" style={{ padding: 24, border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.03)' }}>
          <div className="chart-title" style={{ color: '#ff6b6b', marginBottom: 6 }}>⚠️ Danger Zone</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 18 }}>
            Permanently clears all meals, nutrition history, user data, and localStorage. This action cannot be undone.
          </p>
          <button
            className="btn"
            onClick={() => {
              if (!window.confirm('⚠️ Are you sure? This will permanently delete all your meals, history, and app data. This cannot be undone.')) return;
              // Clear all localStorage keys
              localStorage.clear();
              // Reset Zustand store
              useStore.setState({
                user: null, token: null, isAuthenticated: false,
                todayData: null, meals: [], weeklyData: null, stats: null,
                scanResult: null,
              });
              toast.success('App data cleared — refreshing...');
              setTimeout(() => { window.location.href = '/'; }, 1200);
            }}
            style={{
              background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.4)',
              color: '#ff6b6b', fontWeight: 600, padding: '10px 20px', borderRadius: 12,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
            }}
          >
            🗑️ Reset Full App Data
          </button>
        </div>
      </div>
    </div>
  );
}
