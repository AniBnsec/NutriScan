import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n/index.jsx';
import BackgroundGrid from '../components/common/BackgroundGrid';

const features = [
  { icon: '📸', title: 'Smart Food Recognition', desc: 'Powered by Google Gemini AI — identify any food from a single photo with high accuracy.', color: 'var(--primary-dim)', iconBg: 'rgba(0,229,160,0.12)' },
  { icon: '⚖️', title: 'Portion Size Estimation', desc: 'AI estimates exact grams/ml for each food item on your plate automatically.', color: 'var(--secondary-dim)', iconBg: 'rgba(124,106,247,0.12)' },
  { icon: '🔥', title: 'Calorie Calculation', desc: 'Instant kcal count for every ingredient and total meal calories.', color: 'var(--accent-dim)', iconBg: 'rgba(255,107,107,0.12)' },
  { icon: '💪', title: 'Full Macronutrients', desc: 'Protein, carbs, fat, fiber, and sugar breakdown per food and per meal.', color: 'var(--gold-dim)', iconBg: 'rgba(255,209,102,0.12)' },
  { icon: '🧬', title: 'Micronutrients', desc: 'Vitamins A, C, D, B12, Iron, Calcium and more where available.', color: 'var(--blue-dim)', iconBg: 'rgba(79,195,247,0.12)' },
  { icon: '📈', title: 'Daily Dashboard', desc: 'Track daily intake vs goals with beautiful charts and progress rings.', color: 'var(--primary-dim)', iconBg: 'rgba(0,229,160,0.12)' },
  { icon: '🍛', title: 'Multi-food Detection', desc: 'Detects multiple foods on a single plate — even complex Indian thalis.', color: 'var(--secondary-dim)', iconBg: 'rgba(124,106,247,0.12)' },
  { icon: '📝', title: 'Meal History & Reports', desc: 'Browse past meals, search by date, and view 7-day nutrition trends.', color: 'var(--accent-dim)', iconBg: 'rgba(255,107,107,0.12)' },
];

const steps = [
  { num: '01', title: 'Take a Photo', desc: 'Click or drag any food photo into the scanner.' },
  { num: '02', title: 'AI Analysis', desc: 'Gemini AI identifies every food item and portion size.' },
  { num: '03', title: 'Get Nutrition', desc: 'Instant breakdown of calories, macros, and vitamins.' },
  { num: '04', title: 'Track Progress', desc: 'Save meals and monitor daily nutrition on the dashboard.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    { icon: '📸', title: t('landing.features.f1title'), desc: t('landing.features.f1desc'), color: 'var(--primary-dim)', iconBg: 'rgba(0,229,160,0.12)' },
    { icon: '⚖️', title: t('landing.features.f2title'), desc: t('landing.features.f2desc'), color: 'var(--secondary-dim)', iconBg: 'rgba(124,106,247,0.12)' },
    { icon: '🔥', title: t('landing.features.f3title'), desc: t('landing.features.f3desc'), color: 'var(--accent-dim)', iconBg: 'rgba(255,107,107,0.12)' },
    { icon: '💪', title: t('landing.features.f4title'), desc: t('landing.features.f4desc'), color: 'var(--gold-dim)', iconBg: 'rgba(255,209,102,0.12)' },
    { icon: '🧬', title: t('landing.features.f5title'), desc: t('landing.features.f5desc'), color: 'var(--blue-dim)', iconBg: 'rgba(79,195,247,0.12)' },
    { icon: '📈', title: t('landing.features.f6title'), desc: t('landing.features.f6desc'), color: 'var(--primary-dim)', iconBg: 'rgba(0,229,160,0.12)' },
    { icon: '🍛', title: t('landing.features.f7title'), desc: t('landing.features.f7desc'), color: 'var(--secondary-dim)', iconBg: 'rgba(124,106,247,0.12)' },
    { icon: '📝', title: t('landing.features.f8title'), desc: t('landing.features.f8desc'), color: 'var(--accent-dim)', iconBg: 'rgba(255,107,107,0.12)' },
    { icon: '🌙', title: t('landing.features.f9title'), desc: t('landing.features.f9desc'), color: 'var(--blue-dim)', iconBg: 'rgba(79,195,247,0.12)' },
  ];

  const steps = [
    { num: '01', title: t('landing.steps.s1title'), desc: t('landing.steps.s1desc') },
    { num: '02', title: t('landing.steps.s2title'), desc: t('landing.steps.s2desc') },
    { num: '03', title: t('landing.steps.s3title'), desc: t('landing.steps.s3desc') },
    { num: '04', title: t('landing.steps.s4title'), desc: t('landing.steps.s4desc') },
  ];

  const floatingStats = [
    { val: '80+', label: t('landing.foodsInDB') },
    { val: 'AI', label: t('landing.powered') },
    { val: '14+', label: t('landing.nutrientsTracked') },
    { val: '∞', label: t('landing.mealsLogged') },
  ];

  return (
    <div className="landing" style={{ position: 'relative', overflow: 'hidden' }}>
      <BackgroundGrid />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="logo-mark" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 'clamp(1rem, 4vw, 1.25rem)', whiteSpace: 'nowrap' }}>
          <img src="/LOGO.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
          <span style={{ color: '#fff' }}>NutriScan</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1, minWidth: 160 }}>
          <Link to="/login" className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>{t('landing.signIn')}</Link>
          <Link to="/register" className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{t('landing.getStarted')}</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div className="hero-badge">
            <span>✨</span> {t('landing.poweredBy').replace('✨ ', '')}
          </div>
          <h1>
            {t('landing.heroTitle')}<br />
            <span className="gradient-text">{t('landing.heroTitleGradient')}</span>
          </h1>
          <p>
            {t('landing.heroDesc')}
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              {t('landing.startScanning')}
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>
              {t('landing.signIn')} →
            </button>
          </div>

          {/* Floating stats */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
            {floatingStats.map(s => (
              <div key={s.label} className="glass" style={{ padding: '16px 24px', textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Space Grotesk', color: 'var(--primary)' }}>{s.val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2>{t('landing.howItWorks')} <span className="gradient-text">{t('landing.works')}</span></h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>{t('landing.howDesc')}</p>
        </div>
        <div className="grid-4 stagger" style={{ maxWidth: 900, margin: '0 auto' }}>
          {steps.map(s => (
            <div key={s.num} className="glass" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'Space Grotesk', opacity: 0.4, marginBottom: 12 }}>{s.num}</div>
              <h3 style={{ marginBottom: 8, fontSize: '1rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section landing-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2>{t('landing.everythingYou')} <span className="gradient-text">{t('landing.need')}</span></h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>{t('landing.featuresDesc')}</p>
        </div>
        <div className="features-grid stagger" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {features.map(f => (
            <div key={f.title} className="glass feature-card">
              <div className="feature-icon" style={{ background: f.iconBg }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="landing-section" style={{ borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="glass cta-banner" style={{ maxWidth: 600, margin: '0 auto', background: 'linear-gradient(135deg,rgba(0,229,160,0.06),rgba(124,106,247,0.06))' }}>
          <h2>{t('landing.readyToEat')} <span className="gradient-text">{t('landing.smarter')}</span></h2>
          <p style={{ color: 'var(--text-muted)', margin: '16px 0 28px' }}>{t('landing.ctaDesc')}</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            {t('landing.createFreeAccount')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" style={{ borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.85rem' }}>
        {t('landing.footer')} © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
