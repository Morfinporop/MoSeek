import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { ChatMessage } from './ChatMessage';
import { WelcomeScreen } from './WelcomeScreen';
import { useCompareMode } from './Header';
import type { Message } from '../types';

function DualPair({ left, right }: { left: Message; right: Message }) {
  const isDark = useThemeStore().theme === 'dark';
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[left, right].map((m, i) => (
          <div key={m.id} className="min-w-0">
            {m.model && (
              <div className="flex items-center gap-1.5 mb-1 px-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-zinc-400' : 'bg-zinc-500'}`} />
                <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{m.model}</span>
              </div>
            )}
            <ChatMessage message={m} compact hideModelLabel />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function ChatContainer() {
  const { getCurrentMessages } = useChatStore();
  const messages = getCurrentMessages();
  const ref = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const [dual, setDual] = useState(() => useCompareMode());
  const refresh = useCallback(() => setDual(useCompareMode()), []);

  useEffect(() => {
    window.addEventListener('storage', refresh);
    const i = setInterval(refresh, 500);
    return () => { window.removeEventListener('storage', refresh); clearInterval(i); };
  }, [refresh]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const items = useMemo(() => {
    if (!dual.isDual) return messages.map(m => ({ type: 's' as const, msg: m, l: null as Message | null, r: null as Message | null, k: m.id }));
    const res: { type: 's' | 'd'; msg: Message | null; l: Message | null; r: Message | null; k: string }[] = [];
    const done = new Set<string>();
    for (const m of messages) {
      if (done.has(m.id)) continue;
      if (m.dualPairId && m.dualPosition === 'left') {
        const p = messages.find(x => x.dualPairId === m.dualPairId && x.dualPosition === 'right' && x.id !== m.id);
        if (p) { done.add(m.id); done.add(p.id); res.push({ type: 'd', msg: null, l: m, r: p, k: `d-${m.dualPairId}` }); continue; }
      }
      if (m.dualPairId && m.dualPosition === 'right') { const l = messages.find(x => x.dualPairId === m.dualPairId && x.dualPosition === 'left'); if (l && !done.has(l.id)) continue; }
      done.add(m.id); res.push({ type: 's', msg: m, l: null, r: null, k: m.id });
    }
    return res;
  }, [messages, dual.isDual]);

  if (!messages.length) return <WelcomeScreen />;

  return (
    <div ref={ref} className="flex-1 overflow-y-auto px-4 py-5">
      <div className={`mx-auto space-y-4 ${dual.isDual ? 'max-w-6xl' : 'max-w-3xl'}`}>
        <AnimatePresence mode="popLayout">
          {items.map(i => {
            if (i.type === 'd' && i.l && i.r) return <DualPair key={i.k} left={i.l} right={i.r} />;
            if (i.msg) return <ChatMessage key={i.k} message={i.msg} />;
            return null;
          })}
        </AnimatePresence>
        <div ref={bottom} className="h-2" />
      </div>
    </div>
  );
}
