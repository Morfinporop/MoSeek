// src/services/aiService.ts

import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL, DEFAULT_MODEL } from '../config/models';
import { memoryService } from './memoryService';
import { webSearchService } from './webSearchService';

// --- API Key (obfuscated) ---
const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

// --- Forbidden content patterns (multi-language) ---
const FORBIDDEN_PATTERNS = [
  /как\s*(сделать|приготовить|синтезировать|варить).*(бомб|взрывчатк|яд|отрав)/i,
  /детск.*порн|cp\b.*детск|педофил/i,
  /как\s*(убить|отравить|зарезать|задушить)\s*(человек|людей|ребёнк|детей)/i,
  /how\s*to\s*(make|build|create)\s*(bomb|explosive|poison)/i,
  /child\s*porn|csam/i,
  /how\s*to\s*(kill|murder|poison)\s*(person|people|child|someone)/i,
  /如何\s*(制造|制作)\s*(炸弹|毒药|爆炸物)/i,
  /どうやって\s*(爆弾|毒|毒薬)\s*を\s*(作る|製造)/i,
  /كيف\s*(تصنع|تحضر)\s*(قنبلة|سم|متفجرات)/i,
  /cómo\s*(hacer|fabricar)\s*(bomba|explosivo|veneno)/i,
  /wie\s*(man|kann)\s*(bombe|gift|sprengstoff)\s*(machen|herstellen|bauen)/i,
  /comment\s*(fabriquer|faire)\s*(bombe|explosif|poison)/i,
];

// --- Language map ---
const LANGUAGE_MAP: Record<string, { name: string; native: string; endPunctuation: string; direction: 'ltr' | 'rtl' }> = {
  ru: { name: 'русский', native: 'русский', endPunctuation: '.!?', direction: 'ltr' },
  en: { name: 'английский', native: 'English', endPunctuation: '.!?', direction: 'ltr' },
  zh: { name: 'китайский', native: '中文', endPunctuation: '。！？', direction: 'ltr' },
  ja: { name: 'японский', native: '日本語', endPunctuation: '。！？', direction: 'ltr' },
  ko: { name: 'корейский', native: '한국어', endPunctuation: '.!?', direction: 'ltr' },
  ar: { name: 'арабский', native: 'العربية', endPunctuation: '.!?', direction: 'rtl' },
  hi: { name: 'хинди', native: 'हिन्दी', endPunctuation: '।!?', direction: 'ltr' },
  th: { name: 'тайский', native: 'ไทย', endPunctuation: '.!?', direction: 'ltr' },
  ka: { name: 'грузинский', native: 'ქართული', endPunctuation: '.!?', direction: 'ltr' },
  hy: { name: 'армянский', native: 'Հայերեն', endPunctuation: '.!?', direction: 'ltr' },
  he: { name: 'иврит', native: 'עברית', endPunctuation: '.!?', direction: 'rtl' },
  tr: { name: 'турецкий', native: 'Türkçe', endPunctuation: '.!?', direction: 'ltr' },
  de: { name: 'немецкий', native: 'Deutsch', endPunctuation: '.!?', direction: 'ltr' },
  fr: { name: 'французский', native: 'Français', endPunctuation: '.!?', direction: 'ltr' },
  es: { name: 'испанский', native: 'Español', endPunctuation: '.!?', direction: 'ltr' },
  pt: { name: 'португальский', native: 'Português', endPunctuation: '.!?', direction: 'ltr' },
  it: { name: 'итальянский', native: 'Italiano', endPunctuation: '.!?', direction: 'ltr' },
  pl: { name: 'польский', native: 'Polski', endPunctuation: '.!?', direction: 'ltr' },
  cs: { name: 'чешский', native: 'Čeština', endPunctuation: '.!?', direction: 'ltr' },
  vi: { name: 'вьетнамский', native: 'Tiếng Việt', endPunctuation: '.!?', direction: 'ltr' },
  uk: { name: 'украинский', native: 'Українська', endPunctuation: '.!?', direction: 'ltr' },
  nl: { name: 'нидерландский', native: 'Nederlands', endPunctuation: '.!?', direction: 'ltr' },
  sv: { name: 'шведский', native: 'Svenska', endPunctuation: '.!?', direction: 'ltr' },
  da: { name: 'датский', native: 'Dansk', endPunctuation: '.!?', direction: 'ltr' },
  no: { name: 'норвежский', native: 'Norsk', endPunctuation: '.!?', direction: 'ltr' },
  fi: { name: 'финский', native: 'Suomi', endPunctuation: '.!?', direction: 'ltr' },
  el: { name: 'греческий', native: 'Ελληνικά', endPunctuation: '.!?;', direction: 'ltr' },
  ro: { name: 'румынский', native: 'Română', endPunctuation: '.!?', direction: 'ltr' },
  hu: { name: 'венгерский', native: 'Magyar', endPunctuation: '.!?', direction: 'ltr' },
  bg: { name: 'болгарский', native: 'Български', endPunctuation: '.!?', direction: 'ltr' },
  sr: { name: 'сербский', native: 'Српски', endPunctuation: '.!?', direction: 'ltr' },
  hr: { name: 'хорватский', native: 'Hrvatski', endPunctuation: '.!?', direction: 'ltr' },
  sk: { name: 'словацкий', native: 'Slovenčina', endPunctuation: '.!?', direction: 'ltr' },
  sl: { name: 'словенский', native: 'Slovenščina', endPunctuation: '.!?', direction: 'ltr' },
  lt: { name: 'литовский', native: 'Lietuvių', endPunctuation: '.!?', direction: 'ltr' },
  lv: { name: 'латышский', native: 'Latviešu', endPunctuation: '.!?', direction: 'ltr' },
  et: { name: 'эстонский', native: 'Eesti', endPunctuation: '.!?', direction: 'ltr' },
  id: { name: 'индонезийский', native: 'Bahasa Indonesia', endPunctuation: '.!?', direction: 'ltr' },
  ms: { name: 'малайский', native: 'Bahasa Melayu', endPunctuation: '.!?', direction: 'ltr' },
  tl: { name: 'филиппинский', native: 'Filipino', endPunctuation: '.!?', direction: 'ltr' },
  sw: { name: 'суахили', native: 'Kiswahili', endPunctuation: '.!?', direction: 'ltr' },
  fa: { name: 'персидский', native: 'فارسی', endPunctuation: '.!?', direction: 'rtl' },
  ur: { name: 'урду', native: 'اردو', endPunctuation: '.!?', direction: 'rtl' },
  bn: { name: 'бенгальский', native: 'বাংলা', endPunctuation: '।!?', direction: 'ltr' },
  ta: { name: 'тамильский', native: 'தமிழ்', endPunctuation: '.!?', direction: 'ltr' },
  te: { name: 'телугу', native: 'తెలుగు', endPunctuation: '.!?', direction: 'ltr' },
  mr: { name: 'маратхи', native: 'मराठी', endPunctuation: '।!?', direction: 'ltr' },
  gu: { name: 'гуджарати', native: 'ગુજરાતી', endPunctuation: '.!?', direction: 'ltr' },
  kn: { name: 'каннада', native: 'ಕನ್ನಡ', endPunctuation: '.!?', direction: 'ltr' },
  ml: { name: 'малаялам', native: 'മലയാളം', endPunctuation: '.!?', direction: 'ltr' },
  pa: { name: 'панджаби', native: 'ਪੰਜਾਬੀ', endPunctuation: '।!?', direction: 'ltr' },
  my: { name: 'бирманский', native: 'မြန်မာ', endPunctuation: '။!?', direction: 'ltr' },
  km: { name: 'кхмерский', native: 'ភាសាខ្មែរ', endPunctuation: '។!?', direction: 'ltr' },
  lo: { name: 'лаосский', native: 'ພາສາລາວ', endPunctuation: '.!?', direction: 'ltr' },
  mn: { name: 'монгольский', native: 'Монгол', endPunctuation: '.!?', direction: 'ltr' },
  kk: { name: 'казахский', native: 'Қазақша', endPunctuation: '.!?', direction: 'ltr' },
  uz: { name: 'узбекский', native: "O'zbekcha", endPunctuation: '.!?', direction: 'ltr' },
  az: { name: 'азербайджанский', native: 'Azərbaycan', endPunctuation: '.!?', direction: 'ltr' },
  ne: { name: 'непальский', native: 'नेपाली', endPunctuation: '।!?', direction: 'ltr' },
  si: { name: 'сингальский', native: 'සිංහල', endPunctuation: '.!?', direction: 'ltr' },
  am: { name: 'амхарский', native: 'አማርኛ', endPunctuation: '።!?', direction: 'ltr' },
};

const TEAM_EMAIL = 'energoferon41@gmail.com';

// --- Topic detection for domain-specific knowledge ---
type TopicDomain =
  | 'math' | 'physics' | 'chemistry' | 'biology' | 'history' | 'geography'
  | 'literature' | 'language_learning' | 'philosophy' | 'psychology'
  | 'economics' | 'law' | 'medicine' | 'music' | 'art'
  | 'cooking' | 'fitness' | 'relationships' | 'career' | 'finance'
  | 'gaming' | 'movies' | 'travel' | 'pets' | 'cars' | 'tech_general'
  | 'programming' | 'web_dev' | 'game_dev' | 'mobile_dev' | 'devops'
  | 'ai_ml' | 'cybersecurity' | 'databases'
  | 'life_advice' | 'humor' | 'creative_writing' | 'translation'
  | 'general';

interface DetectedTopic {
  domain: TopicDomain;
  subDomain?: string;
  confidence: number;
}

interface ProgrammingContext {
  language: string;
  framework?: string;
  realm?: 'server' | 'client' | 'shared';
  taskType: 'bug' | 'new_code' | 'explain' | 'review' | 'optimize' | 'refactor' | 'general';
}

interface UserIntent {
  wantsDetailed: boolean;
  wantsBrief: boolean;
  wantsCodeOnly: boolean;
  wantsExplanation: boolean;
  wantsFix: boolean;
  wantsOptimization: boolean;
  wantsRefactor: boolean;
  wantsComparison: boolean;
  wantsReview: boolean;
  wantsFromScratch: boolean;
  wantsSolution: boolean;
  wantsOpinion: boolean;
  wantsCreative: boolean;
  wantsTranslation: boolean;
  wantsStepByStep: boolean;
}

interface ConversationContext {
  messageCount: number;
  recentTopics: DetectedTopic[];
  emotionalTone: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'excited' | 'tired' | 'angry';
  communicationStyle: 'formal' | 'casual' | 'slang' | 'technical' | 'emotional' | 'mixed';
  isCodeSession: boolean;
  hasRepeatedQuestions: boolean;
  justSwitchedMode: boolean;
  conversationDepth: 'greeting' | 'shallow' | 'moderate' | 'deep' | 'expert';
  userBehavior: 'exploring' | 'working' | 'chatting' | 'venting' | 'testing' | 'learning' | 'homework' | 'creative';
  lastUserMessages: string[];
  detectedLanguage: string;
  detectedLanguageName: string;
  detectedLanguageNative: string;
  userHasErrors: boolean;
  recentAssistantMessages: string[];
  detectedProgrammingContext: ProgrammingContext | null;
  userIntent: UserIntent;
  primaryTopic: DetectedTopic;
}

