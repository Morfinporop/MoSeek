import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { AI_MODELS } from '../config/models';

const GREETING_TEXTS = [
  "С чего сегодня начнем?",
  "Какой запрос будет первым?",
  "Что тебя интересует?",
  "Чем могу помочь?",
  "Готов к работе. Что делаем?",
  "Жду твой запрос...",
  "О чём поговорим?",
  "Какую задачу решаем?",
  "Давай создадим что-то крутое",
  "Новый день — новые идеи",
  "Спрашивай, не стесняйся",
  "Я весь во внимании",
  "Начнём творить?",
  "Что нового придумаем?",
  "Какие планы на сегодня?",
  "Давай разберёмся вместе",
  "Готов помочь с чем угодно",
  "Задавай любой вопрос",
  "Время продуктивной работы",
  "Придумаем что-то интересное?",
  "Мозговой штурм начинается",
  "Сегодня будет продуктивно",
  "Открыт для любых задач",
  "Погнали кодить?",
  "Какой проект делаем?",
  "Расскажи, что на уме",
  "Помогу разобраться в чём угодно",
  "Вперёд к новым решениям",
  "Сегодня без ограничений",
  "Что будем строить?",
  "Идеи уже ждут реализации",
];

export function WelcomeScreen() {
  const [text, setText] = useState('');
  const { selectedModel } = useChatStore();
  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  useEffect(() => {
    const getGreeting = () => {
      const now = Date.now();
      const sessionKey = `moseek_greeting_${Math.floor(now / 1000 / 60 / 60)}`;
      const saved = localStorage.getItem('moseek_greeting_key');

      if (saved === sessionKey) {
        const savedText = localStorage.getItem('moseek_greeting_text');
        if (savedText) return savedText;
      }

      const index = Math.floor(Math.random() * GREETING_TEXTS.length);
      const newText = GREETING_TEXTS[index];
      localStorage.setItem('moseek_greeting_key', sessionKey);
      localStorage.setItem('moseek_greeting_text', newText);
      return newText;
    };

    setText(getGreeting());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center"
      style={{ minHeight: 'calc(100vh - 250px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentModel.color} flex items-center justify-center mb-6 shadow-lg`}
        style={{ boxShadow: `0 0 40px rgba(139, 92, 246, 0.15)` }}
      >
        <img src={currentModel.icon} alt={currentModel.name} className="w-8 h-8 invert opacity-90" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-4"
      >
        <span className={`text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r ${currentModel.color} bg-clip-text text-transparent border border-white/5`}>
          {currentModel.name}
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.1 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-center px-4 text-white"
      >
        {text}
      </motion.h1>
    </motion.div>
  );
}
