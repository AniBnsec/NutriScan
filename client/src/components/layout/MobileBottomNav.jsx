import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/index.jsx';
import useStore from '../../store/useStore';
import { motion } from 'framer-motion';

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
      label: 'Tracking',
      items: [
        { to: '/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/scanner', icon: '📸', label: 'AI Camera Scanner' },
        { to: '/fridge', icon: '🧊', label: 'Fridge AI' },
        { to: '/menu', icon: '📜', label: 'Menu Scanner' },
        { to: '/history', icon: '📝', label: 'Nutrition Timeline' },
      ],
    },
    {
      label: 'Health & Details',
      items: [
        { to: '/meal-details', icon: '🥗', label: 'Meal Details' },
        { to: '/weight', icon: '⚖️', label: 'Weight Tracker' },
        { to: '/exercise', icon: '🏋️', label: 'Exercise Log' },
        { to: '/supplements', icon: '💊', label: 'Supplements' },
      ],
    },
    {
      label: 'AI & Arcade',
      items: [
        { to: '/coach', icon: '🤖', label: 'AI Smart Coach' },
        { to: '/game', icon: '🎮', label: 'Bio-Pet Arcade' },
        { to: '/social', icon: '👥', label: 'Social & Battles' },
        { to: '/analytics', icon: '📈', label: 'Interactive Analytics' },
        { to: '/planner', icon: '🎯', label: 'Meal Planner' },
      ],
    },
    {
      label: 'Account',
      items: [
        { to: '/profile', icon: '👤', label: 'Profile & Mode' },
        { to: '/settings', icon: '⚙️', label: 'Settings' },
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
