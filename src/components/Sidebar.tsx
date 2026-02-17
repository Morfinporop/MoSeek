// src/components/Sidebar.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus, LogOut, Loader2, Camera, Sun, Moon, Trash2, ChevronDown, Pencil, Lock, AlertTriangle, Check, ArrowLeft, Shield, Eye, EyeOff, HelpCircle, Archive, ArchiveRestore } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = '0x4AAAAAACa5EobYKh_TrmuZ';
const DISCORD_URL = 'https://discord.gg/qjnyAr7YXe';

type ModalType = 'terms' | 'privacy' | 'cookies' | 'profile' | 'auth' | 'about' | null;
type ProfileView = 'main' | 'changePassword' | 'deleteAccount' | 'deleteVerify';
type AuthStep = 'form' | 'verify';

const VALID_EMAIL_DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','mail.ru','yandex.ru','ya.ru','icloud.com','protonmail.com','proton.me','bk.ru','inbox.ru','list.ru','rambler.ru','live.com','aol.com','zoho.com','gmx.com','tutanota.com','fastmail.com','me.com','mac.com','msn.com','qq.com','163.com','ukr.net','i.ua','meta.ua','email.ua','bigmir.net'];

const MODAL_CONTENT: Record<'terms'|'privacy'|'cookies', { title: string; content: Array<{ type: string; title?: string; text: string }> }> = {
  terms: { title: 'Условия использования', content: [
    { type: 'meta', text: 'Последнее обновление: январь 2026' },
    { type: 'section', title: '1. Принятие условий', text: 'Используя MoSeek и MoGPT, вы принимаете настоящие условия. Если не согласны — прекратите использование.' },
    { type: 'section', title: '2. Сервис', text: 'MoSeek — AI-платформа. MoGPT — нейросеть от MoSeek. Генерация текста, код, ответы на вопросы, дизайн интерфейсов.' },
    { type: 'section', title: '3. Собственность', text: '"MoSeek", "MoGPT", логотипы, дизайн, код — интеллектуальная собственность MoSeek. Копирование запрещено.' },
    { type: 'important', text: 'Нарушение авторских прав влечёт ответственность по закону.' },
    { type: 'section', title: '4. Правила', text: 'Запрещено: вредоносный контент, взлом, массовые запросы, нарушение прав третьих лиц.' },
    { type: 'section', title: '5. Ответственность', text: 'Сервис «как есть». MoSeek не гарантирует бесперебойность и абсолютную точность.' },
    { type: 'copyright', text: '© 2026 MoSeek. Все права защищены.' },
  ]},
  privacy: { title: 'Конфиденциальность', content: [
    { type: 'meta', text: 'Последнее обновление: январь 2026' },
    { type: 'section', title: '1. Какие данные мы храним', text: 'Имя пользователя, email-адрес и хеш пароля (SHA-256). Чаты синхронизируются в зашифрованном облачном хранилище между вашими устройствами.' },
    { type: 'section', title: '2. Как мы защищаем данные', text: 'Все данные хранятся в защищённой базе данных с шифрованием на уровне сервера. Пароли никогда не хранятся в открытом виде — только криптографические хеши.' },
    { type: 'important', text: 'Мы НЕ собираем: геолокацию, IP-адреса для слежки, биометрические данные, финансовую информацию. Мы НЕ продаём и НЕ передаём ваши данные третьим лицам.' },
    { type: 'section', title: '3. Безопасность хранения', text: 'База данных размещена на защищённых серверах с SSL/TLS шифрованием. Все соединения зашифрованы. Резервные копии создаются автоматически и также зашифрованы.' },
    { type: 'section', title: '4. Локальное хранение', text: 'На вашем устройстве в localStorage хранятся только: настройки темы, кеш текущей сессии и токен авторизации.' },
    { type: 'section', title: '5. Ваши права', text: 'Вы можете в любой момент: удалить свой аккаунт и все связанные данные, запросить экспорт данных, отозвать согласие на обработку.' },
    { type: 'copyright', text: '© 2026 MoSeek. Ваши данные под надёжной защитой.' },
  ]},
  cookies: { title: 'Политика хранения данных', content: [
    { type: 'meta', text: 'Последнее обновление: январь 2026' },
    { type: 'section', title: '1. Что мы храним локально', text: 'Настройки интерфейса (тема, язык), кеш текущих чатов для быстрой загрузки и токен авторизации для автоматического входа.' },
    { type: 'important', text: 'Мы не используем рекламные Cookie, трекеры, fingerprinting или любые другие технологии отслеживания.' },
    { type: 'section', title: '2. Управление данными', text: 'Очистка localStorage в браузере удалит локальный кеш и настройки. Ваши чаты и данные аккаунта в облаке сохранятся.' },
    { type: 'section', title: '3. Сторонние сервисы', text: 'Cloudflare Turnstile для защиты от ботов. EmailJS для отправки кодов подтверждения.' },
    { type: 'copyright', text: '© 2026 MoSeek. Ваши данные — ваша собственность.' },
  ]}
};

const ABOUT_CONTENT = { title: 'О MoGPT', content: [
  { type: 'section', title: 'Что такое MoGPT?', text: 'MoGPT — это нейросеть, разработанная командой MoSeek. Она способна генерировать текст, писать код, отвечать на вопросы, помогать с дизайном и решать творческие задачи.' },
  { type: 'section', title: 'Возможности', text: '• Генерация текста на любую тему\n• Написание и отладка кода на 50+ языках\n• Ответы на вопросы с контекстом беседы\n• Помощь с переводами и редактированием\n• Дизайн интерфейсов и креативные задачи\n• Запоминание контекста диалога' },
  { type: 'section', title: 'Как это работает?', text: 'MoGPT обрабатывает ваши сообщения, анализирует контекст беседы и генерирует релевантные ответы. Каждый чат — это отдельный диалог со своим контекстом.' },
  { type: 'important', text: 'MoGPT — это инструмент-помощник. Всегда проверяйте важную информацию из независимых источников.' },
  { type: 'section', title: 'Безлимитный доступ', text: 'MoGPT доступен бесплатно и без ограничений. Регистрация даёт синхронизацию чатов между устройствами.' },
  { type: 'copyright', text: '© 2026 MoSeek. Создано с ❤️' },
]};

