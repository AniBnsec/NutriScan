import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FOOD_EMOJIS } from '../../utils/helpers';

// Mini client-side food database for instant search
const FOOD_LIST = [
  { name: 'basmati rice', category: 'carb', cal100: 130, p100: 2.7, c100: 28.2, f100: 0.3 },
  { name: 'white rice', category: 'carb', cal100: 130, p100: 2.7, c100: 28.2, f100: 0.3 },
  { name: 'brown rice', category: 'carb', cal100: 111, p100: 2.6, c100: 23, f100: 0.9 },
  { name: 'roti', category: 'carb', cal100: 297, p100: 9, c100: 56, f100: 3.7 },
  { name: 'chapati', category: 'carb', cal100: 297, p100: 9, c100: 56, f100: 3.7 },
  { name: 'naan bread', category: 'carb', cal100: 310, p100: 8.9, c100: 52, f100: 7.3 },
  { name: 'paratha', category: 'carb', cal100: 300, p100: 7.5, c100: 45, f100: 10 },
  { name: 'idli', category: 'carb', cal100: 58, p100: 2, c100: 11.5, f100: 0.5 },
  { name: 'dosa', category: 'carb', cal100: 168, p100: 4, c100: 28, f100: 4.5 },
  { name: 'biryani', category: 'carb', cal100: 160, p100: 6, c100: 25, f100: 4.5 },
  { name: 'oatmeal', category: 'carb', cal100: 71, p100: 2.5, c100: 12, f100: 1.5 },
  { name: 'pasta', category: 'carb', cal100: 158, p100: 5.8, c100: 31, f100: 0.9 },
  { name: 'bread', category: 'carb', cal100: 265, p100: 9, c100: 49, f100: 3.2 },
  { name: 'quinoa', category: 'carb', cal100: 120, p100: 4.4, c100: 21.3, f100: 1.9 },
  { name: 'upma', category: 'carb', cal100: 155, p100: 4.5, c100: 28, f100: 3.5 },
  { name: 'poha', category: 'carb', cal100: 130, p100: 2.5, c100: 27, f100: 1.5 },
  { name: 'chicken breast', category: 'protein', cal100: 165, p100: 31, c100: 0, f100: 3.6 },
  { name: 'grilled chicken', category: 'protein', cal100: 165, p100: 31, c100: 0, f100: 3.6 },
  { name: 'butter chicken', category: 'protein', cal100: 150, p100: 14, c100: 7, f100: 7.5 },
  { name: 'tandoori chicken', category: 'protein', cal100: 180, p100: 27, c100: 3, f100: 6.5 },
  { name: 'chicken tikka masala', category: 'protein', cal100: 155, p100: 15, c100: 7, f100: 8 },
  { name: 'fish', category: 'protein', cal100: 136, p100: 24, c100: 0, f100: 4 },
  { name: 'salmon', category: 'protein', cal100: 208, p100: 20, c100: 0, f100: 13.4 },
  { name: 'tuna', category: 'protein', cal100: 144, p100: 30, c100: 0, f100: 1 },
  { name: 'eggs', category: 'protein', cal100: 155, p100: 13, c100: 1.1, f100: 11 },
  { name: 'boiled egg', category: 'protein', cal100: 155, p100: 13, c100: 1.1, f100: 11 },
  { name: 'paneer', category: 'protein', cal100: 265, p100: 18, c100: 3.4, f100: 20 },
  { name: 'paneer tikka', category: 'protein', cal100: 300, p100: 20, c100: 6, f100: 21 },
  { name: 'dal tadka', category: 'protein', cal100: 115, p100: 7.5, c100: 16, f100: 3 },
  { name: 'dal makhani', category: 'protein', cal100: 150, p100: 8, c100: 18, f100: 5 },
  { name: 'chole', category: 'protein', cal100: 164, p100: 8.9, c100: 27, f100: 2.6 },
  { name: 'rajma', category: 'protein', cal100: 127, p100: 8.7, c100: 22.8, f100: 0.5 },
  { name: 'lentils', category: 'protein', cal100: 116, p100: 9, c100: 20, f100: 0.4 },
  { name: 'tofu', category: 'protein', cal100: 76, p100: 8, c100: 1.9, f100: 4.8 },
  { name: 'beef', category: 'protein', cal100: 250, p100: 26, c100: 0, f100: 15 },
  { name: 'spinach', category: 'vegetable', cal100: 23, p100: 2.9, c100: 3.6, f100: 0.4 },
  { name: 'palak paneer', category: 'vegetable', cal100: 190, p100: 11, c100: 7, f100: 13 },
  { name: 'broccoli', category: 'vegetable', cal100: 34, p100: 2.8, c100: 7, f100: 0.4 },
  { name: 'mixed salad', category: 'vegetable', cal100: 20, p100: 1.5, c100: 3.5, f100: 0.3 },
  { name: 'potato', category: 'vegetable', cal100: 77, p100: 2, c100: 17.5, f100: 0.1 },
  { name: 'tomato', category: 'vegetable', cal100: 18, p100: 0.9, c100: 3.9, f100: 0.2 },
  { name: 'carrot', category: 'vegetable', cal100: 41, p100: 0.9, c100: 10, f100: 0.2 },
  { name: 'peas', category: 'vegetable', cal100: 81, p100: 5.4, c100: 14.5, f100: 0.4 },
  { name: 'onion', category: 'vegetable', cal100: 40, p100: 1.1, c100: 9.3, f100: 0.1 },
  { name: 'corn', category: 'vegetable', cal100: 86, p100: 3.2, c100: 19, f100: 1.2 },
  { name: 'apple', category: 'fruit', cal100: 52, p100: 0.3, c100: 14, f100: 0.2 },
  { name: 'banana', category: 'fruit', cal100: 89, p100: 1.1, c100: 23, f100: 0.3 },
  { name: 'mango', category: 'fruit', cal100: 60, p100: 0.8, c100: 15, f100: 0.4 },
  { name: 'orange', category: 'fruit', cal100: 47, p100: 0.9, c100: 12, f100: 0.1 },
  { name: 'grapes', category: 'fruit', cal100: 69, p100: 0.7, c100: 18, f100: 0.2 },
  { name: 'watermelon', category: 'fruit', cal100: 30, p100: 0.6, c100: 7.6, f100: 0.2 },
  { name: 'strawberry', category: 'fruit', cal100: 32, p100: 0.7, c100: 7.7, f100: 0.3 },
  { name: 'milk', category: 'dairy', cal100: 61, p100: 3.2, c100: 4.8, f100: 3.3 },
  { name: 'yogurt', category: 'dairy', cal100: 61, p100: 3.5, c100: 4.7, f100: 3.3 },
  { name: 'curd', category: 'dairy', cal100: 61, p100: 3.5, c100: 4.7, f100: 3.3 },
  { name: 'paneer', category: 'dairy', cal100: 265, p100: 18, c100: 3.4, f100: 20 },
  { name: 'cheese', category: 'dairy', cal100: 402, p100: 25, c100: 1.3, f100: 33 },
  { name: 'raita', category: 'dairy', cal100: 45, p100: 2.5, c100: 4, f100: 2 },
  { name: 'lassi', category: 'dairy', cal100: 70, p100: 3.5, c100: 9, f100: 2.5 },
  { name: 'butter', category: 'fat', cal100: 717, p100: 0.9, c100: 0.1, f100: 81 },
  { name: 'pizza', category: 'other', cal100: 266, p100: 11, c100: 33, f100: 10 },
  { name: 'burger', category: 'other', cal100: 295, p100: 17, c100: 24, f100: 14 },
  { name: 'samosa', category: 'other', cal100: 308, p100: 5.5, c100: 35, f100: 16 },
  { name: 'pakora', category: 'other', cal100: 280, p100: 7, c100: 30, f100: 15 },
  { name: 'french fries', category: 'other', cal100: 312, p100: 3.4, c100: 41, f100: 15 },
  { name: 'chai', category: 'beverage', cal100: 40, p100: 1.5, c100: 5.5, f100: 1.5 },
  { name: 'orange juice', category: 'beverage', cal100: 45, p100: 0.7, c100: 10, f100: 0.2 },
];

