import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `Hey ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm NutriCoach, your personal AI nutrition advisor powered by Gemini AI.\n\nI can see your real nutrition data — today's meals, your goals, 7-day averages — and give you personalized advice.\n\nWhat would you like to know? You can ask me anything about nutrition, meal planning, or your progress! 🥗`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again in a moment. 🙏" }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="page-inner" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 800 }}>
      <div className="page-header fade-in" style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, boxShadow: '0 0 20px rgba(0,229,160,0.25)' }}>
            🤖
          </div>
          <div>
            <h1 style={{ marginBottom: 0 }}>AI Nutrition Coach</h1>
            <p style={{ marginBottom: 0 }}>Powered by Gemini AI · Knows your real nutrition data</p>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="glass" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              {/* Avatar */}
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                background: msg.role === 'model' ? 'linear-gradient(135deg,var(--primary),var(--secondary))' : 'rgba(255,255,255,0.1)', border: '1px solid var(--border)' }}>
                {msg.role === 'model' ? '🤖' : '👤'}
              </div>
              {/* Bubble */}
              <div style={{ maxWidth: '76%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? 'var(--primary-dim)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(0,229,160,0.2)' : 'var(--border)'}`,
                fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🤖</div>
              <div style={{ padding: '14px 18px', borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', gap: 5, alignItems: 'center' }}>
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
        {messages.length <= 1 && (
          <div style={{ padding: '0 20px 12px', flexShrink: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: 8 }}>Quick questions:</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {QUICK_QUESTIONS.slice(0, 4).map(q => (
                <button key={q} className="btn btn-ghost btn-sm" onClick={() => sendMessage(q)} style={{ fontSize: '0.78rem' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <input ref={inputRef} className="input" style={{ flex: 1 }} placeholder="Ask about your nutrition, meals, or health goals..." value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ flexShrink: 0 }}>
            Send →
          </button>
        </div>
      </div>
    </div>
  );
}