/* ─── Shared style tokens ─── */
const S = {
  // Dark backgrounds
  dBg: 'bg-[#0c0c12]',
  dBgModal: 'bg-[#0e0e16]',
  dBorder: 'border-white/[0.08]',
  dBorderLight: 'border-white/[0.05]',
  dHover: 'hover:bg-white/[0.04]',
  dSurface: 'bg-white/[0.03]',
  dSurfaceHover: 'hover:bg-white/[0.06]',
  // Light backgrounds
  lBg: 'bg-white',
  lBgModal: 'bg-white',
  lBorder: 'border-zinc-200',
  lBorderLight: 'border-zinc-100',
  lHover: 'hover:bg-zinc-50',
  lSurface: 'bg-zinc-50',
  lSurfaceHover: 'hover:bg-zinc-100',
  // Accent
  dAccent: 'text-violet-400',
  lAccent: 'text-violet-600',
  dAccentBg: 'bg-violet-500/[0.08]',
  lAccentBg: 'bg-violet-50',
  dAccentBorder: 'border-violet-500/20',
  lAccentBorder: 'border-violet-200',
  dAccentHoverBg: 'hover:bg-violet-500/[0.14]',
  lAccentHoverBg: 'hover:bg-violet-100',
  dAccentHoverBorder: 'hover:border-violet-500/30',
  lAccentHoverBorder: 'hover:border-violet-300',
  // Text
  dText: 'text-zinc-100',
  dTextSec: 'text-zinc-400',
  dTextMuted: 'text-zinc-600',
  dTextDim: 'text-zinc-700',
  lText: 'text-zinc-900',
  lTextSec: 'text-zinc-600',
  lTextMuted: 'text-zinc-400',
  lTextDim: 'text-zinc-300',
  // Error
  dErrBg: 'bg-red-500/[0.08]',
  dErrBorder: 'border-red-500/15',
  lErrBg: 'bg-red-50',
  lErrBorder: 'border-red-200',
  // Success
  dOkBg: 'bg-emerald-500/[0.08]',
  dOkBorder: 'border-emerald-500/15',
  lOkBg: 'bg-emerald-50',
  lOkBorder: 'border-emerald-200',
  // Gradient button
  gradBtn: 'bg-gradient-to-r from-violet-500 to-purple-600',
  gradBtnShadow: 'shadow-lg shadow-violet-500/20',
  gradBtnRed: 'bg-gradient-to-r from-red-500 to-red-600',
  gradBtnRedShadow: 'shadow-lg shadow-red-500/20',
};

/* Helper: pick dark/light */
function pick(isDark: boolean, dark: string, light: string) { return isDark ? dark : light; }

/* ─── Reusable class builders ─── */
function inputClass(isDark: boolean) {
  return `w-full h-12 px-4 rounded-xl text-sm focus:outline-none transition-all duration-200 ${
    isDark
      ? `${S.dSurface} ${S.dBorder} text-white placeholder-zinc-600 focus:border-violet-500/40 focus:bg-white/[0.06]`
      : `${S.lSurface} ${S.lBorder} ${S.lText} placeholder-zinc-400 focus:border-violet-400 focus:bg-white`
  }`;
}

function modalOverlay() {
  return 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]';
}

function modalContainer(isDark: boolean, width = 'w-[420px]') {
  return `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${width} max-w-[calc(100vw-32px)] max-h-[90vh] rounded-2xl z-[70] overflow-hidden border flex flex-col shadow-2xl ${
    isDark ? `${S.dBgModal} ${S.dBorder} shadow-black/40` : `${S.lBgModal} ${S.lBorder} shadow-zinc-200/40`
  }`;
}

function modalHeader(isDark: boolean) {
  return `flex items-center justify-between px-5 py-4 border-b ${pick(isDark, S.dBorderLight, S.lBorderLight)}`;
}

function modalHeaderBack(isDark: boolean) {
  return `flex items-center gap-3 px-5 py-4 border-b ${pick(isDark, S.dBorderLight, S.lBorderLight)}`;
}

function headerTitle(isDark: boolean) {
  return `text-[15px] font-bold tracking-tight ${pick(isDark, S.dText, S.lText)}`;
}

function closeBtn(isDark: boolean) {
  return `p-1.5 rounded-lg transition-colors ${pick(isDark, S.dHover, S.lHover)}`;
}

function closeBtnIcon(isDark: boolean) {
  return `w-4 h-4 ${pick(isDark, S.dTextMuted, S.lTextMuted)}`;
}

function accentBtn(isDark: boolean) {
  return `w-full py-3 rounded-xl text-sm font-medium transition-all ${
    isDark
      ? `${S.dAccentBg} border ${S.dAccentBorder} ${S.dAccent} ${S.dAccentHoverBg}`
      : `${S.lAccentBg} border ${S.lAccentBorder} ${S.lAccent} ${S.lAccentHoverBg}`
  }`;
}

function errBox(isDark: boolean) {
  return `mb-4 px-4 py-3 rounded-xl ${pick(isDark, `${S.dErrBg} border ${S.dErrBorder}`, `${S.lErrBg} border ${S.lErrBorder}`)}`;
}

function okBox(isDark: boolean) {
  return `mb-4 px-4 py-3 rounded-xl ${pick(isDark, `${S.dOkBg} border ${S.dOkBorder}`, `${S.lOkBg} border ${S.lOkBorder}`)}`;
}

function importantBox(isDark: boolean) {
  return `px-4 py-3 rounded-xl ${
    isDark
      ? `${S.dAccentBg} border ${S.dAccentBorder}`
      : `${S.lAccentBg} border ${S.lAccentBorder}`
  }`;
}

function cardBtn(isDark: boolean) {
  return `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
    isDark
      ? `${S.dSurface} ${S.dSurfaceHover} border ${S.dBorderLight}`
      : `${S.lSurface} ${S.lSurfaceHover} border ${S.lBorderLight}`
  }`;
}