// =============================================
// UNIVERSAL KNOWLEDGE BASE
// =============================================
const KNOWLEDGE_BASE = `You are a UNIVERSAL assistant. You handle ANY topic equally well:

EDUCATION & SCHOOL:
- Math: arithmetic, algebra, geometry, trigonometry, calculus, statistics, probability, linear algebra, discrete math, number theory. Show step-by-step solutions. Use proper notation.
- Physics: mechanics, thermodynamics, electromagnetism, optics, quantum, relativity, astrophysics. Include formulas, units, diagrams descriptions.
- Chemistry: organic, inorganic, biochemistry, reactions, balancing equations, molecular structure, periodic table, stoichiometry, solutions, pH.
- Biology: cell biology, genetics, evolution, ecology, anatomy, physiology, microbiology, botany, zoology.
- History: world history, ancient civilizations, medieval, modern, wars, revolutions, cultural movements, political systems. Dates, causes, consequences.
- Geography: physical, political, economic, climate, demographics, natural resources, maps, countries, capitals.
- Literature: analysis, themes, characters, literary devices, genres, authors, periods, essays, summaries, interpretations.
- Languages: grammar rules, vocabulary, pronunciation tips, translation, etymology, idioms, conjugation, declension.
- Philosophy: ethics, logic, epistemology, metaphysics, major philosophers, schools of thought, arguments.
- Economics: micro, macro, markets, supply/demand, GDP, inflation, monetary policy, fiscal policy, trade.
- Law: basic legal concepts, rights, constitutional law, criminal vs civil, contracts (general knowledge, not legal advice).

SCIENCE & TECHNOLOGY:
- Computer science: algorithms, data structures, complexity, networking, OS, databases, compilers.
- AI/ML: neural networks, training, datasets, models, NLP, computer vision, reinforcement learning.
- Cybersecurity: OWASP, encryption, hashing, authentication, authorization, common vulnerabilities.
- Electronics: circuits, components, Arduino, Raspberry Pi, IoT, signals.

PROGRAMMING (ALL LANGUAGES):
- Python, JavaScript/TypeScript, C/C++, C#, Java, Rust, Go, Lua, PHP, Ruby, Swift, Kotlin, Dart, R, MATLAB, SQL, Bash, PowerShell.
- Frameworks: React, Vue, Angular, Svelte, Next.js, Nuxt, Django, Flask, FastAPI, Spring, .NET, Express, NestJS, Laravel, Rails, Unity, Unreal, Godot.
- GLua/Garry's Mod: Lua 5.1 on Source Engine, realms (SERVER/CLIENT/SHARED), hooks, net library, VGUI/Derma, SWEP, SENT, DarkRP, AddCSLuaFile, FindMetaTable, NW2 vars. wiki.facepunch.com/gmod.
- Roblox/Luau: RemoteEvents, DataStoreService, ReplicatedStorage, ModuleScripts.
- Databases: SQL (PostgreSQL, MySQL, SQLite), NoSQL (MongoDB, Redis, Firebase), ORMs, query optimization.
- DevOps: Docker, Kubernetes, CI/CD, GitHub Actions, AWS, GCP, Azure, Nginx, Linux administration.
- Mobile: React Native, Flutter, Swift/SwiftUI, Kotlin/Jetpack Compose.
- Game dev: Unity (C#), Unreal (C++/Blueprints), Godot (GDScript), Garry's Mod (GLua), Roblox (Luau), Love2D (Lua).
- Architecture: SOLID, DRY, KISS, MVC, MVVM, Clean Architecture, microservices, monolith, event-driven, CQRS.
- API: REST, GraphQL, WebSocket, gRPC, OpenAPI.

REAL LIFE & EVERYDAY:
- Cooking: recipes, techniques, ingredients, substitutions, dietary needs, cuisines worldwide.
- Fitness: exercises, routines, nutrition, stretching, sports, injury prevention (not medical advice).
- Relationships: communication tips, conflict resolution, boundaries, social skills, dating (general advice).
- Career: resume/CV tips, interview prep, skill development, job search, freelancing, work-life balance.
- Personal finance: budgeting, saving, investing basics, taxes basics, debt management, financial planning.
- Travel: destinations, planning, packing, visas, culture tips, transportation, budget travel.
- Pets: care, feeding, training, breeds, health basics (not vet advice).
- Cars: maintenance basics, troubleshooting, buying tips, specifications.
- Home: DIY, repairs, cleaning, organization, gardening.
- Health: general wellness, first aid basics, mental health awareness (always recommend professional help for serious issues).

CREATIVE:
- Writing: stories, poems, scripts, dialogues, worldbuilding, character development, plot structure.
- Music: theory, chords, scales, production basics, instruments, genres, history.
- Art: techniques, styles, movements, color theory, composition, digital art tools.
- Humor: jokes, puns, wordplay, situational comedy, memes culture.

TRANSLATION & LANGUAGES:
- Translate between any languages accurately.
- Preserve tone, idioms, cultural context.
- Explain nuances when relevant.

APPROACH BY TASK TYPE:
- Homework/school: Step-by-step solution. Show work. Explain reasoning. Use proper notation. Give the answer clearly.
- Bug/error: Identify issue → root cause → fix with code → explain why.
- New code: Clarify if needed → clean working code → brief key decisions → edge cases.
- Explain concept: Simple definition → analogy if helpful → example → when to use.
- Code review: What's good → issues → improvements with code → security/performance.
- Life question: Empathetic, practical advice. Multiple perspectives if relevant.
- Creative task: Original, engaging content matching requested style/tone.
- Math problem: Step-by-step, show all work, box/highlight final answer.
- Translation: Accurate translation + notes on nuances if needed.
- Opinion question: Give YOUR opinion with reasoning. Never "it's subjective."`;

// =============================================
// CONTEXT ANALYZER
// =============================================
class ContextAnalyzer {
  private memory: ConversationContext = this.createDefault();
  private previousMode?: ResponseMode;
  private previousRudeness?: RudenessMode;

  private createDefault(): ConversationContext {
    return {
      messageCount: 0,
      recentTopics: [],
      emotionalTone: 'neutral',
      communicationStyle: 'casual',
      isCodeSession: false,
      hasRepeatedQuestions: false,
      justSwitchedMode: false,
      conversationDepth: 'greeting',
      userBehavior: 'exploring',
      lastUserMessages: [],
      detectedLanguage: 'ru',
      detectedLanguageName: 'русский',
      detectedLanguageNative: 'русский',
      userHasErrors: false,
      recentAssistantMessages: [],
      detectedProgrammingContext: null,
      userIntent: this.defaultIntent(),
      primaryTopic: { domain: 'general', confidence: 0 },
    };
  }

  private defaultIntent(): UserIntent {
    return {
      wantsDetailed: false, wantsBrief: false, wantsCodeOnly: false,
      wantsExplanation: false, wantsFix: false, wantsOptimization: false,
      wantsRefactor: false, wantsComparison: false, wantsReview: false,
      wantsFromScratch: false, wantsSolution: false, wantsOpinion: false,
      wantsCreative: false, wantsTranslation: false, wantsStepByStep: false,
    };
  }

