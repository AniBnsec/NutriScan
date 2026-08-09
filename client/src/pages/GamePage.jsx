import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PET_STAGES = [
  { level: 1, name: 'Baby Sprout 🌿', icon: '🌱', title: 'Novice Seedling', requiredXp: 0, aura: 'rgba(0, 245, 160, 0.2)' },
  { level: 5, name: 'Emerald Spark 🦊', icon: '🦊', title: 'Protein Prowler', requiredXp: 500, aura: 'rgba(0, 245, 160, 0.4)' },
  { level: 10, name: 'Cyber Lynx 🐆', icon: '🐆', title: 'Macro Master', requiredXp: 1500, aura: 'rgba(139, 92, 246, 0.5)' },
  { level: 20, name: 'Astra Phoenix 🦅', icon: '🦅', title: 'Immortal Health Titan', requiredXp: 4000, aura: 'rgba(251, 191, 36, 0.6)' },
];

const DAILY_QUESTS = [
  { id: 'q1', title: '🎯 Protein Powerhouse', desc: 'Log a meal with 35g+ protein', rewardXp: 150, rewardCredits: 50, progress: 1, max: 1, completed: true, icon: '🍗' },
  { id: 'q2', title: '💧 Morning Hydration', desc: 'Drink 1,000 ml water before noon', rewardXp: 100, rewardCredits: 30, progress: 1000, max: 1000, completed: true, icon: '🌊' },
  { id: 'q3', title: '📸 AI Vision Pioneer', desc: 'Scan 3 meals using AI Camera', rewardXp: 250, rewardCredits: 80, progress: 2, max: 3, completed: false, icon: '📷' },
  { id: 'q4', title: '🥦 Fiber Rush', desc: 'Eat 25g+ dietary fiber today', rewardXp: 180, rewardCredits: 60, progress: 18, max: 25, completed: false, icon: '🥗' },
];

const LOOT_ITEMS = [
  { name: '🔥 2X XP Booster (24h)', rarity: 'Epic', color: '#8b5cf6', icon: '⚡' },
  { name: '🌟 Golden Pet Aura Skin', rarity: 'Legendary', color: '#fbbf24', icon: '👑' },
  { name: '💎 +200 NutriCredits', rarity: 'Rare', color: '#00d2ff', icon: '💎' },
  { name: '🥗 Free AI Meal Plan Voucher', rarity: 'Common', color: '#00f5a0', icon: '🎫' },
];