function footerBorder(isDark: boolean) {
  return `px-6 py-4 border-t ${pick(isDark, S.dBorderLight, S.lBorderLight)}`;
}

/* ─── Small components ─── */
function DiscordIcon({ className }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>);
}

function CodeInput({ code, setCode, isDark, autoFocus = true }: { code: string; setCode: (v: string) => void; isDark: boolean; autoFocus?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { if (autoFocus) setTimeout(() => refs.current[0]?.focus(), 100); }, [autoFocus]);
  const hc = (i: number, v: string) => { if(v.length>1)v=v[v.length-1]; if(!/^\d*$/.test(v))return; const a=code.split(''); while(a.length<6)a.push(''); a[i]=v; setCode(a.join('').slice(0,6)); if(v&&i<5)refs.current[i+1]?.focus(); };
  const hk = (i: number, e: React.KeyboardEvent) => { if(e.key==='Backspace'&&!code[i]&&i>0)refs.current[i-1]?.focus(); };
  const hp = (e: React.ClipboardEvent) => { e.preventDefault(); const p=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6); setCode(p); refs.current[Math.min(p.length,5)]?.focus(); };
  return (
    <div className="flex justify-center gap-2" onPaste={hp}>
      {Array.from({length:6}).map((_,i)=>(
        <input key={i} ref={el=>{refs.current[i]=el;}} type="text" inputMode="numeric" maxLength={1} value={code[i]||''}
          onChange={e=>hc(i,e.target.value)} onKeyDown={e=>hk(i,e)}
          className={`w-11 h-13 text-center text-xl font-bold rounded-xl focus:outline-none transition-all duration-200 ${
            isDark
              ? `${S.dSurface} ${S.dBorder} text-white focus:border-violet-500/50 focus:bg-white/[0.06]`
              : `${S.lSurface} ${S.lBorder} ${S.lText} focus:border-violet-400 focus:bg-white`
          }`}/>
      ))}
    </div>
  );
}

