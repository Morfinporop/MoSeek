import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Flame, Smile, Angry } from 'lucide-react';
import { useChatStore, type RudenessMode } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { aiService } from '../services/aiService';
import { AI_MODELS } from '../config/models';
import { useCompareMode } from './Header';

const MODES: { id: RudenessMode; label: string; icon: typeof Flame; color: string }[] = [
  { id: 'very_rude', label: 'Грубый+', icon: Angry, color: 'text-red-400' },
  { id: 'rude', label: 'Грубый', icon: Flame, color: 'text-orange-400' },
  { id: 'polite', label: 'Вежливый', icon: Smile, color: 'text-green-400' },
];
const UNLIMITED = ['energoferon41@gmail.com'];
const LIMIT = 10000;

export function ChatInput() {
  const [input, setInput] = useState('');
  const [showR, setShowR] = useState(false);
  const [warn, setWarn] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const rRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { addMessage, updateMessage, getCurrentMessages, responseMode, rudenessMode, setRudenessMode, selectedModel, setGeneratingChat, isCurrentChatGenerating } = useChatStore();
  const { user } = useAuthStore();
  const gen = isCurrentChatGenerating();
  const unlim = user?.email && UNLIMITED.includes(user.email);
  const cnt = input.length;
  const over = !unlim && cnt > LIMIT;

  const switchR = useCallback((r: RudenessMode) => { if (r === rudenessMode) { setShowR(false); return; } setRudenessMode(r); setShowR(false); }, [rudenessMode, setRudenessMode]);

  useEffect(() => { if (ta.current) { ta.current.style.height = '36px'; ta.current.style.height = ta.current.scrollHeight > 52 ? `${Math.min(ta.current.scrollHeight, 160)}px` : '36px'; } }, [input]);
  useEffect(() => { const h = (e: MouseEvent) => { if (rRef.current && !rRef.current.contains(e.target as Node)) setShowR(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (!unlim && v.length > LIMIT) { setWarn(true); setTimeout(() => setWarn(false), 3000); setInput(v.slice(0, LIMIT)); return; }
    setWarn(false); setInput(v);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = input.trim();
    if (!t || gen || over) return;
    const { isDual, secondModelId } = useCompareMode();
    setInput(''); if (ta.current) ta.current.style.height = '36px';
    addMessage({ role: 'user', content: t });
    const chatId = useChatStore.getState().currentChatId;
    if (!chatId) return;
    setGeneratingChat(chatId, true);
    const m1 = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];
    const msgs = [...getCurrentMessages()];

    if (isDual) {
      const m2 = AI_MODELS.find(m => m.id === secondModelId) || AI_MODELS[1] || AI_MODELS[0];
      const pid = `p-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const a1 = addMessage({ role: 'assistant', content: '', isLoading: true, model: m1.name, thinking: '', dualPosition: 'left', dualPairId: pid });
      const a2 = addMessage({ role: 'assistant', content: '', isLoading: true, model: m2.name, thinking: '', dualPosition: 'right', dualPairId: pid });
      try {
        const [r1, r2] = await Promise.all([aiService.generateResponse(msgs, responseMode, rudenessMode, selectedModel), aiService.generateResponse(msgs, responseMode, rudenessMode, secondModelId)]);
        updateMessage(a1, '', ''); updateMessage(a2, '', '');
        const w1 = r1.content.split(' '), w2 = r2.content.split(' '); let c1 = '', c2 = '';
        for (let i = 0; i < Math.max(w1.length, w2.length); i++) {
          if (i < w1.length) { c1 += (i ? ' ' : '') + w1[i]; updateMessage(a1, c1, ''); }
          if (i < w2.length) { c2 += (i ? ' ' : '') + w2[i]; updateMessage(a2, c2, ''); }
          await new Promise(r => setTimeout(r, 10));
        }
        updateMessage(a1, c1, ''); updateMessage(a2, c2, '');
      } catch { updateMessage(a1, 'Ошибка.', ''); updateMessage(a2, 'Ошибка.', ''); }
      finally { setGeneratingChat(chatId, false); const u = useAuthStore.getState().user; if (u) useChatStore.getState().syncToCloud(u.id).catch(() => {}); }
    } else {
      const a = addMessage({ role: 'assistant', content: '', isLoading: true, model: m1.name, thinking: '' });
      try {
        const r = await aiService.generateResponse(msgs, responseMode, rudenessMode, selectedModel);
        updateMessage(a, '', ''); let c = ''; const w = r.content.split(' ');
        for (let i = 0; i < w.length; i++) { c += (i ? ' ' : '') + w[i]; updateMessage(a, c, ''); await new Promise(r => setTimeout(r, 10)); }
        updateMessage(a, c, '');
      } catch { updateMessage(a, 'Ошибка. Попробуй снова.', ''); }
      finally { setGeneratingChat(chatId, false); const u = useAuthStore.getState().user; if (u) useChatStore.getState().syncToCloud(u.id).catch(() => {}); }
    }
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } };
  const cur = MODES.find(m => m.id === rudenessMode) || MODES[1];

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <AnimatePresence>
        {warn && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            className={`px-3 py-2 mb-2 rounded-lg text-[12px] ${isDark ? 'bg-red-500/8 text-red-400 border border-red-500/10' : 'bg-red-50 text-red-500 border border-red-100'}`}
          >Лимит {LIMIT} символов.</motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <div className="relative" ref={rRef}>
          <button type="button" onClick={() => setShowR(!showR)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'glass-card hover:bg-white/[0.06]' : 'bg-[#f2f2f2] hover:bg-[#e8e8e8]'}`}
          ><cur.icon className={`w-[18px] h-[18px] ${cur.color}`} /></button>

          <AnimatePresence>
            {showR && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.1 }}
                className={`absolute bottom-full left-0 mb-1.5 w-44 rounded-xl overflow-hidden z-50 ${isDark ? 'bg-[#111] border border-white/[0.06]' : 'bg-white border border-black/[0.06] shadow-lg'}`}
              >
                {MODES.map(m => {
                  const a = rudenessMode === m.id;
                  return (
                    <button key={m.id} type="button" onClick={() => switchR(m.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${a ? isDark ? 'bg-white/[0.05]' : 'bg-black/[0.03]' : isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.02]'}`}
                    >
                      <m.icon className={`w-4 h-4 ${a ? m.color : isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                      <span className={`text-[13px] ${a ? isDark ? 'text-white' : 'text-black' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{m.label}</span>
                      {a && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`} />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={submit} className={`flex-1 rounded-xl glass-input ${over ? '!border-red-500/40' : ''}`}>
          <div className="flex items-center min-h-[44px] pl-3.5 pr-1.5">
            <textarea ref={ta} value={input} onChange={onChange} onKeyDown={onKey} placeholder="Сообщение..." disabled={gen}
              maxLength={unlim ? undefined : LIMIT} rows={1}
              className={`flex-1 bg-transparent resize-none text-[14px] leading-[36px] max-h-[160px] ${isDark ? 'text-white placeholder-zinc-600' : 'text-black placeholder-zinc-400'}`}
              style={{ outline:'none', border:'none', boxShadow:'none', height:'36px', minHeight:'36px' }}
            />
            {!unlim && cnt > 0 && (
              <span className={`text-[10px] mr-1 ${cnt >= LIMIT ? 'text-red-400' : cnt > LIMIT*0.8 ? 'text-orange-400' : isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{cnt}/{LIMIT}</span>
            )}
            <button type="submit" disabled={!input.trim() || gen || over}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ml-0.5 transition-colors ${
                input.trim() && !gen && !over
                  ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                  : isDark ? 'bg-white/[0.04] text-zinc-600' : 'bg-black/[0.04] text-zinc-400'
              }`}
            ><Send className={`w-4 h-4 ${gen ? 'animate-pulse' : ''}`} /></button>
          </div>
        </form>
      </div>

      <p className={`text-center text-[10px] mt-2 ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>MoSeek может ошибаться</p>
    </div>
  );
}
