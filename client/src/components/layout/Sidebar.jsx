import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { UserButton, useClerk } from '@clerk/clerk-react';
import useStore from '../../store/useStore';
import { calcBMI } from '../../utils/helpers';
import { useTranslation } from '../../i18n/index.jsx';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();
  const clerk = useClerk();

  const NAV_GROUPS = [
    {
      label: 'Tracking',
      items: [
        { to: '/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/scanner', icon: '📸', label: 'AI Scanner' },
        { to: '/fridge', icon: '🧊', label: 'Fridge AI' },
        { to: '/menu', icon: '📜', label: 'Menu Scanner' },
        { to: '/history', icon: '📝', label: 'Timeline' },
        { to: '/gallery', icon: '🖼️', label: 'Photo Gallery' },
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
        { to: '/analytics', icon: '📈', label: 'Analytics' },
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

  const handleLogout = async () => {
    try {
      if (clerk?.signOut) await clerk.signOut();
    } catch (e) {}
    logout();
    navigate('/');
  };
  const bmi = calcBMI(user?.weight, user?.height);

  return (
    <aside className="app-sidebar" style={{ width: collapsed ? 64 : undefined, transition: 'width 0.3s' }}>
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '0 0 24px' : undefined }}>
        <div className="logo-mark" onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/LOGO.png" alt="Logo" style={{ width: collapsed ? 36 : 48, height: collapsed ? 36 : 48, borderRadius: collapsed ? 8 : 12, objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,229,160,0.2)', transition: 'all 0.3s' }} />
          {!collapsed && <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>NutriScan</span>}
        </div>
      </div>

      <nav className="sidebar-nav" style={{ overflowY: 'auto', flex: 1, position: 'relative' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 12px 4px', marginTop: 6 }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? item.label : ''}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* BMI / Goal widget */}
      {!collapsed && user?.weight && user?.height && (
        <div style={{ padding: '0 10px', marginBottom: 10 }}>
          <div style={{ padding: '10px 12px', background: 'rgba(0,245,160,0.06)', borderRadius: 12, border: '1px solid rgba(0,245,160,0.15)', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-faint)' }}>BMI</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{bmi}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ color: 'var(--text-faint)' }}>Goal</span>
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{user.calorieGoal || 2000} kcal</span>
            </div>
            {user.dietMode && user.dietMode !== 'general' && (
              <div style={{ marginTop: 4, color: 'var(--primary)', textTransform: 'capitalize', fontSize: '0.68rem' }}>
                📋 {user.dietMode.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        {!collapsed && (
          <div style={{
            padding: '10px 12px', marginBottom: '6px',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 12, margin: '0 8px 8px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <UserButton afterSignOutUrl="/login" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.88rem', fontWeight: 600, color: '#fff',
                textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}>
                {user?.name || 'User'}
              </div>
              <div style={{
                fontSize: '0.72rem', color: 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                lineHeight: 1.3, marginTop: 1,
              }}>
                {user?.email || ''}
              </div>
            </div>
          </div>
        )}
        <button className="nav-item btn-ghost" onClick={handleLogout} style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }} title={t('common.signOut')}>
          <span>🚪</span>{!collapsed && ' ' + t('common.signOut')}
        </button>
      </div>
    </aside>
  );
}