function PasswordField({ value, onChange, placeholder, show, toggle, onKeyDown, isDark }: {
  value: string; onChange: (v: string) => void; placeholder: string; show: boolean; toggle: () => void; onKeyDown?: (e: React.KeyboardEvent) => void; isDark: boolean;
}) {
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown}
        placeholder={placeholder} className={`${inputClass(isDark)} pr-12`} />
      <button type="button" onClick={toggle}
        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${pick(isDark, 'text-zinc-600 hover:text-zinc-400', 'text-zinc-400 hover:text-zinc-600')}`}>
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

/* ─── Sidebar icon button ─── */
function SidebarIconBtn({ isDark, onClick, href, title, bgClass, children }: {
  isDark: boolean; onClick?: () => void; href?: string; title?: string; bgClass: string; children: React.ReactNode;
}) {
  const cls = `w-9 h-9 rounded-xl flex items-center justify-center transition-all ${bgClass}`;
  if (href) return (
    <motion.a href={href} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} className={cls} title={title}>
      {children}
    </motion.a>
  );
  return (
    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={onClick} className={cls} title={title}>
      {children}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════ */
export function Sidebar() {
  const { currentChatId, sidebarOpen, toggleSidebar, setCurrentChat, deleteChat, createNewChat, getActiveChats, getArchivedChats, unarchiveChat } = useChatStore();
  const { user, isAuthenticated, logout, updateAvatar } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showHeaderExtras, setShowHeaderExtras] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const activeChats = getActiveChats();
  const archivedChats = getArchivedChats();

  useEffect(() => {
    const check = () => setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);
    check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check);
  }, []);

  const handleNewChat = () => { const id = createNewChat(); if (id) setCurrentChat(id); toggleSidebar(); };
  const handleDeleteChat = (chatId: string) => {
    const idx = activeChats.findIndex(c => c.id === chatId);
    const remaining = activeChats.filter(c => c.id !== chatId);
    deleteChat(chatId);
    if (currentChatId === chatId && remaining.length > 0) setCurrentChat(remaining[Math.min(idx, remaining.length - 1)].id);
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const r = ev.target?.result as string; if (r) updateAvatar(r); };
    reader.readAsDataURL(file); e.target.value = '';
  };

  const iconBtnBg = (color: 'discord' | 'theme' | 'accent') => {
    const map = {
      discord: isDark
        ? 'bg-[#5865F2]/[0.08] border border-[#5865F2]/15 hover:bg-[#5865F2]/[0.14]'
        : 'bg-[#5865F2]/[0.05] border border-[#5865F2]/12 hover:bg-[#5865F2]/[0.1]',
      theme: isDark
        ? 'bg-amber-500/[0.08] border border-amber-500/15 hover:bg-amber-500/[0.14]'
        : 'bg-violet-500/[0.05] border border-violet-500/12 hover:bg-violet-500/[0.1]',
      accent: isDark
        ? `${S.dAccentBg} border ${S.dAccentBorder} ${S.dAccentHoverBg}`
        : `${S.lAccentBg} border ${S.lAccentBorder} ${S.lAccentHoverBg}`,
    };
    return map[color];
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            onClick={toggleSidebar} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

          <motion.aside initial={{ x: -320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 400 }}
            className={`fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col border-r ${
              isDark ? `${S.dBg}/95 backdrop-blur-2xl ${S.dBorder}` : `${S.lBg}/95 backdrop-blur-2xl ${S.lBorder}`
            }`}>

            {/* Header */}
            <div className={`border-b ${pick(isDark, S.dBorderLight, S.lBorderLight)}`}>
              <div className="flex items-center justify-between px-4 py-3.5">
                <button onClick={() => setShowHeaderExtras(!showHeaderExtras)}
                  className={`flex items-center gap-1.5 text-[15px] font-semibold transition-colors ${pick(isDark, `${S.dText} hover:text-violet-400`, `${S.lText} hover:text-violet-600`)}`}>
                  Меню
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${pick(isDark, S.dTextMuted, S.lTextMuted)} ${showHeaderExtras ? 'rotate-180' : ''}`} />
                </button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleSidebar}
                  className={closeBtn(isDark)}>
                  <X className={closeBtnIcon(isDark)} />
                </motion.button>
              </div>
              <AnimatePresence>
                {showHeaderExtras && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="flex items-center gap-2 px-4 pb-3">
                      <SidebarIconBtn isDark={isDark} href={DISCORD_URL} title="Discord" bgClass={iconBtnBg('discord')}>
                        <DiscordIcon className="w-4.5 h-4.5 text-[#5865F2]" />
                      </SidebarIconBtn>
                      <SidebarIconBtn isDark={isDark} onClick={toggleTheme} bgClass={iconBtnBg('theme')}>
                        {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-violet-500" />}
                      </SidebarIconBtn>
                      <SidebarIconBtn isDark={isDark} onClick={() => setActiveModal('about')} bgClass={iconBtnBg('accent')}>
                        <HelpCircle className={`w-4.5 h-4.5 ${pick(isDark, S.dAccent, S.lAccent)}`} />
                      </SidebarIconBtn>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* New chat */}
            <div className="px-3 pt-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNewChat}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isDark
                    ? `${S.dAccentBg} border ${S.dAccentBorder} ${S.dAccentHoverBg} ${S.dAccentHoverBorder} ${S.dAccent}`
                    : `${S.lAccentBg} border ${S.lAccentBorder} ${S.lAccentHoverBg} ${S.lAccentHoverBorder} ${S.lAccent}`
                }`}>
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Новый чат</span>
              </motion.button>
            </div>

            {/* Archive */}
            {archivedChats.length > 0 && (
              <div className="px-3 pt-2">
                <button onClick={() => setShowArchive(!showArchive)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${pick(isDark, S.dHover, S.lHover)}`}>
                  <Archive className={`w-3.5 h-3.5 ${pick(isDark, S.dTextMuted, S.lTextMuted)}`} />
                  <span className={`text-sm font-medium flex-1 text-left ${pick(isDark, S.dTextSec, S.lTextSec)}`}>Архив</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${pick(isDark, `${S.dSurface} ${S.dTextMuted}`, `${S.lSurface} ${S.lTextMuted}`)}`}>{archivedChats.length}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${pick(isDark, S.dTextDim, S.lTextMuted)} ${showArchive ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showArchive && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="space-y-0.5 pt-1 pb-1">
                        {archivedChats.map((chat) => {
                          const isActive = currentChatId === chat.id;
                          return (
                            <motion.div key={chat.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                              className={`group relative rounded-xl transition-all cursor-pointer ${
                                isActive
                                  ? isDark ? `${S.dAccentBg} border ${S.dAccentBorder}` : `${S.lAccentBg} border ${S.lAccentBorder}`
                                  : isDark ? `${S.dHover} border border-transparent` : `${S.lHover} border border-transparent`
                              }`}>
                              <div className="flex items-center">
                                <button onClick={() => { setCurrentChat(chat.id); toggleSidebar(); }} className="flex-1 min-w-0 text-left px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <Archive className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? pick(isDark, S.dAccent, S.lAccent) : pick(isDark, S.dTextDim, S.lTextMuted)}`} />
                                    <p className={`text-sm truncate max-w-[120px] ${isActive ? pick(isDark, S.dText, S.lText) : pick(isDark, S.dTextMuted, S.lTextMuted)}`}>{chat.title}</p>
                                  </div>
                                </button>
                                <div className={`flex items-center mr-1 ${isTouchDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all`}>
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={(e) => { e.stopPropagation(); unarchiveChat(chat.id); }}
                                    className={`p-1.5 rounded-lg ${pick(isDark, `hover:${S.dAccentBg.replace('bg-', 'bg-')}`, `hover:${S.lAccentBg.replace('bg-', 'bg-')}`)}`} title="Восстановить">
                                    <ArchiveRestore className={`w-3.5 h-3.5 ${pick(isDark, S.dAccent, S.lAccent)}`} />
                                  </motion.button>
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                                    className={`p-1.5 rounded-lg ${pick(isDark, 'hover:bg-red-500/15', 'hover:bg-red-50')}`} title="Удалить">
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {activeChats.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className={`w-12 h-12 mx-auto mb-3 ${pick(isDark, S.dTextDim, S.lTextDim)}`} />
                  <p className={`text-sm ${pick(isDark, S.dTextMuted, S.lTextMuted)}`}>Нет чатов</p>
                  <p className={`text-xs mt-1 ${pick(isDark, S.dTextDim, S.lTextMuted)}`}>Начни новый диалог</p>
                </div>
              ) : (
                activeChats.map((chat) => {
                  const isActive = currentChatId === chat.id;
                  return (
                    <motion.div key={chat.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      className={`group relative rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? isDark ? `bg-violet-500/[0.1] border ${S.dAccentBorder}` : `${S.lAccentBg} border ${S.lAccentBorder}`
                          : isDark ? `${S.dHover} border border-transparent` : `${S.lHover} border border-transparent`
                      }`}>
                      <div className="flex items-center">
                        <button onClick={() => { setCurrentChat(chat.id); toggleSidebar(); }} className="flex-1 min-w-0 text-left px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? pick(isDark, S.dAccent, S.lAccent) : pick(isDark, S.dTextMuted, S.lTextMuted)}`} />
                            <p className={`text-sm truncate max-w-[140px] ${isActive ? pick(isDark, S.dText, S.lText) : pick(isDark, S.dTextSec, S.lTextSec)}`}>{chat.title}</p>
                          </div>
                        </button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}
                          className={`flex-shrink-0 p-2 mr-1 rounded-lg transition-all ${pick(isDark, 'hover:bg-red-500/15', 'hover:bg-red-50')} ${isTouchDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className={`p-4 border-t ${pick(isDark, S.dBorderLight, S.lBorderLight)}`}>
              {isAuthenticated ? (
                <div onClick={() => setActiveModal('profile')}
                  className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer mb-4 transition-colors ${pick(isDark, S.dHover, S.lHover)}`}>
                  <img src={user?.avatar} alt={user?.name}
                    className={`w-10 h-10 rounded-full flex-shrink-0 object-cover border-2 ${pick(isDark, 'border-violet-500/30', 'border-violet-300')}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${pick(isDark, S.dText, S.lText)}`}>{user?.name}</p>
                    <p className={`text-[11px] truncate ${pick(isDark, S.dTextMuted, S.lTextMuted)}`}>{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center gap-3 px-2 py-2 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${pick(isDark, `bg-zinc-800 border ${S.dBorderLight}`, `${S.lSurface} border ${S.lBorder}`)}`}>
                      <span className="text-zinc-500 text-sm">👤</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${pick(isDark, S.dTextSec, S.lTextSec)}`}>Гость</p>
                      <p className={`text-[11px] ${pick(isDark, S.dTextMuted, S.lTextMuted)}`}>Безлимитный доступ</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveModal('auth')}
                    className={accentBtn(isDark)}>
                    Войти / Регистрация
                  </motion.button>
                </div>
              )}
              <div className="flex items-center gap-3 text-[10px] pl-1">
                {(['terms', 'privacy', 'cookies'] as const).map((key, i) => (
                  <span key={key} className="contents">
                    {i > 0 && <span className={pick(isDark, S.dTextDim, S.lTextDim)}>·</span>}
                    <button onClick={() => setActiveModal(key)}
                      className={`transition-colors ${pick(isDark, `${S.dTextMuted} hover:text-violet-400`, `${S.lTextMuted} hover:text-violet-500`)}`}>
                      {key === 'terms' ? 'Условия' : key === 'privacy' ? 'Конфиденциальность' : 'Данные'}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
      <AnimatePresence>{activeModal === 'profile' && <ProfileModal onClose={() => setActiveModal(null)} isDark={isDark} fileInputRef={fileInputRef} isTouchDevice={isTouchDevice} />}</AnimatePresence>
      <AnimatePresence>{activeModal === 'auth' && <AuthModal onClose={() => setActiveModal(null)} isDark={isDark} />}</AnimatePresence>
      <AnimatePresence>{activeModal === 'about' && renderDocModal(ABOUT_CONTENT.title, ABOUT_CONTENT.content, isDark, () => setActiveModal(null))}</AnimatePresence>
      <AnimatePresence>
        {activeModal && activeModal !== 'profile' && activeModal !== 'auth' && activeModal !== 'about' && (
          renderDocModal(MODAL_CONTENT[activeModal].title, MODAL_CONTENT[activeModal].content, isDark, () => setActiveModal(null))
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   DOC MODAL
   ═══════════════════════════════════════════ */
function renderDocModal(title: string, content: Array<{ type: string; title?: string; text: string }>, isDark: boolean, onClose: () => void) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className={modalOverlay()} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={modalContainer(isDark, 'w-[480px]')}>
        <div className={modalHeader(isDark)}>
          <h2 className={headerTitle(isDark)}>{title}</h2>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className={closeBtn(isDark)}>
            <X className={closeBtnIcon(isDark)} />
          </motion.button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            {content.map((block, i) => {
              if (block.type === 'meta') return <p key={i} className={`text-[11px] italic ${pick(isDark, S.dTextMuted, S.lTextMuted)}`}>{block.text}</p>;
              if (block.type === 'copyright') return <p key={i} className={`text-[11px] font-medium pt-3 mt-4 border-t ${pick(isDark, `${S.dTextDim} ${S.dBorderLight}`, `${S.lTextMuted} ${S.lBorderLight}`)}`}>{block.text}</p>;
              if (block.type === 'important') return (
                <div key={i} className={importantBox(isDark)}>
                  <p className={`text-[12px] leading-relaxed font-medium ${pick(isDark, 'text-violet-300', 'text-violet-700')}`}>{block.text}</p>
                </div>
              );
              return (
                <div key={i}>
                  <h3 className={`text-[13px] font-semibold mb-1.5 ${pick(isDark, S.dText, S.lText)}`}>{block.title}</h3>
                  <p className={`text-[12px] leading-[1.7] whitespace-pre-line ${pick(isDark, S.dTextSec, S.lTextSec)}`}>{block.text}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className={footerBorder(isDark)}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} className={accentBtn(isDark)}>
            Понятно
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PROFILE MODAL
   ═══════════════════════════════════════════ */
function ProfileModal({ onClose, isDark, fileInputRef, isTouchDevice }: { onClose: () => void; isDark: boolean; fileInputRef: React.RefObject<HTMLInputElement | null>; isTouchDevice: boolean }) {
  const { user, logout, updateName, updatePassword, sendVerificationCode, verifyCode, deleteAccount } = useAuthStore();
  const [view, setView] = useState<ProfileView>('main');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [oldPw, setOldPw] = useState(''); const [newPw, setNewPw] = useState(''); const [confirmPw, setConfirmPw] = useState('');
  const [sOld, setSO] = useState(false); const [sNew, setSN] = useState(false); const [sCon, setSC] = useState(false);
  const [code, setCode] = useState(''); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false); const [countdown, setCountdown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState(''); const [delText, setDelText] = useState('');

  useEffect(() => { if (countdown > 0) { const t = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(t); } }, [countdown]);
  useEffect(() => { if (isEditingName) setTimeout(() => { nameInputRef.current?.focus(); nameInputRef.current?.select(); }, 50); }, [isEditingName]);

  const reset = useCallback(() => { setError(''); setSuccess(''); setCode(''); setIsLoading(false); setTurnstileToken(''); setDelText(''); setOldPw(''); setNewPw(''); setConfirmPw(''); setSO(false); setSN(false); setSC(false); }, []);
  const goBack = useCallback(() => { reset(); setView('main'); }, [reset]);

  const ic = inputClass(isDark);

  const saveName = async () => { setNameError(''); const t = editName.trim(); if (!t || t.length < 2) { setNameError('Минимум 2 символа'); return; } if (t === user?.name) { setIsEditingName(false); return; } setNameLoading(true); try { const r = await updateName(t); if (r.success) setIsEditingName(false); else setNameError(r.error || 'Ошибка'); } catch { setNameError('Ошибка сети'); } setNameLoading(false); };
  const changePw = async () => { setError(''); if (!oldPw) { setError('Введи текущий пароль'); return; } if (!newPw || newPw.length < 6) { setError('Новый пароль минимум 6 символов'); return; } if (newPw !== confirmPw) { setError('Пароли не совпадают'); return; } if (oldPw === newPw) { setError('Новый пароль совпадает со старым'); return; } setIsLoading(true); try { const r = await updatePassword(oldPw, newPw); if (r.success) { setSuccess('Пароль обновлён'); setTimeout(() => goBack(), 1200); } else setError(r.error || 'Ошибка'); } catch { setError('Ошибка сети'); } setIsLoading(false); };
  const delSend = async () => { setError(''); if (delText !== 'УДАЛИТЬ') { setError('Напиши УДАЛИТЬ'); return; } if (!turnstileToken) { setError('Пройди проверку'); return; } setIsLoading(true); try { const r = await sendVerificationCode(user?.email || '', turnstileToken); if (r.success) { setView('deleteVerify'); setCountdown(60); setCode(''); setError(''); } else setError(r.error || 'Ошибка'); } catch { setError('Ошибка сети'); } setIsLoading(false); };
  const delVerify = async () => { setError(''); if (code.length !== 6) { setError('Введи 6-значный код'); return; } setIsLoading(true); try { const v = await verifyCode(user?.email || '', code); if (!v.success) { setError(v.error || 'Неверный код'); setIsLoading(false); return; } const r = await deleteAccount(); if (r.success) onClose(); else setError(r.error || 'Ошибка'); } catch { setError('Ошибка сети'); } setIsLoading(false); };
  const resend = async () => { if (countdown > 0) return; setIsLoading(true); setError(''); try { const r = await sendVerificationCode(user?.email || '', turnstileToken || 'resend'); if (r.success) { setCountdown(60); setCode(''); } else setError(r.error || 'Ошибка'); } catch { setError('Ошибка сети'); } setIsLoading(false); };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className={modalOverlay()} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={modalContainer(isDark, 'w-[380px]')}>
        <AnimatePresence mode="wait">

          {view === 'main' && (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className={modalHeader(isDark)}>
                <h2 className={headerTitle(isDark)}>Профиль</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className={closeBtn(isDark)}><X className={closeBtnIcon(isDark)} /></motion.button>
              </div>
              <div className="px-5 py-5">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group mb-3">
                    <img src={user?.avatar} alt={user?.name} className={`w-20 h-20 rounded-full object-cover border-2 ${pick(isDark, 'border-violet-500/30', 'border-violet-300')}`} />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  {isEditingName ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="relative w-full max-w-[220px]">
                        <input ref={nameInputRef} type="text" value={editName} onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setIsEditingName(false); setEditName(user?.name || ''); setNameError(''); } }}
                          className={`w-full text-center text-lg font-semibold py-1.5 px-3 rounded-xl focus:outline-none transition-all ${
                            isDark ? `${S.dSurface} border border-violet-500/30 text-white` : `${S.lAccentBg} border ${S.lAccentBorder} ${S.lText}`
                          }`} />
                        {nameLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-violet-400" />}
                      </div>
                      {nameError && <p className="text-xs text-red-400 text-center mt-1.5">{nameError}</p>}
                      <p className={`text-[10px] text-center mt-1.5 ${pick(isDark, S.dTextDim, S.lTextMuted)}`}>Enter — сохранить · Esc — отмена</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <button onClick={() => { setIsEditingName(true); setEditName(user?.name || ''); setNameError(''); }} className="group/name flex items-center gap-2">
                        <span className={`text-lg font-semibold ${pick(isDark, S.dText, S.lText)}`}>{user?.name}</span>
                        <Pencil className={`w-3.5 h-3.5 transition-opacity ${pick(isDark, S.dTextMuted, S.lTextMuted)} ${isTouchDevice ? 'opacity-60' : 'opacity-0 group-hover/name:opacity-60'}`} />
                      </button>
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${pick(isDark, S.dTextMuted, S.lTextMuted)}`}>{user?.email}</p>
                </div>
                <div className="space-y-2 mb-5">
                  <button onClick={() => { reset(); setView('changePassword'); }} className={cardBtn(isDark)}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${pick(isDark, 'bg-amber-500/[0.1]', 'bg-amber-50')}`}>
                      <Lock className={`w-4 h-4 ${pick(isDark, 'text-amber-400', 'text-amber-500')}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${pick(isDark, S.dText, S.lText)}`}>Сменить пароль</p>
                      <p className={`text-[11px] ${pick(isDark, S.dTextMuted, S.lTextMuted)}`}>Обновить пароль аккаунта</p>
                    </div>
                  </button>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { logout(); onClose(); }}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all mb-3 ${pick(isDark, `${S.dErrBg} border ${S.dErrBorder} hover:bg-red-500/[0.14]`, `${S.lErrBg} border ${S.lErrBorder} ${S.lSurfaceHover}`)}`}>
                  <LogOut className="w-4 h-4 text-red-400" /><span className="text-sm text-red-400 font-medium">Выйти из аккаунта</span>
                </motion.button>
                <button onClick={() => { reset(); setView('deleteAccount'); }}
                  className={`w-full text-center text-xs py-2 transition-colors ${pick(isDark, `${S.dTextDim} hover:text-red-400`, `${S.lTextMuted} hover:text-red-500`)}`}>
                  Удалить аккаунт
                </button>
              </div>
            </motion.div>
          )}

          {view === 'changePassword' && (
            <motion.div key="pw" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className={modalHeaderBack(isDark)}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={goBack} className={closeBtn(isDark)}><ArrowLeft className={closeBtnIcon(isDark)} /></motion.button>
                <h2 className={headerTitle(isDark)}>Сменить пароль</h2>
              </div>
              <div className="px-5 py-5">
                {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={errBox(isDark)}><span className="text-sm text-red-400">{error}</span></motion.div>}
                {success && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={okBox(isDark)}><span className="text-sm text-emerald-400 flex items-center gap-2"><Check className="w-4 h-4" />{success}</span></motion.div>}
                <div className="space-y-4">
                  <div><label className={`text-xs font-medium mb-2 block ${pick(isDark, S.dTextSec, S.lTextSec)}`}>Текущий пароль</label><PasswordField value={oldPw} onChange={setOldPw} placeholder="Введи текущий пароль" show={sOld} toggle={() => setSO(!sOld)} isDark={isDark} /></div>
                  <div><label className={`text-xs font-medium mb-2 block ${pick(isDark, S.dTextSec, S.lTextSec)}`}>Новый пароль</label><PasswordField value={newPw} onChange={setNewPw} placeholder="Минимум 6 символов" show={sNew} toggle={() => setSN(!sNew)} isDark={isDark} /></div>
                  <div><label className={`text-xs font-medium mb-2 block ${pick(isDark, S.dTextSec, S.lTextSec)}`}>Повтори новый пароль</label><PasswordField value={confirmPw} onChange={setConfirmPw} placeholder="Повтори пароль" show={sCon} toggle={() => setSC(!sCon)} onKeyDown={e => { if (e.key === 'Enter') changePw(); }} isDark={isDark} /></div>
                  {newPw && <div className="space-y-1.5"><div className="flex gap-1">{[1, 2, 3, 4].map(l => { const s = gpS(newPw); return <div key={l} className={`h-1 flex-1 rounded-full transition-all ${l <= s ? s <= 1 ? 'bg-red-500' : s <= 2 ? 'bg-orange-500' : s <= 3 ? 'bg-yellow-500' : 'bg-emerald-500' : pick(isDark, 'bg-white/[0.06]', 'bg-zinc-200')}`} />; })}</div><p className={`text-[11px] ${pick(isDark, S.dTextMuted, S.lTextMuted)}`}>{gpL(newPw)}</p></div>}
                  {confirmPw && <p className={`text-xs flex items-center gap-1.5 ${newPw === confirmPw ? 'text-emerald-400' : 'text-red-400'}`}>{newPw === confirmPw ? <><Check className="w-3.5 h-3.5" />Пароли совпадают</> : <><X className="w-3.5 h-3.5" />Пароли не совпадают</>}</p>}
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={isLoading || !oldPw || !newPw || newPw !== confirmPw} onClick={changePw}
                  className={`w-full h-12 mt-5 rounded-xl ${S.gradBtn} text-white font-medium text-sm ${S.gradBtnShadow} transition-all disabled:opacity-50 flex items-center justify-center gap-2`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сменить пароль'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {view === 'deleteAccount' && (
            <motion.div key="del" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className={modalHeaderBack(isDark)}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={goBack} className={closeBtn(isDark)}><ArrowLeft className={closeBtnIcon(isDark)} /></motion.button>
                <h2 className="text-[15px] font-bold tracking-tight text-red-400">Удаление аккаунта</h2>
              </div>
              <div className="px-5 py-5">
                <div className={`flex items-start gap-3 px-4 py-4 rounded-xl mb-5 ${pick(isDark, `${S.dErrBg} border ${S.dErrBorder}`, `${S.lErrBg} border ${S.lErrBorder}`)}`}>
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div><p className={`text-sm font-medium mb-1 ${pick(isDark, 'text-red-300', 'text-red-700')}`}>Это действие необратимо</p><p className={`text-xs leading-relaxed ${pick(isDark, 'text-red-400/70', 'text-red-600/70')}`}>Все данные будут удалены навсегда.</p></div>
                </div>
                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={errBox(isDark)}><span className="text-sm text-red-400">{error}</span></motion.div>}
                <label className={`text-xs font-medium mb-2 block ${pick(isDark, S.dTextSec, S.lTextSec)}`}>Напиши <span className="text-red-400 font-bold">УДАЛИТЬ</span></label>
                <input type="text" value={delText} onChange={e => setDelText(e.target.value)} placeholder="УДАЛИТЬ" className={`${ic} mb-4`} autoFocus />
                <div className="flex justify-center py-2 mb-4"><Turnstile siteKey={TURNSTILE_SITE_KEY} onSuccess={t => setTurnstileToken(t)} onError={() => setTurnstileToken('')} onExpire={() => setTurnstileToken('')} options={{ theme: isDark ? 'dark' : 'light', size: 'flexible' }} /></div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={isLoading || delText !== 'УДАЛИТЬ'} onClick={delSend}
                  className={`w-full h-12 rounded-xl ${S.gradBtnRed} text-white font-medium text-sm ${S.gradBtnRedShadow} transition-all disabled:opacity-50 flex items-center justify-center gap-2`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Отправить код'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {view === 'deleteVerify' && (
            <motion.div key="delv" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className={modalHeaderBack(isDark)}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setView('deleteAccount'); setCode(''); setError(''); }} className={closeBtn(isDark)}><ArrowLeft className={closeBtnIcon(isDark)} /></motion.button>
                <h2 className="text-[15px] font-bold tracking-tight text-red-400">Подтверждение</h2>
              </div>
              <div className="px-5 py-5">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-5 ${pick(isDark, `${S.dErrBg} border ${S.dErrBorder}`, `${S.lErrBg} border ${S.lErrBorder}`)}`}>
                  <Shield className="w-5 h-5 flex-shrink-0 text-red-400" /><p className={`text-xs ${pick(isDark, 'text-red-300', 'text-red-700')}`}>Код → <span className="font-semibold">{user?.email}</span></p>
                </div>
                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={errBox(isDark)}><span className="text-sm text-red-400">{error}</span></motion.div>}
                <div className="mb-5"><CodeInput code={code} setCode={setCode} isDark={isDark} /></div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={isLoading || code.length !== 6} onClick={delVerify}
                  className={`w-full h-12 rounded-xl ${S.gradBtnRed} text-white font-medium text-sm ${S.gradBtnRedShadow} transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Удалить навсегда'}
                </motion.button>
                <div className="flex justify-end"><button onClick={resend} disabled={countdown > 0 || isLoading}
                  className={`text-sm transition-colors ${countdown > 0 ? pick(isDark, `${S.dTextDim} cursor-not-allowed`, `${S.lTextMuted} cursor-not-allowed`) : 'text-red-400 hover:text-red-300'}`}>
                  {countdown > 0 ? `${countdown}с` : 'Ещё раз'}</button></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

function gpS(p: string): number { let s = 0; if (p.length >= 6) s++; if (p.length >= 10) s++; if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++; return Math.min(s, 4); }
function gpL(p: string): string { const s = gpS(p); return s <= 1 ? 'Слабый пароль' : s === 2 ? 'Средний пароль' : s === 3 ? 'Хороший пароль' : 'Надёжный пароль'; }

/* ═══════════════════════════════════════════
   AUTH MODAL
   ═══════════════════════════════════════════ */
function AuthModal({ onClose, isDark }: { onClose: () => void; isDark: boolean }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<AuthStep>('form');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false); const [code, setCode] = useState(''); const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); const [turnstileToken, setTurnstileToken] = useState('');
  const [countdown, setCountdown] = useState(0); const [pending, setPending] = useState<'register' | 'login'>('register');
  const { register, login, sendVerificationCode, verifyCode } = useAuthStore();

  useEffect(() => { if (countdown > 0) { const t = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(t); } }, [countdown]);

  const ic = inputClass(isDark);

  const val = (): boolean => { setError(''); if (!email.trim()) { setError('Введи email'); return false; } if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Некорректный email'); return false; } if (mode === 'register') { if (!name.trim() || name.trim().length < 2) { setError('Имя слишком короткое'); return false; } if (!password || password.length < 6) { setError('Пароль минимум 6 символов'); return false; } const d = email.split('@')[1]?.toLowerCase(); if (!d || !VALID_EMAIL_DOMAINS.includes(d)) { setError('Используй настоящий email'); return false; } } else { if (!password) { setError('Введи пароль'); return false; } } if (!turnstileToken) { setError('Пройди проверку'); return false; } return true; };
  const submit = async () => { if (!val()) return; setIsLoading(true); try { const r = await sendVerificationCode(email, turnstileToken); if (r.success) { setPending(mode === 'login' ? 'login' : 'register'); setStep('verify'); setCountdown(60); setCode(''); setError(''); } else setError(r.error || 'Ошибка'); } catch { setError('Ошибка сети'); } setIsLoading(false); };
  const verify = async () => { setError(''); if (code.length !== 6) { setError('Введи 6-значный код'); return; } setIsLoading(true); try { const v = await verifyCode(email, code); if (!v.success) { setError(v.error || 'Неверный код'); setIsLoading(false); return; } const r = pending === 'login' ? await login(email, password) : await register(name, email, password); if (!r.success) { setError(r.error || 'Ошибка'); setIsLoading(false); return; } setIsLoading(false); onClose(); } catch { setError('Ошибка сети'); setIsLoading(false); } };
  const resend = async () => { if (countdown > 0) return; setIsLoading(true); setError(''); try { const r = await sendVerificationCode(email, turnstileToken || 'resend'); if (r.success) { setCountdown(60); setCode(''); } else setError(r.error || 'Ошибка'); } catch { setError('Ошибка сети'); } setIsLoading(false); };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className={modalOverlay()} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={modalContainer(isDark)}>
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
              <div className={`flex rounded-xl p-1 mb-6 ${pick(isDark, S.dSurface, S.lSurface)}`}>
                {(['login', 'register'] as const).map(m => (<button key={m} onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === m ? `${S.gradBtn} text-white shadow-lg` : pick(isDark, `${S.dTextSec} hover:text-white`, `${S.lTextSec} hover:${S.lText}`)}`}>{m === 'login' ? 'Вход' : 'Регистрация'}</button>))}
              </div>
              {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={errBox(isDark)}><span className="text-sm text-red-400">{error}</span></motion.div>}
              <div className="space-y-4">
                {mode === 'register' && <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Имя" className={ic} />}
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={ic} />
                <div className="relative"><input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); }} placeholder="Пароль" className={`${ic} pr-12`} />
                  <button onClick={() => setShowPw(!showPw)} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${pick(isDark, `${S.dTextMuted} hover:text-zinc-400`, `${S.lTextMuted} hover:text-zinc-600`)}`}>{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                <div className="flex justify-center py-2"><Turnstile siteKey={TURNSTILE_SITE_KEY} onSuccess={t => setTurnstileToken(t)} onError={() => setTurnstileToken('')} onExpire={() => setTurnstileToken('')} options={{ theme: isDark ? 'dark' : 'light', size: 'flexible' }} /></div>
                <motion.button disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={submit}
                  className={`w-full h-12 rounded-xl ${S.gradBtn} text-white font-medium text-sm ${S.gradBtnShadow} transition-all disabled:opacity-50 flex items-center justify-center gap-2`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Продолжить'}
                </motion.button>
              </div>
            </motion.div>
          )}
          {step === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-5 ${importantBox(isDark).replace('px-4 py-3 rounded-xl ', '')}`}>
                <Shield className={`w-5 h-5 flex-shrink-0 ${pick(isDark, S.dAccent, S.lAccent)}`} /><p className={`text-xs ${pick(isDark, 'text-violet-300', 'text-violet-700')}`}>Код → <span className="font-semibold">{email}</span></p>
              </div>
              {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={errBox(isDark)}><span className="text-sm text-red-400">{error}</span></motion.div>}
              <div className="mb-6"><CodeInput code={code} setCode={setCode} isDark={isDark} /></div>
              <motion.button disabled={isLoading || code.length !== 6} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={verify}
                className={`w-full h-12 rounded-xl ${S.gradBtn} text-white font-medium text-sm ${S.gradBtnShadow} transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4`}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : pending === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </motion.button>
              <div className="flex items-center justify-between">
                <button onClick={() => { setStep('form'); setCode(''); setError(''); }}
                  className={`text-sm transition-colors ${pick(isDark, `${S.dTextMuted} hover:${S.dTextSec}`, `${S.lTextMuted} hover:${S.lTextSec}`)}`}>← Назад</button>
                <button onClick={resend} disabled={countdown > 0 || isLoading}
                  className={`text-sm transition-colors ${countdown > 0 ? pick(isDark, `${S.dTextDim} cursor-not-allowed`, `${S.lTextMuted} cursor-not-allowed`) : `${pick(isDark, S.dAccent, S.lAccent)} hover:opacity-80`}`}>
                  {countdown > 0 ? `${countdown}с` : 'Ещё раз'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
