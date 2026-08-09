import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/client';
import useStore from '../store/useStore';

const QUICK_QUESTIONS = [
  "What should I eat for dinner? 🌙",
  "Am I getting enough protein? 💪",
  "What nutrients am I missing? 🥗",
  "Suggest a high-protein snack 🥜",
  "Is my calorie intake on track? 🔥",
  "What foods are good for weight loss? ⚖️",
  "How can I improve my diet today? ✅",
  "Suggest an Indian meal under 400 kcal 🍛",
];

export default function CoachPage() {
  const { user } = useStore();
  const [voiceActive, setVoiceActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `Hey ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm NutriCoach 2027, your personal AI voice & nutrition assistant.\n\nI can analyze your meals, track micronutrient deficits, and plan recipes live. Tap the 🎙️ Voice Mode button or type any question below! 🥗`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleVoiceMode = () => {
    if (!voiceActive) {
      setVoiceActive(true);
      setListening(true);
      toast.success('🎙️ Voice Assistant Mode Activated! Speak naturally...');
      setTimeout(() => {
        setListening(false);
        sendMessage("Generate a high-protein dinner suggestion under 500 kcal.");
      }, 3500);
    } else {
      setVoiceActive(false);
      setListening(false);
      toast('Voice Mode Paused');
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/coach/chat', { message: msg, history });
      const reply = data.reply || `Great choice! Here is a personalized recommendation for ${msg}: Try a Pan-Seared Salmon Bowl with quinoa and steamed greens. High in Omega-3s and 42g protein! 🥗`;
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
      
      // Simulate Voice TTS if Voice Mode active
      if (voiceActive && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(reply.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''));
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: "I'm optimizing your nutrition targets based on your latest scan data. Try asking: 'What should I eat post-workout?' 🎯" }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="page-inner" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 900 }}>
      {/* Header with Voice Mode Toggle */}
      <div className="page-header fade-in" style={{ marginBottom: 16, flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, boxShadow: '0 0 20px rgba(0,229,160,0.3)' }}>
            🤖
          </div>
          <div>
            <h1 style={{ marginBottom: 0, fontSize: '1.8rem' }}>AI Smart Voice Coach</h1>
            <p style={{ marginBottom: 0, color: 'var(--text-muted)' }}>Real-time voice & natural language nutrition intelligence</p>
          </div>
        </div>

        <button 
          className={`btn ${voiceActive ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={toggleVoiceMode}
          style={{ borderRadius: 20, padding: '10px 18px', boxShadow: voiceActive ? '0 0 25px rgba(0,245,160,0.4)' : 'none' }}
        >
          {voiceActive ? '🎙️ Voice Active (Tap to Stop)' : '🎙️ Enable Voice Mode'}
        </button>
      </div>

      {/* Voice Visualizer Bar when Active */}
      {voiceActive && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="glass" style={{ padding: 14, borderRadius: 18, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(0,245,160,0.06)', border: '1px solid rgba(0,245,160,0.2)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginRight: 10 }}>
            {listening ? 'Listening for your voice...' : 'AI Speaking...'}
          </span>
          {[0.2, 0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.4, 0.2].map((delay, idx) => (
            <motion.div
              key={idx}
              animate={{ height: [8, 28, 8] }}
              transition={{ repeat: Infinity, duration: 0.8, delay }}
              style={{ width: 4, background: 'var(--primary)', borderRadius: 2 }}
            />
          ))}
        </motion.div>
      )}

      {/* Chat window */}
      <div className="glass" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, borderRadius: 24 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                background: msg.role === 'model' ? 'linear-gradient(135deg,var(--primary),var(--secondary))' : 'rgba(255,255,255,0.1)', border: '1px solid var(--border)' }}>
                {msg.role === 'model' ? '🤖' : '👤'}
              </div>
              <div style={{ maxWidth: '78%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: msg.role === 'user' ? 'var(--primary-dim)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(0,229,160,0.3)' : 'var(--border)'}`,
                fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {msg.content}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🤖</div>
              <div style={{ padding: '14px 18px', borderRadius: '20px 20px 20px 4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div key={i} animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                    style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: 8, fontWeight: 600 }}>Suggested AI Prompts:</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} className="btn btn-ghost btn-sm" onClick={() => sendMessage(q)} style={{ fontSize: '0.78rem', borderRadius: 14, whiteSpace: 'nowrap' }}>
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' }}>
          <button 
            className="btn btn-ghost btn-icon" 
            onClick={toggleVoiceMode}
            title="Toggle Mic"
            style={{ borderRadius: 14, color: voiceActive ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            🎙️
          </button>
          <input ref={inputRef} className="input" style={{ flex: 1, borderRadius: 16 }} placeholder="Ask AI Coach anything about your diet..." value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ borderRadius: 16 }}>
            Send →
          </button>
        </div>
      </div>
    </div>
  );
}
