import { motion } from 'framer-motion';

export default function BackgroundGrid() {
  return (
    <div className="ambient-ai-bg" aria-hidden="true">
      {/* Dynamic Glowing Ethereal Blobs */}
      <motion.div
        className="glow-blob glow-blob-1"
        animate={{
          x: [0, 50, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.25, 0.9, 1],
          opacity: [0.35, 0.5, 0.35],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="glow-blob glow-blob-2"
        animate={{
          x: [0, -60, 50, 0],
          y: [0, 50, -50, 0],
          scale: [1, 1.2, 0.85, 1],
          opacity: [0.3, 0.45, 0.3],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="glow-blob glow-blob-3"
        animate={{
          x: [0, 40, -50, 0],
          y: [0, 40, -60, 0],
          scale: [1, 1.35, 0.8, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Cyber Grid Lines & Mesh */}
      <div className="cyber-grid-overlay" />
      <div className="radial-spotlight" />
    </div>
  );
}
