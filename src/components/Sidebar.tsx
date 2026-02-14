import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus, LogOut, Loader2, Camera, Sun, Moon, Trash2, ChevronDown } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useState, useRef, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_KEY = '0x4AAAAAACa5EobYKh_TrmuZ';
const DISCORD = 'https://discord.gg/qjnyAr7YXe';
const DEF_AV = 'https://media.forgecdn.net/avatars/260/481/637214772494979032.png';

type Modal = 'terms' | 'privacy' | 'cookies' | 'profile' | 'auth' | null;

const DOCS: Record<'terms'|'privacy'|'cookies', { title: string; items: { t: string; h?: string; text: string }[] }> = {
  terms: { title: 'Условия', items: [
    { t:'m', text:'Январь 2026' },
    { t:'s', h:'1. Принятие', text:'Используя MoSeek, вы принимаете условия.' },
    { t:'s', h:'2. Сервис', text:'AI-платформа для генерации текста и кода.' },
    { t:'s', h:'3. Собственность', text:'MoSeek, MoGPT — интеллектуальная собственность.' },
    { t:'i', text:'Нарушение авторских прав влечёт ответственность.' },
    { t:'s', h:'4. Правила', text:'Запрещён вредоносный контент и взлом.' },
    { t:'c', text:'© 2026 MoSeek' },
  ]},
  privacy: { title: 'Конфиденциальность', items: [
    { t:'m', text:'Январь 2026' },
    { t:'s', h:'1. Данные', text:'Имя, email, пароль (SHA-256).' },
    { t:'i', text:'Мы НЕ собираем геолокацию, биометрию, финансы.' },
    { t:'s', h:'2. Хранение', text:'Защищённая база + локальный кеш.' },
    { t:'c', text:'© 2026 MoSeek' },
  ]},
  cookies: { title: 'Cookie', items: [
    { t:'m', text:'Январь 2026' },
    { t:'s', h:'1. Хранение', text:'Настройки и кеш в localStorage.' },
    { t:'i', text:'Без рекламных трекеров.' },
    { t:'c', text:'© 2026 MoSeek. Ваши данные — ваши.' },
  ]},
};

