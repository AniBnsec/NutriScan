import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { useTranslation } from '../i18n/index.jsx';

const DEFAULT_MEAL = {
  id: 'salmon-quinoa-bowl',
  name: 'Pan-Seared Salmon & Quinoa Bowl',
  mealType: 'lunch',
  timestamp: 'Today, 12:45 PM',
  confidence: 98.4,
  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  baseGram: 350,
  glycemicIndex: { score: 38, category: 'Low GI', label: 'Slow & Steady Energy Release' },
  allergens: [
    { name: 'Gluten-Free', safe: true, icon: '🌾' },
    { name: 'Dairy-Free', safe: true, icon: '🥛' },
    { name: 'Contains Fish', safe: false, icon: '🐟' },
    { name: 'Nut-Free', safe: true, icon: '🥜' },
  ],
  ingredients: [
    { id: 1, name: 'Atlantic Salmon (Wild-Caught)', baseGrams: 150, category: 'protein', color: '#ff6b6b' },
    { id: 2, name: 'Organic Red Quinoa', baseGrams: 100, category: 'carb', color: '#4fc3f7' },
    { id: 3, name: 'Avocado Slices', baseGrams: 50, category: 'fat', color: '#ffd166' },
    { id: 4, name: 'Steamed Asparagus & Spinach', baseGrams: 50, category: 'vegetable', color: '#00e5a0' },
  ],
  per100g: {
    calories: 165,
    protein: 11.2,
    carbs: 14.5,
    fat: 6.8,
    fiber: 3.2,
    sugar: 1.1,
    sodium: 145,
  },
  vitamins: [
    { name: 'Vitamin B12', pct: 92, amount: '2.2 mcg' },
    { name: 'Omega-3 EPA/DHA', pct: 140, amount: '1.8 g' },
    { name: 'Vitamin D3', pct: 65, amount: '5.2 mcg' },
    { name: 'Vitamin C', pct: 45, amount: '36 mg' },
    { name: 'Iron', pct: 28, amount: '4.1 mg' },
    { name: 'Potassium', pct: 34, amount: '620 mg' },
    { name: 'Magnesium', pct: 42, amount: '110 mg' },
    { name: 'Zinc', pct: 30, amount: '2.8 mg' },
  ],
  aiInsights: [
    '✨ Exceptional protein density (39.2g total) for post-workout muscle protein synthesis.',
    '🥑 Healthy monounsaturated fats from avocado help lower LDL cholesterol and improve satiety.',
    '💡 Tip: Squeeze fresh lemon juice over the salmon to increase non-heme iron absorption by up to 300%.',
    '⚡ Low Glycemic Load (GL = 8) keeps blood sugar levels balanced for sustained afternoon focus.',
  ]
};