export default function GamePage() {
  const navigate = useNavigate();
  
  // Game State
  const [xp, setXp] = useState(1280);
  const [credits, setCredits] = useState(340);
  const [streak, setStreak] = useState(14);
  const [petMood, setPetMood] = useState('Ecstatic ✨');
  const [petHealth, setPetHealth] = useState(96);
  const [quests, setQuests] = useState(DAILY_QUESTS);
  const [spinning, setSpinning] = useState(false);
  const [wonLoot, setWonLoot] = useState(null);
  const [bossHp, setBossHp] = useState(34200); // Boss Max 100,000

  // Calculate pet stage
  const currentStage = PET_STAGES.reduce((prev, curr) => xp >= curr.requiredXp ? curr : prev, PET_STAGES[0]);
  const nextStage = PET_STAGES.find(s => s.requiredXp > xp) || PET_STAGES[PET_STAGES.length - 1];

  const handleClaimQuest = (id) => {
    setQuests(quests.map(q => {
      if (q.id === id && !q.completed && q.progress >= q.max) {
        setXp(x => x + q.rewardXp);
        setCredits(c => c + q.rewardCredits);
        toast.success(`🎉 Claimed +${q.rewardXp} XP & +${q.rewardCredits} Credits!`);
        return { ...q, completed: true };
      }
      return q;
    }));
  };

  const handleSpinLootBox = () => {
    if (credits < 50) {
      return toast.error('You need at least 50 NutriCredits to spin!');
    }
    setCredits(c => c - 50);
    setSpinning(true);
    setWonLoot(null);

    setTimeout(() => {
      const prize = LOOT_ITEMS[Math.floor(Math.random() * LOOT_ITEMS.length)];
      setSpinning(false);
      setWonLoot(prize);
      setXp(x => x + 100);
      toast.success(`🎁 You unboxed: ${prize.name}!`);
    }, 2000);
  };

  const handleFeedPet = () => {
    setPetHealth(100);
    setPetMood('Overjoyed! 💖');
    toast.success(`${currentStage.name} ate your healthy meal log and feels empowered!`);
  };

  return (
    <div className="page-inner" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge badge-green" style={{ marginBottom: 6 }}>🎮 NutriVerse Arcade & Bio-Pet</span>
          <h1>Health Gamification Arcade</h1>
          <p>Level up your AI Bio-Companion, complete daily health quests, and conquer community boss raids.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="glass" style={{ padding: '8px 16px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>💎</span>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CREDITS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00d2ff' }}>{credits}</div>
            </div>
          </div>
          <div className="glass" style={{ padding: '8px 16px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>⚡</span>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL XP</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{xp} XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Bio-Pet Avatar Hero, Right Quests & Loot */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

        {/* 1. Bio-Pet Hologram Hero Card */}
        <div 
          className="glass"
          style={{ 
            padding: 28, 
            borderRadius: 32, 
            background: 'linear-gradient(135deg, rgba(8,12,24,0.95) 0%, rgba(16,28,48,0.95) 100%)',
            border: '1px solid rgba(0, 245, 160, 0.4)',
            boxShadow: `0 20px 60px ${currentStage.aura}`,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <span className="badge badge-gold" style={{ position: 'absolute', top: 20, right: 20, fontSize: '0.85rem' }}>
            🔥 {streak} Day Streak
          </span>

          {/* Holographic Circle Frame */}
          <div 
            style={{ 
              position: 'relative', 
              width: 170, 
              height: 170, 
              borderRadius: '50%', 
              margin: '20px 0',
              background: 'rgba(0,245,160,0.06)',
              border: '2px dashed var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              boxShadow: '0 0 40px rgba(0,245,160,0.2)'
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 16px rgba(0,245,160,0.8))' }}
            >
              {currentStage.icon}
            </motion.div>
          </div>

          <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 800, marginBottom: 4 }}>
            {currentStage.name}
          </h2>
          <span style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 16 }}>
            {currentStage.title} • Level {currentStage.level}
          </span>

          {/* Pet Stats Row */}
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>COMPANION MOOD</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#00e5a0' }}>{petMood}</div>
            </div>
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>VITALITY ENERGY</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffb347' }}>{petHealth}% HP</div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div style={{ width: '100%', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
              <span>Stage Progress</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{xp} / {nextStage.requiredXp} XP</span>
            </div>
            <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min((xp / nextStage.requiredXp) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #00f5a0, #00d2ff)' }} />
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleFeedPet} style={{ width: '100%', borderRadius: 16, padding: '14px' }}>
            🍎 Feed Companion With Healthy Log (+50 XP)
          </button>
        </div>

        {/* 2. Daily Health Quest Board */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass" style={{ padding: 24, borderRadius: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.2rem' }}>📜 Daily Health Quests</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Resets in 14h 32m</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {quests.map(q => (
                <div 
                  key={q.id}
                  style={{ 
                    padding: 14, 
                    borderRadius: 18, 
                    background: q.completed ? 'rgba(0,245,160,0.06)' : 'rgba(255,255,255,0.02)', 
                    border: `1px solid ${q.completed ? 'rgba(0,245,160,0.3)' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.6rem' }}>{q.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>{q.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{q.desc}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: 2, fontWeight: 600 }}>
                        Rewards: +{q.rewardXp} XP • +{q.rewardCredits} 💎
                      </div>
                    </div>
                  </div>

                  <button 
                    className={`btn ${q.completed ? 'btn-ghost' : q.progress >= q.max ? 'btn-primary' : 'btn-ghost'}`}
                    disabled={q.completed || q.progress < q.max}
                    onClick={() => handleClaimQuest(q.id)}
                    style={{ borderRadius: 14, padding: '8px 14px', fontSize: '0.82rem' }}
                  >
                    {q.completed ? '✅ Done' : q.progress >= q.max ? '🎁 Claim' : `${q.progress}/${q.max}`}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Daily Gacha Loot Box Wheel */}
          <div className="glass" style={{ padding: 24, borderRadius: 24, textCenter: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: 6 }}>🎁 Daily Bio-Cube Unboxing</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Spend 50 NutriCredits to spin the holographic wheel for legendary skins, boosters, and vouchers.
            </p>

            {wonLoot && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ padding: 14, background: `${wonLoot.color}20`, border: `1px solid ${wonLoot.color}`, borderRadius: 16, marginBottom: 16 }}>
                <span style={{ fontSize: '2rem' }}>{wonLoot.icon}</span>
                <div style={{ fontWeight: 800, color: wonLoot.color }}>{wonLoot.rarity} Unlocked!</div>
                <div style={{ fontSize: '0.9rem', color: '#fff' }}>{wonLoot.name}</div>
              </motion.div>
            )}

            <button 
              className="btn btn-primary"
              onClick={handleSpinLootBox}
              disabled={spinning || credits < 50}
              style={{ width: '100%', borderRadius: 16, padding: '14px', background: 'linear-gradient(135deg, #8b5cf6, #00f5a0)' }}
            >
              {spinning ? '🎲 Unboxing Bio-Cube...' : '🎲 Spin Loot Box (50 💎)'}
            </button>
          </div>
        </div>

      </div>

      {/* 4. Global Community Boss Raid Banner */}
      <div className="glass" style={{ marginTop: 28, padding: 26, borderRadius: 28, background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(8,12,24,0.95) 100%)', border: '1px solid rgba(236,72,153,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <span className="badge badge-red" style={{ marginBottom: 4 }}>👹 Global Boss Event</span>
            <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>Defeat The Sugar Kraken (100,000 HP)</h3>
          </div>
          <button className="btn btn-danger" onClick={() => { setBossHp(h => Math.max(0, h - 250)); toast.success('💥 Dealt 250 Damage to Sugar Kraken by logging zero sugar today!'); }} style={{ borderRadius: 14 }}>
            ⚔️ Attack Boss (-250 HP)
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-muted)' }}>Community HP Remaining</span>
            <span style={{ color: '#ec4899', fontWeight: 800 }}>{bossHp.toLocaleString()} / 100,000 HP</span>
          </div>
          <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ width: `${(bossHp / 100000) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #ec4899, #fbbf24)' }} />
          </div>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Tip: Every healthy meal logged by NutriScan players worldwide reduces the Boss HP. Defeat the boss to grant 7 days of 2X XP to all active players!
        </div>
      </div>
    </div>
  );
}
