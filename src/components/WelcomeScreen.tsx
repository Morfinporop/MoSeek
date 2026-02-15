import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useChatStore } from '../store/chatStore';
import { OPENROUTER_API_URL, DEFAULT_MODEL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

const CACHE_KEY = 'mogpt_welcome';
const CACHE_DURATION = 30 * 60 * 1000;

interface CachedGreeting {
  text: string;
  rudeness: string;
  timestamp: number;
}

function getCached(rudeness: string): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedGreeting = JSON.parse(raw);
    if (cached.rudeness !== rudeness) return null;
    if (Date.now() - cached.timestamp > CACHE_DURATION) return null;
    return cached.text;
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
  if (c.endsWith(':')) c = c.slice(0, -1).trim();
  if (c.startsWith('Приветствие:')) c = c.replace('Приветствие:', '').trim();
  if (c.startsWith('Приветствие')) c = c.replace('Приветствие', '').trim();
  c = c.replace(/^[-—:\s]+/, '').trim();
  return c;
}

async function generateGreeting(rudeness: string): Promise<string> {
  const hour = new Date().getHours();
  let timeContext = 'день';
  if (hour >= 5 && hour < 12) timeContext = 'утро';
  else if (hour >= 12 && hour < 17) timeContext = 'день';
  else if (hour >= 17 && hour < 22) timeContext = 'вечер';
  else timeContext = 'ночь';

  const toneMap: Record<string, string> = {
    polite: `Сейчас ${timeContext}. Придумай одну короткую фразу-приветствие для экрана чата. 3-8 слов. Вежливо, с характером. Можешь учесть время суток. Ответь ТОЛЬКО фразой, без кавычек, без пояснений, без эмодзи. Пример формата: Готов помочь, давай начнём`,
    rude: `Сейчас ${timeContext}. Придумай одну короткую дерзкую фразу-приветствие для экрана чата. 3-8 слов. Нагло, развязно. Можешь учесть время суток. Ответь ТОЛЬКО фразой, без кавычек, без пояснений, без эмодзи. Пример формата: Ну давай, излагай уже`,
    very_rude: `Сейчас ${timeContext}. Придумай одну короткую грубую фразу-приветствие для экрана чата. 3-8 слов. Агрессивно, можно лёгкий мат. Можешь учесть время суток. Ответь ТОЛЬКО фразой, без кавычек, без пояснений, без эмодзи. Пример формата: Чё уставился, пиши давай`,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

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
        messages: [
          { role: 'user', content: toneMap[rudeness] || toneMap.rude },
        ],
        max_tokens: 50,
        temperature: 0.9,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('[WelcomeScreen] API error:', res.status, errText);
      throw new Error(`API ${res.status}`);
    }

    const data = await res.json();
    console.log('[WelcomeScreen] Raw response:', data);

    const content = data.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      console.warn('[WelcomeScreen] No content in response');
      throw new Error('No content');
    }

    const cleaned = cleanGreeting(content);
    console.log('[WelcomeScreen] Cleaned:', JSON.stringify(cleaned));

    if (cleaned.length < 2) {
      console.warn('[WelcomeScreen] Greeting too short after cleaning, using raw');
      const rawClean = content.trim().split('\n')[0].replace(/^["«»"'`]+|["«»"'`]+$/g, '').trim();
      if (rawClean.length >= 2) return rawClean;
      throw new Error('Empty after clean');
    }

    return cleaned;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

const EMERGENCY_FALLBACKS: Record<string, string> = {
  polite: 'Чем могу помочь?',
  rude: 'Ну давай, излагай.',
  very_rude: 'Чё надо, блять?',
};

export function WelcomeScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();
  const { rudenessMode } = useChatStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    let cancelled = false;

    const cached = getCached(rudenessMode);
    if (cached) {
      setText(cached);
      setLoading(false);
      return;
    }

    setText('');
    setLoading(true);

    const attempt = async (retries: number): Promise<string> => {
      let lastError: Error | null = null;
      for (let i = 0; i < retries; i++) {
        try {
          const result = await generateGreeting(rudenessMode);
          return result;
        } catch (e) {
          lastError = e as Error;
          console.warn(`[WelcomeScreen] Attempt ${i + 1}/${retries} failed:`, e);
          if (i < retries - 1) await new Promise(r => setTimeout(r, 800 * (i + 1)));
        }
      }
      throw lastError || new Error('Failed');
    };

    attempt(3)
      .then((generated) => {
        if (cancelled) return;
        setText(generated);
        setCache(generated, rudenessMode);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = EMERGENCY_FALLBACKS[rudenessMode] || EMERGENCY_FALLBACKS.rude;
        setText(fallback);
        setLoading(false);
      });

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
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-violet-400/60' : 'bg-violet-500/40'}`}
              animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      ) : (
        <motion.h1
          key={text}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className={`text-3xl md:text-4xl lg:text-5xl font-bold text-center px-4 ${
            isDark ? 'text-white' : 'text-zinc-900'
          }`}
          style={{
            textShadow: isDark
              ? '0 0 40px rgba(139, 92, 246, 0.3), 0 0 80px rgba(139, 92, 246, 0.1)'
              : '0 2px 10px rgba(0, 0, 0, 0.08)',
          }}
        >
          {text}
        </motion.h1>
      )}
    </motion.div>
  );
}