export default function MealDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { t } = useTranslation();
  const { saveMeal } = useStore();

  const initialMeal = location.state?.meal || DEFAULT_MEAL;
  const [portionWeight, setPortionWeight] = useState(initialMeal.baseGram || 350);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [saving, setSaving] = useState(false);

  // Dynamic ratio multiplier based on slider
  const multiplier = portionWeight / (initialMeal.baseGram || 350);

  const calories = Math.round((initialMeal.per100g?.calories || 165) * (portionWeight / 100));
  const protein = ((initialMeal.per100g?.protein || 11.2) * (portionWeight / 100)).toFixed(1);
  const carbs = ((initialMeal.per100g?.carbs || 14.5) * (portionWeight / 100)).toFixed(1);
  const fat = ((initialMeal.per100g?.fat || 6.8) * (portionWeight / 100)).toFixed(1);
  const fiber = ((initialMeal.per100g?.fiber || 3.2) * (portionWeight / 100)).toFixed(1);
  const sugar = ((initialMeal.per100g?.sugar || 1.1) * (portionWeight / 100)).toFixed(1);
  const sodium = Math.round((initialMeal.per100g?.sodium || 145) * (portionWeight / 100));

  const handleSaveToLog = async () => {
    setSaving(true);
    try {
      if (saveMeal) {
        await saveMeal({
          name: initialMeal.name,
          mealType: initialMeal.mealType || 'lunch',
          portion_g: portionWeight,
          nutrition: { calories, protein: parseFloat(protein), carbs: parseFloat(carbs), fat: parseFloat(fat), fiber: parseFloat(fiber) },
          imagePath: initialMeal.image,
        });
      }
      toast.success('Meal logged into daily summary! 🎯');
      navigate('/dashboard');
    } catch (e) {
      toast.error('Meal logged locally');
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-inner" style={{ paddingBottom: 100 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-ghost"
          style={{ backdropFilter: 'blur(12px)', borderRadius: 14 }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            🤖 AI Precision: {initialMeal.confidence || 98.4}%
          </span>
          <button className="btn btn-primary" onClick={handleSaveToLog} disabled={saving}>
            {saving ? 'Saving...' : '➕ Log This Meal'}
          </button>
        </div>
      </div>

      {/* Hero Visual Card */}
      <div className="glass" style={{ borderRadius: 28, overflow: 'hidden', marginBottom: 28, position: 'relative' }}>
        <div style={{ position: 'relative', height: 320, width: '100%', overflow: 'hidden' }}>
          <img 
            src={initialMeal.image} 
            alt={initialMeal.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9)' }} 
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to top, rgba(8,12,24,0.95) 0%, rgba(8,12,24,0.4) 50%, transparent 100%)' 
          }} />
          
          <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-green" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {initialMeal.mealType || 'Lunch'}
              </span>
              <span className="badge badge-purple">
                ⚡ Low GI ({initialMeal.glycemicIndex?.score || 38})
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: 4, textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {initialMeal.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Recognized via NutriScan Neural Vision 4.0 • {initialMeal.timestamp || 'Just Now'}
            </p>
          </div>
        </div>

        {/* Portion Slider Control */}
        <div style={{ padding: 24, background: 'rgba(13, 18, 36, 0.7)', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Portion Weight Slider</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                {portionWeight}g <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>({(portionWeight / 28.35).toFixed(1)} oz)</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Scaled Calories</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffb347' }}>
                {calories} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>kcal</span>
              </div>
            </div>
          </div>

          <input 
            type="range" 
            min="50" 
            max="800" 
            step="10"
            value={portionWeight} 
            onChange={e => setPortionWeight(Number(e.target.value))}
            style={{ 
              width: '100%', 
              accentColor: 'var(--primary)', 
              height: 8, 
              borderRadius: 4, 
              cursor: 'pointer' 
            }} 
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 6 }}>
            <span>50g (Snack)</span>
            <span>350g (Standard)</span>
            <span>800g (Large Feast)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'overview', label: '📊 Nutrition & Macros' },
          { id: 'ingredients', label: '🥗 Ingredients Breakdown' },
          { id: 'vitamins', label: '🧬 Micronutrients' },
          { id: 'ai-insights', label: '💡 AI Health Tips' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`btn ${selectedTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 16, padding: '10px 20px', whiteSpace: 'nowrap' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {selectedTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Main Macros Grid */}
          <div className="glass" style={{ padding: 24, borderRadius: 24 }}>
            <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎯 Macro Distribution
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ padding: 14, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 16 }}>
                <div style={{ fontSize: '0.8rem', color: '#ff6b6b', fontWeight: 600 }}>PROTEIN</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{protein}g</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(protein * 4)} kcal ({Math.round((protein * 4 / calories) * 100)}%)</div>
              </div>

              <div style={{ padding: 14, background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.2)', borderRadius: 16 }}>
                <div style={{ fontSize: '0.8rem', color: '#4fc3f7', fontWeight: 600 }}>CARBOHYDRATES</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{carbs}g</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(carbs * 4)} kcal ({Math.round((carbs * 4 / calories) * 100)}%)</div>
              </div>

              <div style={{ padding: 14, background: 'rgba(255,209,102,0.1)', border: '1px solid rgba(255,209,102,0.2)', borderRadius: 16 }}>
                <div style={{ fontSize: '0.8rem', color: '#ffd166', fontWeight: 600 }}>HEALTHY FATS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{fat}g</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(fat * 9)} kcal ({Math.round((fat * 9 / calories) * 100)}%)</div>
              </div>

              <div style={{ padding: 14, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 16 }}>
                <div style={{ fontSize: '0.8rem', color: '#00e5a0', fontWeight: 600 }}>DIETARY FIBER</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{fiber}g</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(fiber / 30 * 100).toFixed(0)}% Daily Goal</div>
              </div>
            </div>

            {/* Extra details */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Net Sugars</span>
              <span style={{ fontWeight: 600, color: '#f06292' }}>{sugar}g</span>
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sodium Content</span>
              <span style={{ fontWeight: 600, color: '#ce93d8' }}>{sodium}mg</span>
            </div>
          </div>

          {/* Glycemic & Allergens */}
          <div className="glass" style={{ padding: 24, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ marginBottom: 12 }}>⚡ Glycemic Impact</h3>
              <div style={{ padding: 16, background: 'rgba(0,245,160,0.06)', borderRadius: 18, border: '1px solid rgba(0,245,160,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{initialMeal.glycemicIndex?.category || 'Low GI'}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>GI: {initialMeal.glycemicIndex?.score || 38}/100</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  {initialMeal.glycemicIndex?.label || 'Minimal insulin spike, provides gradual sustained endurance energy.'}
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: 12 }}>🛡️ Allergen & Dietary Safety</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(initialMeal.allergens || []).map((a, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '10px 14px', 
                      borderRadius: 14, 
                      background: a.safe ? 'rgba(0,229,160,0.08)' : 'rgba(236,72,153,0.1)', 
                      border: `1px solid ${a.safe ? 'rgba(0,229,160,0.2)' : 'rgba(236,72,153,0.3)'}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      fontSize: '0.85rem'
                    }}
                  >
                    <span>{a.icon}</span>
                    <span style={{ fontWeight: 600, color: a.safe ? '#00e5a0' : '#ec4899' }}>{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Ingredients */}
      {selectedTab === 'ingredients' && (
        <div className="glass" style={{ padding: 24, borderRadius: 24 }}>
          <h3 style={{ marginBottom: 16 }}>🥗 Segmented Ingredient Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {initialMeal.ingredients.map(ing => {
              const scaledGram = Math.round(ing.baseGrams * multiplier);
              return (
                <div key={ing.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: ing.color }} />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ing.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span className="badge" style={{ background: `${ing.color}20`, color: ing.color }}>{ing.category}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>~{scaledGram}g</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Micronutrients */}
      {selectedTab === 'vitamins' && (
        <div className="glass" style={{ padding: 24, borderRadius: 24 }}>
          <h3 style={{ marginBottom: 16 }}>🧬 Micronutrient & Mineral Density</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {initialMeal.vitamins.map((v, idx) => (
              <div key={idx} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 18, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{v.name}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{v.amount}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ width: `${Math.min(v.pct, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #00f5a0, #00d2ff)', borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  {v.pct}% RDA
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: AI Insights */}
      {selectedTab === 'ai-insights' && (
        <div className="glass" style={{ padding: 24, borderRadius: 24 }}>
          <h3 style={{ marginBottom: 16, color: 'var(--primary)' }}>🤖 AI Precision Analysis & Tips</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {initialMeal.aiInsights.map((insight, idx) => (
              <div key={idx} style={{ padding: 16, background: 'rgba(0,245,160,0.05)', borderRadius: 16, border: '1px solid rgba(0,245,160,0.15)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
