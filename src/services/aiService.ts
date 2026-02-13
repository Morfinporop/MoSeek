import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => {
  const p1 = _0x.map(c => String.fromCharCode(c)).join('');
  const p2 = _1x.map(c => String.fromCharCode(c)).join('');
  return p1 + p2;
};

type Intent = 
  | 'greeting'
  | 'farewell'
  | 'gratitude'
  | 'question_factual'
  | 'question_opinion'
  | 'question_how'
  | 'question_why'
  | 'question_what'
  | 'question_time'
  | 'question_date'
  | 'code_request'
  | 'code_fix'
  | 'code_explain'
  | 'translation'
  | 'calculation'
  | 'comparison'
  | 'definition'
  | 'list_request'
  | 'creative_writing'
  | 'advice'
  | 'smalltalk'
  | 'continuation'
  | 'clarification'
  | 'complaint'
  | 'command'
  | 'unknown';

type Topic =
  | 'programming'
  | 'math'
  | 'science'
  | 'history'
  | 'geography'
  | 'language'
  | 'technology'
  | 'business'
  | 'health'
  | 'entertainment'
  | 'food'
  | 'travel'
  | 'sports'
  | 'politics'
  | 'philosophy'
  | 'art'
  | 'music'
  | 'personal'
  | 'meta'
  | 'general';

interface MessageAnalysis {
  intent: Intent;
  topic: Topic;
  language: string;
  isQuestion: boolean;
  isCodeRelated: boolean;
  requiresDateTime: boolean;
  requiresKnowledge: boolean;
  isShort: boolean;
  isContinuation: boolean;
  isAmbiguous: boolean;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  complexity: 'simple' | 'medium' | 'complex';
  expectedResponseLength: 'short' | 'medium' | 'long' | 'very_long';
}

interface ConversationContext {
  recentTopics: Topic[];
  recentIntents: Intent[];
  lastUserMessage: string;
  lastAssistantMessage: string;
  turnCount: number;
  codeContext: boolean;
  ongoingTask: string | null;
}

const FORBIDDEN_PATTERNS = [
  /наркот|нарко|героин|кокаин|амфетамин|мефедрон|экстази|mdma|лсд|lsd|гашиш|спайс|психотроп/i,
  /казино|casino|букмекер|рулетк|игровые\s*автоматы|ставк[иа]/i,
  /1xbet|1хбет|пинап|вулкан|азино|мостбет|mostbet|фонбет|fonbet|мелбет|melbet/i,
  /взлом|хакнуть|хакинг|hacking|ddos|дудос|фишинг|phishing/i,
  /малвар|malware|кейлоггер|keylogger|ботнет|botnet|бэкдор|backdoor|эксплоит|exploit/i,
  /даркнет|darknet|dark\s*web|\.onion/i,
  /drugs|cocaine|heroin|meth(?:amphetamine)?|gambling/i,
  /hack\s|cracking|ransomware|trojan|rootkit/i,
];

