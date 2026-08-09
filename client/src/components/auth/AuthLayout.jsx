import { motion } from 'framer-motion';
import AuthHeader from './AuthHeader';
import BackgroundGrid from '../common/BackgroundGrid';
export default function AuthLayout({ children }) {
  return (
    <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', position: 'relative', zIndex: 1, boxSizing: 'border-box' }}>
      <BackgroundGrid />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card glass"
      >
        <AuthHeader />
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
