import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const MOCK_BADGES = [
  { id: 'b1', name: 'Macro Master 🥇', icon: '🏆', desc: 'Hit all protein, carb, & fat targets for 7 consecutive days.', unlocked: true, date: 'Unlocked 2d ago' },
  { id: 'b2', name: 'Hydration Legend 💧', icon: '🌊', desc: 'Logged over 3,000ml water daily for 14 days straight.', unlocked: true, date: 'Unlocked 5d ago' },
  { id: 'b3', name: '7-Day Clean Streak 🔥', icon: '🔥', desc: 'Scanned 100% of your meals with AI Vision.', unlocked: true, date: 'Unlocked 1w ago' },
  { id: 'b4', name: 'Fiber Titan 🥦', icon: '🥦', desc: 'Consistently hit 35g+ dietary fiber daily.', unlocked: false, progress: '24/35g today' },
  { id: 'b5', name: 'Keto Pioneer 🥑', icon: '🥑', desc: 'Maintained strict keto macro ratio (<20g net carbs) for 10 days.', unlocked: false, progress: '6/10 days' },
  { id: 'b6', name: 'Century Scanner 📸', icon: '📸', desc: 'Completed 100 AI food image scans.', unlocked: true, date: 'Unlocked yesterday' },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Sarah Jenkins', level: 24, xp: '14,850 XP', streak: 28, avatar: '👩‍⚕️', isUser: false },
  { rank: 2, name: 'Alex Rivera (You)', level: 19, xp: '11,420 XP', streak: 14, avatar: '🦸‍♂️', isUser: true },
  { rank: 3, name: 'Marcus Chen', level: 18, xp: '10,950 XP', streak: 12, avatar: '🏋️‍♂️', isUser: false },
  { rank: 4, name: 'Elena Rostova', level: 16, xp: '9,800 XP', streak: 9, avatar: '🧘‍♀️', isUser: false },
  { rank: 5, name: 'David Kim', level: 15, xp: '8,900 XP', streak: 7, avatar: '🏃‍♂️', isUser: false },
];

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState('report-card');
  const [copied, setCopied] = useState(false);

  const handleShareReport = () => {
    setCopied(true);
    toast.success('NutriScan 8K Report Card snapshot link copied to clipboard! 🚀');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-inner" style={{ paddingBottom: 100 }}>
      {/* Page Header */}
      <div className="page-header">
        <span className="badge badge-green" style={{ marginBottom: 6 }}>👥 Community & Battles</span>
        <h1>Social, Battles & Achievements</h1>
        <p>Compete with friends, unlock futuristic achievement badges, and share your weekly nutrition report card.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'report-card', label: '💳 8K Report Card' },
          { id: 'challenges', label: '⚔️ Weekly Challenges' },
          { id: 'badges', label: '🏅 Achievement Badges' },
          { id: 'leaderboard', label: '🏆 Leaderboard' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 16, padding: '10px 20px', whiteSpace: 'nowrap' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Shareable 8K Report Card */}
      {activeTab === 'report-card' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Card Preview Container */}
          <div 
            className="glass"
            style={{ 
              padding: 28, 
              borderRadius: 32, 
              background: 'linear-gradient(135deg, rgba(8,12,24,0.95) 0%, rgba(13,24,42,0.95) 100%)',
              border: '1px solid rgba(0, 245, 160, 0.4)',
              boxShadow: '0 20px 50px rgba(0,245,160,0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Hologram Gradient Glow Overlay */}
            <div style={{ position: 'absolute', top: -100, right: -100, width: 250, height: 250, borderRadius: '50%', background: 'rgba(0, 245, 160, 0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #00f5a0, #8b5cf6)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                  🧬
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>NutriScan AI Report</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Week of Aug 1 - Aug 7, 2026</span>
                </div>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>
                94.2 AI Score
              </span>
            </div>

            {/* User Stat Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24, textAlign: 'center' }}>
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>STREAK</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffb347' }}>🔥 14 Days</div>
              </div>
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TOTAL PROTEIN</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff6b6b' }}>945g</div>
              </div>
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GLOBAL RANK</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00e5a0' }}>Top 3%</div>
              </div>
            </div>

            {/* Highlights */}
            <div style={{ padding: 16, background: 'rgba(0, 245, 160, 0.05)', borderRadius: 18, border: '1px solid rgba(0, 245, 160, 0.15)', marginBottom: 20 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                🏆 Weekly Highlight
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Maintained an average daily protein ratio of 135g with 98.4% AI scanning precision. Zero skipped meals!
              </p>
            </div>

            <button className="btn btn-primary" onClick={handleShareReport} style={{ width: '100%', borderRadius: 16, padding: '14px' }}>
              {copied ? '✅ Report Link Copied!' : '📤 Export & Share 8K Card'}
            </button>
          </div>

          {/* Social Stats & Friends Battle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass" style={{ padding: 24, borderRadius: 24 }}>
              <h3 style={{ marginBottom: 16 }}>🔥 1-on-1 Streak Battle</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 18, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.8rem' }}>🦸‍♂️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>You (Alex)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>🔥 14 Days Streak</div>
                  </div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-faint)' }}>VS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Marcus C.</div>
                    <div style={{ fontSize: '0.75rem', color: '#ffb347' }}>🔥 12 Days Streak</div>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>🏋️‍♂️</span>
                </div>
              </div>

              <div style={{ marginTop: 14, fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                You are currently <strong style={{ color: 'var(--primary)' }}>2 days ahead</strong> of Marcus! Keep scanning to maintain lead.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Weekly Challenges */}
      {activeTab === 'challenges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {[
            { title: '🌊 7-Day Hydration Hero', goal: '3,000 ml water daily', progress: 85, daysLeft: '2 days left', participants: '1,420 members', badge: 'Hydration Master' },
            { title: '🥦 30g Fiber Daily Sprint', goal: 'Consume 30g+ fiber per day', progress: 60, daysLeft: '4 days left', participants: '890 members', badge: 'Fiber Titan' },
            { title: '🚫 Zero Refined Sugar Week', goal: 'Avoid added sugars for 7 days', progress: 40, daysLeft: '5 days left', participants: '2,150 members', badge: 'Pure Glucose' },
          ].map((c, i) => (
            <div key={i} className="glass" style={{ padding: 22, borderRadius: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="badge badge-green">{c.daysLeft}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.participants}</span>
              </div>

              <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: 6 }}>{c.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>{c.goal}</p>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                  <span>Progress</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{c.progress}%</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${c.progress}%`, height: '100%', background: 'linear-gradient(90deg, #00f5a0, #8b5cf6)' }} />
                </div>
              </div>

              <button className="btn btn-ghost" onClick={() => toast.success(`Joined ${c.title}!`)} style={{ width: '100%', borderRadius: 14 }}>
                Join Challenge
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Badges */}
      {activeTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {MOCK_BADGES.map(b => (
            <div 
              key={b.id} 
              className="glass"
              style={{ 
                padding: 20, 
                borderRadius: 22, 
                opacity: b.unlocked ? 1 : 0.6,
                border: b.unlocked ? '1px solid rgba(0,245,160,0.3)' : '1px solid var(--border)'
              }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>{b.icon}</div>
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: 4 }}>{b.name}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>{b.desc}</p>
              
              <span className={`badge ${b.unlocked ? 'badge-green' : 'badge-purple'}`} style={{ fontSize: '0.72rem' }}>
                {b.unlocked ? b.date : b.progress}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="glass" style={{ padding: 24, borderRadius: 24 }}>
          <h3 style={{ marginBottom: 16 }}>🏆 Global Health Leaderboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MOCK_LEADERBOARD.map(user => (
              <div 
                key={user.rank}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: 'space-between', 
                  padding: 14, 
                  borderRadius: 16, 
                  background: user.isUser ? 'rgba(0,245,160,0.1)' : 'rgba(255,255,255,0.02)',
                  border: user.isUser ? '1px solid rgba(0,245,160,0.3)' : '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', width: 24, color: user.rank === 1 ? '#fbbf24' : user.rank === 2 ? '#00e5a0' : 'var(--text-muted)' }}>
                    #{user.rank}
                  </div>
                  <span style={{ fontSize: '1.5rem' }}>{user.avatar}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: user.isUser ? 'var(--primary)' : '#fff' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Level {user.level} • {user.xp}
                    </div>
                  </div>
                </div>

                <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>
                  🔥 {user.streak} Days
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
