import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const GOALS = [
  { id: 'high-protein',     label: '💪 High Protein',     filter: i => i.protein >= 30 },
  { id: 'keto',             label: '🥑 Low Carb / Keto',  filter: i => i.carbs <= 20 },
  { id: 'calorie-deficit',  label: '🔥 Under 500 kcal',   filter: i => i.calories <= 500 },
  { id: 'all',              label: '📋 All Items',         filter: () => true },
];

const RATING_META = {
  emerald: { color: '#00e5a0', bg: 'rgba(0,229,160,0.1)', border: 'rgba(0,229,160,0.35)', label: '🌟 Healthiest Pick' },
  yellow:  { color: '#ffd166', bg: 'rgba(255,209,102,0.07)', border: 'rgba(255,209,102,0.3)', label: '⚡ Moderate Choice' },
  red:     { color: '#ff6b6b', bg: 'rgba(255,107,107,0.07)', border: 'rgba(255,107,107,0.3)', label: '⚠️ Caution Choice' },
};

export default function MenuScannerPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const [mode, setMode] = useState('upload'); // 'upload' | 'camera'
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState([]);
  const [scanned, setScanned] = useState(false);
  const [activeGoal, setActiveGoal] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  // ── Camera ──────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      setMode('camera');
      setPreview(null);
      setItems([]);
      setScanned(false);
    } catch {
      toast.error('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const captured = new File([blob], 'menu-capture.jpg', { type: 'image/jpeg' });
      setFile(captured);
      setPreview(URL.createObjectURL(blob));
      stopCamera();
      setMode('upload');
      toast.success('📸 Menu photo captured!');
    }, 'image/jpeg', 0.92);
  };

  // ── File Drop ───────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    if (!accepted[0]) return;
    stopCamera();
    setFile(accepted[0]);
    setPreview(URL.createObjectURL(accepted[0]));
    setScanned(false);
    setItems([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: false,
  });

  // ── Scan ────────────────────────────────────────────────
  const handleScan = async () => {
    if (!file) return toast.error('Please upload or capture a menu photo first');
    setScanning(true);
    setItems([]);
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('goal', activeGoal);
      const { data } = await api.post('/menu/scan', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setItems(data.items || []);
      setScanned(true);
      if (data.count > 0) {
        toast.success(`📜 Found ${data.count} menu items! Healthiest picks highlighted.`);
      } else {
        toast.error('No menu items detected. Try a clearer photo of the menu.');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Scan failed — try again');
    } finally {
      setScanning(false);
    }
  };

  const filtered = items.filter(GOALS.find(g => g.id === activeGoal)?.filter || (() => true));

  return (
    <div className="page-inner" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div className="page-header fade-in">
        <span className="badge badge-green" style={{ marginBottom: 6 }}>📜 AI Menu Scanner</span>
        <h1>Restaurant Menu Analyzer</h1>
        <p>Point your camera at any restaurant menu — AI reads every dish and highlights the healthiest choices for your goal.</p>
      </div>

      {/* Scanner Card */}
      <div className="glass" style={{ padding: 24, marginBottom: 24, borderRadius: 22 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          📸 Step 1 — Capture or Upload Menu Photo
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <button
            className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 14, padding: '10px 20px' }}
            onClick={() => { stopCamera(); setMode('upload'); }}
          >
            📁 Upload Photo
          </button>
          <button
            className={`btn ${mode === 'camera' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 14, padding: '10px 20px' }}
            onClick={startCamera}
          >
            📷 Use Camera
          </button>
        </div>

        {/* Camera View */}
        <AnimatePresence>
          {cameraActive && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', marginBottom: 16, height: 340 }}>
              <video ref={videoRef} autoPlay playsInline muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 18 }} />

              {/* Scanning overlay frame */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {/* Corner brackets */}
                {[
                  { top: 16, left: 16, borderTop: '3px solid #00f5a0', borderLeft: '3px solid #00f5a0' },
                  { top: 16, right: 16, borderTop: '3px solid #00f5a0', borderRight: '3px solid #00f5a0' },
                  { bottom: 16, left: 16, borderBottom: '3px solid #00f5a0', borderLeft: '3px solid #00f5a0' },
                  { bottom: 16, right: 16, borderBottom: '3px solid #00f5a0', borderRight: '3px solid #00f5a0' },
                ].map((s, i) => (
                  <div key={i} style={{ position: 'absolute', width: 28, height: 28, borderRadius: 4, ...s }} />
                ))}
                {/* Scan line */}
                <motion.div
                  animate={{ top: ['15%', '85%', '15%'] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  style={{ position: 'absolute', left: '5%', right: '5%', height: 2, background: 'linear-gradient(to right, transparent, #00f5a0, transparent)' }}
                />
              </div>

              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', display: 'flex', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.82rem', color: '#00f5a0', fontWeight: 600 }}>
                  📋 Point at the restaurant menu
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* File Dropzone (shown when no camera) */}
        {!cameraActive && (
          <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr 1fr' : '1fr', gap: 20, alignItems: 'stretch' }}>
            {/* Dropzone */}
            <div {...getRootProps()} style={{
              border: `2px dashed ${isDragActive ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 18, cursor: 'pointer', height: 280,
              background: isDragActive ? 'rgba(0,245,160,0.06)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <input {...getInputProps()} />
              <div style={{ fontSize: '3.5rem' }}>📜</div>
              <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 600 }}>
                {isDragActive ? 'Drop menu photo here!' : 'Drag & drop a menu photo'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>or click to browse — JPG, PNG, WEBP</div>
            </div>

            {/* Preview */}
            {preview && (
              <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', height: 280 }}>
                <img src={preview} alt="Menu preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {scanning && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                    <motion.div animate={{ scaleX: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ width: '75%', height: 3, background: 'var(--primary)', borderRadius: 99 }} />
                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>🤖 Reading Menu Items...</div>
                  </div>
                )}
                {/* Re-upload chip */}
                {!scanning && (
                  <div {...getRootProps()} style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.7)', borderRadius: 10, padding: '5px 12px', fontSize: '0.73rem', color: '#fff', cursor: 'pointer', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <input {...getInputProps()} />
                    🔄 Change Photo
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {cameraActive ? (
            <>
              <button className="btn btn-primary" onClick={capturePhoto}
                style={{ flex: 1, justifyContent: 'center', padding: '14px', borderRadius: 16, fontSize: '1rem' }}>
                📸 Capture Menu Photo
              </button>
              <button className="btn btn-ghost" onClick={stopCamera}
                style={{ borderRadius: 16, padding: '14px 20px', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' }}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleScan} disabled={scanning || !file}
              style={{ flex: 1, justifyContent: 'center', padding: '14px', borderRadius: 16, fontSize: '0.95rem' }}>
              {scanning ? '🔍 AI Analyzing Menu...' : '✨ Analyze Menu with AI'}
            </button>
          )}
        </div>
      </div>

      {/* Goal Filter — shown after scan */}
      {scanned && items.length > 0 && (
        <div className="glass" style={{ padding: 14, borderRadius: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>🎯 Filter:</span>
          {GOALS.map(g => (
            <button key={g.id} onClick={() => setActiveGoal(g.id)}
              className={`btn ${activeGoal === g.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 14, padding: '8px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              {g.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
            {filtered.length} of {items.length} items
          </span>
        </div>
      )}

      {/* Results Grid */}
      {scanned && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.length === 0 ? (
            <div className="glass" style={{ padding: 40, borderRadius: 22, textAlign: 'center', opacity: 0.6, gridColumn: '1/-1' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔍</div>
              <div style={{ fontWeight: 600 }}>No items match this filter</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>Try "All Items" to see every dish</div>
            </div>
          ) : filtered.map((item, idx) => {
            const meta = RATING_META[item.healthRating] || RATING_META.yellow;
            const isExpanded = expandedId === item.id;
            return (
              <motion.div key={item.id || idx}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="glass"
                style={{ padding: 22, borderRadius: 24, border: `1px solid ${meta.border}`, background: meta.bg, position: 'relative' }}>

                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: meta.color, background: `${meta.color}18`, borderRadius: 8, padding: '4px 10px' }}>
                    {meta.label}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textAlign: 'right', maxWidth: 110 }}>{item.section}</span>
                </div>

                {/* Dish name */}
                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 6, fontWeight: 700 }}>{item.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>{item.description}</p>

                {/* Warning */}
                {item.warning && (
                  <div style={{ padding: '7px 12px', background: 'rgba(255,107,107,0.1)', borderRadius: 10, fontSize: '0.76rem', color: '#ff6b6b', marginBottom: 12 }}>
                    {item.warning}
                  </div>
                )}

                {/* AI Score */}
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: meta.color, marginBottom: 10 }}>
                  🤖 AI Score: {item.score}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {(item.tags || []).map(tag => (
                    <span key={tag} style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Macro Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center', marginBottom: 16 }}>
                  {[
                    { label: 'CAL', val: item.calories, color: '#ffb347', unit: '' },
                    { label: 'PROTEIN', val: item.protein, color: '#ff6b6b', unit: 'g' },
                    { label: 'CARBS', val: item.carbs, color: '#4fc3f7', unit: 'g' },
                    { label: 'FAT', val: item.fat, color: '#ffd166', unit: 'g' },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '7px 4px', background: `${m.color}15`, borderRadius: 12 }}>
                      <div style={{ fontSize: '0.62rem', color: m.color, fontWeight: 700 }}>{m.label}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800 }}>{m.val}{m.unit}</div>
                    </div>
                  ))}
                </div>

                {/* Log button */}
                <button className={`btn ${item.healthRating === 'emerald' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => { toast.success(`Logged "${item.name}" to your meal tracker!`); navigate('/dashboard'); }}
                  style={{ width: '100%', borderRadius: 14, fontSize: '0.88rem', justifyContent: 'center', border: item.healthRating !== 'emerald' ? `1px solid ${meta.border}` : undefined }}>
                  ➕ Log This Dish ({item.calories} kcal)
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!scanned && !scanning && (
        <div className="glass" style={{ padding: 48, borderRadius: 22, textAlign: 'center', opacity: 0.6 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>📜</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Capture or upload a restaurant menu</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
            AI will read every dish and rate it for your dietary goals
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20 }}>
            <button className="btn btn-primary" onClick={startCamera} style={{ borderRadius: 14 }}>
              📷 Open Camera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
