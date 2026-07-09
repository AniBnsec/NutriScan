import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { useTranslation } from '../i18n/index.jsx';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.signIn') + ' failed');
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
        <h2 className="auth-title">{t('auth.welcomeBack')}</h2>
        <p className="auth-sub">{t('auth.signInSubtitle')}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="email">{t('auth.email')}</label>
            <input
              id="email" type="email" className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="password">{t('auth.password')}</label>
            <input
              id="password" type="password" className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit" id="login-btn"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> {t('auth.signingIn')}</> : t('auth.signIn')}
          </button>
        </form>

        <div className="auth-divider">{t('common.or')}</div>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {t('auth.noAccount')}{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>{t('auth.createOne')}</Link>
        </p>

        {/* Demo hint */}
        <div style={{ marginTop: 20, padding: '12px 14px', background: 'rgba(0,229,160,0.06)', borderRadius: 10, border: '1px solid rgba(0,229,160,0.12)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {t('auth.firstTime')} <Link to="/register">{t('auth.register')}</Link> {t('auth.registerHint')}
        </div>
      </motion.div>
    </div>
  );
}