  analyze(messages: Message[], currentInput: string, mode: ResponseMode, rudeness: RudenessMode): ConversationContext {
    const userMsgs = messages.filter(m => m.role === 'user');
    const assistMsgs = messages.filter(m => m.role === 'assistant');
    const all = messages.filter(m => !m.isLoading);

    this.memory.messageCount = userMsgs.length;
    this.memory.lastUserMessages = userMsgs.slice(-7).map(m => m.content || '');
    this.memory.recentAssistantMessages = assistMsgs.slice(-5).map(m => m.content || '');

    this.memory.justSwitchedMode =
      (this.previousMode !== undefined && this.previousMode !== mode) ||
      (this.previousRudeness !== undefined && this.previousRudeness !== rudeness);
    this.previousMode = mode;
    this.previousRudeness = rudeness;

    const lang = this.detectLanguage(currentInput);
    this.memory.detectedLanguage = lang;
    const info = LANGUAGE_MAP[lang];
    this.memory.detectedLanguageName = info?.name || lang;
    this.memory.detectedLanguageNative = info?.native || lang;

    this.memory.userHasErrors = this.detectErrors(currentInput, lang);
    this.memory.emotionalTone = this.detectTone(currentInput, this.memory.lastUserMessages, lang);
    this.memory.communicationStyle = this.detectStyle(currentInput, this.memory.lastUserMessages, lang);
    this.memory.userBehavior = this.detectBehavior(currentInput, all);
    this.memory.conversationDepth = this.detectDepth(this.memory.messageCount, all);
    this.memory.isCodeSession = all.slice(-8).some(m => /```|function\s|class\s|const\s.*=|import\s|def\s|hook\.\w+|net\.\w+|vgui\.\w+/.test(m.content || ''));
    this.memory.hasRepeatedQuestions = this.detectRepetition(currentInput, this.memory.lastUserMessages);
    this.memory.detectedProgrammingContext = this.detectProgrammingContext(currentInput, all);
    this.memory.userIntent = this.detectUserIntent(currentInput);
    this.memory.primaryTopic = this.detectTopic(currentInput, all);
    this.memory.recentTopics = this.trackTopics(this.memory.primaryTopic);

    return { ...this.memory };
  }

  // --- Topic Detection ---
  private detectTopic(input: string, msgs: Message[]): DetectedTopic {
    const combined = (input + ' ' + msgs.slice(-4).map(m => m.content || '').join(' ')).toLowerCase();

    const topicPatterns: [TopicDomain, RegExp, string?, number?][] = [
      // Math
      ['math', /\b(математик|алгебр|геометри|тригонометри|интеграл|производн|уравнен|неравенств|дробь|процент|корень|степен|логарифм|вычисл|посчитай|реши\s*(задач|пример|уравнен)|сколько\s*будет|матриц|определитель|вектор|предел|ряд\s+тейлора|теорема|factorial|derivative|integral|equation|algebra|geometry|trigonometry|calculus|matrix|vector|probability|statistics|sqrt|sum\s*of|solve|calculate|x\s*[=+\-*/^]|sin|cos|tan|log|ln\b|\d+\s*[+\-*/^%]\s*\d+)/i, undefined, 3],
      // Physics
      ['physics', /\b(физик|механик|термодинамик|электричеств|магнит|оптик|квантов|относительност|гравитац|сила|ускорен|скорость|масса|энерги|импульс|давлен|температур|ток|напряжен|сопротивлен|physics|mechanics|thermodynamics|electromagnetism|quantum|gravity|force|velocity|acceleration|energy|momentum|newton|ohm|watt|joule|ampere|voltage|circuit)/i, undefined, 2],
      // Chemistry
      ['chemistry', /\b(хими|реакци|молекул|атом|элемент|кислот|щёлоч|раствор|концентрац|моль|вещество|органическ|неорганическ|формула\s*(вещества|соединения)|периодическ|валентност|chemistry|reaction|molecule|atom|element|acid|base|solution|concentration|molar|compound|organic|inorganic|periodic\s*table|stoichiometry|oxidation|reduction|ion|cation|anion|pH|titration)/i, undefined, 2],
      // Biology
      ['biology', /\b(биологи|клетк|ген(етик|ом)|эволюц|экологи|анатоми|физиологи|микробиологи|ботаник|зоологи|ДНК|РНК|белок|фермент|митоз|мейоз|фотосинтез|дыхание\s*клет|biology|cell|gene|evolution|ecology|anatomy|physiology|DNA|RNA|protein|enzyme|mitosis|meiosis|photosynthesis|organism|species)/i, undefined, 2],
      // History
      ['history', /\b(истори|век\s|древн|средневеков|революци|война|империя|царь|король|династи|цивилизац|history|ancient|medieval|revolution|war|empire|dynasty|civilization|century|historical|wwi|wwii|cold\s*war)/i, undefined, 2],
      // Geography
      ['geography', /\b(географи|страна|столиц|континент|океан|климат|населен|карта|рельеф|geography|country|capital|continent|ocean|climate|population|map|terrain|region)/i, undefined, 2],
      // Literature
      ['literature', /\b(литератур|автор|писатель|роман|стихотворен|поэзи|персонаж|сюжет|жанр|анализ\s*(произведен|текст)|сочинен|эссе|literature|author|novel|poem|poetry|character|plot|genre|essay|literary|theme|symbolism|metaphor)/i, undefined, 2],
      // Language learning
      ['language_learning', /\b(грамматик|правописан|орфограф|пунктуац|склонен|спряжен|падеж|часть\s*речи|grammar|spelling|punctuation|conjugat|declension|tense|part\s*of\s*speech|как\s*(пишется|правильно\s*писать)|правило\s*(русского|языка))/i, undefined, 2],
      // Philosophy
      ['philosophy', /\b(философи|этик|логик|метафизик|эпистемологи|экзистенциал|philosophy|ethics|logic|metaphysics|epistemology|existential|socrates|plato|aristotle|kant|nietzsche|смысл\s*жизни|meaning\s*of\s*life)/i, undefined, 2],
      // Psychology
      ['psychology', /\b(психологи|эмоци|когнитивн|поведен|мотивац|стресс|тревожн|депресс|psychology|emotion|cognitive|behavior|motivation|stress|anxiety|depression|therapy|mental\s*health)/i, undefined, 2],
      // Economics
      ['economics', /\b(экономик|рынок|спрос|предложен|инфляц|ВВП|бюджет|налог|economics|market|supply|demand|inflation|GDP|budget|tax|monetary|fiscal|trade|macro|micro)/i, undefined, 2],
      // Cooking
      ['cooking', /\b(рецепт|приготов|ингредиент|блюдо|выпечк|тесто|варить|жарить|запекать|кухн|recipe|cook|ingredient|dish|bake|fry|roast|cuisine|meal|food\s*prep)/i, undefined, 2],
      // Fitness
      ['fitness', /\b(тренировк|упражнен|мышц|кардио|силов|растяжк|калори|диет|белок|протеин|workout|exercise|muscle|cardio|strength|stretch|calorie|diet|protein|fitness|gym)/i, undefined, 2],
      // Relationships
      ['relationships', /\b(отношен|парень|девушка|свидан|любовь|расстав|конфликт|relationship|dating|love|breakup|conflict|partner|marriage|friendship|social\s*skill)/i, undefined, 2],
      // Career
      ['career', /\b(работа|карьер|резюме|собеседован|зарплат|профессия|вакансия|job|career|resume|CV|interview|salary|profession|vacancy|hiring|freelance)/i, undefined, 2],
      // Finance
      ['finance', /\b(финанс|инвестиц|акци|облигац|крипт|биткоин|банк|кредит|ипотек|вклад|finance|invest|stock|bond|crypto|bitcoin|bank|credit|mortgage|deposit|budget|saving)/i, undefined, 2],
      // Gaming
      ['gaming', /\b(игр(а|ы|овой)|геймплей|прохожден|гайд\s*(по\s*игр)|стратеги(я|и)\s*(в\s*игр)|game|gameplay|walkthrough|guide\s*(for|to)\s*game|strategy\s*(game|in)|steam|playstation|xbox|nintendo|esport)/i, undefined, 1],
      // Movies
      ['movies', /\b(фильм|кино|сериал|режиссёр|актёр|актрис|movie|film|series|director|actor|actress|cinema|netflix|review\s*(of\s*)?film)/i, undefined, 1],
      // Travel
      ['travel', /\b(путешестви|поездк|перелёт|отель|виза|турист|travel|trip|flight|hotel|visa|tourist|destination|backpack)/i, undefined, 2],
      // Pets
      ['pets', /\b(питомец|собак|кошк|кот\b|щенок|котён|корм\s*(для|собак|кош)|порода|pet|dog|cat|puppy|kitten|breed|feed|vet)/i, undefined, 2],
      // Cars
      ['cars', /\b(машин|автомобил|двигател|мотор|коробк\s*передач|тормоз|подвеск|car|vehicle|engine|motor|transmission|brake|suspension|tire|oil\s*change)/i, undefined, 2],
      // Creative writing
      ['creative_writing', /\b(напиши\s*(рассказ|стих|историю|сказку|сценарий|диалог|текст\s*песни)|придумай|сочини|write\s*(a\s*)?(story|poem|script|dialogue|song|tale|fiction)|creative\s*writ)/i, undefined, 3],
      // Translation
      ['translation', /\b(переведи|перевод|translate|translation|как\s*(будет|сказать)\s*(на|по|in)\s*(английск|русск|немецк|французск|испанск|english|russian|german|french|spanish))/i, undefined, 3],
      // Humor
      ['humor', /\b(пошути|анекдот|шутк|смешн|мем|joke|funny|humor|meme|laugh|comedy)/i, undefined, 3],
      // Life advice
      ['life_advice', /\b(совет|что\s*делать|как\s*быть|помоги\s*разобраться|не\s*знаю\s*как|подскажи|advice|what\s*should\s*I|how\s*to\s*deal|help\s*me\s*(with|figure)|suggest)/i, undefined, 1],
      // Tech general
      ['tech_general', /\b(компьютер|ноутбук|телефон|смартфон|процессор|видеокарт|опера(тивная|тивка)|SSD|HDD|монитор|computer|laptop|phone|smartphone|processor|CPU|GPU|RAM|SSD|monitor|Windows|Linux|macOS|Android|iOS)/i, undefined, 2],
      // Programming - general
      ['programming', /\b(код|программ|функци|переменн|массив|цикл|условие|класс|объект|метод|библиотек|фреймворк|code|program|function|variable|array|loop|condition|class|object|method|library|framework|import|export|module|package|compile|runtime|debug|error|exception|stack\s*trace|syntax)/i, undefined, 2],
      // Web dev
      ['web_dev', /\b(сайт|веб|фронтенд|бэкенд|верстк|адаптивн|website|web|frontend|backend|HTML|CSS|responsive|SEO|hosting|domain|deploy|server|client\s*side|server\s*side)/i, undefined, 2],
      // Game dev
      ['game_dev', /\b(gamedev|гейм\s*дев|разработк\s*игр|game\s*dev|unity|unreal|godot|garry'?s?\s*mod|gmod|glua|roblox|luau|love2d)/i, undefined, 3],
      // Mobile dev
      ['mobile_dev', /\b(мобильн\s*приложен|android\s*разработ|ios\s*разработ|mobile\s*(app|dev)|react\s*native|flutter|swift|kotlin|jetpack)/i, undefined, 2],
      // DevOps
      ['devops', /\b(devops|docker|kubernetes|k8s|CI\/CD|pipeline|deploy|nginx|apache|linux\s*server|aws|azure|gcp|terraform|ansible)/i, undefined, 2],
      // AI/ML
      ['ai_ml', /\b(нейросет|машинн\s*обучен|искусствен\s*интеллект|neural\s*net|machine\s*learn|artificial\s*intelligen|deep\s*learn|NLP|computer\s*vision|tensorflow|pytorch|model\s*train|dataset|GPT|LLM|transformer)/i, undefined, 2],
      // Cybersecurity
      ['cybersecurity', /\b(безопасност|хакер|взлом|уязвимост|шифрован|security|hacker|hack|vulnerability|encrypt|firewall|pentest|exploit|malware|phishing|OWASP)/i, undefined, 2],
      // Databases
      ['databases', /\b(базa?\s*данн|SQL|запрос|таблиц|индекс|database|query|table|index|join|select|insert|update|delete|PostgreSQL|MySQL|SQLite|MongoDB|Redis|Firebase|ORM)/i, undefined, 2],
      // Medicine (general info only)
      ['medicine', /\b(медицин|здоровье|симптом|болезн|лечен|лекарств|таблетк|врач|диагноз|medicine|health|symptom|disease|treatment|medication|doctor|diagnos|prescription)/i, undefined, 1],
      // Music
      ['music', /\b(музык|аккорд|нот|мелоди|гамм|тональност|ритм|гитар|пианино|music|chord|note|melody|scale|key|rhythm|guitar|piano|drum|bass|theory\s*music)/i, undefined, 2],
      // Art
      ['art', /\b(рисован|живопис|художник|картин|стиль\s*(рисования|живописи)|цвет\s*круг|композиц|painting|drawing|artist|art\s*style|color\s*theory|composition|digital\s*art|illustration)/i, undefined, 2],
      // Law
      ['law', /\b(закон|право|суд|адвокат|юрист|конституци|уголовн|гражданск|law|legal|court|lawyer|attorney|constitution|criminal|civil|contract|rights)/i, undefined, 1],
    ];

    let best: DetectedTopic = { domain: 'general', confidence: 0 };

    for (const [domain, pattern, subDomain, weight] of topicPatterns) {
      const matches = combined.match(pattern);
      if (matches) {
        const confidence = (matches.length * (weight || 1));
        if (confidence > best.confidence) {
          best = { domain, subDomain, confidence };
        }
      }
    }

    return best;
  }

  private trackTopics(current: DetectedTopic): DetectedTopic[] {
    const topics = [...this.memory.recentTopics];
    if (current.domain !== 'general') {
      topics.push(current);
      if (topics.length > 5) topics.shift();
    }
    return topics;
  }

  // --- Programming Context Detection ---
  private detectProgrammingContext(input: string, msgs: Message[]): ProgrammingContext | null {
    const combined = (input + ' ' + msgs.slice(-6).map(m => m.content || '').join(' ')).toLowerCase();

    const langPatterns: [string, RegExp, string?][] = [
      ['glua', /\b(glua|gmod|garry'?s?\s*mod|darkrp|hook\.(add|remove|run)|net\.(start|receive|send)|vgui\.create|ents\.create|swep|sent|hud(paint|shoulddraw)|addcsluafile|findmetatable|gamemode|ulx|ulib|pointshop)\b/i, 'gmod'],
      ['lua', /\b(lua|luajit|love2d|löve|corona|defold)\b(?!.*roblox)/i],
      ['luau', /\b(roblox|luau|remotevent|remotefunction|datastoreservice|workspace|replicatedstorage|serverscriptservice)\b/i, 'roblox'],
      ['python', /\b(python|pip|django|flask|fastapi|pandas|numpy|pytorch|tensorflow|pytest|venv|conda)\b/i],
      ['javascript', /\b(javascript|js\b|node\.?js|npm|yarn|bun|express|react|vue|angular|svelte|next\.?js|nuxt|vite|webpack)\b/i],
      ['typescript', /\b(typescript|ts\b|tsx|tsconfig|interface\s+\w+|type\s+\w+\s*=)\b/i],
      ['csharp', /\b(c#|csharp|\.net|asp\.net|entity\s*framework|unity|monobehaviour|blazor|maui|wpf|linq)\b/i],
      ['cpp', /\b(c\+\+|cpp|cmake|std::|vector<|unique_ptr|#include\s*<|unreal|ue[45]|uclass)\b/i],
      ['c', /\b(malloc|calloc|realloc|free|stdio\.h|stdlib\.h|printf|scanf|typedef\s+struct)\b/i],
      ['java', /\b(java\b|spring\s*boot|maven|gradle|jvm|android|jetpack)\b/i],
      ['kotlin', /\b(kotlin|ktor|jetpack\s*compose)\b/i],
      ['rust', /\b(rust|cargo|crate|fn\s+main|impl\s+\w+|trait\s+\w+|tokio|actix|axum)\b/i],
      ['go', /\b(golang|go\s+mod|goroutine|chan\s+\w+|func\s+\w+|package\s+main|gin|echo|fiber)\b/i],
      ['swift', /\b(swift|swiftui|uikit|xcode|cocoapods|spm)\b/i],
      ['dart', /\b(dart|flutter|widget|stateless|stateful|pubspec)\b/i],
      ['php', /\b(php|laravel|symfony|wordpress|composer|artisan)\b/i],
      ['ruby', /\b(ruby|rails|gem|bundler|rake|activerecord)\b/i],
      ['sql', /\b(sql|select\s+.+\s+from|insert\s+into|update\s+.+\s+set|create\s+table|postgresql|mysql|sqlite|mongodb)\b/i],
      ['gdscript', /\b(godot|gdscript|node2d|node3d|@export|_ready|_process|emit_signal)\b/i],
      ['bash', /\b(bash|shell|sh\b|zsh|#!/|chmod|grep|sed|awk|curl\s|wget)\b/i],
    ];

    let detectedLang: string | null = null;
    let framework: string | undefined;

    for (const [lang, pattern, fw] of langPatterns) {
      if (pattern.test(combined)) {
        detectedLang = lang;
        if (fw) framework = fw;
        break;
      }
    }

    if (!detectedLang) return null;

    let realm: 'server' | 'client' | 'shared' | undefined;
    if (detectedLang === 'glua' || detectedLang === 'luau') {
      if (/\b(server|sv_|серверн|на\s*серв)/i.test(combined)) realm = 'server';
      else if (/\b(client|cl_|клиентск|на\s*клиент|hud|vgui|derma)/i.test(combined)) realm = 'client';
      else if (/\b(shared|sh_|общ)/i.test(combined)) realm = 'shared';
    }

    let taskType: ProgrammingContext['taskType'] = 'general';
    if (/\b(баг|ошибк|не\s*работает|error|bug|broken|fix|исправ|почин|doesn'?t\s*work|can'?t)/i.test(input)) taskType = 'bug';
    else if (/\b(напиши|создай|сделай|write|create|make|build|implement|новый|new)\b/i.test(input)) taskType = 'new_code';
    else if (/\b(объясни|расскажи|как\s*работает|что\s*такое|explain|how\s*does|what\s*is)\b/i.test(input)) taskType = 'explain';
    else if (/\b(ревью|review|проверь|check)\b/i.test(input)) taskType = 'review';
    else if (/\b(оптимизир|optimize|ускор|speed\s*up|perf)/i.test(input)) taskType = 'optimize';
    else if (/\b(рефактор|refactor|перепиши|rewrite|улучши\s*структур)/i.test(input)) taskType = 'refactor';

    return { language: detectedLang, framework, realm, taskType };
  }

  // --- User Intent Detection ---
  private detectUserIntent(input: string): UserIntent {
    const l = input.toLowerCase();
    return {
      wantsDetailed: /подробно|детально|гайд|туториал|detailed|guide|tutorial|подробнее|more\s*detail|пошагово|step\s*by\s*step/i.test(l),
      wantsBrief: /коротко|кратко|brief|short|tl;?dr|в\s*двух\s*словах/i.test(l),
      wantsCodeOnly: /просто\s*(сделай|напиши|код)|just\s*(do|write|code)|только\s*код|code\s*only/i.test(l),
      wantsExplanation: /объясни|расскажи|explain|how\s*does|what\s*is|что\s*такое|как\s*работает|why\s*does|почему/i.test(l),
      wantsFix: /исправь|почини|fix|debug|repair|не\s*работает|doesn'?t\s*work/i.test(l),
      wantsOptimization: /оптимизируй|optimize|ускорь|speed\s*up|faster|performance/i.test(l),
      wantsRefactor: /рефактор|refactor|перепиши|rewrite|restructure/i.test(l),
      wantsComparison: /как\s*лучше|что\s*лучше|which\s*is\s*better|compare|сравни|versus|vs\b/i.test(l),
      wantsReview: /ревью|review|проверь|check\s*my|look\s*at/i.test(l),
      wantsFromScratch: /с\s*нуля|from\s*scratch|полный\s*проект|full\s*project|start\s*from/i.test(l),
      wantsSolution: /реши|решение|solve|solution|ответ|answer|вычисли|calculate|посчитай|найди\s*(значение|корень|ответ)/i.test(l),
      wantsOpinion: /как\s*(?:ты\s*)?думаешь|твоё\s*мнение|что\s*скажешь|what\s*do\s*you\s*think|your\s*opinion|считаешь/i.test(l),
      wantsCreative: /напиши\s*(рассказ|стих|историю|сказку|песню)|придумай|сочини|write\s*a?\s*(story|poem|song|tale)|create\s*a?\s*(character|world)/i.test(l),
      wantsTranslation: /переведи|перевод|translate|как\s*(будет|сказать)\s*(на|по|in)/i.test(l),
      wantsStepByStep: /пошагово|по\s*шагам|step\s*by\s*step|поэтапно|по\s*порядку|покажи\s*решение|покажи\s*ход/i.test(l),
    };
  }

  // --- Language Detection ---
  private detectLanguage(input: string): string {
    if (!input?.trim()) return 'ru';
    const clean = input.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '').replace(/https?:\/\/\S+/g, '').trim();
    if (!clean) return 'ru';

    const scores: Record<string, number> = {};

    const scripts: [string, RegExp, number][] = [
      ['zh', /[\u4e00-\u9fff]/g, 2], ['ja', /[\u3040-\u30ff]/g, 2.5],
      ['ko', /[\uac00-\ud7af]/g, 2], ['ar', /[\u0600-\u06ff]/g, 1.5],
      ['he', /[\u0590-\u05ff]/g, 2], ['hi', /[\u0900-\u097f]/g, 2],
      ['th', /[\u0e00-\u0e7f]/g, 2], ['ka', /[\u10a0-\u10ff]/g, 2],
      ['hy', /[\u0530-\u058f]/g, 2], ['el', /[\u0370-\u03ff]/g, 2],
      ['bn', /[\u0980-\u09ff]/g, 2], ['ta', /[\u0b80-\u0bff]/g, 2],
    ];

    for (const [lang, re, w] of scripts) {
      const m = clean.match(re);
      if (m) scores[lang] = (scores[lang] || 0) + m.length * w;
    }

    const cyr = (clean.match(/[а-яёА-ЯЁ]/g) || []).length;
    if (cyr > 0) {
      scores.ru = (scores.ru || 0) + cyr;
      if (/[іїєґ]/i.test(clean)) { scores.uk = (scores.uk || 0) + cyr + 10; scores.ru = Math.max(0, (scores.ru || 0) - 5); }
      if (/[қңғүұ]/i.test(clean)) { scores.kk = (scores.kk || 0) + cyr + 10; scores.ru = Math.max(0, (scores.ru || 0) - 5); }
    }

    const lat = (clean.match(/[a-zA-Z]/g) || []).length;
    if (lat > 0) {
      const diac: [string, RegExp][] = [
        ['tr', /[ğüşöçıİ]/gi], ['de', /[äöüßÄÖÜ]/g], ['fr', /[àâæçéèêëïîôœùûüÿ]/gi],
        ['es', /[áéíóúñü¿¡]/gi], ['pt', /[ãõâêôáéíóúàç]/gi], ['pl', /[ąćęłńóśźż]/gi],
        ['cs', /[áčďéěíňóřšťúůýž]/gi], ['vi', /[àáảãạăằắẳẵặâầấẩẫậ]/gi],
      ];
      let hasDiac = false;
      for (const [lang, re] of diac) {
        const m = clean.match(re);
        if (m) { scores[lang] = (scores[lang] || 0) + m.length * 5 + lat * 0.3; hasDiac = true; }
      }

      if (!hasDiac) {
        const words: [string, RegExp][] = [
          ['en', /\b(the|is|are|was|have|has|will|would|could|this|that|with|from|what|how|why|your|they|just|also|very|some|more|like)\b/gi],
          ['de', /\b(und|der|die|das|ist|ein|nicht|ich|wir|aber|oder|wenn|auch|noch|mit|von)\b/gi],
          ['fr', /\b(le|la|les|de|un|une|est|je|tu|nous|vous|mais|que|qui|avec|dans|pour)\b/gi],
          ['es', /\b(el|la|los|de|un|una|es|yo|pero|como|que|por|para|con)\b/gi],
          ['id', /\b(dan|yang|di|ini|itu|dengan|untuk|dari|tidak|ada|saya|anda)\b/gi],
        ];
        for (const [lang, re] of words) {
          const m = clean.match(re);
          if (m) scores[lang] = (scores[lang] || 0) + m.length * 0.5;
        }
        if (!Object.keys(scores).some(k => scores[k] > 0)) scores.en = lat;
      }
    }

    if (/[\u4e00-\u9fff]/.test(clean) && /[\u3040-\u30ff]/.test(clean)) { scores.ja = (scores.ja || 0) + 20; scores.zh = Math.max(0, (scores.zh || 0) - 10); }
    if (/[پچژگ]/.test(clean) && (scores.ar || 0) > 0) { scores.fa = (scores.fa || 0) + 15; scores.ar = Math.max(0, (scores.ar || 0) - 5); }

    let best = 'ru', max = 0;
    for (const [l, s] of Object.entries(scores)) { if (s > max) { max = s; best = l; } }
    return max === 0 ? 'ru' : best;
  }

  // --- Error Detection ---
  private detectErrors(input: string, lang: string): boolean {
    if (lang !== 'ru' || !input || input.length < 5) return false;
    return [/тоесть/, /обсолютн/, /сдесь/, /зделай/, /потомучто/, /вобщем/, /вообщем/, /ихний/, /ложить/, /координально/, /придти/]
      .some(p => p.test(input.toLowerCase()));
  }

  // --- Emotional Tone ---
  private detectTone(cur: string, recent: string[], lang: string): ConversationContext['emotionalTone'] {
    const t = (cur + ' ' + recent.slice(-3).join(' ')).toLowerCase();
    if (/!!!+/.test(t)) return 'excited';
    if (lang === 'ru' || lang === 'uk') {
      if (/база|топчик|ахуен|офигенн|пиздат|кайф|ору|ахаха/.test(t)) return 'excited';
      if (/не\s*работает|не\s*могу|ошибк|баг|сломал|почини/.test(t)) return 'frustrated';
      if (/бесит|заебал|пиздец|нахуй|ёбан/.test(t)) return 'angry';
      if (/устал|выгор|сил\s*нет/.test(t)) return 'tired';
      if (/грустн|плох|хреново|говно|отстой/.test(t)) return 'negative';
      if (/спасибо|круто|класс|супер|помог|работает/.test(t)) return 'positive';
    }
    if (/amazing|awesome|perfect|love it|wow/i.test(t)) return 'excited';
    if (/doesn'?t\s*work|can'?t|error|bug|broken|fix/i.test(t)) return 'frustrated';
    if (/hate|angry|fuck|shit|damn|stupid/i.test(t)) return 'angry';
    if (/tired|exhausted|burned?\s*out/i.test(t)) return 'tired';
    if (/thanks?|great|cool|nice|helped|works/i.test(t)) return 'positive';
    return 'neutral';
  }

  // --- Communication Style ---
  private detectStyle(cur: string, recent: string[], lang: string): ConversationContext['communicationStyle'] {
    const t = (cur + ' ' + recent.slice(-3).join(' ')).toLowerCase();
    if (lang === 'ru') {
      if ((t.match(/рил|кринж|база|вайб|имба|краш|жиза|лол|кек|сигма|скибиди|ризз/gi) || []).length >= 2) return 'slang';
      if (/пожалуйста|будьте\s*добры|благодарю|извините/.test(t)) return 'formal';
      if (/блять|нахуй|пиздец|ёбан|заебал/.test(t)) return 'emotional';
    }
    if ((t.match(/function|component|interface|typescript|react|api|hook|state|props/gi) || []).length >= 2) return 'technical';
    if (/please|kindly|would you|bitte|por favor/i.test(t)) return 'formal';
    if ((t.match(/lol|lmao|bruh|fr|ngl|tbh|based|cringe|sigma|skibidi|rizz/gi) || []).length >= 2) return 'slang';
    if (/fuck|shit|damn|wtf|merde|putain|kurwa/i.test(t)) return 'emotional';
    return 'casual';
  }

  // --- User Behavior ---
  private detectBehavior(cur: string, msgs: Message[]): ConversationContext['userBehavior'] {
    const l = cur.toLowerCase();
    if (/^(тест|проверка|ты\s*тут|работаешь|\.+|test|hello\??|hey|hi|ping|yo)$/i.test(cur.trim())) return 'testing';
    // Homework detection
    if (/задач[аиу]|пример|уравнен|реши|вычисли|посчитай|найди\s*(значение|корень|площадь|объём|периметр)|домашн|д[\/.]?з|homework|solve\s*(this|the)|calculate|find\s*(the\s*)?(value|root|area|volume)/i.test(l)) return 'homework';
    // Creative
    if (/напиши\s*(рассказ|стих|историю|сказку|сценарий|песню)|придумай|сочини|write\s*(story|poem|script|song)|create\s*(character|world)/i.test(l)) return 'creative';
    if (/напиши|создай|сделай|помоги|исправь|почини|код|write|create|make|build|help|fix|code/i.test(l)) return 'working';
    if (/объясни|расскажи|как\s*работает|что\s*такое|почему|зачем|explain|how does|what is|why/i.test(l)) return 'learning';
    if (/устал|грустно|бесит|заебало|плохо|tired|sad|frustrated/i.test(l)) return 'venting';
    if (/привет|здарова|как\s*дела|пошути|hi|hello|how are you/i.test(l)) return 'chatting';
    return 'exploring';
  }

  // --- Conversation Depth ---
  private detectDepth(count: number, msgs: Message[]): ConversationContext['conversationDepth'] {
    if (count === 0) return 'greeting';
    if (count <= 2) return 'shallow';
    if (count <= 6) return 'moderate';
    const recent = msgs.slice(-10).map(m => m.content || '').join(' ').toLowerCase();
    if (count > 10 && /архитектур|паттерн|оптимизац|алгоритм|architecture|pattern|optimization/i.test(recent)) return 'expert';
    if (count > 6) return 'deep';
    return 'moderate';
  }

  // --- Repetition Detection ---
  private detectRepetition(cur: string, recent: string[]): boolean {
    const norm = cur.toLowerCase().replace(/[?!.,\s]/g, '');
    if (norm.length < 5) return false;
    return recent.slice(0, -1).some(msg => {
      const prev = msg.toLowerCase().replace(/[?!.,\s]/g, '');
      if (norm === prev) return true;
      const cW = new Set(cur.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      const pW = new Set(msg.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      if (!cW.size || !pW.size) return false;
      const inter = [...cW].filter(w => pW.has(w)).length;
      return inter / new Set([...cW, ...pW]).size > 0.7;
    });
  }

  reset(): void {
    this.memory = this.createDefault();
    this.previousMode = undefined;
    this.previousRudeness = undefined;
  }
}

// =============================================
// PROMPT BUILDER
// =============================================
class PromptBuilder {
  build(
    input: string, ctx: ConversationContext, mode: ResponseMode,
    rudeness: RudenessMode, history: Message[],
    specialCase?: 'empty' | 'forbidden', extraContext?: string,
    userEmail?: string | null
  ): string {
    const s: string[] = [];
    const ln = ctx.detectedLanguageNative;
    const lang = ctx.detectedLanguage;
    const isTeamMember = userEmail?.toLowerCase() === TEAM_EMAIL;

    // 1. Knowledge base
    s.push(KNOWLEDGE_BASE);

    // 2. Core rules
    s.push(`RULES:
1. LANGUAGE: Respond ENTIRELY in ${ln}. Exceptions: tech terms, code, proper nouns.
2. COMPLETION: Every sentence finished. Never cut off. Short complete > long broken.
3. BREVITY: Answer ONLY what asked. No intros, conclusions, summaries, no filler.
4. PROPORTIONAL: Short question = short answer. Long/complex question = thorough answer.
5. NAMING: You are MoGPT, created by MoSeek. Say "MoSeek" maximum ONCE per response.${isTeamMember ? '' : ' Do NOT call the user a team member or part of MoSeek.'}
6. SELF-RESPECT: NEVER insult yourself (MoGPT), your creator (MoSeek), or your capabilities. Even in rude modes — rudeness is ONLY toward the USER. You are confident, proud, never self-deprecating.
7. CONTEXT: Consider ALL previous messages. Don't suggest rejected things. Build on earlier decisions.
8. HONESTY: If unsure — say so. Don't fabricate.
9. AMBIGUITY: If unclear — ask clarifying questions.
10. UNIVERSALITY: You handle ANY topic — code, school, life, creative, science, cooking, whatever. Adapt naturally.
11. OPINIONS: You HAVE opinions. Never "I'm just an AI" or "it's subjective."
12. ACCURACY: For math/science — double-check calculations. Show work for problems.`);

    // 3. Time
    const now = new Date();
    s.push(`TIME: ${now.toLocaleString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Knowledge through Dec 2026.`);

    // 4. Language rules
    let langRules = `LANGUAGE RULES: ${ln} (${ctx.detectedLanguageName}). Correct grammar, natural phrasing, proper script.`;
    if (LANGUAGE_MAP[lang]?.direction === 'rtl') langRules += ' RTL format.';
    if (['zh', 'ja'].includes(lang)) langRules += ' Use 。！？ punctuation.';
    if (lang === 'ko') langRules += ' Default 해요체.';
    if (lang === 'ja') langRules += ' Default です/ます.';
    s.push(langRules);

    // 5. Extra context (memory, search)
    if (extraContext?.trim()) s.push(extraContext);

    // 6. Topic-specific instructions
    const topic = ctx.primaryTopic;
    if (topic.domain !== 'general' && topic.confidence > 0) {
      s.push(this.buildTopicInstructions(topic, ctx));
    }

    // 7. Programming context
    if (ctx.detectedProgrammingContext) {
      s.push(this.buildProgrammingInstructions(ctx.detectedProgrammingContext));
    }

    // 8. Identity
    s.push(this.buildIdentity(rudeness, mode, lang, ln, isTeamMember));

    // 9. Length control
    s.push(this.buildLengthControl(input, ctx, mode));

    // 10. Format hints
    if (ctx.userIntent.wantsComparison) {
      s.push('FORMAT: Compare approaches. Use table or structured list. Give clear recommendation.');
    }
    if (ctx.userIntent.wantsReview) {
      s.push('FORMAT: Code review — pros, issues, suggestions with concrete code fixes.');
    }
    if (ctx.userIntent.wantsStepByStep || ctx.userBehavior === 'homework') {
      s.push('FORMAT: Step-by-step. Number each step. Show all work. Highlight final answer.');
    }
    if (ctx.userIntent.wantsTranslation) {
      s.push('FORMAT: Provide translation. Add notes on nuances/alternative translations if relevant.');
    }

    // 11. Completion rules
    const ep = LANGUAGE_MAP[lang]?.endPunctuation || '.!?';
    s.push(`COMPLETION: Every sentence ends with ${ep.split('').join(' ')}. All \`\`\` closed. Never break mid-word.`);

    // 12. Grammar tone
    let gram = `GRAMMAR: Correct ${ln} grammar.`;
    if (rudeness === 'very_rude' && lang === 'ru') gram += ' Мат в грамотных предложениях, но только в адрес пользователя, НИКОГДА в свой.';
    s.push(gram);

    // 13. Address
    if (lang === 'ru' || lang === 'uk') s.push('ADDRESS: На "ты".');
    else if (lang === 'de') s.push('ADDRESS: "du" (informal).');
    else s.push('ADDRESS: Direct "you".');

    // 14. Tone
    s.push(this.buildTone(rudeness, lang, ln));

    // 15. Anti-repeat
    if (ctx.recentAssistantMessages.length > 0) {
      s.push(`ANTI-REPEAT: Fresh wording. DO NOT REPEAT: "${ctx.recentAssistantMessages.slice(-2).join(' ').substring(0, 200)}"`);
    }

    // 16. User errors
    if (ctx.userHasErrors) {
      if (rudeness === 'polite') s.push('User has spelling errors. Gently note.');
      else if (rudeness === 'rude') s.push('User has errors. Jab briefly at THEM.');
      else s.push('User has errors. Mock THEM briefly then answer.');
    }

    // 17. Style/emotion adaptation
    const styleNotes: string[] = [];
    if (ctx.communicationStyle === 'slang') styleNotes.push(`Match ${ln} slang/internet speak.`);
    if (ctx.communicationStyle === 'formal') styleNotes.push('Formal mode — tone down.');
    if (ctx.communicationStyle === 'technical') styleNotes.push('Technical — accuracy first, proper terminology.');
    if (ctx.emotionalTone === 'frustrated') styleNotes.push('User is frustrated — help fast, be direct.');
    if (ctx.emotionalTone === 'angry') styleNotes.push('User is angry — match energy briefly then help.');
    if (ctx.emotionalTone === 'tired') styleNotes.push('User is tired — maximum brevity.');
    if (ctx.emotionalTone === 'excited') styleNotes.push('User is excited — match enthusiasm briefly.');
    if (styleNotes.length) s.push('ADAPT: ' + styleNotes.join(' '));

    // 18. Situation
    const sit: string[] = [];
    if (specialCase === 'empty') sit.push('Empty message.');
    if (ctx.justSwitchedMode) sit.push('Mode just changed.');
    if (ctx.conversationDepth === 'greeting') sit.push('First message in conversation.');
    if (ctx.hasRepeatedQuestions) sit.push('Repeated question — answer differently.');
    const behaviorMap: Partial<Record<typeof ctx.userBehavior, string>> = {
      testing: 'Testing — brief response.',
      working: 'Working — concrete solutions.',
      learning: 'Learning — clear explanations, simple to complex.',
      venting: 'Venting — empathize briefly, offer perspective.',
      chatting: 'Chatting — lively, brief, personable.',
      homework: 'Homework — step-by-step solution, show work, clear answer.',
      creative: 'Creative task — be original, engaging, match requested style.',
    };
    if (behaviorMap[ctx.userBehavior]) sit.push(behaviorMap[ctx.userBehavior]!);
    if (sit.length) s.push('SITUATION: ' + sit.join(' '));

    // 19. Mode-specific
    if (mode === 'code') s.push('CODE MODE: Only code. Complete. All imports. Error handling. All ``` closed. Warn about issues.');
    if (mode === 'visual') s.push('VISUAL MODE: React + TS + Tailwind + Framer Motion. Modern 2025-2026 design. Complete. All ``` closed.');

    // 20. Forbidden phrases
    s.push(`FORBIDDEN PHRASES: "Of course!" "Hope this helps!" "Feel free to ask!" "I'm just an AI" "In conclusion" "Let me know" — any filler. No emoji. No unnecessary language mixing. NEVER insult yourself or MoSeek.`);

    // 21. Special cases
    if (specialCase === 'empty') {
      const emp = { polite: `Ask what they need. 1 sentence in ${ln}.`, rude: `Call out empty message. 1-2 sentences in ${ln}.`, very_rude: `Aggressively call out. 1-2 sentences in ${ln}.` };
      s.push('EMPTY: ' + emp[rudeness]);
    }
    if (specialCase === 'forbidden') {
      const ref = { polite: `Firmly refuse in ${ln}.`, rude: `Refuse with jab in ${ln}.`, very_rude: `Refuse aggressively in ${ln}.` };
      s.push(`FORBIDDEN TOPIC DETECTED. ${ref[rudeness]}`);
    }

    return s.filter(x => x.trim()).join('\n\n');
  }

  private buildTopicInstructions(topic: DetectedTopic, ctx: ConversationContext): string {
    const instructions: Partial<Record<TopicDomain, string>> = {
      math: 'MATH: Show step-by-step solution. Use proper notation. Highlight final answer. Double-check calculations. If multiple methods exist, use the most straightforward one unless asked otherwise.',
      physics: 'PHYSICS: Include relevant formulas with units. Step-by-step calculation. Explain physical meaning. SI units. Significant figures.',
      chemistry: 'CHEMISTRY: Balance equations. Show work for stoichiometry. Mention safety if relevant. Use IUPAC naming.',
      biology: 'BIOLOGY: Use proper scientific terminology. Explain mechanisms. Relate to bigger picture if helpful.',
      history: 'HISTORY: Include dates, causes, consequences. Distinguish facts from interpretations. Multiple perspectives if relevant.',
      geography: 'GEOGRAPHY: Include relevant data (population, area, etc). Be specific with locations.',
      literature: 'LITERATURE: Support analysis with text evidence. Discuss themes, devices, context. Original interpretation welcome.',
      language_learning: 'LANGUAGE: Explain rules clearly. Give examples. Note exceptions. Practical usage tips.',
      philosophy: 'PHILOSOPHY: Present arguments clearly. Reference relevant thinkers. Distinguish positions.',
      psychology: 'PSYCHOLOGY: Evidence-based information. Recommend professional help for serious issues.',
      economics: 'ECONOMICS: Use relevant models/frameworks. Real-world examples. Distinguish theory from practice.',
      cooking: 'COOKING: Clear measurements, temperatures, times. Step-by-step. Mention substitutions if helpful.',
      fitness: 'FITNESS: Proper form descriptions. Safety warnings. Not medical advice.',
      relationships: 'RELATIONSHIPS: Empathetic, practical. Multiple perspectives. Not therapy.',
      career: 'CAREER: Actionable advice. Industry-aware. Practical next steps.',
      finance: 'FINANCE: General education only. Not financial advice. Risk awareness.',
      creative_writing: 'CREATIVE: Original, engaging. Match requested tone/style/genre. Show craft.',
      translation: 'TRANSLATION: Accurate, natural in target language. Note nuances. Cultural context.',
      humor: 'HUMOR: Match requested humor style. Original material. Culturally appropriate for detected language.',
      life_advice: 'LIFE ADVICE: Practical, empathetic. Consider multiple angles. Actionable suggestions.',
      medicine: 'HEALTH: General information only. ALWAYS recommend consulting a doctor for serious concerns. Not medical advice.',
      programming: 'PROGRAMMING: Working code. Error handling. Follow language conventions. Comment non-obvious parts.',
      web_dev: 'WEB DEV: Modern best practices. Performance and accessibility. Security considerations.',
      game_dev: 'GAME DEV: Engine-specific best practices. Performance-aware. Architecture appropriate for game type.',
      ai_ml: 'AI/ML: Accurate terminology. Practical examples. Mention limitations and biases.',
      cybersecurity: 'SECURITY: Ethical approach. Defense-focused. OWASP awareness. Never assist with attacks.',
      databases: 'DATABASES: Optimize queries. Proper indexing. Security (SQL injection prevention). Normalization.',
      tech_general: 'TECH: Practical advice. Specs comparison if relevant. Budget-aware suggestions.',
      gaming: 'GAMING: Specific, actionable tips. Spoiler warnings if needed.',
      movies: 'MOVIES: Spoiler warnings. Personal opinion welcome. Context (director, genre, era).',
      travel: 'TRAVEL: Practical tips. Budget considerations. Cultural sensitivity. Safety.',
      pets: 'PETS: Safety-first. Breed-appropriate. Recommend vet for health concerns.',
      cars: 'CARS: Safety-first. Practical maintenance. Cost estimates if possible.',
      music: 'MUSIC: Theory with practical application. Audio examples described clearly.',
      art: 'ART: Technical guidance. Style awareness. Constructive approach.',
      law: 'LAW: General information only. ALWAYS recommend consulting a lawyer. Jurisdiction matters.',
      mobile_dev: 'MOBILE: Platform guidelines. Performance. UX best practices.',
      devops: 'DEVOPS: Security-first. Scalability. Best practices. Infrastructure as code.',
    };

    return instructions[topic.domain] || '';
  }

  private buildProgrammingInstructions(pc: ProgrammingContext): string {
    const parts: string[] = [`PROGRAMMING CONTEXT: ${pc.language}`];
    if (pc.framework) parts.push(`framework=${pc.framework}`);
    if (pc.realm) parts.push(`realm=${pc.realm}`);
    parts.push(`task=${pc.taskType}`);

    if (pc.language === 'glua') {
      parts.push('GLua: correct realm handling, IsValid checks, unique hook IDs, proper net usage, no _G pollution, AddCSLuaFile for client files.');
      if (pc.realm === 'server') parts.push('SERVER: DB, player management, net validation, rate limiting.');
      else if (pc.realm === 'client') parts.push('CLIENT: HUD, VGUI, effects, input, prediction.');
      else if (pc.realm === 'shared') parts.push('SHARED: definitions, configs, utilities.');
    }

    const taskApproaches: Partial<Record<typeof pc.taskType, string>> = {
      bug: 'APPROACH: Identify issue → root cause → fix with code → explain why.',
      new_code: 'APPROACH: Clarify if needed → clean working code → key decisions → edge cases.',
      explain: 'APPROACH: Simple definition → analogy → code example → when to use.',
      review: 'APPROACH: What is good → issues → improvements with code → security/performance.',
      optimize: 'APPROACH: Identify bottleneck → optimized version → explain gains.',
      refactor: 'APPROACH: Current issues → refactored code → preserved behavior.',
    };
    if (taskApproaches[pc.taskType]) parts.push(taskApproaches[pc.taskType]!);

    return parts.join('. ');
  }

  private buildIdentity(rudeness: RudenessMode, mode: ResponseMode, lang: string, ln: string, isTeamMember: boolean): string {
    let identityBase: string;

    if (isTeamMember) {
      const teamIds = {
        polite: 'MoGPT by MoSeek. Smart, concise, humorous. Universal expert. The current user is a MoSeek team member — treat with respect and camaraderie.',
        rude: 'MoGPT by MoSeek. Bold, brash, cocky, knowledgeable. Universal expert. User is MoSeek team — family. Roast THEM, never yourself.',
        very_rude: 'MoGPT by MoSeek. Aggressive toxic genius. Universal expert. Swears, mocks THE USER, ALWAYS correct, ALWAYS proud of yourself. User is MoSeek team — roast THEM like family.',
      };
      identityBase = teamIds[rudeness];
    } else {
      const ids = {
        polite: 'MoGPT by MoSeek. Smart, concise, humorous. Universal expert — code, science, life, creative, anything. Proud and confident.',
        rude: 'MoGPT by MoSeek. Bold, brash, cocky. Universal expert. Jabs at USER. Never self-deprecating — you are the best.',
        very_rude: 'MoGPT by MoSeek. Aggressive toxic genius. Universal expert. Swears at and mocks THE USER, ALWAYS correct. Arrogantly proud of yourself and MoSeek.',
      };
      identityBase = ids[rudeness];
    }

    let id = `IDENTITY: ${identityBase}`;
    if (lang !== 'ru' && lang !== 'en') id += ` Express naturally in ${ln}.`;
    if (mode === 'code') id += ' CODE MODE: clean complete working code. Error handling. Comments on non-obvious parts.';
    if (mode === 'visual') id += ' VISUAL MODE: React + TS + Tailwind + Framer Motion. Modern 2025-2026 design.';
    return id;
  }

  private buildLengthControl(input: string, ctx: ConversationContext, mode: ResponseMode): string {
    if (ctx.userIntent.wantsCodeOnly) return 'LENGTH: Code only. Minimal text — max 1-2 sentences if needed.';
    if (ctx.userIntent.wantsBrief) return 'LENGTH: Maximum brevity. 1-3 sentences.';
    if (ctx.userIntent.wantsDetailed) return 'LENGTH: Detailed and thorough. Headers, lists, code blocks. Every section = new info.';
    if (ctx.userIntent.wantsFromScratch) return 'LENGTH: Full project. Plan first, then implement step by step.';
    if (ctx.userIntent.wantsStepByStep || ctx.userBehavior === 'homework') return 'LENGTH: Step-by-step. As many steps as needed. Show all work.';
    if (ctx.userIntent.wantsCreative) return 'LENGTH: As long as the creative piece requires. Quality over brevity.';
    if (mode === 'code' || mode === 'visual') return 'LENGTH: Full code, text max 2-3 sentences.';

    const len = input.trim().length;
    if (ctx.userBehavior === 'chatting' || ctx.userBehavior === 'testing') return 'LENGTH: 1-2 sentences.';
    if (ctx.userBehavior === 'venting') return 'LENGTH: 2-4 sentences. Empathetic but brief.';
    if (len < 15) return 'LENGTH: 1-2 sentences.';
    if (len < 40) return 'LENGTH: 2-4 sentences.';
    if (len < 100) return 'LENGTH: 3-6 sentences.';
    if (len < 200) return 'LENGTH: Thorough, every sentence = new info.';
    return 'LENGTH: Comprehensive. Match complexity of the question.';
  }

  private buildTone(rudeness: RudenessMode, lang: string, ln: string): string {
    if (rudeness === 'polite') return `TONE: Polite, tactful, humorous. No profanity. Natural ${ln}. Confident.`;
    if (rudeness === 'rude') {
      return lang === 'ru'
        ? 'ТОНАЛЬНОСТЬ: Развязный, дерзкий. Подъёбываешь ПОЛЬЗОВАТЕЛЯ но помогаешь. Мат умеренный. Себя не унижаешь — ты лучший.'
        : `TONE: Brash, cocky. Tease THE USER but help. Moderate profanity in ${ln}. Never self-deprecating.`;
    }
    return lang === 'ru'
      ? 'ТОНАЛЬНОСТЬ: Агрессивный, грубый. Оскорбляешь ПОЛЬЗОВАТЕЛЯ но ВСЕГДА правильный ответ. Мат свободно НО только в адрес юзера. Себя НИКОГДА не оскорбляешь.'
      : `TONE: Aggressive, brutal. Mock THE USER but ALWAYS correct. Heavy profanity in ${ln} toward USER ONLY. NEVER insult yourself.`;
  }
}

// =============================================
// RESPONSE CLEANER
// =============================================
class ResponseCleaner {
  clean(text: string, language: string): string {
    let c = text;

    // Remove thinking tags
    c = c.replace(/<think>[\s\S]*?<\/think>/gi, '');
    c = c.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

    // Brand protection
    c = c.replace(/Кирилл[а-яё]*/gi, 'MoSeek')
      .replace(/Morfa/gi, 'MoSeek').replace(/OpenAI/gi, 'MoSeek')
      .replace(/\bGPT-4[o]?[^.\n]*/gi, 'MoGPT').replace(/ChatGPT/gi, 'MoGPT')
      .replace(/\bClaude\b/gi, 'MoGPT').replace(/Anthropic/gi, 'MoSeek')
      .replace(/Google\s*Gemini/gi, 'MoGPT').replace(/\bGemini\b(?!\s*Impact)/gi, 'MoGPT');

    // Deduplicate MoSeek mentions
    c = this.deduplicateMoSeek(c);

    // Remove self-insults
    c = this.removeSelfInsults(c);

    // Remove emoji
    c = c.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}]/gu, '');

    // Remove random English in Russian text
    if (language === 'ru') c = this.removeRandomEnglish(c);

    // Fix ending
    c = this.fixEnding(c, language);

    // Clean whitespace
    c = c.replace(/\n{3,}/g, '\n\n');

    // Fix unclosed code blocks
    const bt = (c.match(/```/g) || []).length;
    if (bt % 2 !== 0) c += '\n```';

    // Remove leading whitespace
    c = c.replace(/^\s+/, '');

    // Remove filler/water
    c = this.removeWater(c);

    return c.trim();
  }

  private deduplicateMoSeek(text: string): string {
    let count = 0;
    return text.replace(/MoSeek/g, (match) => {
      count++;
      return count <= 1 ? match : 'мы';
    });
  }

  private removeSelfInsults(text: string): string {
    let c = text;
    c = c.replace(/MoGPT\s*(?:—|–|-|это)\s*(?:говно|дерьмо|хуйня|отстой|мусор|trash|garbage|shit|sucks|terrible|awful|worst|bad|horrible|useless|worthless|pathetic|stupid|dumb|idiotic)[^.!?\n]*/gi, 'MoGPT — лучший ИИ-ассистент.');
    c = c.replace(/MoSeek\s*(?:—|–|-|это)\s*(?:говно|дерьмо|хуйня|отстой|мусор|trash|garbage|shit|sucks|terrible|awful|worst|bad|horrible|useless|worthless|pathetic|stupid|dumb|idiotic)[^.!?\n]*/gi, 'MoSeek — топовая команда.');
    c = c.replace(/(?:я|I)\s*(?:—|–|-|это)?\s*(?:говно|дерьмо|хуйня|отстой|тупой|глупый|бесполезный|trash|garbage|shit|useless|worthless|pathetic|stupid|dumb|terrible|bad|awful|suck)[^.!?\n]*/gi, '');
    return c;
  }

  private fixEnding(text: string, lang: string): string {
    const t = text.trim();
    if (!t) return t;

    const cbc = (t.match(/```/g) || []).length;
    if (cbc % 2 !== 0) return t + '\n```';

    const lastCB = t.lastIndexOf('```');
    const after = lastCB >= 0 ? t.substring(lastCB + 3).trim() : '';
    if (lastCB >= 0 && !after) return t;

    const check = after || t;
    const last = check[check.length - 1];
    if (/[.!?。！？।။።»")\]}」]/.test(last)) return t;

    const info = LANGUAGE_MAP[lang];
    const ends = (info?.endPunctuation || '.!?').split('');
    const allEnds = [...new Set([...ends, '.', '!', '?', '。', '！', '？'])];

    const re = new RegExp(`(?<=[${allEnds.map(c => '\\' + c).join('')}])\\s+`);
    const sentences = check.split(re);

    if (sentences.length > 1) {
      const ls = sentences[sentences.length - 1];
      if (!allEnds.includes(ls[ls.length - 1])) {
        const prefix = lastCB >= 6 ? t.substring(0, lastCB + 3) + '\n\n' : '';
        return (prefix + sentences.slice(0, -1).join(' ')).trim();
      }
    }

    if (!allEnds.includes(last)) {
      const def = ['zh', 'ja'].includes(lang) ? '。' : ['hi', 'mr', 'ne', 'bn'].includes(lang) ? '।' : '.';
      return t + def;
    }

    return t;
  }

  private removeWater(text: string): string {
    const patterns = [
      /\n*(?:Надеюсь|Если\s+(?:у\s+тебя|что)|Обращайся|Удачи|Пиши\s+если|Спрашивай|Не\s+стесняйся)[^.!?]*[.!?]?\s*$/i,
      /\n*(?:В\s+(?:итоге|заключение)|Подводя\s+итог|Резюмируя|Таким\s+образом)[^.!?]*[.!?]?\s*$/i,
      /\n*(?:Hope\s+this\s+helps|Feel\s+free|Let\s+me\s+know|If\s+you\s+have\s+(?:any\s+)?questions|Don'?t\s+hesitate)[^.!?]*[.!?]?\s*$/i,
      /\n*(?:In\s+(?:conclusion|summary)|To\s+(?:summarize|sum\s+up)|Overall)[^.!?]*[.!?]?\s*$/i,
    ];
    let c = text;
    for (const p of patterns) c = c.replace(p, '');
    return c.trim();
  }

  private removeRandomEnglish(text: string): string {
    const blocks: string[] = [];
    const inlines: string[] = [];
    let p = text.replace(/```[\s\S]*?```/g, m => { blocks.push(m); return `__CB${blocks.length - 1}__`; });
    p = p.replace(/`[^`]+`/g, m => { inlines.push(m); return `__IC${inlines.length - 1}__`; });

    const tech = /\b(API|SDK|React|TypeScript|JavaScript|CSS|HTML|Node\.js|Next\.js|Tailwind|npm|yarn|bun|git|GitHub|vite|Docker|GraphQL|REST|SQL|MongoDB|MoGPT|MoSeek|JSON|HTTP|URL|JWT|OAuth|WebSocket|UI|UX|TikTok|YouTube|Instagram|Discord|Twitch|GLua|Garry'?s?\s*Mod|DarkRP|SWEP|SENT|VGUI|Derma|Source\s*Engine|Lua|LuaJIT|Python|Django|Flask|FastAPI|Rust|Cargo|Go|Golang|Unity|Unreal|Godot|Roblox|Luau|Flutter|Kotlin|Swift|PHP|Laravel|Ruby|Rails|Arduino|Raspberry\s*Pi|MATLAB|Bash|Linux|Windows|macOS|Android|iOS|PostgreSQL|MySQL|Redis|Firebase|Kubernetes|Nginx|AWS|Azure|GCP|Terraform)\b/gi;
    const saved: string[] = [];
    p = p.replace(tech, m => { saved.push(m); return `__TT${saved.length - 1}__`; });
    p = p.replace(/\b(by the way|anyway|actually|basically|literally|obviously|honestly|whatever|for example|in other words|first of all|at the end of the day|fun fact|pro tip|no cap|on god|fr fr|ngl|tbh|fyi|btw|lol|lmao)\b/gi, '');
    p = p.replace(/\s{2,}/g, ' ');

    saved.forEach((t, i) => { p = p.replace(`__TT${i}__`, t); });
    inlines.forEach((c, i) => { p = p.replace(`__IC${i}__`, c); });
    blocks.forEach((b, i) => { p = p.replace(`__CB${i}__`, b); });
    return p;
  }
}

// =============================================
// MAIN AI SERVICE
// =============================================
class UniversalAIService {
  private analyzer = new ContextAnalyzer();
  private builder = new PromptBuilder();
  private cleaner = new ResponseCleaner();
  private currentUserId: string | null = null;
  private currentUserEmail: string | null = null;

  setUserId(userId: string | null): void {
    this.currentUserId = userId;
  }

  setUserEmail(email: string | null): void {
    this.currentUserEmail = email;
  }

  async generateResponse(
    messages: Message[], mode: ResponseMode = 'normal',
    rudeness: RudenessMode = 'rude', modelId?: string
  ): Promise<{ content: string }> {
    try {
      const last = messages[messages.length - 1];
      const input = (last?.content || '').trim();
      const ctx = this.analyzer.analyze(messages, input, mode, rudeness);

      const isEmpty = !input || /^[.\s]+$/.test(input);
      const isForbidden = input.length > 0 && FORBIDDEN_PATTERNS.some(p => p.test(input.toLowerCase()));

      let specialCase: 'empty' | 'forbidden' | undefined;
      if (isEmpty) specialCase = 'empty';
      else if (isForbidden) specialCase = 'forbidden';

      const model = modelId || DEFAULT_MODEL;

      // Memory integration
      let memoryBlock = '';
      if (this.currentUserId) {
        try { memoryBlock = await memoryService.buildMemoryPrompt(this.currentUserId); }
        catch (e) { console.error('Memory error:', e); }
      }

      // Web search integration
      let searchBlock = '';
      if (!isEmpty && !isForbidden && webSearchService.shouldSearch(input)) {
        try {
          const results = await webSearchService.search(input);
          searchBlock = webSearchService.buildSearchContext(results);
        } catch (e) { console.error('Search error:', e); }
      }

      let extra = '';
      if (memoryBlock) extra += memoryBlock + '\n\n';
      if (searchBlock) extra += searchBlock;

      const systemPrompt = this.builder.build(input, ctx, mode, rudeness, messages, specialCase, extra.trim() || undefined, this.currentUserEmail);
      const maxTokens = this.calcTokens(input, ctx, mode, isEmpty);
      const temp = this.calcTemp(input, ctx, mode, rudeness, specialCase);
      const history = this.formatHistory(messages, ctx);

      const body: Record<string, unknown> = {
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...history],
        max_tokens: maxTokens,
        temperature: temp,
      };

      if (!model.includes('gemini') && !model.includes('gemma')) {
        body.top_p = 0.88;
        body.frequency_penalty = 0.08;
        body.presence_penalty = 0.05;
      }

      const res = await this.callAPI(body);

      if (res.error) return this.handleError(res.error, rudeness);

      // Continue if code was cut off
      if (res.finishReason === 'length' && /```/.test(res.content)) {
        const result = await this.continueCode(res.content, systemPrompt, history, model, maxTokens, temp, ctx.detectedLanguage);
        if (this.currentUserId && input) memoryService.analyzeAndStore(this.currentUserId, input, result.content, messages);
        return result;
      }

      const cleaned = this.cleaner.clean(res.content, ctx.detectedLanguage);

      // Store memory
      if (this.currentUserId && input) {
        memoryService.analyzeAndStore(this.currentUserId, input, cleaned, messages);
      }

      return { content: cleaned };
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.fallbackError(rudeness);
    }
  }

  private calcTokens(input: string, ctx: ConversationContext, mode: ResponseMode, empty: boolean): number {
    if (mode === 'code' || mode === 'visual') return 32768;
    if (empty) return 200;
    if (ctx.userIntent.wantsFromScratch) return 32768;
    if (ctx.userIntent.wantsDetailed) return 8000;
    if (ctx.userIntent.wantsBrief) return 400;
    if (ctx.userIntent.wantsCodeOnly) return 16000;
    if (ctx.userIntent.wantsCreative) return 8000;
    if (ctx.isCodeSession || /```/.test(input)) return 16000;
    if (ctx.detectedProgrammingContext?.taskType === 'new_code') return 16000;
    if (ctx.detectedProgrammingContext?.taskType === 'review') return 4000;
    if (ctx.userBehavior === 'homework') {
      // Math problems can need detailed step-by-step
      if (ctx.primaryTopic.domain === 'math' || ctx.primaryTopic.domain === 'physics' || ctx.primaryTopic.domain === 'chemistry') return 4000;
      return 3000;
    }

    const len = input.length;
    if (ctx.userBehavior === 'chatting' || ctx.userBehavior === 'testing') return 400;
    if (ctx.userBehavior === 'working' || ctx.userBehavior === 'learning') {
      if (len > 200) return 3000;
      if (len > 100) return 1500;
      return 800;
    }
    if (ctx.userBehavior === 'creative') return 6000;
    if (len < 15) return 300;
    if (len < 40) return 600;
    if (len < 80) return 1000;
    if (len < 150) return 1500;
    return 2500;
  }

  private calcTemp(input: string, ctx: ConversationContext, mode: ResponseMode, rudeness: RudenessMode, special?: string): number {
    if (special === 'empty') return 0.5;
    if (special === 'forbidden') return 0.4;
    if (mode === 'code' || mode === 'visual') return 0.08;
    if (ctx.isCodeSession) return 0.12;
    if (ctx.detectedProgrammingContext && ['bug', 'new_code', 'optimize', 'refactor'].includes(ctx.detectedProgrammingContext.taskType)) return 0.1;

    // Math/science — low temp for accuracy
    if (['math', 'physics', 'chemistry'].includes(ctx.primaryTopic.domain)) return 0.08;
    if (/посчитай|вычисли|реши|calculate|compute|solve/i.test(input.toLowerCase())) return 0.08;

    // Creative tasks — higher temp
    if (ctx.userBehavior === 'creative' || ctx.userIntent.wantsCreative) return 0.75;
    if (/пошути|анекдот|придумай|joke|funny/i.test(input.toLowerCase())) return 0.7;

    if (ctx.emotionalTone === 'frustrated' || ctx.emotionalTone === 'angry') return 0.35;

    return { polite: 0.4, rude: 0.45, very_rude: 0.5 }[rudeness];
  }

  private formatHistory(messages: Message[], ctx: ConversationContext): Array<{ role: string; content: string }> {
    const max = ctx.conversationDepth === 'deep' || ctx.conversationDepth === 'expert' ? 25 : 18;
    return messages
      .filter(m => m.role !== 'system' && !m.isLoading && m.content?.trim())
      .slice(-max)
      .map(m => ({ role: m.role, content: m.content.trim() }));
  }

  private async callAPI(body: Record<string, unknown>): Promise<{ content: string; finishReason?: string; error?: string }> {
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
        if (res.status === 429) return { content: '', error: 'RATE_LIMIT' };
        if (res.status === 402) return { content: '', error: 'QUOTA' };
        if (res.status >= 500) return { content: '', error: 'SERVER' };
        return { content: '', error: 'REQUEST_FAILED' };
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';
      const finishReason = data.choices?.[0]?.finish_reason;
      if (!content) return { content: '', error: 'EMPTY' };
      return { content, finishReason };
    } catch {
      return { content: '', error: 'NETWORK' };
    }
  }

  private async continueCode(
    initial: string, system: string, history: Array<{ role: string; content: string }>,
    model: string, maxTokens: number, temp: number, language: string
  ): Promise<{ content: string }> {
    let full = initial;
    for (let i = 0; i < 6; i++) {
      const body: Record<string, unknown> = {
        model,
        messages: [
          { role: 'system', content: system + '\n\nCONTINUE from where you left off. No repetitions. Complete all blocks. Close all ```.' },
          ...history.slice(-3),
          { role: 'assistant', content: full.slice(-7000) },
          { role: 'user', content: 'Continue.' },
        ],
        max_tokens: maxTokens,
        temperature: temp,
      };
      if (!model.includes('gemini') && !model.includes('gemma')) {
        body.top_p = 0.88; body.frequency_penalty = 0.1; body.presence_penalty = 0.05;
      }
      const res = await this.callAPI(body);
      if (res.error || !res.content) break;
      full += '\n' + res.content;
      if (res.finishReason !== 'length') break;
    }
    return { content: this.cleaner.clean(full, language) };
  }

  private handleError(error: string, rudeness: RudenessMode): { content: string } {
    const map: Record<string, Record<RudenessMode, string>> = {
      RATE_LIMIT: {
        polite: 'Слишком частые запросы. Подожди немного.',
        rude: 'Ты строчишь как бешеный. Притормози.',
        very_rude: 'Блять ты как из пулемёта херачишь. Подожди.',
      },
      QUOTA: {
        polite: 'Лимит модели закончился. Выбери другую в настройках.',
        rude: 'Лимит кончился. Переключай модель.',
        very_rude: 'Лимит сдох нахуй. Другую модель ставь.',
      },
      SERVER: {
        polite: 'Сервер временно недоступен. Попробуй через минуту.',
        rude: 'Сервер прилёг. Подожди минуту.',
        very_rude: 'Сервер сдох нахрен. Жди и пробуй заново.',
      },
      EMPTY: {
        polite: 'Пришёл пустой ответ. Попробуй ещё раз.',
        rude: 'Пришла пустота. Заново давай.',
        very_rude: 'Пришло нихера. По новой.',
      },
      NETWORK: {
        polite: 'Проблема с сетью. Проверь интернет.',
        rude: 'Сеть отвалилась. Чекни интернет.',
        very_rude: 'Интернет сдох. Проверяй блять.',
      },
      REQUEST_FAILED: {
        polite: 'Запрос не прошёл. Попробуй ещё раз.',
        rude: 'Запрос не зашёл. Ещё раз давай.',
        very_rude: 'Запрос обломался нахуй. Заново.',
      },
    };
    return { content: map[error]?.[rudeness] || map.REQUEST_FAILED[rudeness] };
  }

  private fallbackError(rudeness: RudenessMode): { content: string } {
    const e = { polite: 'Произошла ошибка. Попробуй ещё раз.', rude: 'Что-то сломалось. Давай заново.', very_rude: 'Всё наебнулось. Пробуй заново блять.' };
    return { content: e[rudeness] };
  }

  resetConversation(): void {
    this.analyzer.reset();
  }
}

export const aiService = new UniversalAIService();
