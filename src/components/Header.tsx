import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronDown } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { AI_MODELS } from '../config/models';

type CompareMode = 'single' | 'dual';

export function Header() {
  const { toggleSidebar, selectedModel, setSelectedModel, createNewChat, setCurrentChat } = useChatStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showModelMenu2, setShowModelMenu2] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [compareMode, setCompareMode] = useState<CompareMode>('single');
  const [secondModel, setSecondModel] = useState(AI_MODELS.length > 1 ? AI_MODELS[1].id : AI_MODELS[0].id);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuRef2 = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];
  const currentModel2 = AI_MODELS.find(m => m.id === secondModel) || AI_MODELS[1] || AI_MODELS[0];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowModelMenu(false);
      if (menuRef2.current && !menuRef2.current.contains(e.target as Node)) setShowModelMenu2(false);
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) setShowModeMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const s = localStorage.getItem('moseek_compare_mode');
    if (s === 'dual') setCompareMode('dual');
    const s2 = localStorage.getItem('moseek_second_model');
    if (s2) setSecondModel(s2);
  }, []);
  useEffect(() => { localStorage.setItem('moseek_compare_mode', compareMode); }, [compareMode]);
  useEffect(() => { localStorage.setItem('moseek_second_model', secondModel); }, [secondModel]);

  const closeAll = () => { setShowModelMenu(false); setShowModelMenu2(false); setShowModeMenu(false); };

  const handleSelectModel = (id: string) => {
    if (id === selectedModel) { closeAll(); return; }
    setSelectedModel(id);
    if (compareMode === 'single') { const c = createNewChat(); if (c) setCurrentChat(c); }
    closeAll();
  };

  const handleSelectModel2 = (id: string) => {
    if (id === secondModel) { closeAll(); return; }
    setSecondModel(id); closeAll();
  };

  const handleModeChange = (mode: CompareMode) => {
    setCompareMode(mode); closeAll();
    if (mode === 'dual' && secondModel === selectedModel) {
      const o = AI_MODELS.find(m => m.id !== selectedModel);
      if (o) setSecondModel(o.id);
    }
    const c = createNewChat(); if (c) setCurrentChat(c);
  };

  const dd = `absolute top-full mt-1.5 rounded-xl z-50 overflow-hidden ${
    isDark ? 'bg-[#111] border border-white/[0.06]' : 'bg-white border border-black/[0.06] shadow-lg'
  }`;

  const ddItem = (a: boolean, d?: boolean) =>
    `w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
      a ? isDark ? 'bg-white/[0.05]' : 'bg-black/[0.03]' : isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.02]'
    } ${d ? 'opacity-20 pointer-events-none' : ''}`;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 glass-strong ${isDark ? 'border-b border-white/[0.04]' : 'border-b border-black/[0.04]'}`}>
      <div className="h-14 flex items-center px-3">
        {/* Menu */}
        <button onClick={toggleSidebar} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]'} transition-colors`}>
          <Menu className={`w-5 h-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
        </button>

        {/* Mode */}
        <div className="relative ml-2" ref={modeRef}>
          <button
            onClick={() => { setShowModeMenu(!showModeMenu); setShowModelMenu(false); setShowModelMenu2(false); }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${isDark ? 'text-zinc-400 hover:bg-white/[0.06]' : 'text-zinc-500 hover:bg-black/[0.04]'}`}
          >
            {compareMode === 'single' ? 'Одиночная' : 'Двойная'}
            <ChevronDown className={`w-3 h-3 transition-transform ${showModeMenu ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showModeMenu && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }} className={`${dd} left-0 w-48`}>
                {(['single', 'dual'] as const).map(m => (
                  <button key={m} onClick={() => handleModeChange(m)} className={ddItem(compareMode === m)}>
                    <span className={`text-[13px] ${compareMode === m ? isDark ? 'text-white' : 'text-black' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {m === 'single' ? 'Одиночная' : 'Двойная'}
                    </span>
                    {compareMode === m && <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Model 1 */}
        <div className="relative ml-0.5" ref={menuRef}>
          <button
            onClick={() => { setShowModelMenu(!showModelMenu); setShowModelMenu2(false); setShowModeMenu(false); }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${isDark ? 'text-zinc-300 hover:bg-white/[0.06]' : 'text-zinc-700 hover:bg-black/[0.04]'}`}
          >
            {currentModel.name}
            <ChevronDown className={`w-3 h-3 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showModelMenu && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }} className={`${dd} left-0 w-56 max-h-[60vh] overflow-y-auto`}>
                {AI_MODELS.map(m => (
                  <button key={m.id} onClick={() => handleSelectModel(m.id)} className={ddItem(selectedModel === m.id, compareMode === 'dual' && m.id === secondModel)}>
                    <div className="min-w-0">
                      <p className={`text-[13px] ${selectedModel === m.id ? isDark ? 'text-white' : 'text-black' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{m.name}</p>
                      <p className={`text-[10px] truncate ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{m.description}</p>
                    </div>
                    {selectedModel === m.id && <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-white' : 'bg-black'}`} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Model 2 */}
        {compareMode === 'dual' && (
          <div className="relative ml-0.5 flex items-center" ref={menuRef2}>
            <span className={`text-[11px] font-medium mx-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>vs</span>
            <button
              onClick={() => { setShowModelMenu2(!showModelMenu2); setShowModelMenu(false); setShowModeMenu(false); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${isDark ? 'text-zinc-300 hover:bg-white/[0.06]' : 'text-zinc-700 hover:bg-black/[0.04]'}`}
            >
              {currentModel2.name}
              <ChevronDown className={`w-3 h-3 transition-transform ${showModelMenu2 ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showModelMenu2 && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }} className={`${dd} left-0 w-56 max-h-[60vh] overflow-y-auto`}>
                  {AI_MODELS.map(m => (
                    <button key={m.id} onClick={() => handleSelectModel2(m.id)} className={ddItem(secondModel === m.id, m.id === selectedModel)}>
                      <div className="min-w-0">
                        <p className={`text-[13px] ${secondModel === m.id ? isDark ? 'text-white' : 'text-black' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{m.name}</p>
                        <p className={`text-[10px] truncate ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{m.description}</p>
                      </div>
                      {secondModel === m.id && <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-white' : 'bg-black'}`} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex-1" />

        <span className={`text-[16px] font-semibold tracking-tight pr-2 ${isDark ? 'text-white' : 'text-black'}`}>MoSeek</span>
      </div>
    </header>
  );
}

export function useCompareMode() {
  const s = localStorage.getItem('moseek_compare_mode');
  const s2 = localStorage.getItem('moseek_second_model');
  return { isDual: s === 'dual', secondModelId: s2 || (AI_MODELS.length > 1 ? AI_MODELS[1].id : AI_MODELS[0].id) };
}
