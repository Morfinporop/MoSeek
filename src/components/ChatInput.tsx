import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Flame, Smile, Angry } from 'lucide-react';
import { useChatStore, type RudenessMode } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { aiService } from '../services/aiService';
import { AI_MODELS } from '../config/models';
import { useCompareMode } from './Header';

const RUDENESS_MODES: { id: RudenessMode; label: string; icon: typeof Flame; desc: string; color: string }[] = [
  { id: 'very_rude', label: 'Очень грубый', icon: Angry, desc: 'Мат и прямота', color: 'text-red-400' },
  { id: 'rude', label: 'Грубый', icon: Flame, desc: 'Дерзкий сарказм', color: 'text-orange-400' },
  { id: 'polite', label: 'Вежливый', icon: Smile, desc: 'Без мата', color: 'text-green-400' },
];

const UNLIMITED_EMAILS = ['energoferon41@gmail.com'];
const CHAR_LIMIT = 10000;

export function ChatInput() {
  const [input, setInput] = useState('');
  const [showRudeness, setShowRudeness] = useState(false);
  const [showCharLimitWarning, setShowCharLimitWarning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rudenessRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const { addMessage, updateMessage, getCurrentMessages, responseMode, rudenessMode, setRudenessMode, selectedModel, setGeneratingChat, isCurrentChatGenerating } = useChatStore();
  const { user } = useAuthStore();

  const generating = isCurrentChatGenerating();
  const isUnlimitedUser = user?.email && UNLIMITED_EMAILS.includes(user.email);
  const charCount = input.length;
  const isOverLimit = !isUnlimitedUser && charCount > CHAR_LIMIT;

  const handleRudenessSwitch = useCallback((r: RudenessMode) => {
    if (r === rudenessMode) { setShowRudeness(false); return; }
    setRudenessMode(r); setShowRudeness(false);
  }, [rudenessMode, setRudenessMode]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
      textareaRef.current.style.height = textareaRef.current.scrollHeight > 52
        ? `${Math.min(textareaRef.current.scrollHeight, 160)}px` : '36px';
    }
  }, [input]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (rudenessRef.current && !rudenessRef.current.contains(e.target as Node)) setShowRudeness(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (!isUnlimitedUser && v.length > CHAR_LIMIT) {
      setShowCharLimitWarning(true); setTimeout(() => setShowCharLimitWarning(false), 3000);
      setInput(v.slice(0, CHAR_LIMIT)); return;
    }
    setShowCharLimitWarning(false); setInput(v);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || generating || isOverLimit) return;
    const { isDual, secondModelId } = useCompareMode();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '36px';
    addMessage({ role: 'user', content: trimmed });
    const chatId = useChatStore.getState().currentChatId;
    if (!chatId) return;
    setGeneratingChat(chatId, true);
    const model1 = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];
    const allMsgs = [...getCurrentMessages()];

    if (isDual) {
      const model2 = AI_MODELS.find(m => m.id === secondModelId) || AI_MODELS[1] || AI_MODELS[0];
      const pairId = `pair-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const id1 = addMessage({ role: 'assistant', content: '', isLoading: true, model: model1.name, thinking: 'Печатаю...', dualPosition: 'left', dualPairId: pairId });
      const id2 = addMessage({ role: 'assistant', content: '', isLoading: true, model: model2.name, thinking: 'Печатаю...', dualPosition: 'right', dualPairId: pairId });
      try {
        const [r1, r2] = await Promise.all([aiService.generateResponse(allMsgs, responseMode, rudenessMode, selectedModel), aiService.generateResponse(allMsgs, responseMode, rudenessMode, secondModelId)]);
        updateMessage(id1, '', 'Печатаю...'); updateMessage(id2, '', 'Печатаю...');
        const w1 = r1.content.split(' '), w2 = r2.content.split(' ');
        let c1 = '', c2 = '';
        for (let i = 0; i < Math.max(w1.length, w2.length); i++) {
          if (i < w1.length) { c1 += (i > 0 ? ' ' : '') + w1[i]; updateMessage(id1, c1, 'Печатаю...'); }
          if (i < w2.length) { c2 += (i > 0 ? ' ' : '') + w2[i]; updateMessage(id2, c2, 'Печатаю...'); }
          await new Promise(r => setTimeout(r, 10));
        }
        updateMessage(id1, c1, ''); updateMessage(id2, c2, '');
      } catch { updateMessage(id1, 'Ошибка.', ''); updateMessage(id2, 'Ошибка.', ''); }
      finally { setGeneratingChat(chatId, false); const au = useAuthStore.getState().user; if (au) useChatStore.getState().syncToCloud(au.id).catch(() => {}); }
    } else {
      const aId = addMessage({ role: 'assistant', content: '', isLoading: true, model: model1.name, thinking: 'Печатаю...' });
      try {
        const res = await aiService.generateResponse(allMsgs, responseMode, rudenessMode, selectedModel);
        updateMessage(aId, '', 'Печатаю...');
        let cur = ''; const words = res.content.split(' ');
        for (let i = 0; i < words.length; i++) { cur += (i > 0 ? ' ' : '') + words[i]; updateMessage(aId, cur, 'Печатаю...'); await new Promise(r => setTimeout(r, 10)); }
        updateMessage(aId, cur, '');
      } catch { updateMessage(aId, 'Ошибка. Попробуй ещё раз.', ''); }
      finally { setGeneratingChat(chatId, false); const au = useAuthStore.getState().user; if (au) useChatStore.getState().syncToCloud(au.id).catch(() => {}); }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };
  const currentRudeness = RUDENESS_MODES.find(m => m.id === rudenessMode) || RUDENESS_MODES[1];

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <AnimatePresence>
        {showCharLimitWarning && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className={`flex items-center gap-2 px-4 py-3 mb-3 rounded-xl ${isDark ? 'bg-red-500/8 border border-red-500/10' : 'bg-red-50 border border-red-100'}`}
          ><p className="text-[13px] text-red-400">Лимит {CHAR_LIMIT} символов достигнут.</p></motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        {/* Rudeness button */}
        <div className="relative" ref={rudenessRef}>
          <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => setShowRudeness(!showRudeness)}
            className={`flex items-center justify-center w-[48px] h-[48px] rounded-2xl transition-all ${
              isDark ? 'glass-card hover:bg-white/[0.06]' : 'bg-white border border-black/[0.06] hover:border-black/[0.1] shadow-sm'
            }`}
          ><currentRudeness.icon className={`w-5 h-5 ${currentRudeness.color}`} /></motion.button>

          <AnimatePresence>
            {showRudeness && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.12 }}
                className={`absolute bottom-full left-0 mb-2 w-52 rounded-2xl overflow-hidden z-50 shadow-2xl ${
                  isDark ? 'bg-[#161616]/95 backdrop-blur-xl border border-white/[0.08]' : 'bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-xl'
                }`}
              >
                <div className={`px-4 py-2.5 border-b ${isDark ? 'border-white/[0.05]' : 'border-black/[0.04]'}`}>
                  <p className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Режим</p>
                </div>
                {RUDENESS_MODES.map((mode) => {
                  const active = rudenessMode === mode.id;
                  return (
                    <button key={mode.id} type="button" onClick={() => handleRudenessSwitch(mode.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-black/[0.02]'} ${active ? isDark ? 'bg-white/[0.04]' : 'bg-black/[0.02]' : ''}`}
                    >
                      <mode.icon className={`w-4 h-4 ${active ? mode.color : isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                      <div className="flex-1">
                        <p className={`text-[13px] ${active ? isDark ? 'text-white font-medium' : 'text-black font-medium' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{mode.label}</p>
                        <p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{mode.desc}</p>
                      </div>
                      {active && <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit}
          className={`flex-1 relative rounded-2xl glass-input ${isOverLimit ? '!border-red-500/50' : ''}`}
        >
          <div className="relative flex items-center min-h-[48px] pl-4 pr-2">
            <textarea
              ref={textareaRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
              placeholder="Напиши что-нибудь..." disabled={generating}
              maxLength={isUnlimitedUser ? undefined : CHAR_LIMIT} rows={1}
              className={`flex-1 bg-transparent resize-none text-[14.5px] leading-9 max-h-[160px] focus:outline-none ${
                isDark ? 'text-white placeholder-zinc-500' : 'text-black placeholder-zinc-400'
              }`}
              style={{ outline: 'none', border: 'none', boxShadow: 'none', height: '36px', minHeight: '36px' }}
            />

            {!isUnlimitedUser && input.length > 0 && (
              <span className={`text-[11px] mr-1 flex-shrink-0 ${charCount >= CHAR_LIMIT ? 'text-red-400' : charCount > CHAR_LIMIT * 0.8 ? 'text-orange-400' : isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {charCount}/{CHAR_LIMIT}
              </span>
            )}

            <motion.button type="submit" disabled={!input.trim() || generating || isOverLimit} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-9 h-9 rounded-xl transition-all ml-1 flex items-center justify-center ${
                input.trim() && !generating && !isOverLimit
                  ? 'bg-[#3b82f6] text-white glow-accent'
                  : isDark ? 'bg-white/[0.04] text-zinc-600 cursor-not-allowed' : 'bg-black/[0.04] text-zinc-400 cursor-not-allowed'
              }`}
            ><Send className={`w-4 h-4 ${generating ? 'animate-pulse' : ''}`} /></motion.button>
          </div>
        </form>
      </div>

      <p className={`text-center text-[11px] mt-2.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>MoSeek может ошибаться</p>
    </div>
  );
}
