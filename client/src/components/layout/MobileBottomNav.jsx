import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/index.jsx';
import { useStore } from '../../store/useStore';

export default function MobileBottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const NAV_ITEMS = [
    { to: '/dashboard', icon: '📊', label: t('nav.dashboard') || 'Dashboard' },
    { to: '/history', icon: '📝', label: t('nav.mealHistory') || 'History' },
    { to: '/scanner', icon: '📸', label: t('nav.scanFood') || 'Scan', isMain: true },
    { to: '/coach', icon: '🤖', label: t('nav.aiCoach') || 'Coach' },
    { isMenu: true, icon: '☰', label: t('nav.menu') || 'Menu' }
  ];

  const ALL_GROUPS = [
    {
      label: t('nav.tracking'),
      items: [
        { to: '/dashboard', icon: '📊', label: t('nav.dashboard') },
        { to: '/scanner', icon: '📸', label: t('nav.scanFood') },
        { to: '/history', icon: '📝', label: t('nav.mealHistory') },
        { to: '/gallery', icon: '🖼️', label: t('nav.photoGallery') },
      ],
    },
    {
      label: t('nav.health'),
      items: [
        { to: '/weight', icon: '⚖️', label: t('nav.weightTracker') },
        { to: '/exercise', icon: '🏋️', label: t('nav.exerciseLog') },
        { to: '/supplements', icon: '💊', label: t('nav.supplements') },
      ],
    },
    {
      label: t('nav.planning'),
      items: [
        { to: '/planner', icon: '🎯', label: t('nav.mealPlanner') },
        { to: '/analytics', icon: '📈', label: t('nav.analytics') },
        { to: '/compare', icon: '📊', label: t('nav.compareMeals') },
      ],
    },
    {
      label: t('nav.ai'),
      items: [
        { to: '/coach', icon: '🤖', label: t('nav.aiCoach') },
      ],
    },
    {
      label: t('nav.account'),
      items: [
        { to: '/profile', icon: '👤', label: t('nav.profileGoals') },
        { to: '/settings', icon: '⚙️', label: t('nav.settings') },
      ],
    },
  ];

  return (
    <>
      {/* Full Menu Overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay hide-print" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-sheet glass" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>NutriScan Menu</h3>
              <button className="btn btn-ghost" onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <div className="mobile-menu-content">
              {ALL_GROUPS.map(group => (
                <div key={group.label} className="mobile-menu-group">
                  <h4>{group.label}</h4>
                  <div className="mobile-menu-items">
                    {group.items.map(item => (
                      <NavLink key={item.to} to={item.to} className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                        <span className="icon">{item.icon}</span>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mobile-menu-group" style={{ marginTop: 20 }}>
                <button className="mobile-menu-item" onClick={() => { logout(); navigate('/'); setMenuOpen(false); }} style={{ width: '100%', color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <span className="icon">🚪</span> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="mobile-bottom-nav hide-print">
        {NAV_ITEMS.map((item, idx) => {
          if (item.isMenu) {
            return (
              <button 
                key="menu" 
                className={`mobile-nav-item ${menuOpen ? 'active' : ''}`} 
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}
              >
                <div className="icon-wrapper">
                  <span className="icon" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{item.icon}</span>
                </div>
                <span className="label">{item.label}</span>
              </button>
            );
          }
          return (
            <NavLink 
              key={item.to} 
              to={item.to} 
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''} ${item.isMain ? 'main-action' : ''}`}
            >
              <div className="icon-wrapper">
                <span className="icon">{item.icon}</span>
              </div>
              <span className="label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
