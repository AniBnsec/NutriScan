import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import FoodSearch from '../components/scanner/FoodSearch';
import { calcHealthScore, getScoreColor, getScoreLabel } from '../utils/helpers';

const FOOD_EMOJIS = { protein: '🍗', carb: '🍚', vegetable: '🥗', fruit: '🍎', dairy: '🥛', fat: '🧈', beverage: '🥤', dessert: '🍰', other: '🍽️' };
const TABS = [
  { id: 'upload', label: '📷 Upload Photo' },
  { id: 'camera', label: '📸 Camera' },
  { id: 'search', label: '🔍 Search Foods' },
];

function MacroBar({ label, value, unit, color, pct }) {
  return (
    <div className="progress-wrap">
      <div className="progress-header">
        <span className="progress-label" style={{ color }}>{label}</span>
        <span className="progress-value">{value}{unit}</span>
      </div>
      <div className="progress-track">
        <motion.div className="progress-fill" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
      </div>
    </div>
  );
}

function FoodItemCard({ food, index }) {
  const emoji = FOOD_EMOJIS[food.category] || '🍽️';
  const color = { protein: '#ff6b6b', carb: '#4fc3f7', vegetable: '#00e5a0', fruit: '#ffd166', dairy: '#f9a8d4', fat: '#fed7aa', other: '#94a3b8' }[food.category] || '#94a3b8';
  const conf = Math.round((food.confidence || 0.8) * 100);
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} className="glass food-item-card">
      <div className="food-emoji" style={{ background: `${color}20` }}>{emoji}</div>
      <div className="food-details">
        <div className="food-name">{food.name}</div>
        <div className="food-portion">~{food.portion_g}g • {food.nutrition?.calories || 0} kcal</div>
        <div className="food-macros">
          <span className="food-macro macro-protein">P: {food.nutrition?.protein || 0}g</span>
          <span className="food-macro macro-carbs">C: {food.nutrition?.carbs || 0}g</span>
          <span className="food-macro macro-fat">F: {food.nutrition?.fat || 0}g</span>
        </div>
      </div>
      <div className="confidence-dot tooltip" data-tip={`AI confidence: ${conf}%`} style={{ background: conf > 80 ? 'var(--primary)' : conf > 60 ? 'var(--gold)' : 'var(--accent)' }} />
    </motion.div>
  );
}

