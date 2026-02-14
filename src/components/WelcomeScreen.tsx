import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

const GREETING_TEXTS = [
  "С чего сегодня начнём?", "Какой запрос будет первым?", "Что тебя интересует?",
  "Чем могу помочь?", "Готов к работе. Что делаем?", "Жду твой запрос...",
  "О чём поговорим?", "Какую задачу решаем?", "Давай создадим что-то крутое",
  "Новый день — новые идеи", "Спрашивай, не стесняйся", "Я весь во внимании",
  "Начнём творить?", "Что нового придумаем?", "Какие планы на сегодня?",
  "Давай разберёмся вместе", "Готов помочь с чем угодно", "Задавай любой вопрос",
  "Время продуктивной работы", "Погнали кодить?", "Какой проект делаем?",
  "Расскажи, что на уме", "Что будем строить?", "Идеи уже ждут реализации",
];

export function WelcomeScreen() {
  const [text, setText] = useState('');
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    const now = Date.now();
    const key = `moseek_greeting_${Math.floor(now / 3600000)}`;
    const saved = localStorage.getItem('moseek_greeting_key');
    if (saved === key) { const t = localStorage.getItem('moseek_greeting_text'); if (t) { setText(t); return; } }
    const idx = Math.floor(Math.random() * GREETING_TEXTS.length);
    const newText = GREETING_TEXTS[idx];
    localStorage.setItem('moseek_greeting_key', key);
    localStorage.setItem('moseek_greeting_text', newText);
    setText(newText);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center px-6"
      style={{ minHeight: 'calc(100vh - 250px)' }}
    >
      {/* Decorative orb behind text */}
      <div className="relative">
        <div
          className="absolute -inset-20 pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 60%)'
              : 'radial-gradient(circle, rgba(37, 99, 235, 0.04) 0%, transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`relative text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-tight ${
            isDark ? 'text-white' : 'text-black'
          }`}
        >
          {text}
        </motion.h1>
      </div>

      {/* Subtle hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={`text-[13px] mt-6 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}
      >
        Напиши что-нибудь, чтобы начать ↓
      </motion.p>
    </motion.div>
  );
}