function Discord({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>;
}

export function Sidebar() {
  const { chats, currentChatId, sidebarOpen, toggleSidebar, setCurrentChat, deleteChat, createNewChat } = useChatStore();
  const { user, isAuthenticated, logout, updateAvatar } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  const fRef = useRef<HTMLInputElement>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [touch, setTouch] = useState(false);
  const [extras, setExtras] = useState(false);

  useEffect(() => { const c = () => setTouch('ontouchstart' in window || navigator.maxTouchPoints > 0); c(); window.addEventListener('resize', c); return () => window.removeEventListener('resize', c); }, []);

  const newChat = () => { const id = createNewChat(); if (id) setCurrentChat(id); toggleSidebar(); };
  const delChat = (id: string) => { const idx = chats.findIndex(c => c.id === id); const rest = chats.filter(c => c.id !== id); deleteChat(id); if (currentChatId === id && rest.length) setCurrentChat(rest[Math.min(idx, rest.length - 1)].id); };
  const onAv = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f || f.size > 2*1024*1024) return; const r = new FileReader(); r.onload = ev => { const s = ev.target?.result as string; if (s) updateAvatar(s); }; r.readAsDataURL(f); e.target.value = ''; };
  const av = () => user?.avatar || DEF_AV;

  const modal_bg = isDark ? 'bg-[#111] border border-white/[0.06]' : 'bg-white border border-black/[0.06] shadow-xl';
  const border = isDark ? 'border-white/[0.04]' : 'border-black/[0.04]';

  return (
    <AnimatePresence>
      {sidebarOpen && (<>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} onClick={toggleSidebar} className="fixed inset-0 bg-black/40 z-40" />
        <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className={`fixed left-0 top-0 bottom-0 w-[272px] z-50 flex flex-col ${isDark ? 'bg-[#0a0a0a] border-r border-white/[0.04]' : 'bg-[#fafafa] border-r border-black/[0.04]'}`}
        >
          {/* Head */}
          <div className={`border-b ${border}`}>
            <div className="flex items-center justify-between px-4 py-3.5">
              <button onClick={() => setExtras(!extras)} className={`flex items-center gap-1 text-[15px] font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                Меню <ChevronDown className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} transition-transform ${extras ? 'rotate-180' : ''}`} />
              </button>
              <button onClick={toggleSidebar} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]'}`}>
                <X className={`w-4.5 h-4.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              </button>
            </div>
            <AnimatePresence>
              {extras && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }} className="overflow-hidden">
                  <div className="flex gap-2 px-4 pb-3">
                    <a href={DISCORD} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium ${isDark ? 'glass-card text-[#5865F2] hover:bg-white/[0.06]' : 'bg-[#5865F2]/5 text-[#5865F2] hover:bg-[#5865F2]/10'}`}
                    ><Discord className="w-3.5 h-3.5" />Discord</a>
                    <button onClick={toggleTheme}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium ${isDark ? 'glass-card text-zinc-300 hover:bg-white/[0.06]' : 'bg-black/[0.03] text-zinc-600 hover:bg-black/[0.05]'}`}
                    >{isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}{isDark ? 'Светлая' : 'Тёмная'}</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* New */}
          <div className="p-2.5">
            <button onClick={newChat} className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${isDark ? 'glass-card hover:bg-white/[0.06] text-white' : 'bg-white border border-black/[0.06] text-black shadow-sm hover:bg-black/[0.02]'}`}>
              <Plus className={`w-4.5 h-4.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} /> Новый чат
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-2.5 space-y-px">
            {!chats.length ? (
              <div className="text-center py-14">
                <MessageSquare className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`} />
                <p className={`text-[12px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Нет чатов</p>
              </div>
            ) : chats.map(chat => {
              const a = currentChatId === chat.id;
              return (
                <div key={chat.id} className={`group flex items-center rounded-lg transition-colors cursor-pointer ${a ? isDark ? 'bg-white/[0.06]' : 'bg-white shadow-sm' : isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-black/[0.02]'}`}>
                  <button onClick={() => { setCurrentChat(chat.id); toggleSidebar(); }} className="flex-1 min-w-0 text-left px-3 py-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${a ? isDark ? 'text-white' : 'text-black' : isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
                      <span className={`text-[13px] truncate ${a ? isDark ? 'text-white' : 'text-black' : isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{chat.title}</span>
                    </div>
                  </button>
                  <button onClick={e => { e.stopPropagation(); delChat(chat.id); }}
                    className={`p-1.5 mr-1 rounded-md transition-all ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'} ${touch ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  ><Trash2 className="w-3 h-3 text-red-400" /></button>
                </div>
              );
            })}
          </div>

          {/* Bottom */}
          <div className={`p-3.5 border-t ${border}`}>
            {isAuthenticated ? (
              <div onClick={() => setModal('profile')} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer mb-3 ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.02]'}`}>
                <img src={av()} alt="" className="w-9 h-9 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-medium truncate ${isDark ? 'text-white' : 'text-black'}`}>{user?.name}</p>
                  <p className={`text-[11px] truncate ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{user?.email}</p>
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
                  <img src={DEF_AV} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div><p className={`text-[13px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Гость</p><p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Безлимит</p></div>
                </div>
                <button onClick={() => setModal('auth')} className={`w-full py-2 rounded-lg text-[13px] font-medium ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>Войти</button>
              </div>
            )}
            <div className="flex gap-2.5 text-[9px] px-1">
              {(['terms','privacy','cookies'] as const).map((k, i) => (
                <span key={k} className="contents">
                  {i > 0 && <span className={isDark ? 'text-zinc-700' : 'text-zinc-300'}>·</span>}
                  <button onClick={() => setModal(k)} className={isDark ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-600'}>{k === 'terms' ? 'Terms' : k === 'privacy' ? 'Privacy' : 'Cookies'}</button>
                </span>
              ))}
            </div>
          </div>
        </motion.aside>
      </>)}

      <input ref={fRef} type="file" accept="image/*" onChange={onAv} className="hidden" />

      {/* Profile */}
      <AnimatePresence>
        {modal === 'profile' && (<>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)} className="fixed inset-0 bg-black/50 z-[60]" />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] rounded-2xl z-[70] ${modal_bg}`}
          >
            <div className={`flex items-center justify-between px-5 py-3.5 border-b ${border}`}>
              <span className={`text-[14px] font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Профиль</span>
              <button onClick={() => setModal(null)}><X className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} /></button>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="relative group">
                  <img src={av()} alt="" className="w-14 h-14 rounded-full object-cover" />
                  <button onClick={() => fRef.current?.click()} className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="w-4 h-4 text-white" /></button>
                </div>
                <div className="min-w-0">
                  <p className={`text-[14px] font-semibold truncate ${isDark ? 'text-white' : 'text-black'}`}>{user?.name}</p>
                  <p className={`text-[11px] truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{user?.email}</p>
                </div>
              </div>
              <button onClick={() => { logout(); setModal(null); }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium ${isDark ? 'bg-red-500/8 text-red-400 hover:bg-red-500/12 border border-red-500/10' : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'}`}
              ><LogOut className="w-4 h-4" />Выйти</button>
            </div>
          </motion.div>
        </>)}
      </AnimatePresence>

      {/* Auth */}
      <AnimatePresence>{modal === 'auth' && <Auth onClose={() => setModal(null)} isDark={isDark} />}</AnimatePresence>

      {/* Docs */}
      <AnimatePresence>
        {modal && modal !== 'profile' && modal !== 'auth' && (<>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)} className="fixed inset-0 bg-black/50 z-[60]" />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] max-w-[calc(100vw-32px)] max-h-[80vh] rounded-2xl z-[70] flex flex-col ${modal_bg}`}
          >
            <div className={`flex items-center justify-between px-5 py-3.5 border-b ${border}`}>
              <span className={`text-[14px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>{DOCS[modal].title}</span>
              <button onClick={() => setModal(null)}><X className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {DOCS[modal].items.map((b, i) => {
                if (b.t === 'm') return <p key={i} className={`text-[10px] italic ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{b.text}</p>;
                if (b.t === 'c') return <p key={i} className={`text-[10px] pt-2 mt-3 border-t ${isDark ? 'text-zinc-600 border-white/[0.04]' : 'text-zinc-400 border-black/[0.04]'}`}>{b.text}</p>;
                if (b.t === 'i') return <div key={i} className={`px-3 py-2.5 rounded-lg text-[11px] font-medium ${isDark ? 'glass-card text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>{b.text}</div>;
                return <div key={i}><h3 className={`text-[12px] font-semibold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{b.h}</h3><p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{b.text}</p></div>;
              })}
            </div>
            <div className={`px-5 py-3.5 border-t ${border}`}>
              <button onClick={() => setModal(null)} className={`w-full py-2.5 rounded-xl text-[13px] font-medium ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>Понятно</button>
            </div>
          </motion.div>
        </>)}
      </AnimatePresence>
    </AnimatePresence>
  );
}

// ===== AUTH =====
function Auth({ onClose, isDark }: { onClose: () => void; isDark: boolean }) {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [step, setStep] = useState<'form'|'verify'>('form');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false); const [code, setCode] = useState(''); const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false); const [token, setToken] = useState(''); const [cd, setCd] = useState(0);
  const cRef = useRef<(HTMLInputElement|null)[]>([]);
  const { register, login, sendVerificationCode, verifyCode } = useAuthStore();

  useEffect(() => { if (cd > 0) { const t = setTimeout(() => setCd(cd - 1), 1000); return () => clearTimeout(t); } }, [cd]);

  const inp = `w-full h-11 px-3.5 rounded-lg text-[13px] glass-input ${isDark ? 'text-white placeholder-zinc-500' : 'text-black placeholder-zinc-400'}`;

  const onSubmit = async () => {
    setErr('');
    if (!email.trim()) { setErr('Введи email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Некорректный email'); return; }
    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) { setErr('Имя короткое'); return; }
      if (!pw || pw.length < 6) { setErr('Пароль мин. 6 символов'); return; }
      const DOMS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','mail.ru','yandex.ru','ya.ru','icloud.com','protonmail.com','proton.me','bk.ru','inbox.ru','list.ru','rambler.ru','live.com','aol.com','zoho.com','gmx.com','tutanota.com','fastmail.com','me.com','mac.com','msn.com','qq.com','163.com','ukr.net','i.ua','meta.ua','email.ua','bigmir.net'];
      const d = email.split('@')[1]?.toLowerCase();
      if (!d || !DOMS.includes(d)) { setErr('Используй настоящий email'); return; }
    } else { if (!pw) { setErr('Введи пароль'); return; } }
    if (!token) { setErr('Пройди проверку'); return; }
    setLoading(true);
    if (mode === 'login') { try { const r = await login(email, pw); if (!r.success) { setErr(r.error || 'Ошибка'); setLoading(false); return; } setLoading(false); onClose(); } catch { setErr('Ошибка сети'); setLoading(false); } return; }
    try { const r = await sendVerificationCode(email, token); if (r.success) { setStep('verify'); setCd(60); setCode(''); setErr(''); setTimeout(() => cRef.current[0]?.focus(), 100); } else setErr(r.error || 'Ошибка'); } catch { setErr('Ошибка сети'); } setLoading(false);
  };

  const onVerify = async () => {
    setErr(''); if (code.length !== 6) { setErr('6 цифр'); return; } setLoading(true);
    try { const v = await verifyCode(email, code); if (!v.success) { setErr(v.error || 'Неверный код'); setLoading(false); return; } const r = await register(name, email, pw); if (!r.success) { setErr(r.error || 'Ошибка'); setLoading(false); return; } setLoading(false); onClose(); }
    catch { setErr('Ошибка сети'); setLoading(false); }
  };

  const onCC = (i: number, v: string) => { if (v.length > 1) v = v[v.length-1]; if (!/^\d*$/.test(v)) return; const a = code.split(''); while(a.length<6)a.push(''); a[i]=v; setCode(a.join('').slice(0,6)); if(v&&i<5)cRef.current[i+1]?.focus(); };
  const onCK = (i: number, e: React.KeyboardEvent) => { if(e.key==='Backspace'&&!code[i]&&i>0)cRef.current[i-1]?.focus(); };
  const onPaste = (e: React.ClipboardEvent) => { e.preventDefault(); const p=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6); setCode(p); cRef.current[Math.min(p.length,5)]?.focus(); };
  const resend = async () => { if(cd>0)return; setLoading(true); setErr(''); try{const r=await sendVerificationCode(email,token||'r'); if(r.success){setCd(60);setCode('');}else setErr(r.error||'Ошибка');}catch{setErr('Ошибка');} setLoading(false); };

  const modal_bg = isDark ? 'bg-[#111] border border-white/[0.06]' : 'bg-white border border-black/[0.06] shadow-xl';

  return (<>
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/50 z-[60]" />
    <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}}
      className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[calc(100vw-32px)] rounded-2xl z-[70] overflow-hidden ${modal_bg}`}
    >
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div key="f" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-5">
            <div className={`flex rounded-lg p-0.5 mb-5 ${isDark ? 'glass-card' : 'bg-[#f2f2f2]'}`}>
              {(['login','register'] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setErr(''); }}
                  className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-colors ${mode === m ? isDark ? 'bg-white/[0.1] text-white' : 'bg-white text-black shadow-sm' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
                >{m === 'login' ? 'Вход' : 'Регистрация'}</button>
              ))}
            </div>
            {err && <div className={`mb-3 px-3 py-2 rounded-lg text-[12px] ${isDark ? 'bg-red-500/8 text-red-400 border border-red-500/10' : 'bg-red-50 text-red-500 border border-red-100'}`}>{err}</div>}
            <div className="space-y-2.5">
              {mode === 'register' && <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Имя" className={inp} />}
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className={inp} />
              <div className="relative">
                <input type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')onSubmit();}} placeholder="Пароль" className={`${inp} pr-11`} />
                <button type="button" onClick={()=>setShowPw(!showPw)} className={`absolute right-3 top-1/2 -translate-y-1/2 text-base ${isDark?'text-zinc-500':'text-zinc-400'}`}>{showPw?'🙈':'👁'}</button>
              </div>
              <div className="flex justify-center py-1"><Turnstile siteKey={TURNSTILE_KEY} onSuccess={t=>setToken(t)} onError={()=>setToken('')} onExpire={()=>setToken('')} options={{theme:isDark?'dark':'light',size:'flexible'}} /></div>
              <button disabled={loading} onClick={onSubmit}
                className={`w-full h-11 rounded-lg text-[13px] font-medium disabled:opacity-40 flex items-center justify-center gap-2 ${isDark?'bg-white text-black hover:bg-zinc-200':'bg-black text-white hover:bg-zinc-800'}`}
              >{loading?<Loader2 className="w-4 h-4 animate-spin"/>:mode==='login'?'Войти':'Далее'}</button>
            </div>
          </motion.div>
        )}
        {step === 'verify' && (
          <motion.div key="v" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-5">
            <p className={`text-[13px] text-center mb-4 ${isDark?'text-zinc-400':'text-zinc-500'}`}>Код → <span className={isDark?'text-white':'text-black'}>{email}</span></p>
            {err && <div className={`mb-3 px-3 py-2 rounded-lg text-[12px] ${isDark?'bg-red-500/8 text-red-400 border border-red-500/10':'bg-red-50 text-red-500 border border-red-100'}`}>{err}</div>}
            <div className="flex justify-center gap-1.5 mb-5" onPaste={onPaste}>
              {Array.from({length:6}).map((_,i)=>(
                <input key={i} ref={el=>{cRef.current[i]=el;}} type="text" inputMode="numeric" maxLength={1} value={code[i]||''}
                  onChange={e=>onCC(i,e.target.value)} onKeyDown={e=>onCK(i,e)}
                  className={`w-11 h-12 text-center text-lg font-bold rounded-lg glass-input ${isDark?'text-white':'text-black'}`}
                />
              ))}
            </div>
            <button disabled={loading||code.length!==6} onClick={onVerify}
              className={`w-full h-11 rounded-lg text-[13px] font-medium disabled:opacity-40 flex items-center justify-center gap-2 mb-3 ${isDark?'bg-white text-black hover:bg-zinc-200':'bg-black text-white hover:bg-zinc-800'}`}
            >{loading?<Loader2 className="w-4 h-4 animate-spin"/>:'Подтвердить'}</button>
            <div className="flex justify-between">
              <button onClick={()=>{setStep('form');setCode('');setErr('');}} className={`text-[12px] ${isDark?'text-zinc-500':'text-zinc-400'}`}>← Назад</button>
              <button onClick={resend} disabled={cd>0} className={`text-[12px] ${cd>0?isDark?'text-zinc-600':'text-zinc-400':'text-white'}`}>{cd>0?`${cd}с`:'Ещё раз'}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </>);
}
