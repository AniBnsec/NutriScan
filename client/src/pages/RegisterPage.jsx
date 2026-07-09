import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { useTranslation } from '../i18n/index.jsx';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', calorieGoal: 2000 });
  const [loading, setLoading] = useState(false);
  const { register } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.calorieGoal);
      toast.success('Account created! Let\'s start scanning 🥗');
      navigate('/scanner');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card glass"
      >
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/LOGO.png" alt="Logo" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', marginBottom: 16, boxShadow: '0 8px 24px rgba(0,229,160,0.2)' }} />
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.6rem', color: '#fff', letterSpacing: '0.5px' }}>
            NutriScan
          </div>
        </div>
        <h2 className="auth-title">{t('auth.createAccount')}</h2>
        <p className="auth-sub">{t('auth.registerSubtitle')}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="name">{t('auth.fullName')}</label>
            <input id="name" type="text" className="input" placeholder={t('auth.namePlaceholder')}
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="reg-email">{t('auth.email')}</label>
            <input id="reg-email" type="email" className="input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="reg-password">{t('auth.password')}</label>
            <input id="reg-password" type="password" className="input" placeholder={t('auth.passwordPlaceholder')}
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="calorie-goal">{t('auth.calorieGoal')}</label>
            <input id="calorie-goal" type="number" className="input" placeholder="2000" min={800} max={6000}
              value={form.calorieGoal} onChange={e => setForm(p => ({ ...p, calorieGoal: +e.target.value }))} />
          </div>

          <button type="submit" id="register-btn" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> {t('auth.creating')}</> : t('auth.createBtn')}
          </button>
        </form>

        <div className="auth-divider">{t('common.or')}</div>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {t('auth.alreadyAccount')}{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>{t('auth.signIn').replace('🚀 ', '')}</Link>
        </p>
      </motion.div>
    </div>
  );
}
