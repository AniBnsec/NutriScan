/**
 * Centralized Clerk Dark Glassmorphism Appearance Configuration
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: '#00f5a0',
    colorBackground: 'transparent',
    colorInputBackground: 'rgba(255, 255, 255, 0.06)',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    borderRadius: '14px',
    fontFamily: 'Inter, sans-serif',
  },
  elements: {
    card: { background: 'transparent', boxShadow: 'none', padding: 0, width: '100%' },
    socialButtonsIconButton: {
      background: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.18)',
      color: '#ffffff',
    },
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #00f5a0 0%, #00d2ff 100%)',
      color: '#04060c',
      fontWeight: 700,
      fontSize: '0.98rem',
      boxShadow: '0 4px 20px rgba(0, 245, 160, 0.4)',
    },
  },
};


