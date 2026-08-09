import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const CATEGORY_COLORS = {
  protein: '#ff6b6b', vegetable: '#00e5a0', fruit: '#ffd166',
  dairy: '#f9a8d4', grain: '#4fc3f7', condiment: '#94a3b8',
  beverage: '#7c6af7', other: '#64748b',
};

export default function FridgePage() {
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState([]);
  const [scanned, setScanned] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [targetCalories, setTargetCalories] = useState(550);
  const [targetProtein, setTargetProtein] = useState(35);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const toggleItem = (id) => setItems(prev =>
    prev.map(it => it.id === id ? { ...it, selected: !it.selected } : it)
  );

  const onDrop = useCallback((accepted) => {
    if (!accepted[0]) return;
    setFile(accepted[0]);
    setPreview(URL.createObjectURL(accepted[0]));
    setScanned(false);
    setItems([]);
    setRecipes([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: false,
  });

  const handleScan = async () => {
    if (!file) return toast.error('Please upload a fridge photo first');
    setScanning(true);
    setItems([]);
    setRecipes([]);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/fridge/scan', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setItems(data.items || []);
      setScanned(true);
      toast.success(`🧊 Detected ${data.count} ingredients from your fridge!`);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Scan failed — please try again');
    } finally {
      setScanning(false);
    }
  };

  const handleGenerateRecipes = async () => {
    const selected = items.filter(i => i.selected);
    if (!selected.length) return toast.error('Select at least 1 ingredient');
    setGenerating(true);
    setRecipes([]);
    try {
      const { data } = await api.post('/fridge/recipes', {
        ingredients: selected,
        targetCalories,
        targetProtein,
      });
      setRecipes(data.recipes || []);
      toast.success('👨‍🍳 AI generated recipes from your fridge!');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Recipe generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page-inner" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div className="page-header fade-in">
        <span className="badge badge-green" style={{ marginBottom: 6 }}>🧊 AI Refrigerator Assistant</span>
        <h1>Fridge Scanner & Recipe AI</h1>
        <p>Scan your fridge photo — AI detects all ingredients and generates personalized recipes matching your macro goals.</p>
      </div>

      {/* Step 1: Upload & Scan */}
      <div className="glass" style={{ padding: 24, marginBottom: 24, borderRadius: 22 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: '#fff' }}>
          📸 Step 1 — Upload Fridge Photo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr 1fr' : '1fr', gap: 20, alignItems: 'start' }}>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 18, padding: 32, textAlign: 'center', cursor: 'pointer',
              background: isDragActive ? 'rgba(0,245,160,0.06)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s',
            }}
          >
            <input {...getInputProps()} />
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🧊</div>
            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
              {isDragActive ? 'Drop your fridge photo here!' : 'Drag & drop a fridge photo'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
              or click to browse — JPG, PNG, WEBP
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: '4/3' }}>
              <img src={preview} alt="Fridge preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {scanning && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12
                }}>
                  <motion.div
                    animate={{ scaleX: [1, 0.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    style={{ width: '80%', height: 3, background: 'var(--primary)', borderRadius: 99 }}
                  />
                  <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>🤖 AI Scanning Ingredients...</div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleScan}
          disabled={scanning || !file}
          style={{ marginTop: 16, width: '100%', justifyContent: 'center', padding: '14px', borderRadius: 16 }}
        >
          {scanning ? '🔍 Scanning Your Fridge...' : '🧊 Scan Fridge Photo'}
        </button>
      </div>

      {/* Step 2 & 3: Ingredients + Recipe Generator */}
      {scanned && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

          {/* Left: Detected Ingredients + Macro Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Macro Goal Filter */}
            <div className="glass" style={{ padding: 20, borderRadius: 22 }}>
              <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>🎯 Step 2 — Set Macro Goal</h3>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Calorie Cap</span>
                  <span style={{ fontWeight: 700, color: '#ffb347' }}>{targetCalories} kcal</span>
                </div>
                <input type="range" min="200" max="1000" step="50" value={targetCalories}
                  onChange={e => setTargetCalories(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ffb347' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Min Protein Goal</span>
                  <span style={{ fontWeight: 700, color: '#ff6b6b' }}>{targetProtein}g</span>
                </div>
                <input type="range" min="10" max="80" step="5" value={targetProtein}
                  onChange={e => setTargetProtein(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ff6b6b' }} />
              </div>
            </div>

            {/* Detected Ingredients */}
            <div className="glass" style={{ padding: 20, borderRadius: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: '1rem' }}>🥦 Detected Ingredients ({items.filter(i => i.selected).length}/{items.length})</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setItems(prev => prev.map(i => ({ ...i, selected: true })))}>
                  All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
                {items.map(it => (
                  <div key={it.id} onClick={() => toggleItem(it.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                      background: it.selected ? 'rgba(0,245,160,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${it.selected ? 'rgba(0,245,160,0.25)' : 'var(--border)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.3rem' }}>{it.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: it.selected ? '#fff' : 'var(--text-muted)' }}>{it.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', display: 'flex', gap: 6, marginTop: 2 }}>
                          <span>{it.qty}</span>
                          <span style={{ color: CATEGORY_COLORS[it.category] || '#94a3b8', textTransform: 'capitalize' }}>• {it.category}</span>
                        </div>
                      </div>
                    </div>
                    <input type="checkbox" checked={it.selected} readOnly style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: 18, height: 18 }} />
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" onClick={handleGenerateRecipes} disabled={generating}
                style={{ width: '100%', marginTop: 16, borderRadius: 16, padding: '14px', justifyContent: 'center' }}>
                {generating ? '🤖 Chef AI is Cooking...' : '✨ Step 3 — Generate AI Recipes'}
              </button>
            </div>
          </div>

          {/* Right: AI Recipes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {generating && (
              <div className="glass" style={{ padding: 40, borderRadius: 22, textAlign: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  style={{ fontSize: '3rem', display: 'inline-block', marginBottom: 14 }}>🤖</motion.div>
                <div style={{ fontWeight: 600, color: '#fff' }}>AI Chef is crafting your recipes...</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>Analyzing your ingredients & macro goals</div>
              </div>
            )}

            {recipes.length > 0 && (<>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>👨‍🍳 AI Generated Recipes</h3>
              {recipes.map((recipe, i) => (
                <motion.div key={recipe.id || i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} className="glass" style={{ borderRadius: 24, overflow: 'hidden' }}>

                  {/* Recipe Image */}
                  <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                    <img src={recipe.image} alt={recipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,24,0.9), transparent)' }} />
                    <span className="badge badge-green" style={{ position: 'absolute', top: 14, right: 14, fontSize: '0.78rem' }}>
                      {recipe.aiScore}
                    </span>
                    <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
                      <h4 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700, margin: 0 }}>{recipe.name}</h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: 12, marginTop: 4 }}>
                        <span>⏱️ {recipe.cookTime}</span>
                        <span>🔥 {recipe.difficulty}</span>
                        <span>🍳 Prep: {recipe.prepTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: 20 }}>
                    {/* Macro Pills */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16, textAlign: 'center' }}>
                      {[
                        { label: 'CAL', val: recipe.calories, color: '#ffb347', unit: '' },
                        { label: 'PROTEIN', val: recipe.protein, color: '#ff6b6b', unit: 'g' },
                        { label: 'CARBS', val: recipe.carbs, color: '#4fc3f7', unit: 'g' },
                        { label: 'FAT', val: recipe.fat, color: '#ffd166', unit: 'g' },
                      ].map(m => (
                        <div key={m.label} style={{ padding: '8px 4px', background: `${m.color}18`, borderRadius: 12 }}>
                          <div style={{ fontSize: '0.65rem', color: m.color, fontWeight: 700 }}>{m.label}</div>
                          <div style={{ fontSize: '1rem', fontWeight: 800 }}>{m.val}{m.unit}</div>
                        </div>
                      ))}
                    </div>

                    {/* Ingredients used */}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                      <strong style={{ color: '#fff' }}>Uses:</strong>{' '}
                      {(recipe.ingredientsUsed || []).join(', ')}
                    </div>

                    {/* Steps */}
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                      <strong style={{ color: '#fff' }}>Instructions:</strong>
                      <ol style={{ paddingLeft: 18, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {(recipe.steps || []).map((st, j) => (
                          <li key={j} style={{ lineHeight: 1.5 }}>{st}</li>
                        ))}
                      </ol>
                    </div>

                    <button className="btn btn-ghost" style={{ width: '100%', borderRadius: 14, border: '1px solid rgba(0,245,160,0.3)', color: 'var(--primary)', justifyContent: 'center' }}
                      onClick={() => { toast.success(`Logged "${recipe.name}" to your meal plan!`); navigate('/dashboard'); }}>
                      ➕ Log Recipe ({recipe.calories} kcal)
                    </button>
                  </div>
                </motion.div>
              ))}
            </>)}

            {!generating && !recipes.length && (
              <div className="glass" style={{ padding: 40, borderRadius: 22, textAlign: 'center', opacity: 0.6 }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>👨‍🍳</div>
                <div style={{ fontWeight: 600 }}>Recipes will appear here</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>Select ingredients and click Generate</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state before scan */}
      {!scanned && !scanning && (
        <div className="glass" style={{ padding: 48, borderRadius: 22, textAlign: 'center', opacity: 0.6 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🧊</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upload a fridge photo to get started</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
            AI will detect all ingredients and generate personalized recipes for you
          </div>
        </div>
      )}
    </div>
  );
}