function calcPreviewNutrition(food, portionG) {
  const f = portionG / 100;
  return {
    calories: Math.round(food.cal100 * f),
    protein: Math.round(food.p100 * f * 10) / 10,
    carbs: Math.round(food.c100 * f * 10) / 10,
    fat: Math.round(food.f100 * f * 10) / 10,
  };
}

export default function FoodSearch({ onAddItem }) {
  const [query, setQuery] = useState('');
  const [portion, setPortion] = useState(100);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = query.length >= 1
    ? FOOD_LIST.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  const handleSelect = (food) => {
    setSelected(food);
    setQuery(food.name);
    setShowDropdown(false);
  };

  const handleAdd = () => {
    if (!selected) return;
    const nutrition = calcPreviewNutrition(selected, portion);
    const item = {
      name: selected.name,
      portion_g: portion,
      category: selected.category,
      confidence: 1,
      nutrition: { ...nutrition, fiber: 0, sugar: 0, sodium: 0 },
    };
    setItems(prev => [...prev, item]);
    setQuery('');
    setSelected(null);
    setPortion(100);
  };

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const totalCal = items.reduce((a, i) => a + (i.nutrition?.calories || 0), 0);
  const totalP = items.reduce((a, i) => a + (i.nutrition?.protein || 0), 0);
  const totalC = items.reduce((a, i) => a + (i.nutrition?.carbs || 0), 0);
  const totalF = items.reduce((a, i) => a + (i.nutrition?.fat || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search Row */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            className="input"
            placeholder="🔍 Search food (e.g. rice, chicken, dal...)"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />
          <AnimatePresence>
            {showDropdown && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'rgba(15,17,26,0.98)', border: '1px solid var(--border)', borderRadius: 12, zIndex: 100, overflow: 'hidden', backdropFilter: 'blur(20px)' }}
              >
                {filtered.map(f => (
                  <div
                    key={f.name}
                    onMouseDown={() => handleSelect(f)}
                    style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{FOOD_EMOJIS[f.category] || '🍽️'}</span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>{f.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{f.cal100} kcal / 100g • {f.category}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Portion + Preview */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
              {FOOD_EMOJIS[selected.category]} {selected.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number" className="input" min={10} max={1000} step={10}
                value={portion}
                onChange={e => setPortion(Math.max(10, +e.target.value))}
                style={{ width: 80, textAlign: 'center' }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>g</span>
            </div>
          </div>
          <input
            type="range" min={10} max={500} step={10} value={portion}
            onChange={e => setPortion(+e.target.value)}
            style={{ width: '100%', accentColor: 'var(--primary)', marginBottom: 12 }}
          />
          {(() => {
            const n = calcPreviewNutrition(selected, portion);
            return (
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#ffb347' }}>{n.calories}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>kcal</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#ff6b6b' }}>{n.protein}g</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>protein</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#4fc3f7' }}>{n.carbs}g</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>carbs</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#ffd166' }}>{n.fat}g</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>fat</div>
                </div>
              </div>
            );
          })()}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAdd}>
            + Add to Meal
          </button>
        </motion.div>
      )}

      {/* Added Items */}
      {items.length > 0 && (
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Added Items ({items.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <span>{FOOD_EMOJIS[item.category] || '🍽️'}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 500, textTransform: 'capitalize' }}>{item.name}</span>
                  <span style={{ color: 'var(--text-faint)', fontSize: '0.78rem', marginLeft: 8 }}>{item.portion_g}g • {item.nutrition.calories} kcal</span>
                </div>
                <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 6px' }}>✕</button>
              </div>
            ))}
          </div>
          {/* Totals */}
          <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border)', marginBottom: 12 }}>
            {[
              { label: 'kcal', val: totalCal, color: '#ffb347' },
              { label: 'protein', val: `${Math.round(totalP)}g`, color: '#ff6b6b' },
              { label: 'carbs', val: `${Math.round(totalC)}g`, color: '#4fc3f7' },
              { label: 'fat', val: `${Math.round(totalF)}g`, color: '#ffd166' },
            ].map(m => (
              <div key={m.label} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: m.color, fontSize: '1rem' }}>{m.val}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{m.label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onAddItem(items)}>
            💾 Save Manual Meal ({items.length} foods)
          </button>
        </div>
      )}
    </div>
  );
}
