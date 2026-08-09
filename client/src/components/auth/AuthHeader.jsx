import { motion } from 'framer-motion';

export default function AuthHeader() {
  return (
    <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
      {/* Animated Glowing Logo with Breathing Aura */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: 3 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        style={{ position: 'relative', cursor: 'pointer' }}
      >
        {/* Animated Radial Pulse */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.85, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: -8,
            background: 'radial-gradient(circle, var(--primary) 0%, rgba(139,92,246,0.5) 50%, transparent 70%)',
            borderRadius: 24,
            filter: 'blur(12px)',
          }}
        />
        <img
          src="/LOGO.png"
          alt="NutriScan AI"
          style={{
            width: 60,
            height: 60,
            borderRadius: 20,
            objectFit: 'cover',
            position: 'relative',
            border: '1.5px solid rgba(0, 245, 160, 0.5)',
            boxShadow: '0 10px 30px rgba(0, 245, 160, 0.4)',
          }}
        />
      </motion.div>

      {/* Brand Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 800,
          fontSize: '1.75rem',
          color: '#ffffff',
          letterSpacing: '-0.5px',
          marginTop: 10,
        }}
      >
        Nutri<span style={{ color: 'var(--primary)', textShadow: '0 0 20px rgba(0,245,160,0.5)' }}>Scan</span> AI
      </motion.div>
    </div>
  );
}
