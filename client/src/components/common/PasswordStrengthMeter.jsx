import { motion } from 'framer-motion';

export default function PasswordStrengthMeter({ password = '' }) {
  const len = password.length;
  if (!len) return null;

  // Entropy calculation
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;

  const bits = Math.floor(len * Math.log2(pool || 1));

  let tier = 1;
  let label = 'Paperclip';
  let crackText = 'Cracked instantly';
  let icon = '📎';
  let color = '#ef4444';

  if (bits >= 70) {
    tier = 4;
    label = 'Bank Vault';
    crackText = 'Cracked in centuries';
    icon = '🏦';
    color = '#00f5a0';
  } else if (bits >= 50) {
    tier = 3;
    label = 'Deadbolt';
    crackText = 'Cracked in 48 years';
    icon = '🔐';
    color = '#fbbf24';
  } else if (bits >= 30) {
    tier = 2;
    label = 'Padlock';
    crackText = 'Cracked in 2 hours';
    icon = '🔒';
    color = '#3b82f6';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.3 }}
      style={{
        marginTop: 12,
        padding: '14px 16px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: `1px solid ${color}33`,
        borderRadius: 16,
        boxShadow: `0 8px 24px ${color}15`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Segmented Meter Bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[1, 2, 3, 4].map(seg => (
          <div
            key={seg}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 4,
              background: seg <= tier ? color : 'rgba(255, 255, 255, 0.1)',
              boxShadow: seg <= tier ? `0 0 10px ${color}` : 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        ))}
      </div>

      {/* Info Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${color}18`,
            border: `1px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
            A {label}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
            {crackText}
          </div>
          <div style={{ fontSize: '0.7rem', color: `${color}`, fontWeight: 600, marginTop: 2 }}>
            {bits} bits of entropy
          </div>
        </div>
      </div>
    </motion.div>
  );
}