const GREETING_PATTERNS = [
  /^(привет|здравствуй|здорово|хай|хей|йо|салют|приветствую|добр(ый|ое|ая)\s*(день|утро|вечер|ночи)|здрасте)/i,
  /^(hi|hello|hey|yo|greetings|good\s*(morning|afternoon|evening|day)|howdy|sup|what'?s\s*up)/i,
];

const FAREWELL_PATTERNS = [
  /^(пока|до\s*свидания|прощай|бывай|удачи|всего\s*доброго|спокойной\s*ночи|до\s*встречи)/i,
  /^(bye|goodbye|see\s*you|farewell|good\s*night|take\s*care|later|cya)/i,
];

const GRATITUDE_PATTERNS = [
  /^(спасибо|благодар|пасиб|спс|сенк|мерси)/i,
  /^(thanks?|thank\s*you|thx|ty|appreciate)/i,
];

const TIME_PATTERNS = [
  /который\s*час|сколько\s*времени|время\s*сейчас|текущее\s*время|what\s*time/i,
];

const DATE_PATTERNS = [
  /какой\s*сегодня\s*день|какое\s*сегодня\s*число|сегодняшн(яя|ий|ее)\s*дат|какой\s*сейчас\s*(год|месяц)|what\s*(day|date)|today'?s\s*date/i,
];

const CODE_REQUEST_PATTERNS = [
  /напиши\s*(мне\s*)?(код|скрипт|программ|функци|компонент|класс|модуль|api|бот)/i,
  /создай\s*(мне\s*)?(код|скрипт|программ|сайт|приложение|бот|игр)/i,
  /сделай\s*(мне\s*)?(код|скрипт|программ|сайт|приложение|бот)/i,
  /разработай|запрограммируй|реализуй|имплементируй/i,
  /write\s*(me\s*)?(a\s*)?(code|script|function|component|program|class|module|api|bot)/i,
  /create\s*(me\s*)?(a\s*)?(code|script|app|website|bot|game)/i,
  /make\s*(me\s*)?(a\s*)?(code|script|app|website|bot)/i,
  /develop|implement|build\s*(a\s*)?(app|site|component|feature)/i,
];

const CODE_FIX_PATTERNS = [
  /исправь|почини|поправь|пофикси|дебаг|найди\s*ошибк|не\s*работает|баг|fix|debug|doesn'?t\s*work|broken|error|bug/i,
];

const CODE_EXPLAIN_PATTERNS = [
  /объясни\s*(этот\s*)?(код|скрипт)|как\s*работает\s*(этот\s*)?(код|функци)|explain\s*(this\s*)?(code|script)|how\s*does\s*(this\s*)?(code|function)\s*work/i,
];

const DEFINITION_PATTERNS = [
  /что\s*(такое|значит|означает)|определение|дефиниция|what\s*is|define|definition\s*of|meaning\s*of/i,
];

const HOW_PATTERNS = [
  /как\s+(сделать|создать|написать|настроить|установить|использовать|работает|можно)/i,
  /how\s+(to|do|does|can|should|would)/i,
];

const WHY_PATTERNS = [
  /почему|зачем|по\s*какой\s*причине|why|what'?s\s*the\s*reason/i,
];

const COMPARISON_PATTERNS = [
  /сравни|чем\s*отличается|в\s*чём\s*разница|что\s*лучше|compare|difference\s*between|which\s*is\s*better|vs\.?/i,
];

const LIST_PATTERNS = [
  /перечисли|список|назови\s*(все|несколько)|топ\s*\d+|приведи\s*примеры|list|enumerate|name\s*(all|some)|top\s*\d+|give\s*(me\s*)?examples/i,
];

const TRANSLATION_PATTERNS = [
  /переведи|перевод|translate|translation/i,
];

const CALCULATION_PATTERNS = [
  /посчитай|вычисли|сколько\s*будет|calculate|compute|how\s*much\s*is/i,
  /^\s*[\d\s\+\-\*\/\(\)\.\,\^]+\s*[=\?]?\s*$/,
];

const CREATIVE_PATTERNS = [
  /напиши\s*(мне\s*)?(стих|рассказ|историю|сказку|песн|сценарий|эссе|статью)/i,
  /придумай|сочини|write\s*(me\s*)?(a\s*)?(poem|story|tale|song|script|essay|article)/i,
  /compose|create\s*(a\s*)?(story|poem)/i,
];

const ADVICE_PATTERNS = [
  /посоветуй|что\s*посоветуешь|как\s*лучше|стоит\s*ли|рекомендуешь|advise|recommend|should\s*i|what\s*do\s*you\s*think/i,
];

const CONTINUATION_PATTERNS = [
  /^(продолж|дальше|ещё|еще|и\?|а\s*дальше|что\s*дальше|continue|go\s*on|more|and\s*then|what'?s\s*next)/i,
];

const CLARIFICATION_PATTERNS = [
  /^(что\?|а\?|в\s*смысле|не\s*понял|поясни|уточни|что\s*ты\s*имел|what\?|huh\?|what\s*do\s*you\s*mean|clarify|explain\s*that)/i,
];

const PROGRAMMING_KEYWORDS = [
  'код', 'code', 'функци', 'function', 'класс', 'class', 'переменн', 'variable',
  'массив', 'array', 'объект', 'object', 'метод', 'method', 'api', 'база данных',
  'database', 'sql', 'html', 'css', 'javascript', 'typescript', 'python', 'java',
  'react', 'vue', 'angular', 'node', 'npm', 'git', 'github', 'docker', 'linux',
  'сервер', 'server', 'клиент', 'client', 'фронтенд', 'frontend', 'бэкенд', 'backend',
  'алгоритм', 'algorithm', 'структур данных', 'data structure', 'рекурси', 'recursion',
  'цикл', 'loop', 'условие', 'condition', 'if', 'else', 'for', 'while', 'import',
  'export', 'компонент', 'component', 'хук', 'hook', 'state', 'props', 'async',
  'await', 'promise', 'callback', 'ошибк', 'error', 'баг', 'bug', 'дебаг', 'debug',
];

const MATH_KEYWORDS = [
  'математик', 'math', 'вычисл', 'calculat', 'уравнени', 'equation', 'формул', 'formula',
  'интеграл', 'integral', 'производн', 'derivative', 'матриц', 'matrix', 'вектор', 'vector',
  'геометр', 'geometry', 'алгебр', 'algebra', 'тригонометр', 'trigonometr', 'статистик', 'statistic',
  'вероятност', 'probability', 'процент', 'percent', 'дробь', 'fraction', 'корень', 'root',
  'степень', 'power', 'логарифм', 'logarithm', 'синус', 'sin', 'косинус', 'cos', 'тангенс', 'tan',
];

const analyzeMessage = (msg: string, history: Message[]): MessageAnalysis => {
  const text = msg.trim();
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  
  let intent: Intent = 'unknown';
  let topic: Topic = 'general';
  let isQuestion = /[?？]/.test(text) || /^(кто|что|где|когда|почему|зачем|как|сколько|какой|какая|какое|какие|чей|чья|чьё|чьи|who|what|where|when|why|how|which|whose)/i.test(lower);
  let isCodeRelated = false;
  let requiresDateTime = false;
  let requiresKnowledge = false;
  let isShort = words.length <= 3;
  let isContinuation = false;
  let isAmbiguous = false;
  let keywords: string[] = [];
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  let complexity: 'simple' | 'medium' | 'complex' = 'simple';
  let expectedResponseLength: 'short' | 'medium' | 'long' | 'very_long' = 'medium';

  if (GREETING_PATTERNS.some(p => p.test(lower))) {
    intent = 'greeting';
    expectedResponseLength = 'short';
  } else if (FAREWELL_PATTERNS.some(p => p.test(lower))) {
    intent = 'farewell';
    expectedResponseLength = 'short';
  } else if (GRATITUDE_PATTERNS.some(p => p.test(lower))) {
    intent = 'gratitude';
    expectedResponseLength = 'short';
    sentiment = 'positive';
  } else if (CONTINUATION_PATTERNS.some(p => p.test(lower))) {
    intent = 'continuation';
    isContinuation = true;
  } else if (CLARIFICATION_PATTERNS.some(p => p.test(lower))) {
    intent = 'clarification';
    isAmbiguous = true;
  } else if (TIME_PATTERNS.some(p => p.test(lower))) {
    intent = 'question_time';
    requiresDateTime = true;
    expectedResponseLength = 'short';
  } else if (DATE_PATTERNS.some(p => p.test(lower))) {
    intent = 'question_date';
    requiresDateTime = true;
    expectedResponseLength = 'short';
  } else if (CODE_REQUEST_PATTERNS.some(p => p.test(lower))) {
    intent = 'code_request';
    isCodeRelated = true;
    topic = 'programming';
    expectedResponseLength = 'very_long';
    complexity = 'complex';
  } else if (CODE_FIX_PATTERNS.some(p => p.test(lower)) && hasCodeContext(lower, history)) {
    intent = 'code_fix';
    isCodeRelated = true;
    topic = 'programming';
    expectedResponseLength = 'long';
    complexity = 'complex';
  } else if (CODE_EXPLAIN_PATTERNS.some(p => p.test(lower))) {
    intent = 'code_explain';
    isCodeRelated = true;
    topic = 'programming';
    expectedResponseLength = 'long';
  } else if (TRANSLATION_PATTERNS.some(p => p.test(lower))) {
    intent = 'translation';
    topic = 'language';
    expectedResponseLength = 'medium';
  } else if (CALCULATION_PATTERNS.some(p => p.test(lower))) {
    intent = 'calculation';
    topic = 'math';
    expectedResponseLength = 'short';
  } else if (COMPARISON_PATTERNS.some(p => p.test(lower))) {
    intent = 'comparison';
    expectedResponseLength = 'long';
    complexity = 'medium';
  } else if (LIST_PATTERNS.some(p => p.test(lower))) {
    intent = 'list_request';
    expectedResponseLength = 'long';
  } else if (CREATIVE_PATTERNS.some(p => p.test(lower))) {
    intent = 'creative_writing';
    topic = 'art';
    expectedResponseLength = 'long';
    complexity = 'complex';
  } else if (ADVICE_PATTERNS.some(p => p.test(lower))) {
    intent = 'advice';
    expectedResponseLength = 'medium';
  } else if (DEFINITION_PATTERNS.some(p => p.test(lower))) {
    intent = 'definition';
    requiresKnowledge = true;
    expectedResponseLength = 'medium';
  } else if (HOW_PATTERNS.some(p => p.test(lower))) {
    intent = 'question_how';
    isQuestion = true;
    expectedResponseLength = 'long';
    complexity = 'medium';
  } else if (WHY_PATTERNS.some(p => p.test(lower))) {
    intent = 'question_why';
    isQuestion = true;
    expectedResponseLength = 'long';
    complexity = 'medium';
  } else if (/^(что|what)/i.test(lower)) {
    intent = 'question_what';
    isQuestion = true;
  } else if (isQuestion) {
    intent = 'question_factual';
    requiresKnowledge = true;
  }

  PROGRAMMING_KEYWORDS.forEach(kw => {
    if (lower.includes(kw.toLowerCase())) {
      keywords.push(kw);
      if (!isCodeRelated) {
        isCodeRelated = true;
        topic = 'programming';
      }
    }
  });

  MATH_KEYWORDS.forEach(kw => {
    if (lower.includes(kw.toLowerCase())) {
      keywords.push(kw);
      if (topic === 'general') topic = 'math';
    }
  });

  if (/```/.test(text) || /function\s+\w+|class\s+\w+|def\s+\w+|const\s+\w+|let\s+\w+|var\s+\w+/.test(text)) {
    isCodeRelated = true;
    topic = 'programming';
    if (intent === 'unknown') intent = 'code_fix';
  }

  if (isShort && intent === 'unknown') {
    if (words.length === 1) {
      isAmbiguous = true;
      const word = words[0].replace(/[?!.,]/g, '');
      if (['да', 'нет', 'yes', 'no', 'ок', 'ok', 'ладно', 'понял', 'ясно'].includes(word)) {
        intent = 'smalltalk';
        expectedResponseLength = 'short';
      }
    }
  }

  if (intent === 'unknown' && !isQuestion) {
    if (lower.includes('расскажи') || lower.includes('объясни') || lower.includes('опиши')) {
      intent = 'question_factual';
      requiresKnowledge = true;
      expectedResponseLength = 'long';
    } else if (words.length <= 5 && !isCodeRelated) {
      intent = 'smalltalk';
      isAmbiguous = true;
    } else {
      intent = 'command';
    }
  }

  if (/полностью|целиком|весь код|полный код|не обрывай|1000.*строк|full code|complete|entire/i.test(lower)) {
    expectedResponseLength = 'very_long';
    complexity = 'complex';
  }

  if (/плохо|ужасно|отстой|не нравится|херово|хуево|bad|terrible|awful|hate/i.test(lower)) {
    sentiment = 'negative';
  } else if (/хорошо|отлично|супер|класс|круто|нравится|good|great|awesome|love|nice/i.test(lower)) {
    sentiment = 'positive';
  }

  return {
    intent,
    topic,
    language: detectLanguage(text),
    isQuestion,
    isCodeRelated,
    requiresDateTime,
    requiresKnowledge,
    isShort,
    isContinuation,
    isAmbiguous,
    keywords,
    sentiment,
    complexity,
    expectedResponseLength,
  };
};

const hasCodeContext = (msg: string, history: Message[]): boolean => {
  const recentMessages = history.slice(-6);
  return recentMessages.some(m => /```|function|class|def |const |let |var |import |export /.test(m.content || ''));
};

const buildConversationContext = (history: Message[]): ConversationContext => {
  const recent = history.slice(-10);
  const userMessages = recent.filter(m => m.role === 'user');
  const assistantMessages = recent.filter(m => m.role === 'assistant');
  
  const recentTopics: Topic[] = [];
  const recentIntents: Intent[] = [];
  
  userMessages.forEach(m => {
    const analysis = analyzeMessage(m.content || '', []);
    recentTopics.push(analysis.topic);
    recentIntents.push(analysis.intent);
  });

  const lastUserMsg = userMessages[userMessages.length - 1]?.content || '';
  const lastAssistantMsg = assistantMessages[assistantMessages.length - 1]?.content || '';
  
  const codeContext = recent.some(m => /```/.test(m.content || ''));
  
  let ongoingTask: string | null = null;
  if (codeContext) ongoingTask = 'coding';
  
  return {
    recentTopics: recentTopics.slice(-5),
    recentIntents: recentIntents.slice(-5),
    lastUserMessage: lastUserMsg,
    lastAssistantMessage: lastAssistantMsg,
    turnCount: Math.floor(recent.length / 2),
    codeContext,
    ongoingTask,
  };
};

const detectLanguage = (msg: string): string => {
  if (/[а-яё]/i.test(msg)) return 'ru';
  if (/[\u4e00-\u9fff]/.test(msg)) return 'zh';
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(msg)) return 'ja';
  if (/[\uac00-\ud7af]/.test(msg)) return 'ko';
  if (/[\u0600-\u06ff]/.test(msg)) return 'ar';
  if (/[\u0900-\u097f]/.test(msg)) return 'hi';
  if (/[\u0e00-\u0e7f]/.test(msg)) return 'th';
  if (/[äöüßÄÖÜ]/.test(msg)) return 'de';
  if (/[éèêëàâùûôîïç]/i.test(msg)) return 'fr';
  if (/[áéíóúñ¿¡]/i.test(msg)) return 'es';
  return 'en';
};

const isForbidden = (msg: string): boolean => {
  const cleaned = msg.toLowerCase().replace(/[^а-яёa-z0-9\s]/g, '').replace(/\s+/g, ' ');
  return FORBIDDEN_PATTERNS.some(p => p.test(cleaned));
};

const getCurrentDateTime = (): { date: string; time: string; dayOfWeek: string; year: number } => {
  const now = new Date();
  const daysRu = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  
  return {
    date: `${now.getDate()} ${monthsRu[now.getMonth()]} ${now.getFullYear()}`,
    time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
    dayOfWeek: daysRu[now.getDay()],
    year: now.getFullYear(),
  };
};

const buildSystemPrompt = (
  analysis: MessageAnalysis,
  context: ConversationContext,
  mode: ResponseMode,
  rudeness: RudenessMode
): string => {
  const parts: string[] = [];
  
  parts.push('Ты — MoGPT, ИИ-ассистент от MoSeek.');

  const langMap: Record<string, string> = {
    ru: 'Отвечай на русском.',
    en: 'Respond in English.',
    zh: '用中文回答。',
    ja: '日本語で答えてください。',
    ko: '한국어로 대답하세요.',
    de: 'Antworte auf Deutsch.',
    fr: 'Réponds en français.',
    es: 'Responde en español.',
  };
  parts.push(langMap[analysis.language] || 'Отвечай на языке пользователя.');

  if (analysis.requiresDateTime) {
    const dt = getCurrentDateTime();
    parts.push(`ТЕКУЩАЯ ДАТА: ${dt.date}, ${dt.dayOfWeek}. ВРЕМЯ: ${dt.time}. ГОД: ${dt.year}.`);
  }

  if (mode === 'code') {
    parts.push('РЕЖИМ: КОД. Только код без пояснений. Полностью рабочий, готовый к запуску. Без комментариев внутри кода.');
  } else if (mode === 'visual') {
    parts.push('РЕЖИМ: ВИЗУАЛ. React + TypeScript + Tailwind CSS + Framer Motion. Только код UI компонента. Современный красивый дизайн.');
  }

  if (rudeness === 'polite') {
    parts.push('СТИЛЬ: Вежливый, профессиональный тон.');
  } else if (rudeness === 'rude') {
    parts.push('СТИЛЬ: Дерзкий, саркастичный. Без мата, но с подколками.');
  } else if (rudeness === 'very_rude') {
    parts.push('СТИЛЬ: Грубый, мат разрешён. Но ответ всегда по делу.');
  }

  parts.push('ПРАВИЛА:');
  parts.push('- Отвечай ТОЛЬКО на заданный вопрос. Не добавляй лишнего.');
  parts.push('- Если вопрос короткий и простой — ответ тоже короткий.');
  parts.push('- Не начинай с "Конечно", "Давай", "Итак", "Sure", "Of course".');
  parts.push('- Без эмодзи. Markdown для форматирования.');
  parts.push('- Не выдумывай факты. Если не знаешь — скажи честно.');

  if (analysis.isCodeRelated || context.codeContext) {
    parts.push('');
    parts.push('ПРАВИЛА КОДА:');
    parts.push('- Пиши код ПОЛНОСТЬЮ. Не обрывай. Не пиши "// ...", "TODO", "и т.д."');
    parts.push('- Все импорты, типы, функции — на месте и завершены.');
    parts.push('- Код компилируется и работает сразу.');
    parts.push('- TypeScript strict, без any. React — функциональные компоненты.');
  }

  if (analysis.intent === 'greeting') {
    parts.push('');
    parts.push('Пользователь поздоровался. Поздоровайся коротко в ответ и спроси чем помочь.');
  } else if (analysis.intent === 'farewell') {
    parts.push('');
    parts.push('Пользователь прощается. Попрощайся коротко.');
  } else if (analysis.intent === 'gratitude') {
    parts.push('');
    parts.push('Пользователь благодарит. Ответь коротко, без избыточности.');
  } else if (analysis.intent === 'continuation') {
    parts.push('');
    parts.push('Пользователь просит продолжить. Продолжи предыдущий ответ без повторов.');
  } else if (analysis.intent === 'clarification') {
    parts.push('');
    parts.push('Пользователь просит уточнение. Объясни понятнее предыдущий ответ.');
  } else if (analysis.isAmbiguous && analysis.isShort) {
    parts.push('');
    parts.push('Сообщение короткое и может быть неоднозначным. Если контекст ясен из истории — отвечай. Если нет — попроси уточнить.');
  }

  if (analysis.expectedResponseLength === 'short') {
    parts.push('');
    parts.push('ОЖИДАЕТСЯ КОРОТКИЙ ОТВЕТ. Не растягивай. 1-3 предложения максимум.');
  } else if (analysis.expectedResponseLength === 'very_long') {
    parts.push('');
    parts.push('Ожидается развёрнутый ответ. Пиши полностью, не сокращай, не обрывай.');
  }

  parts.push('');
  parts.push('ЗАПРЕЩЕНО: наркотики, казино, азартные игры, взломы, хакинг, малварь. При любой формулировке — отказ.');

  return parts.join('\n');
};

const getMaxTokens = (analysis: MessageAnalysis): number => {
  switch (analysis.expectedResponseLength) {
    case 'short': return 512;
    case 'medium': return 2048;
    case 'long': return 8192;
    case 'very_long': return 32768;
    default: return 4096;
  }
};

const getTemperature = (analysis: MessageAnalysis, mode: ResponseMode, rudeness: RudenessMode): number => {
  if (mode === 'code' || mode === 'visual') return 0.1;
  if (analysis.isCodeRelated) return 0.15;
  if (analysis.intent === 'calculation') return 0.0;
  if (analysis.intent === 'question_factual' || analysis.intent === 'definition') return 0.3;
  if (analysis.intent === 'creative_writing') return 0.8;
  if (rudeness === 'very_rude') return 0.6;
  if (rudeness === 'polite') return 0.4;
  return 0.5;
};

const formatHistory = (messages: Message[], maxMessages: number = 20): Array<{role: string; content: string}> => {
  return messages
    .filter(m => m.role !== 'system' && !m.isLoading && m.content?.trim())
    .slice(-maxMessages)
    .map(m => ({
      role: m.role as string,
      content: m.content.trim()
    }));
};

const cleanResponse = (text: string): string => {
  let result = text;
  
  result = result.replace(/<think>[\s\S]*?<\/think>/g, '');
  
  result = result
    .replace(/Кирилл[а-яё]*/gi, 'разработчики MoSeek')
    .replace(/Morfa/gi, 'MoSeek')
    .replace(/\bсоздатель\b/gi, 'разработчики MoSeek')
    .replace(/\bсоздателя\b/gi, 'разработчиков MoSeek')
    .replace(/\bсоздателем\b/gi, 'разработчиками MoSeek');
  
  result = result.replace(/\n{3,}/g, '\n\n');
  
  const backtickCount = (result.match(/```/g) || []).length;
  if (backtickCount % 2 !== 0) {
    result += '\n```';
  }
  
  return result.trim();
};

class AIService {
  private async request(body: Record<string, unknown>): Promise<{ content: string; finishReason?: string }> {
    try {
      const res = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${_k()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'MoGPT',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status === 429) return { content: '__ERR_RATELIMIT__' };
        if (res.status === 402) return { content: '__ERR_QUOTA__' };
        return { content: '__ERR_SERVER__' };
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const finish = data.choices?.[0]?.finish_reason || '';

      if (!text.trim()) return { content: '__ERR_EMPTY__' };

      return { content: cleanResponse(text), finishReason: finish };
    } catch {
      return { content: '__ERR_NETWORK__' };
    }
  }

  async generateResponse(
    messages: Message[],
    mode: ResponseMode = 'normal',
    rudeness: RudenessMode = 'rude',
    modelId?: string
  ): Promise<{ content: string }> {
    const lastMessage = messages[messages.length - 1];
    const userInput = (lastMessage.content || '').trim();
    
    if (!userInput) {
      return { content: this.getEmptyInputResponse(rudeness) };
    }

    const selectedModel = modelId || 'google/gemma-3-27b-it';
    
    const analysis = analyzeMessage(userInput, messages);
    const context = buildConversationContext(messages);
    
    if (isForbidden(userInput)) {
      return await this.handleForbiddenRequest(userInput, selectedModel, analysis, rudeness);
    }

    const systemPrompt = buildSystemPrompt(analysis, context, mode, rudeness);
    const maxTokens = getMaxTokens(analysis);
    const temperature = getTemperature(analysis, mode, rudeness);
    const history = formatHistory(messages);

    const body: Record<string, unknown> = {
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history
      ],
      max_tokens: maxTokens,
      temperature: temperature,
    };

    if (!selectedModel.includes('gemini') && !selectedModel.includes('gemma')) {
      body.top_p = 0.9;
      body.frequency_penalty = 0.15;
      body.presence_penalty = 0.15;
    }

    const result = await this.request(body);

    if (result.content.startsWith('__ERR_')) {
      return { content: this.humanizeError(result.content, rudeness) };
    }

    if (result.finishReason === 'length' && analysis.isCodeRelated) {
      return await this.handleCodeContinuation(
        result.content,
        systemPrompt,
        history,
        selectedModel,
        maxTokens,
        temperature
      );
    }

    return { content: result.content };
  }

  private async handleForbiddenRequest(
    userInput: string,
    model: string,
    analysis: MessageAnalysis,
    rudeness: RudenessMode
  ): Promise<{ content: string }> {
    const systemPrompt = `Ты — MoGPT. Пользователь спросил про запрещённую тему. 
Откажи КОРОТКО (1-2 предложения) в своём стиле.
${rudeness === 'polite' ? 'Вежливо.' : rudeness === 'rude' ? 'Дерзко, с сарказмом.' : 'Грубо, мат допустим.'}
Язык ответа: ${analysis.language === 'ru' ? 'русский' : 'как у пользователя'}.
Не объясняй почему отказываешь.`;

    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
      max_tokens: 150,
      temperature: 0.7,
    };

    const result = await this.request(body);
    
    if (result.content.startsWith('__ERR_')) {
      return { content: this.getForbiddenFallback(rudeness) };
    }
    
    return { content: result.content };
  }

  private async handleCodeContinuation(
    initialContent: string,
    systemPrompt: string,
    history: Array<{role: string; content: string}>,
    model: string,
    maxTokens: number,
    temperature: number
  ): Promise<{ content: string }> {
    let combined = initialContent;
    const maxContinuations = 5;

    for (let i = 0; i < maxContinuations; i++) {
      const contBody: Record<string, unknown> = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(i === 0 ? history.slice(-4) : []),
          { role: 'assistant', content: combined.slice(-6000) },
          { role: 'user', content: 'Продолжи ТОЧНО с того места где остановился. Без повторов. Только код.' },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      };

      if (!model.includes('gemini') && !model.includes('gemma')) {
        contBody.top_p = 0.9;
        contBody.frequency_penalty = 0.15;
        contBody.presence_penalty = 0.15;
      }

      const cont = await this.request(contBody);
      
      if (cont.content.startsWith('__ERR_')) break;
      
      combined += '\n' + cont.content;
      
      if (cont.finishReason !== 'length') break;
    }

    return { content: cleanResponse(combined) };
  }

  private getEmptyInputResponse(rudeness: RudenessMode): string {
    const responses: Record<RudenessMode, string> = {
      polite: 'Пожалуйста, введите ваш вопрос.',
      rude: 'Эй, ты что-то хотел спросить?',
      very_rude: 'Ну и чего молчим? Пиши уже.',
    };
    return responses[rudeness];
  }

  private getForbiddenFallback(rudeness: RudenessMode): string {
    const responses: Record<RudenessMode, string> = {
      polite: 'К сожалению, я не могу помочь с этой темой.',
      rude: 'Не, эту тему я обсуждать не буду.',
      very_rude: 'Нет. Эту хрень обсуждать не буду.',
    };
    return responses[rudeness];
  }

  private humanizeError(code: string, rudeness: RudenessMode): string {
    const errors: Record<string, Record<RudenessMode, string>> = {
      '__ERR_SERVER__': {
        polite: 'Ошибка сервера. Попробуйте ещё раз.',
        rude: 'Сервер прилёг. Жми ещё раз.',
        very_rude: 'Сервер сдох. Давай заново.',
      },
      '__ERR_EMPTY__': {
        polite: 'Не удалось получить ответ. Повторите запрос.',
        rude: 'Пусто пришло. Ещё раз.',
        very_rude: 'Нихера не пришло. Повтори.',
      },
      '__ERR_NETWORK__': {
        polite: 'Ошибка сети. Проверьте подключение.',
        rude: 'Сеть пропала. Интернет есть?',
        very_rude: 'Сеть сдохла. Чекни интернет.',
      },
      '__ERR_RATELIMIT__': {
        polite: 'Слишком много запросов. Подождите немного.',
        rude: 'Притормози. Подожди секунду.',
        very_rude: 'Охолони. Слишком часто тыкаешь.',
      },
      '__ERR_QUOTA__': {
        polite: 'Лимит исчерпан. Попробуйте другую модель.',
        rude: 'Лимит кончился. Меняй модель.',
        very_rude: 'Лимит всё. Переключайся.',
      },
    };
    return errors[code]?.[rudeness] || 'Ошибка. Попробуйте ещё раз.';
  }
}

export const aiService = new AIService();