export default function ScannerPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const { scanFood, scanResult, scanLoading, clearScan, saveMeal, saveManualMeal } = useStore();

  const onDrop = useCallback(accepted => {
    const f = accepted[0];
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setSaved(false); clearScan();
  }, [clearScan]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    maxFiles: 1, maxSize: 20 * 1024 * 1024,
  });

  const handleScan = async () => {
    if (!file) return toast.error('Please upload a food photo first');
    try { 
      await scanFood(file); 
      toast.success('Food recognized! 🎉'); 
    }
    catch (err) { 
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Scan failed';
      toast.error(`Scan failed: ${msg}`); 
    }
  };

  const handleSave = async () => {
    if (!scanResult) return;
    setSaving(true);
    try {
      await saveMeal({ name: mealName || capitalize(mealType), foods: scanResult.foods, image: scanResult.imagePath || null, mealType, notes: '' });
      setSaved(true); toast.success('Meal saved! 📝');
    } catch { toast.error('Failed to save meal'); }
    finally { setSaving(false); }
  };

  const handleManualSave = async (items) => {
    setSaving(true);
    try {
      await saveManualMeal({ name: mealName || capitalize(mealType), foods: items, mealType });
      setSaved(true); toast.success('Manual meal saved! 📝');
    } catch { toast.error('Failed to save meal'); }
    finally { setSaving(false); }
  };

  // Camera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1280, height: 720 } });
      streamRef.current = stream;
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); } }, 100);
      setCameraOpen(true);
    } catch { toast.error('Camera not available or permission denied'); }
  };
  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraOpen(false);
  };
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const f = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      setFile(f); setPreview(URL.createObjectURL(blob)); setSaved(false); clearScan();
      closeCamera(); setActiveTab('upload');
      toast.success('Photo captured!');
    }, 'image/jpeg', 0.9);
  };

  const handleReset = () => { setPreview(null); setFile(null); setSaved(false); clearScan(); };

  const t = scanResult?.totals;
  const score = t ? calcHealthScore(t) : 0;
  const maxMacro = t ? Math.max(t.protein, t.carbs, t.fat, 1) : 1;

  return (
    <div className="page-inner">
      <div className="page-header fade-in">
        <h1>📸 AI Food Scanner</h1>
        <p>Upload, capture, or search foods to get instant nutrition breakdown</p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {TABS.map(tab => (
          <button key={tab.id} className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`} style={{ border: 'none' }}
            onClick={() => { setActiveTab(tab.id); if (tab.id === 'camera') openCamera(); }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <video ref={videoRef} style={{ maxWidth: '90vw', maxHeight: '65vh', borderRadius: 16, border: '2px solid var(--primary)' }} playsInline />
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" onClick={closeCamera}>✕ Cancel</button>
              <button className="btn btn-primary btn-lg" onClick={capturePhoto}>📸 Capture Photo</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'search' ? (
        /* Manual Food Search */
        <div className="grid-2" style={{ gap: 28, alignItems: 'start' }}>
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Search & Add Foods</div>
            <FoodSearch onAddItem={handleManualSave} />
          </div>
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Meal Options</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input" placeholder="Meal name (optional)" value={mealName} onChange={e => setMealName(e.target.value)} />
              <select className="input" value={mealType} onChange={e => setMealType(e.target.value)} style={{ cursor: 'pointer' }}>
                <option value="breakfast">🌅 Breakfast</option>
                <option value="lunch">☀️ Lunch</option>
                <option value="snack">🍎 Snack</option>
                <option value="dinner">🌙 Dinner</option>
              </select>
            </div>
            {saved && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ marginTop: 16, padding: 16, textAlign: 'center', background: 'var(--primary-dim)' }}>
                <div style={{ fontSize: '1.5rem' }}>✅</div>
                <div style={{ color: 'var(--primary)', fontWeight: 600 }}>Meal saved!</div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setSaved(false)}>Add Another</button>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        /* Upload / Scan */
        <div className="grid-2" style={{ gap: 28, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!preview ? (
              <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}>
                <input {...getInputProps()} id="food-image-input" />
                <span className="upload-icon float">📷</span>
                <h3>{isDragActive ? 'Drop it here!' : 'Upload Food Photo'}</h3>
                <p>Drag & drop or <strong style={{ color: 'var(--primary)' }}>click to browse</strong></p>
                <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-faint)' }}>JPG, PNG, WebP • Max 20MB</p>
              </div>
            ) : (
              <div className="glass" style={{ overflow: 'hidden', position: 'relative' }}>
                <img src={preview} alt="Food" className="scan-image-preview" />
                {scanLoading && (
                  <div className="scan-overlay">
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="pulse-ring" style={{ position: 'absolute' }} />
                      <div className="spinner" />
                    </div>
                    <div className="scan-line" />
                    <p style={{ color: 'var(--primary)', fontWeight: 600 }}>AI Analyzing...</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Identifying foods & estimating portions</p>
                  </div>
                )}
                <div style={{ padding: 16, display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost btn-sm" onClick={handleReset} style={{ flex: 1 }}>🔄 New Photo</button>
                  {!scanResult && (
                    <button className="btn btn-primary" onClick={handleScan} disabled={scanLoading} style={{ flex: 2, justifyContent: 'center' }}>
                      {scanLoading ? 'Scanning...' : '🔍 Scan with AI'}
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="glass" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📌 Tips</div>
              {['Good lighting improves AI accuracy', 'Show the full plate from above', 'Works great with Indian thalis!', 'Try camera tab for real-time capture'].map(tip => (
                <div key={tip} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--primary)' }}>✓</span> {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Results Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!scanResult ? (
              <div className="glass empty-state">
                <div className="empty-icon">🤖</div>
                <h3>Waiting for scan</h3>
                <p>Upload a photo and click <strong>Scan with AI</strong></p>
              </div>
            ) : (
              <AnimatePresence>
                {/* Health Score */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: `${getScoreColor(score)}12`, border: `1px solid ${getScoreColor(score)}28`, borderRadius: 'var(--radius)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${getScoreColor(score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: getScoreColor(score), fontFamily: 'Space Grotesk' }}>{score}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MEAL HEALTH SCORE</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: getScoreColor(score) }}>{getScoreLabel(score)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Based on macros, fiber & sodium balance</div>
                  </div>
                </motion.div>

                {/* Calories */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass nutrition-panel" style={{ borderRadius: 'var(--radius)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>TOTAL MEAL CALORIES</div>
                      <div className="calorie-big">{t?.calories || 0}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>kcal</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="badge badge-green" style={{ marginBottom: 8 }}>{scanResult.foods?.length || 0} items detected</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>⚡ {scanResult.duration ? `${(scanResult.duration / 1000).toFixed(1)}s` : 'instant'}</div>
                    </div>
                  </div>
                  <div className="macro-grid">
                    {[
                      { key: 'Protein', val: t?.protein, unit: 'g', color: '#ff6b6b' },
                      { key: 'Carbs', val: t?.carbs, unit: 'g', color: '#4fc3f7' },
                      { key: 'Fat', val: t?.fat, unit: 'g', color: '#ffd166' },
                      { key: 'Fiber', val: t?.fiber, unit: 'g', color: '#00e5a0' },
                      { key: 'Sugar', val: t?.sugar, unit: 'g', color: '#f06292' },
                      { key: 'Sodium', val: t?.sodium, unit: 'mg', color: '#ce93d8' },
                    ].map(m => (
                      <div key={m.key} className="macro-item">
                        <div className="value" style={{ color: m.color }}>{m.val || 0}</div>
                        <div className="unit">{m.unit}</div>
                        <div className="key">{m.key}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Macro Bars */}
                <div className="glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Breakdown</div>
                  <MacroBar label="Protein" value={t?.protein} unit="g" color="#ff6b6b" pct={(t?.protein / maxMacro) * 100} />
                  <MacroBar label="Carbohydrates" value={t?.carbs} unit="g" color="#4fc3f7" pct={(t?.carbs / maxMacro) * 100} />
                  <MacroBar label="Fat" value={t?.fat} unit="g" color="#ffd166" pct={(t?.fat / maxMacro) * 100} />
                  <MacroBar label="Fiber" value={t?.fiber} unit="g" color="#00e5a0" pct={(t?.fiber / maxMacro) * 100} />
                </div>

                {/* Foods List */}
                <div className="glass" style={{ padding: 20 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Detected Foods ({scanResult.foods?.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {scanResult.foods?.map((food, i) => <FoodItemCard key={i} food={food} index={i} />)}
                  </div>
                </div>

                {/* Vitamins */}
                {(t?.vitaminC > 0 || t?.iron > 0 || t?.calcium > 0) && (
                  <div className="glass" style={{ padding: 20 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Micronutrients</div>
                    <div className="vitamin-grid">
                      {[
                        { key: 'Vit A', val: t?.vitaminA, unit: 'µg' },
                        { key: 'Vit C', val: t?.vitaminC, unit: 'mg' },
                        { key: 'Vit D', val: t?.vitaminD, unit: 'µg' },
                        { key: 'B12', val: t?.vitaminB12, unit: 'µg' },
                        { key: 'Iron', val: t?.iron, unit: 'mg' },
                        { key: 'Calcium', val: t?.calcium, unit: 'mg' },
                        { key: 'Potassium', val: t?.potassium, unit: 'mg' },
                      ].map(v => v.val > 0 && (
                        <div key={v.key} className="vitamin-item">
                          <div className="v-val" style={{ color: 'var(--secondary)' }}>{v.val}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>{v.unit}</div>
                          <div className="v-key">{v.key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save */}
                {!saved ? (
                  <div className="glass" style={{ padding: 20 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Save Meal</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input className="input" placeholder="Meal name (optional)" value={mealName} onChange={e => setMealName(e.target.value)} />
                      <select className="input" value={mealType} onChange={e => setMealType(e.target.value)} style={{ cursor: 'pointer' }}>
                        <option value="breakfast">🌅 Breakfast</option>
                        <option value="lunch">☀️ Lunch</option>
                        <option value="snack">🍎 Snack</option>
                        <option value="dinner">🌙 Dinner</option>
                      </select>
                      <button className="btn btn-primary" id="save-meal-btn" onClick={handleSave} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
                        {saving ? 'Saving...' : '💾 Save to Meal History'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass"
                    style={{ padding: 20, textAlign: 'center', background: 'var(--primary-dim)', borderColor: 'rgba(0,229,160,0.2)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>Meal saved!</div>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={handleReset}>Scan Another</button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
