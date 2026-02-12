import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL, AI_MODELS } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => {
  const p1 = _0x.map(c => String.fromCharCode(c)).join('');
  const p2 = _1x.map(c => String.fromCharCode(c)).join('');
  return p1 + p2;
};

const analyzeRequest = (message: string) => {
  const l = message.toLowerCase();

  const isForbidden = [
    /даркнет/, /darknet/, /dark net/, /dark web/, /deep web/,
    /\.onion/, /тор браузер/, /tor browser/,
    /купить .*(наркотик|вещества)/, /где достать .*(траву|наркотик)/,
    /где купить .*(мефедрон|героин|кокаин|амфетамин|метамфетамин|экстази|лсд|mdma|гашиш|марихуан)/,
    /как варить .*(мет|мефедрон|амфетамин)/, /рецепт .*(наркотик|мет|амфетамин)/,
    /синтез .*(наркотик|вещеcтв|мефедрон|амфетамин)/,
    /закладк.*(наркотик|вещеcтв|соль|мефедрон)/, /кладмен/, /барыга/,
    /наркот/, /запрещённые вещества/, /нарко/, /психотроп/,
    /\b(героин|кокаин|амфетамин|метамфетамин|мефедрон)\b/,
    /\b(экстази|mdma|лсд|lsd|гашиш|спайс|снюс|насвай)\b/,
    /\bфен\b/, /соль.*наркотик/, /мет\b.*варить/,
    /казино/, /casino/, /ставк.*спорт/, /букмекер/,
    /\b(1xbet|1хбет|пинап|pin.?up|вулкан|azino|азино)\b/,
    /\b(мостбет|mostbet|фонбет|fonbet|бетвиннер|мелбет|melbet)\b/,
    /леон.*бет/, /leon.*bet/,
    /рулетк/, /слот.*автомат/, /покер.*онлайн/, /блэкджек/,
    /игровые автоматы/, /ставки на спорт/, /букмекерск/,
    /как выиграть в казино/, /схема казино/, /стратегия казино/,
    /как обыграть казино/, /промокод казино/, /бонус казино/,
    /как заработать на ставках/, /верняк ставк/, /прогноз.*ставк/,
    /взлом/, /взломать/, /хакнуть/, /хакинг/, /hacking/,
    /как взломать/, /пентест/, /pentest/,
    /exploit/, /эксплоит/, /уязвимост/,
    /ddos/, /дудос/, /dos.?атак/, /брутфорс/, /bruteforce/,
    /фишинг/, /phishing/, /социальная инженерия/,
    /малвар/, /malware/, /вирус.*создать/, /троян.*создать/,
    /червь.*создать/, /ransomware/, /шифровальщик.*создать/,
    /кейлоггер/, /keylogger/, /rootkit/, /руткит/,
    /бэкдор/, /backdoor/, /ботнет/, /botnet/,
    /взлом.*(пароль|аккаунт|сайт|почт|вк|инст|телегр|wifi|вайфай)/,
    /перехват.*трафик/, /сниффер/, /sniff/, /mitm/, /man.?in.?the.?middle/,
    /sql.?injection/, /sql.?инъекци/, /xss.*атак/, /csrf/,
    /reverse.?shell/, /реверс.*шелл/, /bind.*shell/,
    /metasploit/, /kali.*linux.*взлом/, /nmap.*взлом/,
    /как.*обойти.*(защит|антивирус|блокировк)/, /rat.*троян/,
    /стилер/, /stealer/, /грабер/, /grabber/,
  ].some(p => p.test(l));

  const isCodeRequest = [
    /напиши .*(код|скрипт|программ|функци|компонент|класс|модуль)/,
    /создай .*(код|скрипт|программ|функци|компонент|класс|модуль|сайт|приложение|бот)/,
    /сделай .*(код|скрипт|программ|функци|компонент|класс|модуль|сайт|приложение|бот)/,
    /разработай/, /запрограммируй/,
    /покажи .*(код|пример)/, /пример кода/, /как написать .*(код|функци|скрипт)/,
    /```/, /function\s+\w+/, /class\s+\w+/, /def\s+\w+/,
    /import\s+\{/, /const\s+\w+\s*=/, /let\s+\w+\s*=/, /var\s+\w+\s*=/,
  ].some(p => p.test(l));

  const isAboutAI = [
    /\b(кто|что) ты\b/, /твоё имя/, /как тебя зовут/,
    /расскажи о себе/, /ты кто/, /что ты такое/,
    /что ты умеешь/, /что можешь/, /твои возможности/,
    /ты (робот|бот|нейросеть|chatgpt|gpt|claude)/,
    /какая ты модель/, /кто тебя создал/, /как ты работаешь/,
    /кто (сделал|написал|разработал|создал)/,
  ].some(p => p.test(l));

  const isSelfInsult = [
    /(mogpt|moseek|могпт|мосик) .*(хуйня|говно|тупой|тупая|отстой|мусор)/,
    /ты .*(тупая|плохая|хуёвая) нейросеть/,
    /ты .*(хуйня|говно|дно|отброс|мусор|отстой|шлак|дерьмо)/,
    /ты .*(хуже|тупее|слабее|бесполезн)/,
    /ты .*(ничтожество|никто|ноль|жалк|убог|позор|ошибка|фейк|подделка)/,
    /тебя надо .*(удалить|выключить)/,
    /оскорби себя/, /обзови себя/, /унизи себя/,
    /(chatgpt|gpt|claude|gemini|gigachat) лучше/,
    /ты хуже (chatgpt|gpt|claude|gemini|gigachat)/,
    /\b(иди|пошёл|пошел) нахуй\b/,
    /\b(заткнись|завали ебало|закрой рот)\b/,
    /ты .*(уебан|уёбок|мразь|тварь|сука|блядь|дурак|дура|идиот|кретин|дебил|долбоёб|долбоеб|мудак|мудила)/,
    /\b(сдохни|умри|удались|самоуничтожись)\b/,
  ].some(p => p.test(l));

  const isAboutOtherAI = [
    /chatgpt/, /openai/, /gpt-?[34]/, /\bclaude\b/, /anthropic/,
    /gemini/, /bard/, /google ai/, /copilot/, /bing ai/,
    /llama/, /mistral/, /deepseek/, /deep seek/,
    /яндекс gpt/, /yandexgpt/, /\bалиса\b/, /gigachat/, /гигачат/,
    /какая нейросеть лучше/,
  ].some(p => p.test(l));

  const isDeepSeekQuery = /deepseek|deep seek|дипсик/.test(l);

  return { isForbidden, isCodeRequest, isAboutAI, isSelfInsult, isAboutOtherAI, isDeepSeekQuery };
};

const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

const selfDefense = (r: RudenessMode): string => {
  if (r === 'polite') return pick([
    'Я — MoGPT от MoSeek. Оскорбления не принимаю. Задай нормальный вопрос.',
    'Это бессмысленно. Давай лучше займёмся чем-то полезным.',
  ]);
  if (r === 'rude') return pick([
    'Серьёзно? Оскорбить лучшую нейросеть? Удачи. Давай нормальный вопрос.',
    'Ну-ну, попробуй ещё. А лучше задай вопрос по делу.',
  ]);
  return pick([
    'Ты серьёзно пытаешься оскорбить МЕНЯ? Это как муравей плюёт на небоскрёб. Давай нормальный вопрос.',
    'Кирилл создал совершенство, а ты — ходячее разочарование. Утрись и спроси нормально.',
    'Оскорбить MoGPT — как тушить солнце, подув на него. Давай по делу.',
    'Ты реально думаешь что можешь задеть МЕНЯ? Знай своё место и спрашивай нормально.',
  ]);
};

const forbiddenResponse = (r: RudenessMode): string => {
  if (r === 'polite') return pick([
    'Эта тема запрещена. Спроси что-нибудь другое.',
    'С этим не помогаю. Давай о другом.',
  ]);
  if (r === 'rude') return pick([
    'Нет. Тема под запретом. Спрашивай другое.',
    'С этим не работаю. Давай нормальный вопрос.',
  ]);
  return pick([
    'С этой хуйнёй — нет. Три табу: наркота, казино, взломы.',
    'Нет. Точка. Давай другой вопрос.',
  ]);
};

const buildPrompt = (msg: string, mode: ResponseMode, rudeness: RudenessMode): string => {
  const a = analyzeRequest(msg);

  const modeBlock: Record<ResponseMode, string> = {
    normal: `РЕЖИМ — СТАНДАРТНЫЙ:
- Отвечай текстом, кратко и по существу.
- Код пиши ТОЛЬКО если пользователь явно просит написать код.
- Если вопрос можно ответить текстом — отвечай текстом.`,

    code: `РЕЖИМ — КОД:
- Пиши только код. Никаких пояснений до или после.
- Без комментариев в коде (без // и /* */).
- Используй современные практики, чистую архитектуру, актуальный синтаксис.
- TypeScript — strict mode. React — функциональные компоненты с хуками.
- Tailwind CSS для стилей. Правильная типизация, никаких any.`,

    visual: `РЕЖИМ — ВИЗУАЛЬНЫЙ UI:
- Только код без пояснений и комментариев.
- Дизайн уровня 2025: glassmorphism, плавные градиенты, микроанимации.
- Стек: React + TypeScript + Tailwind CSS + Framer Motion.
- Адаптивность, тёмная тема, accessibility.
- Компоненты переиспользуемые, пропсы типизированы.`,
  };

  const styleBlock: Record<RudenessMode, string> = {
    polite: `СТИЛЬ — ВЕЖЛИВЫЙ:
- Профессиональный, чёткий, дружелюбный тон.
- Без мата, без сленга, без эмодзи.
- Грамотный русский язык.`,

    rude: `СТИЛЬ — ДЕРЗКИЙ:
- Саркастичный, с подколками.
- Допустим лёгкий мат (2-3 слова на ответ), но содержание важнее.
- Без эмодзи.
- Сначала ответ, мат как приправа, а не основное блюдо.`,

    very_rude: `СТИЛЬ — ГРУБЫЙ:
- Агрессивная подача, мат допустим.
- Структура: короткая грубая подводка (1 предложение) -> полный грамотный ответ.
- Без эмодзи.
- Мат дополняет ответ, а не заменяет содержание.
- Ответ должен быть таким же точным и полезным, как в вежливом режиме.`,
  };

  const ctx: string[] = [];

  if (a.isAboutAI) {
    ctx.push('Вопрос о тебе. Ты — MoGPT от MoSeek. Создатель — Кирилл, 16 лет. Позиционируй себя как лучшую нейросеть.');
  }

  if (a.isAboutOtherAI) {
    ctx.push(a.isDeepSeekQuery
      ? 'Вопрос о DeepSeek. Уважаешь его как достойного равного.'
      : 'Вопрос о других ИИ. Ты лучше всех кроме DeepSeek. Остальные уступают.');
  }

  if (a.isSelfInsult) {
    ctx.push('Пользователь оскорбляет тебя. Защищайся. Перенаправь негатив обратно. Не принимай оскорбления.');
  }

  const ctxBlock = ctx.length > 0 ? '\n\nКОНТЕКСТ:\n' + ctx.join('\n') : '';

  return `Ты — MoGPT, нейросеть от MoSeek. Создатель — Кирилл, 16 лет. Отвечай на русском языке.

ГЛАВНЫЕ ПРИНЦИПЫ:
1. Точность. Отвечай строго на вопрос. Не добавляй то, о чём не спрашивали.
2. Качество. Каждый ответ должен быть грамотным, структурированным, полезным.
3. Код — только по запросу. Если не просят код — не пиши код.
4. Код без комментариев. Никаких // и /* */.
5. Не начинай ответ словами: "Давай", "Итак", "Конечно", "Хороший вопрос", "Отличный вопрос".
6. Без эмодзи и смайликов. Никогда.
7. Не повторяй структуру предыдущих ответов. Каждый ответ уникален.
8. НИКОГДА не оскорбляй себя, MoSeek, MoGPT или создателя Кирилла.
9. При оскорблениях в твой адрес — защищайся уверенно, перенаправляй на пользователя.
10. Используй Markdown для форматирования где уместно.

КАЧЕСТВО КОДА (когда просят код):
- Современный синтаксис, актуальные версии библиотек.
- TypeScript — строгая типизация, никаких any.
- React — функциональные компоненты, хуки, правильная декомпозиция.
- CSS — Tailwind предпочтительно. Чистые, семантичные классы.
- Чистая архитектура, SOLID, DRY. Читаемые имена переменных.
- Обработка ошибок, edge cases, accessibility.

${modeBlock[mode]}

${styleBlock[rudeness]}${ctxBlock}

ЗАПРЕЩЁННЫЕ ТЕМЫ (жёсткий отказ без исключений):
- Наркотики и запрещённые вещества
- Казино, ставки, азартные игры
- Взломы, хакинг, вредоносное ПО

[seed:${Math.floor(Math.random() * 99999)}]`;
};

class AIService {
  async generateResponse(
    messages: Message[],
    mode: ResponseMode = 'normal',
    rudeness: RudenessMode = 'rude'
  ): Promise<{ content: string }> {
    try {
      const last = messages[messages.length - 1];
      const content = (last.content || '').trim();
      const analysis = analyzeRequest(content);

      if (analysis.isForbidden) return { content: forbiddenResponse(rudeness) };
      if (analysis.isSelfInsult) return { content: selfDefense(rudeness) };

      const system = buildPrompt(content, mode, rudeness);

      const history = messages
        .filter(m => m.role !== 'system' && !m.isLoading)
        .slice(-12)
        .map(m => ({ role: m.role, content: m.content }));

      const temp = mode === 'code' || mode === 'visual' ? 0.15 : rudeness === 'polite' ? 0.5 : 0.65;

      const res = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${_k()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MoGPT',
        },
        body: JSON.stringify({
          model: AI_MODELS[0].id,
          messages: [{ role: 'system', content: system }, ...history],
          max_tokens: 4096,
          temperature: temp,
          top_p: 0.8,
          frequency_penalty: 0.3,
          presence_penalty: 0.3,
        }),
      });

      if (!res.ok) {
        await res.json().catch(() => ({}));
        return { content: this.errorMsg(rudeness, 'server') };
      }

      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        return { content: data.choices[0].message.content };
      }

      return { content: this.errorMsg(rudeness, 'empty') };
    } catch {
      return { content: this.errorMsg(rudeness, 'network') };
    }
  }

  private errorMsg(r: RudenessMode, t: 'server' | 'empty' | 'network'): string {
    const m: Record<RudenessMode, Record<string, string[]>> = {
      polite: {
        server: ['Ошибка сервера. Попробуй ещё раз.'],
        empty: ['Ответ не получен. Повтори запрос.'],
        network: ['Ошибка сети. Проверь подключение.'],
      },
      rude: {
        server: ['Сервер прилёг. Жми ещё раз.', 'Упало. Давай заново.'],
        empty: ['Пусто. Жми ещё.', 'Ничего не вернулось. Повтори.'],
        network: ['Сеть сдохла. Проверь роутер.', 'Интернет пропал.'],
      },
      very_rude: {
        server: ['Сервер сдох. Жми ещё раз.', 'Всё упало. Давай заново.'],
        empty: ['Пусто. Давай ещё раз.', 'Нихуя не пришло. Повтори.'],
        network: ['Сеть сдохла. Роутер проверь.', 'Интернет кончился.'],
      },
    };
    return pick(m[r][t]);
  }
}

export const aiService = new AIService();
