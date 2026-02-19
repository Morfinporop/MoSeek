import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useChatStore } from '../store/chatStore';
import { OPENROUTER_API_URL, DEFAULT_MODEL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

const CACHE_KEY = 'mogpt_welcome';
const CACHE_DURATION = 20 * 60 * 1000;

interface CachedGreeting {
  text: string;
  rudeness: string;
  timestamp: number;
}

function getCached(rudeness: string): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c: CachedGreeting = JSON.parse(raw);
    if (c.rudeness !== rudeness) return null;
    if (Date.now() - c.timestamp > CACHE_DURATION) return null;
    return c.text;
  } catch {
    return null;
  }
}

function setCache(text: string, rudeness: string): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ text, rudeness, timestamp: Date.now() }));
  } catch {}
}

function cleanGreeting(text: string): string {
  let c = text.trim();
  c = c.replace(/<think>[\s\S]*?<\/think>/gi, '');
  c = c.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  c = c.replace(/^["«»"'`\s]+|["«»"'`\s]+$/g, '');
  c = c.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '');
  c = c.replace(/\s{2,}/g, ' ').trim();
  if (c.includes('\n')) c = c.split('\n').filter(l => l.trim().length > 0)[0]?.trim() || '';
  c = c.replace(/^(Приветствие|Greeting|Фраза|Ответ)\s*[:—\-]\s*/i, '');
  c = c.replace(/^[-—:\s]+/, '').trim();
  if (c.endsWith(':')) c = c.slice(0, -1).trim();
  return c;
}

function makeRandomSeed(): string {
  const words = ['альфа','бета','гамма','дельта','сигма','омега','зенит','пульс','вектор','квант','нова','призма','спектр','импульс','фокус'];
  return words[Math.floor(Math.random() * words.length)] + '-' + Math.floor(Math.random() * 9999);
}

async function generateGreeting(rudeness: string): Promise<string> {
  const hour = new Date().getHours();
  let time = 'день';
  if (hour >= 5 && hour < 12) time = 'утро';
  else if (hour >= 12 && hour < 17) time = 'день';
  else if (hour >= 17 && hour < 22) time = 'вечер';
  else time = 'ночь';

  const seed = makeRandomSeed();

  const toneMap: Record<string, string> = {
    polite: `Время суток: ${time}. Seed: ${seed}. Придумай ОДНУ уникальную короткую фразу (3-7 слов) — приветствие пользователя в AI-чате. Вежливо, уверенно, с характером. Ответь ТОЛЬКО фразой. Без кавычек, пояснений, эмодзи.`,
    rude: `Время суток: ${time}. Seed: ${seed}. Придумай ОДНУ уникальную короткую дерзкую фразу (3-7 слов) — приветствие в AI-чате. Нагло, развязно, с подъёбкой. Ответь ТОЛЬКО фразой. Без кавычек, пояснений, эмодзи.`,
    very_rude: `Время суток: ${time}. Seed: ${seed}. Придумай ОДНУ уникальную короткую грубую фразу (3-7 слов) — приветствие в AI-чате. Агрессивно, с лёгким матом. Ответь ТОЛЬКО фразой. Без кавычек, пояснений, эмодзи.`,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_k()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MoGPT',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: toneMap[rudeness] || toneMap.rude }],
        max_tokens: 30,
        temperature: 1.2,
        seed: Math.floor(Math.random() * 100000),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) throw new Error(`${res.status}`);

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('empty');

    const cleaned = cleanGreeting(content);
    if (cleaned.length < 2) {
      const raw = content.trim().split('\n')[0].replace(/^["«»"'`]+|["«»"'`]+$/g, '').trim();
      if (raw.length >= 2) return raw;
      throw new Error('bad');
    }
    return cleaned;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

function instantGreeting(rudeness: string): string {
  const hour = new Date().getHours();
  const isNight = hour < 5 || hour >= 23;
  const isMorning = hour >= 5 && hour < 12;
  const isEvening = hour >= 17 && hour < 23;

  const pool: Record<string, string[][]> = {
    polite: [
      ['Чем помочь?', 'Что делаем сегодня?', 'Готов к работе.', 'Какой план?', 'Слушаю тебя.'],
      isMorning ? ['Доброе утро! Что делаем?', 'Утро — время продуктивности.'] : [],
      isEvening ? ['Добрый вечер. Чем помочь?', 'Вечерняя сессия?'] : [],
      isNight ? ['Поздновато, но я тут.', 'Ночной режим активен.'] : [],
    ],
    rude: [
      ['Ну давай, излагай.', 'Чё надо?', 'Погнали.', 'Не тупи, пиши.', 'Жду.', 'Выкладывай.'],
      isMorning ? ['Ранняя пташка, ну давай.', 'Продрал глаза? Излагай.'] : [],
      isEvening ? ['Вечерний залёт? Давай.', 'Ну чё, вечерком поработаем?'] : [],
      isNight ? ['Полуночник? Ладно, давай.', 'Не спится? Излагай.'] : [],
    ],
    very_rude: [
      ['Чё вылупился? Пиши.', 'Ну блять, давай.', 'Шевелись.', 'Хватит пялиться.', 'Ну?'],
      isMorning ? ['Какого хрена так рано?', 'Ебать, жаворонок нашёлся.'] : [],
      isEvening ? ['Припёрся на ночь глядя.', 'Вечерний дебил? Давай.'] : [],
      isNight ? ['Какого хера не спишь?', 'Блять, иди спи. Ладно, давай.'] : [],
    ],
  };

  const all = (pool[rudeness] || pool.rude).flat().filter(Boolean);
  return all[Math.floor(Math.random() * all.length)];
}

export function WelcomeScreen() {
  const [text, setText] = useState('');
  const { theme } = useThemeStore();
  const { rudenessMode } = useChatStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    let cancelled = false;

    const cached = getCached(rudenessMode);
    if (cached) {
      setText(cached);
      return;
    }

    const instant = instantGreeting(rudenessMode);
    setText(instant);

    generateGreeting(rudenessMode)
      .then((generated) => {
        if (cancelled) return;
        setText(generated);
        setCache(generated, rudenessMode);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [rudenessMode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center"
      style={{ minHeight: 'calc(100vh - 250px)' }}
    >
      <motion.h1
        key={text}
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`text-3xl md:text-4xl lg:text-5xl font-bold text-center px-4 ${
          isDark ? 'text-amber-50' : 'text-amber-900'
        }`}
        style={{
          textShadow: isDark
            ? '0 0 40px rgba(180, 130, 70, 0.3), 0 0 80px rgba(180, 130, 70, 0.1)'
            : '0 2px 10px rgba(0, 0, 0, 0.08)',
        }}
      >
        {text}
      </motion.h1>
    </motion.div>
  );
}
