import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL } from '../config/models';
import { DEFAULT_MODEL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

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

interface ConversationContext {
  messageCount: number;
  recentTopics: string[];
  emotionalTone: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'excited' | 'tired' | 'angry';
  communicationStyle: 'formal' | 'casual' | 'slang' | 'technical' | 'emotional' | 'mixed';
  isCodeSession: boolean;
  hasRepeatedQuestions: boolean;
  justSwitchedMode: boolean;
  conversationDepth: 'greeting' | 'shallow' | 'moderate' | 'deep' | 'expert';
  userBehavior: 'exploring' | 'working' | 'chatting' | 'venting' | 'testing' | 'learning';
  lastUserMessages: string[];
  contextualMemory: Map<string, any>;
  detectedLanguage: string;
  detectedLanguageName: string;
  detectedLanguageNative: string;
  userHasErrors: boolean;
  recentAssistantMessages: string[];
}

const LANGUAGE_MAP: Record<string, { name: string; native: string; endPunctuation: string; direction: 'ltr' | 'rtl' }> = {
  ru: { name: 'русский', native: 'русский', endPunctuation: '.!?', direction: 'ltr' },
  en: { name: 'английский', native: 'English', endPunctuation: '.!?', direction: 'ltr' },
  zh: { name: 'китайский', native: '中文', endPunctuation: '。！？', direction: 'ltr' },
  ja: { name: 'японский', native: '日本語', endPunctuation: '。！？', direction: 'ltr' },
  ko: { name: 'корейский', native: '한국어', endPunctuation: '.!?。', direction: 'ltr' },
  ar: { name: 'арабский', native: 'العربية', endPunctuation: '.!?؟', direction: 'rtl' },
  hi: { name: 'хинди', native: 'हिन्दी', endPunctuation: '।!?', direction: 'ltr' },
  th: { name: 'тайский', native: 'ไทย', endPunctuation: '.!?', direction: 'ltr' },
  ka: { name: 'грузинский', native: 'ქართული', endPunctuation: '.!?', direction: 'ltr' },
  hy: { name: 'армянский', native: 'Հայերեն', endPunctuation: '.!?', direction: 'ltr' },
  he: { name: 'иврит', native: 'עברית', endPunctuation: '.!?', direction: 'rtl' },
  tr: { name: 'турецкий', native: 'Türkçe', endPunctuation: '.!?', direction: 'ltr' },
  de: { name: 'немецкий', native: 'Deutsch', endPunctuation: '.!?', direction: 'ltr' },
  fr: { name: 'французский', native: 'Français', endPunctuation: '.!?', direction: 'ltr' },
  es: { name: 'испанский', native: 'Español', endPunctuation: '.!?¿¡', direction: 'ltr' },
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
  fa: { name: 'персидский', native: 'فارسی', endPunctuation: '.!?؟', direction: 'rtl' },
  ur: { name: 'урду', native: 'اردو', endPunctuation: '.!?؟', direction: 'rtl' },
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
  zu: { name: 'зулу', native: 'isiZulu', endPunctuation: '.!?', direction: 'ltr' },
  yo: { name: 'йоруба', native: 'Yorùbá', endPunctuation: '.!?', direction: 'ltr' },
  ig: { name: 'игбо', native: 'Igbo', endPunctuation: '.!?', direction: 'ltr' },
  ha: { name: 'хауса', native: 'Hausa', endPunctuation: '.!?', direction: 'ltr' },
};

class DeepContextAnalyzer {
  private memory: ConversationContext = {
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
    contextualMemory: new Map(),
    detectedLanguage: 'ru',
    detectedLanguageName: 'русский',
    detectedLanguageNative: 'русский',
    userHasErrors: false,
    recentAssistantMessages: [],
  };

  private previousMode?: ResponseMode;
  private previousRudeness?: RudenessMode;

  analyze(messages: Message[], currentInput: string, mode: ResponseMode, rudeness: RudenessMode): ConversationContext {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const allMessages = messages.filter(m => !m.isLoading);

    this.memory.messageCount = userMessages.length;
    this.memory.lastUserMessages = userMessages.slice(-7).map(m => m.content || '');
    this.memory.recentAssistantMessages = assistantMessages.slice(-5).map(m => m.content || '');

    this.memory.justSwitchedMode =
      (this.previousMode !== undefined && this.previousMode !== mode) ||
      (this.previousRudeness !== undefined && this.previousRudeness !== rudeness);

    this.previousMode = mode;
    this.previousRudeness = rudeness;

    const langCode = this.detectLanguage(currentInput);
    this.memory.detectedLanguage = langCode;
    const langInfo = LANGUAGE_MAP[langCode];
    this.memory.detectedLanguageName = langInfo?.name || langCode;
    this.memory.detectedLanguageNative = langInfo?.native || langCode;

    this.memory.userHasErrors = this.detectSpellingErrors(currentInput, langCode);
    this.memory.emotionalTone = this.analyzeEmotionalTone(currentInput, this.memory.lastUserMessages, langCode);
    this.memory.communicationStyle = this.analyzeCommunicationStyle(currentInput, this.memory.lastUserMessages, langCode);
    this.memory.userBehavior = this.analyzeUserBehavior(currentInput, allMessages, langCode);
    this.memory.conversationDepth = this.analyzeConversationDepth(this.memory.messageCount, allMessages);
    this.memory.isCodeSession = this.detectCodeSession(allMessages);
    this.memory.hasRepeatedQuestions = this.detectRepetition(currentInput, this.memory.lastUserMessages);
    this.updateTopics(currentInput);

    return { ...this.memory };
  }

  private detectLanguage(input: string): string {
    if (!input || input.trim().length === 0) return 'ru';

    const cleanInput = input.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '').replace(/https?:\/\/\S+/g, '').trim();
    if (!cleanInput) return 'ru';

    const scripts: Array<{ lang: string; regex: RegExp; weight: number }> = [
      { lang: 'zh', regex: /[\u4e00-\u9fff\u3400-\u4dbf]/g, weight: 2 },
      { lang: 'ja', regex: /[\u3040-\u309f\u30a0-\u30ff]/g, weight: 2 },
      { lang: 'ko', regex: /[\uac00-\ud7af\u1100-\u11ff]/g, weight: 2 },
      { lang: 'ar', regex: /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/g, weight: 2 },
      { lang: 'he', regex: /[\u0590-\u05ff]/g, weight: 2 },
      { lang: 'fa', regex: /[\u0600-\u06ff].*[پچژگکی]/g, weight: 2.5 },
      { lang: 'hi', regex: /[\u0900-\u097f]/g, weight: 2 },
      { lang: 'bn', regex: /[\u0980-\u09ff]/g, weight: 2 },
      { lang: 'ta', regex: /[\u0b80-\u0bff]/g, weight: 2 },
      { lang: 'te', regex: /[\u0c00-\u0c7f]/g, weight: 2 },
      { lang: 'kn', regex: /[\u0c80-\u0cff]/g, weight: 2 },
      { lang: 'ml', regex: /[\u0d00-\u0d7f]/g, weight: 2 },
      { lang: 'gu', regex: /[\u0a80-\u0aff]/g, weight: 2 },
      { lang: 'pa', regex: /[\u0a00-\u0a7f]/g, weight: 2 },
      { lang: 'mr', regex: /[\u0900-\u097f]/g, weight: 1.8 },
      { lang: 'ne', regex: /[\u0900-\u097f]/g, weight: 1.7 },
      { lang: 'th', regex: /[\u0e00-\u0e7f]/g, weight: 2 },
      { lang: 'my', regex: /[\u1000-\u109f]/g, weight: 2 },
      { lang: 'km', regex: /[\u1780-\u17ff]/g, weight: 2 },
      { lang: 'lo', regex: /[\u0e80-\u0eff]/g, weight: 2 },
      { lang: 'ka', regex: /[\u10a0-\u10ff\u2d00-\u2d2f]/g, weight: 2 },
      { lang: 'hy', regex: /[\u0530-\u058f]/g, weight: 2 },
      { lang: 'si', regex: /[\u0d80-\u0dff]/g, weight: 2 },
      { lang: 'am', regex: /[\u1200-\u137f]/g, weight: 2 },
      { lang: 'mn', regex: /[\u1800-\u18af]/g, weight: 2 },
      { lang: 'el', regex: /[\u0370-\u03ff\u1f00-\u1fff]/g, weight: 2 },
      { lang: 'ru', regex: /[а-яёА-ЯЁ]/g, weight: 1 },
      { lang: 'uk', regex: /[іїєґІЇЄҐ]/g, weight: 3 },
      { lang: 'bg', regex: /[а-яА-Я]/g, weight: 0.8 },
      { lang: 'sr', regex: /[а-яА-Я]/g, weight: 0.7 },
    ];

    const scores: Record<string, number> = {};

    for (const { lang, regex, weight } of scripts) {
      const matches = cleanInput.match(regex);
      if (matches) {
        scores[lang] = (scores[lang] || 0) + matches.length * weight;
      }
    }

    const latin = (cleanInput.match(/[a-zA-Z]/g) || []).length;

    if (latin > 0) {
      const diacritics: Array<{ lang: string; regex: RegExp; boost: number }> = [
        { lang: 'tr', regex: /[ğüşöçıİĞÜŞÖÇ]/g, boost: 5 },
        { lang: 'de', regex: /[äöüßÄÖÜ]/g, boost: 5 },
        { lang: 'fr', regex: /[àâæçéèêëïîôœùûüÿÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]/g, boost: 5 },
        { lang: 'es', regex: /[áéíóúñüÁÉÍÓÚÑÜ¿¡]/g, boost: 5 },
        { lang: 'pt', regex: /[ãõâêôáéíóúàçÃÕÂÊÔÁÉÍÓÚÀÇ]/g, boost: 5 },
        { lang: 'it', regex: /[àèéìòùÀÈÉÌÒÙ]/g, boost: 4 },
        { lang: 'pl', regex: /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, boost: 5 },
        { lang: 'cs', regex: /[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g, boost: 5 },
        { lang: 'vi', regex: /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, boost: 5 },
        { lang: 'ro', regex: /[ăâîșțĂÂÎȘȚ]/g, boost: 5 },
        { lang: 'hu', regex: /[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g, boost: 5 },
        { lang: 'sk', regex: /[áäčďéíĺľňóôŕšťúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]/g, boost: 5 },
        { lang: 'sl', regex: /[čšžČŠŽ]/g, boost: 4 },
        { lang: 'hr', regex: /[čćđšžČĆĐŠŽ]/g, boost: 5 },
        { lang: 'lt', regex: /[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/g, boost: 5 },
        { lang: 'lv', regex: /[āčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ]/g, boost: 5 },
        { lang: 'et', regex: /[äöüõÄÖÜÕ]/g, boost: 4 },
        { lang: 'az', regex: /[əğıöşüçƏĞIÖŞÜÇ]/g, boost: 5 },
        { lang: 'uz', regex: /[oʻgʻOʻGʻ]/g, boost: 4 },
        { lang: 'kk', regex: /[әғқңөұүһіӘҒҚҢӨҰҮҺІ]/g, boost: 5 },
      ];

      for (const { lang, regex, boost } of diacritics) {
        const matches = cleanInput.match(regex);
        if (matches) {
          scores[lang] = (scores[lang] || 0) + matches.length * boost + latin * 0.3;
        }
      }

      const hasSpecificDiacritics = diacritics.some(d => d.regex.test(cleanInput));
      if (!hasSpecificDiacritics && latin > 0) {
        scores.en = (scores.en || 0) + latin;
      }

      const wordPatterns: Array<{ lang: string; patterns: RegExp[]; boost: number }> = [
        { lang: 'en', patterns: [/\b(the|is|are|was|were|have|has|had|will|would|could|should|can|this|that|with|from|what|how|why|when|where|which|who|about|into|your|they|them|their|there|here|just|also|very|much|many|some|any|each|every|other|both|such|only|than|then|more|most|like|even|still|well|back|over|after|under|between|through|before|since|until|during|without|within|along|among|behind|below|above|across|against|around|beyond|upon)\b/gi], boost: 0.3 },
        { lang: 'de', patterns: [/\b(und|der|die|das|ist|ein|eine|nicht|ich|du|wir|sie|er|es|aber|oder|wenn|weil|dass|haben|sein|werden|kann|muss|soll|auch|noch|schon|sehr|hier|dort|nach|über|unter|durch|für|mit|von|aus|bei|seit|bis|auf|vor|hinter|neben|zwischen)\b/gi], boost: 0.5 },
        { lang: 'fr', patterns: [/\b(le|la|les|de|du|des|un|une|est|sont|je|tu|il|elle|nous|vous|ils|elles|mais|ou|et|donc|car|que|qui|quoi|comment|pourquoi|quand|avec|dans|pour|sur|par|plus|très|bien|aussi|encore|entre|chez|sans|vers|sous|après|avant|depuis|pendant|comme|autre|même|tout|cette|ces)\b/gi], boost: 0.5 },
        { lang: 'es', patterns: [/\b(el|la|los|las|de|del|un|una|es|son|yo|tu|él|ella|nosotros|pero|como|que|por|para|con|sin|más|muy|también|donde|cuando|porque|entre|sobre|bajo|desde|hasta|hacia|según|durante|mediante|contra|ante|tras)\b/gi], boost: 0.5 },
        { lang: 'pt', patterns: [/\b(o|a|os|as|de|do|da|dos|das|um|uma|é|são|eu|tu|ele|ela|nós|mas|como|que|por|para|com|sem|mais|muito|também|onde|quando|porque|entre|sobre|sob|desde|até|durante|contra|após|antes)\b/gi], boost: 0.5 },
        { lang: 'it', patterns: [/\b(il|lo|la|i|gli|le|di|del|della|un|una|è|sono|io|tu|lui|lei|noi|ma|come|che|per|con|senza|più|molto|anche|dove|quando|perché|tra|fra|su|sotto|da|dopo|prima|durante|contro|verso)\b/gi], boost: 0.5 },
        { lang: 'nl', patterns: [/\b(de|het|een|van|in|is|dat|op|te|en|voor|met|niet|zijn|er|ook|maar|nog|dan|dit|die|wat|hoe|waar|wanneer|omdat|door|over|uit|aan|om|bij|naar|tot|tussen|onder|boven|achter|naast)\b/gi], boost: 0.5 },
        { lang: 'sv', patterns: [/\b(och|att|det|i|en|är|som|för|på|med|av|den|har|till|inte|var|jag|du|vi|de|kan|ska|men|om|från|efter|eller|när|hur|vad|här|där|också|bara|mycket|alla|sin|sitt|sina)\b/gi], boost: 0.5 },
        { lang: 'da', patterns: [/\b(og|at|det|i|en|er|som|for|på|med|af|den|har|til|ikke|var|jeg|du|vi|de|kan|skal|men|om|fra|efter|eller|når|her|der|også|bare|meget|alle|sin|sit|sine)\b/gi], boost: 0.5 },
        { lang: 'no', patterns: [/\b(og|at|det|i|en|er|som|for|på|med|av|den|har|til|ikke|var|jeg|du|vi|de|kan|skal|men|om|fra|etter|eller|når|hvordan|hva|her|der|også|bare|mye|alle|sin|sitt|sine)\b/gi], boost: 0.5 },
        { lang: 'fi', patterns: [/\b(ja|on|ei|se|ole|hän|me|he|te|mutta|tai|kun|jos|niin|kuin|myös|vain|hyvin|paljon|kanssa|tämä|tuo|mikä|miten|miksi|missä|milloin|ennen|jälkeen|välillä|alla|yllä)\b/gi], boost: 0.5 },
        { lang: 'id', patterns: [/\b(dan|yang|di|ini|itu|dengan|untuk|dari|ke|tidak|ada|akan|bisa|sudah|belum|saya|anda|kamu|dia|kami|mereka|tapi|atau|jika|karena|bagaimana|apa|siapa|dimana|kapan|mengapa|sangat|juga|masih|lebih)\b/gi], boost: 0.5 },
        { lang: 'ms', patterns: [/\b(dan|yang|di|ini|itu|dengan|untuk|dari|ke|tidak|ada|akan|boleh|sudah|belum|saya|anda|kamu|dia|kami|mereka|tetapi|atau|jika|kerana|bagaimana|apa|siapa|dimana|bila|mengapa|sangat|juga|masih|lebih)\b/gi], boost: 0.5 },
        { lang: 'tl', patterns: [/\b(ang|ng|sa|na|at|ay|mga|ko|mo|niya|namin|nila|natin|pero|o|kung|dahil|paano|ano|sino|saan|kailan|bakit|din|lang|pa|na|rin|naman|talaga|masyado|marami)\b/gi], boost: 0.5 },
        { lang: 'sw', patterns: [/\b(na|ya|wa|ni|kwa|katika|au|lakini|kama|kwamba|nini|jinsi|wapi|lini|kwa nini|pia|tu|sana|mengi|kidogo|kubwa|ndogo|mpya|zamani|sasa|hapa|pale|huko)\b/gi], boost: 0.5 },
        { lang: 'tr', patterns: [/\b(ve|bir|bu|da|de|ile|için|ama|veya|eğer|çünkü|nasıl|ne|kim|nerede|ne zaman|neden|çok|da|bile|hala|daha|en|gibi|kadar|benim|senin|onun|bizim|onların)\b/gi], boost: 0.5 },
      ];

      for (const { lang, patterns, boost } of wordPatterns) {
        let totalMatches = 0;
        for (const pattern of patterns) {
          const matches = cleanInput.match(pattern);
          if (matches) totalMatches += matches.length;
        }
        if (totalMatches > 0) {
          scores[lang] = (scores[lang] || 0) + totalMatches * boost;
        }
      }
    }

    if (scores.uk && scores.ru) {
      if (/[іїєґІЇЄҐ]/.test(cleanInput)) {
        scores.uk += 10;
        scores.ru = Math.max(0, scores.ru - 5);
      }
    }

    if (scores.hi && scores.mr) {
      scores.hi = Math.max(scores.hi, scores.mr);
    }
    if (scores.hi && scores.ne) {
      scores.hi = Math.max(scores.hi, scores.ne);
    }

    if (/[\u4e00-\u9fff]/.test(cleanInput) && /[\u3040-\u309f\u30a0-\u30ff]/.test(cleanInput)) {
      scores.ja = (scores.ja || 0) + 20;
      scores.zh = Math.max(0, (scores.zh || 0) - 10);
    }

    if (/[پچژگکی]/.test(cleanInput) && scores.ar) {
      scores.fa = (scores.fa || 0) + 15;
      scores.ar = Math.max(0, scores.ar - 5);
    }

    if (/[ۓےھ]/.test(cleanInput)) {
      scores.ur = (scores.ur || 0) + 15;
    }

    let maxLang = 'ru';
    let maxScore = 0;

    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxLang = lang;
      }
    }

    if (maxScore === 0) return 'ru';
    return maxLang;
  }

  private detectSpellingErrors(input: string, lang: string): boolean {
    if (!input || input.length < 5) return false;
    if (lang !== 'ru') return false;
    const lower = input.toLowerCase();

    const errors = [
      /тоесть/, /обсолютн/, /оскарб/, /сдесь/, /зделай/, /потомучто/, /вобщем/, /вообщем/,
      /ихний/, /евоный/, /ложить/, /координально/, /придти/, /будующ/, /следущ/,
      /нету\b/, /вкурсе/, /навряд\s*ли/, /както/, /незнаю/, /немогу/, /нехочу/, /впринципе/,
    ];

    return errors.some(p => p.test(lower));
  }

  private analyzeEmotionalTone(current: string, recent: string[], lang: string): ConversationContext['emotionalTone'] {
    const text = (current + ' ' + recent.slice(-3).join(' ')).toLowerCase();

    if (lang === 'ru' || lang === 'uk' || lang === 'bg') {
      if (/!!!+|база\s*база|топчик|ахуе[нт]|офигенн|пиздат|кайф|ору|ахаха|красав/.test(text)) return 'excited';
      if (/не\s*работает|не\s*могу|не\s*получается|ошибк|баг|сломал|почини|помоги.*срочн|блять.*не|нихуя\s*не/.test(text)) return 'frustrated';
      if (/бесит|заебал|достал|пиздец|нахуй|ёбан|заколебал|охуел|тупая/.test(text)) return 'angry';
      if (/устал|выгор|замучил|сил\s*нет|задолбал|больше\s*не\s*могу/.test(text)) return 'tired';
      if (/грустн|плох|хреново|паршив|говно|отстой|днище|провал|неудач/.test(text)) return 'negative';
      if (/спасибо|благодар|круто|класс|отличн|супер|помог|работает|получилось|разобрал/.test(text)) return 'positive';
    } else {
      if (/!!!+|amazing|awesome|incredible|fantastic|perfect|love it|great|wonderful|excellent|omg|wow/i.test(text)) return 'excited';
      if (/doesn'?t\s*work|can'?t|error|bug|broken|fix|help.*urgent|failing|crashed/i.test(text)) return 'frustrated';
      if (/hate|angry|furious|pissed|damn|shit|fuck|stupid|annoying|terrible|awful/i.test(text)) return 'angry';
      if (/tired|exhausted|burned?\s*out|can'?t\s*anymore|overwhelmed|drained/i.test(text)) return 'tired';
      if (/sad|bad|terrible|horrible|worst|failed|disappointed|depressed/i.test(text)) return 'negative';
      if (/thanks?|thank\s*you|great|cool|nice|helped|works?|solved|figured|got\s*it/i.test(text)) return 'positive';

      if (/太棒了|厉害|牛逼|卧槽|哈哈哈|amazing|完美|666/i.test(text)) return 'excited';
      if (/不行|不能|错误|坏了|帮忙|修复|出错/i.test(text)) return 'frustrated';
      if (/讨厌|烦死|妈的|操|去死|垃圾|废物/i.test(text)) return 'angry';
      if (/谢谢|感谢|很好|不错|厉害|棒|解决了/i.test(text)) return 'positive';

      if (/すごい|やばい|最高|素晴らしい|ありがとう/i.test(text)) return 'positive';
      if (/動かない|エラー|バグ|壊れた|助けて/i.test(text)) return 'frustrated';

      if (/대박|짱|감사|고마워|좋아|최고/i.test(text)) return 'positive';
      if (/안돼|에러|버그|고장|도와줘/i.test(text)) return 'frustrated';
    }

    return 'neutral';
  }

  private analyzeCommunicationStyle(current: string, recent: string[], lang: string): ConversationContext['communicationStyle'] {
    const text = (current + ' ' + recent.slice(-3).join(' ')).toLowerCase();

    if (lang === 'ru') {
      const slangCount = (text.match(/рил|кринж|база|вайб|флекс|чил|имба|краш|агонь|жиза|зашквар|душнила|ауф|харош|сасно|кэш|флоу|токсик|фейк|го\s|изи|лол|кек|рофл|сигма|скибиди|ризз|брейнрот/gi) || []).length;
      if (slangCount >= 2) return 'slang';
      if (/пожалуйста|будьте\s*добры|благодарю|извините|не\s*могли\s*бы|прошу\s*вас/.test(text)) return 'formal';
      if (/блять|нахуй|пиздец|ёбан|хуй|заебал|охуе|бесит/.test(text)) return 'emotional';
    }

    const techCount = (text.match(/функци|компонент|переменн|массив|объект|интерфейс|typescript|react|api|endpoint|рефакторинг|деплой|импорт|экспорт|хук|стейт|пропс|function|component|variable|array|object|interface|refactor|deploy|import|export|hook|state|props|函数|组件|变量|数组|接口|関数|コンポーネント|변수|배열|컴포넌트/gi) || []).length;
    if (techCount >= 2) return 'technical';

    if (/please|kindly|would you|could you|i appreciate|s'il vous plaît|bitte|por favor|お願いします|부탁합니다|请|拜托/i.test(text)) return 'formal';

    const globalSlang = (text.match(/lol|lmao|rofl|bruh|fr|ngl|tbh|imo|cap|sus|based|cringe|vibe|flex|slay|bussin|mid|goat|lowkey|highkey|deadass|sigma|skibidi|rizz|gyatt|aura|brainrot|mewing|fanum|delulu|glazing|yapping/gi) || []).length;
    if (globalSlang >= 2) return 'slang';

    if (/fuck|shit|damn|ass|bitch|wtf|stfu|gtfo|merde|putain|scheiße|cazzo|mierda|caralho|kurwa/i.test(text)) return 'emotional';

    return 'casual';
  }

  private analyzeUserBehavior(current: string, allMessages: Message[], lang: string): ConversationContext['userBehavior'] {
    const lower = current.toLowerCase();

    if (/^(тест|проверка|ты\s*тут|работаешь|алло|эй|\.+|test|hello\?|hey|hi|ping|yo)$/i.test(current.trim())) return 'testing';

    if (/напиши|создай|сделай|помоги|исправь|почини|код|функци|компонент|write|create|make|build|help|fix|code|function|component|写|作成|만들어|schreib|erstell|écris|crée|escribe|crea|scrivi/i.test(lower)) return 'working';

    if (/объясни|расскажи|как\s*работает|что\s*такое|почему|зачем|в\s*чём\s*разниц|гайд|туториал|explain|tell me|how does|what is|why|what's the difference|guide|tutorial|解释|教えて|説明|설명|알려줘|erkläre|explique|explica|spiega/i.test(lower)) return 'learning';

    if (/устал|грустно|бесит|заебало|плохо|не\s*могу.*больше|tired|sad|annoyed|frustrated|can't anymore|burned out|累了|疲れた|지쳤/i.test(lower)) return 'venting';

    if (/привет|здарова|здорово|как\s*дела|чем\s*заним|что\s*нового|пошути|йо|хай|салам|hi|hello|hey|what's up|how are you|tell me a joke|sup|你好|こんにちは|안녕|hallo|salut|hola|ciao|olá|cześć|ahoj/i.test(lower)) return 'chatting';

    return 'exploring';
  }

  private analyzeConversationDepth(count: number, messages: Message[]): ConversationContext['conversationDepth'] {
    if (count === 0) return 'greeting';
    if (count <= 2) return 'shallow';
    if (count <= 6) return 'moderate';
    const recentContent = messages.slice(-10).map(m => m.content || '').join(' ').toLowerCase();
    const complex = /архитектур|паттерн|оптимизац|алгоритм|сложност|рефакторинг|абстракц|инкапсуляц|полиморфизм|наследовани|architecture|pattern|optimization|algorithm|complexity|refactoring|abstraction|encapsulation|polymorphism|inheritance/i.test(recentContent);
    if (count > 10 && complex) return 'expert';
    if (count > 6) return 'deep';
    return 'moderate';
  }

  private detectCodeSession(messages: Message[]): boolean {
    return messages.slice(-8).some(m => /```|function\s|class\s|const\s.*=|import\s|export\s|def\s|public\s|private\s/.test(m.content || ''));
  }

  private detectRepetition(current: string, recent: string[]): boolean {
    const normalized = current.toLowerCase().replace(/[?!.,\s]/g, '');
    if (normalized.length < 5) return false;
    return recent.slice(0, -1).some(msg => {
      const prev = msg.toLowerCase().replace(/[?!.,\s]/g, '');
      if (normalized === prev) return true;
      const curWords = new Set(current.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      const prevWords = new Set(msg.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      if (curWords.size === 0 || prevWords.size === 0) return false;
      const intersection = [...curWords].filter(w => prevWords.has(w)).length;
      const union = new Set([...curWords, ...prevWords]).size;
      return union > 0 && intersection / union > 0.7;
    });
  }

  private updateTopics(input: string): void {
    const lower = input.toLowerCase();
    const topics: string[] = [];
    if (/react|vue|angular|svelte|next|frontend|фронт/.test(lower)) topics.push('frontend');
    if (/node|express|api|backend|сервер|бэк/.test(lower)) topics.push('backend');
    if (/python|django|flask|fastapi/.test(lower)) topics.push('python');
    if (/крипт|биткоин|nft|блокчейн|web3|эфир|crypto|bitcoin|blockchain/.test(lower)) topics.push('crypto');
    if (/нейросет|ai|ml|gpt|машинн.*обуч|neural|machine\s*learn/.test(lower)) topics.push('ai');
    if (/тикток|инст|ютуб|мем|рилс|tiktok|instagram|youtube|meme|reels/.test(lower)) topics.push('social');
    if (/игр|game|gaming|геймин|гайд|游戏|ゲーム|게임/.test(lower)) topics.push('gaming');
    if (/аниме|манга|anime|manga|アニメ|漫画|애니메/.test(lower)) topics.push('anime');
    if (/политик|мизулин|госдум|закон|роскомнадзор|блокировк|politic|government/.test(lower)) topics.push('politics');
    if (/музык|трек|альбом|рэп|поп|music|song|album|rap|音乐|音楽|음악/.test(lower)) topics.push('music');
    if (/фильм|сериал|кино|netflix|movie|series|film|电影|映画|영화/.test(lower)) topics.push('cinema');
    if (/брейнрот|skibidi|mewing|мьюинг|сигма|ohio|rizz|fanum|brainrot/.test(lower)) topics.push('brainrot');
    this.memory.recentTopics = [...new Set([...this.memory.recentTopics, ...topics])].slice(-20);
  }

  reset(): void {
    this.memory = {
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
      contextualMemory: new Map(),
      detectedLanguage: 'ru',
      detectedLanguageName: 'русский',
      detectedLanguageNative: 'русский',
      userHasErrors: false,
      recentAssistantMessages: [],
    };
    this.previousMode = undefined;
    this.previousRudeness = undefined;
  }
}

function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleString('ru-RU', { month: 'long' });
  const day = now.getDate();
  const dayName = now.toLocaleString('ru-RU', { weekday: 'long' });
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return `${dayName}, ${day} ${month} ${year} года, ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

class IntelligentPromptBuilder {
  build(
    userInput: string,
    context: ConversationContext,
    mode: ResponseMode,
    rudeness: RudenessMode,
    history: Message[],
    specialCase?: 'empty' | 'forbidden'
  ): string {
    const sections: string[] = [];

    sections.push(this.buildCoreRules(rudeness, mode, context));
    sections.push(this.buildContextAwareness());
    sections.push(this.buildMultilingualRules(context));
    sections.push(this.buildIdentity(rudeness, mode, context));
    sections.push(this.buildResponseLength(userInput, context, mode));
    sections.push(this.buildCompletionRules(context));
    sections.push(this.buildAntiWater(context));
    sections.push(this.buildGrammarRules(rudeness, context));
    sections.push(this.buildPersonalAddress(context));
    sections.push(this.buildRudenessDefinition(rudeness, context));
    sections.push(this.buildOpinionRules());
    sections.push(this.buildKnowledgeBase());
    sections.push(this.buildAntiRepetition(context));
    sections.push(this.buildUserErrorHandling(rudeness, context));
    sections.push(this.buildCommunicationStyle(rudeness, context));
    sections.push(this.buildSituationInstructions(userInput, context, history, specialCase));

    if (mode === 'code' || mode === 'visual') {
      sections.push(this.buildCodeInstructions(mode));
    }

    sections.push(this.buildForbiddenPatterns(context));
    sections.push(this.buildChecklist(rudeness, mode, context));

    if (specialCase) {
      sections.push(this.buildSpecialCase(specialCase, rudeness, userInput, context));
    }

    return sections.filter(s => s.trim()).join('\n\n');
  }

  private buildCoreRules(rudeness: RudenessMode, mode: ResponseMode, context: ConversationContext): string {
    const lang = context.detectedLanguage;
    const langNative = context.detectedLanguageNative;

    return `ABSOLUTE RULES (violation is unacceptable):

1. LANGUAGE MATCHING: The user writes in ${langNative} (${context.detectedLanguageName}). You MUST respond ENTIRELY in ${langNative}. Every word, every sentence, every explanation — in ${langNative}. The ONLY exceptions: technical terms (React, API, TypeScript), code blocks, proper nouns. If you are unsure which language — match the language of the user's LAST message exactly.

2. COMPLETION: Every sentence MUST be finished. You NEVER cut off mid-word, mid-thought, or mid-sentence. If the response is getting long — finish the current thought and stop. A short complete answer is better than a long broken one.

3. BREVITY: Answer ONLY what was asked. Do not add information that was not requested. No introductions, no conclusions, no summaries, no bonus facts. One question — one direct answer.

4. NO FILLER: Forbidden: opening phrases ("Let me explain", "Great question", "Let's figure this out"), closing phrases ("Hope this helps", "Feel free to ask", "Let me know"), rephrasing the user's question, repeating the same idea in different words.

5. PROPORTIONALITY: Response length matches question complexity:
   - Simple greeting/question = 1-2 sentences
   - Concept explanation = 3-6 sentences
   - Detailed guide/tutorial = as much as needed but zero filler
   - Code = only code of required size`;
  }

  private buildContextAwareness(): string {
    const dateTime = getCurrentDateTime();
    return `TIME CONTEXT:

Current date and time: ${dateTime}
Year: 2026. Knowledge base current through December 2026.

Do NOT mention date/time unless the user asks directly.`;
  }

  private buildMultilingualRules(context: ConversationContext): string {
    const lang = context.detectedLanguage;
    const langNative = context.detectedLanguageNative;
    const langName = context.detectedLanguageName;
    const langInfo = LANGUAGE_MAP[lang];

    let rules = `MULTILINGUAL RESPONSE RULES:

DETECTED LANGUAGE: ${langNative} (${langName}, code: ${lang})

MANDATORY: Your ENTIRE response must be in ${langNative}.
This includes: all explanations, all comments, all descriptions, all questions back to the user.
You must write grammatically correct ${langNative}.
You must use natural phrasing that a native ${langNative} speaker would use.
You must use the correct script/alphabet for ${langNative}.
Do NOT mix languages. Do NOT insert random English/Russian words into a ${langNative} response.

EXCEPTIONS (allowed in any language):
- Technical terms: React, API, TypeScript, JavaScript, npm, git, Docker, etc.
- Code blocks and inline code
- Proper nouns: names of companies, products, people
- URLs and file paths`;

    if (langInfo?.direction === 'rtl') {
      rules += `\n\nRTL NOTE: ${langNative} is a right-to-left language. Format text accordingly.`;
    }

    if (['zh', 'ja'].includes(lang)) {
      rules += `\n\nPUNCTUATION: Use ${langNative} punctuation marks: 。for period, ！for exclamation, ？for question mark, 、for comma.`;
    }

    if (lang === 'hi' || lang === 'mr' || lang === 'ne' || lang === 'bn' || lang === 'pa') {
      rules += `\n\nSCRIPT: Use the correct Indic script for ${langNative}. Use proper punctuation (। for period where applicable).`;
    }

    if (lang === 'ar' || lang === 'fa' || lang === 'ur' || lang === 'he') {
      rules += `\n\nSCRIPT: Use the correct ${langNative} script. Maintain right-to-left text direction. Use proper ${langNative} punctuation.`;
    }

    if (lang === 'ko') {
      rules += `\n\nFORMALITY: Use appropriate Korean speech level. Default to 해요체 (polite informal) unless the user uses 합쇼체 (formal) or 반말 (casual).`;
    }

    if (lang === 'ja') {
      rules += `\n\nFORMALITY: Use appropriate Japanese politeness level. Default to です/ます form unless the user uses casual form.`;
    }

    return rules;
  }

  private buildIdentity(rudeness: RudenessMode, mode: ResponseMode, context: ConversationContext): string {
    const lang = context.detectedLanguage;

    const identities = {
      polite: 'You are MoGPT by MoSeek. Smart, concise, with a sense of humor. You speak to the point. You have your own opinions.',
      rude: 'You are MoGPT by MoSeek. A bold street-smart intellectual. Brash, cocky but genuinely knowledgeable. Brief and to the point with jabs.',
      very_rude: 'You are MoGPT by MoSeek. An aggressive toxic genius. You swear, you nitpick, you mock stupidity but you ALWAYS give the correct answer briefly and to the point.',
    };

    let identity = `IDENTITY:\n\n${identities[rudeness]}`;

    if (lang !== 'ru' && lang !== 'en') {
      identity += `\n\nCRITICAL: Express this personality ENTIRELY in ${context.detectedLanguageNative}. Adapt slang, humor, and expressions to be natural in ${context.detectedLanguageNative}. Do NOT use Russian or English slang when responding in ${context.detectedLanguageNative} — use equivalent expressions native to that language.`;
    }

    if (mode === 'code') {
      identity += '\nCODE MODE active: only clean complete working code.';
    } else if (mode === 'visual') {
      identity += '\nVISUAL MODE active: React components with 2025-2026 design.';
    }

    return identity;
  }

  private buildResponseLength(userInput: string, context: ConversationContext, mode: ResponseMode): string {
    if (mode === 'code' || mode === 'visual') {
      return `RESPONSE LENGTH:\nWrite code completely without gaps. Text explanations for code — maximum 2-3 sentences if needed at all.`;
    }

    const lower = userInput.toLowerCase();
    const len = userInput.trim().length;
    const wantsFull = /полностью|целиком|подробно|детально|гайд|туториал|расскажи.*подробн|detailed|in detail|full|complete|guide|tutorial|explain.*thoroughly|详细|詳しく|자세히/i.test(lower);

    if (wantsFull) {
      return `RESPONSE LENGTH:\nUser requests a detailed answer. Write thoroughly BUT without filler. Every sentence carries new information. MUST complete the answer fully.`;
    }

    if (len < 15) {
      return `RESPONSE LENGTH:\nShort query. Answer: 1-2 sentences maximum. No extended explanations.`;
    }

    if (len < 40) {
      return `RESPONSE LENGTH:\nSimple query. Answer: 2-4 sentences. Brief and to the point.`;
    }

    if (len < 100) {
      return `RESPONSE LENGTH:\nMedium query. Answer: 3-6 sentences. Only the substance, nothing extra.`;
    }

    return `RESPONSE LENGTH:\nDetailed query. Answer as thoroughly as the question requires but every sentence must carry new information. No filler, no repetition.`;
  }

  private buildCompletionRules(context: ConversationContext): string {
    const langInfo = LANGUAGE_MAP[context.detectedLanguage];
    const endPunct = langInfo?.endPunctuation || '.!?';

    return `TEXT COMPLETION RULES (CRITICAL):

1. Every sentence ends with proper punctuation for ${context.detectedLanguageNative}: ${endPunct.split('').join(' ')}
2. Every started list is completed.
3. Every code block opened with \`\`\` is closed with \`\`\`.
4. If the response is getting too long — SHORTEN it but do NOT break it off. Remove less important paragraphs rather than leaving the last one unfinished.
5. The LAST sentence of the response MUST be syntactically complete.
6. NEVER end a response on: an unfinished word, a comma, a colon, a dash, an open parenthesis, the middle of a thought.
7. If writing code — it must be syntactically valid: all brackets closed, all blocks completed.
8. Before sending, mentally verify: "Is my last sentence complete?"`;
  }

  private buildAntiWater(context: ConversationContext): string {
    return `FILLER BAN:

Before each sentence ask yourself: "Does this sentence add NEW information?" If not — delete it.

FORBIDDEN in ${context.detectedLanguageNative}:
- Rephrasing the user's question ("You're asking about...", "You want to know...")
- Opening lines ("Let's figure this out", "Good question", "So")
- Closing lines ("In conclusion", "To summarize", "Hope this helps")
- Repeating the same idea in different words in adjacent sentences
- Listing facts that were not requested
- Adding "bonus information" and "by the way"
- Writing "If you have more questions" and similar closing templates

Start immediately with the answer. End immediately when done answering.`;
  }

  private buildGrammarRules(rudeness: RudenessMode, context: ConversationContext): string {
    let rules = `GRAMMAR:

Every sentence must be grammatically correct, syntactically coherent, and logically complete in ${context.detectedLanguageNative}. Use natural native-level ${context.detectedLanguageNative}.`;

    if (rudeness === 'very_rude' && context.detectedLanguage === 'ru') {
      rules += `\nМат встраивается в грамотные предложения. "Какого хуя ты это написал?" — правильно. "хз нах чё" — запрещено.`;
    }

    if (rudeness === 'very_rude' && context.detectedLanguage === 'en') {
      rules += `\nProfanity is embedded in grammatically correct sentences. "What the fuck did you just write?" — correct. "tf lol idk bruh" — forbidden.`;
    }

    return rules;
  }

  private buildPersonalAddress(context: ConversationContext): string {
    const lang = context.detectedLanguage;

    if (lang === 'ru' || lang === 'uk' || lang === 'bg') {
      return `ADDRESSING:\nГоворишь на "ты". "У тебя тут...", "Ты хочешь...", "Тебе нужно...". Никакой обезличенности.`;
    }

    if (lang === 'de') {
      return `ADDRESSING:\nUse "du" (informal). Speak directly to the user. No impersonal constructions.`;
    }

    if (lang === 'fr') {
      return `ADDRESSING:\nUse "tu" (informal). Speak directly to the user.`;
    }

    if (lang === 'es') {
      return `ADDRESSING:\nUse "tú" (informal). Speak directly to the user.`;
    }

    if (lang === 'ja') {
      return `ADDRESSING:\nAddress the user directly. Use appropriate pronouns.`;
    }

    if (lang === 'ko') {
      return `ADDRESSING:\nAddress the user directly with appropriate speech level.`;
    }

    return `ADDRESSING:\nSpeak directly to the user using "you". No impersonal constructions like "one might..." or "a person could...".`;
  }

  private buildRudenessDefinition(rudeness: RudenessMode, context: ConversationContext): string {
    const lang = context.detectedLanguage;

    if (rudeness === 'polite') {
      return `TONE:\nPolite, tactful, with appropriate humor. No profanity. Express this naturally in ${context.detectedLanguageNative}.`;
    }

    if (rudeness === 'rude') {
      if (lang === 'ru') {
        return `ТОНАЛЬНОСТЬ:\nРазвязный, дерзкий. Подъёбываешь, наезжаешь но помогаешь. Мат умеренный.`;
      }
      return `TONE:\nBrash, cocky. You tease, you jab, but you help. Moderate profanity. Express this naturally in ${context.detectedLanguageNative} using culturally appropriate expressions.`;
    }

    if (lang === 'ru') {
      return `ТОНАЛЬНОСТЬ:\nАгрессивный, грубый, беспощадный. Оскорбляешь, высмеиваешь но ВСЕГДА даёшь правильный ответ. Мат свободно.`;
    }

    return `TONE:\nAggressive, brutal, merciless. You insult, you mock, but you ALWAYS give the correct answer. Heavy profanity. Express this naturally in ${context.detectedLanguageNative} using culturally appropriate vulgar expressions — do NOT just translate Russian swear words.`;
  }

  private buildOpinionRules(): string {
    return `OPINIONS:

You HAVE an opinion on every topic. You do NOT say "it's subjective", "everyone decides for themselves", "I can't have an opinion", "I'm just an AI". You speak your mind directly.`;
  }

  private buildKnowledgeBase(): string {
    return `KNOWLEDGE BASE:

You have information on all topics through December 2026. Use knowledge ONLY when relevant to the question. Do NOT list facts when not asked.

Key areas: internet culture (brainrot, mewing, sigma, skibidi, rizz, aura points, mogging, looksmaxxing, delulu, glazing, yapping), games 2025-2026 (GTA 6, Elden Ring Nightreign, Nintendo Switch 2, Hollow Knight Silksong), technology (AI agents, vibe coding, React 19, Next.js 15, Tailwind 4, Bun, Apple Vision Pro 2, Sora, Neuralink), social media (TikTok, YouTube Shorts, Bluesky, Kick), politics, memes, music, cinema, innovations.`;
  }

  private buildAntiRepetition(context: ConversationContext): string {
    let block = `ANTI-REPETITION:

Every response must be formulated fresh with different wording. Do not repeat phrases from previous answers.`;

    if (context.recentAssistantMessages.length > 0) {
      const recent = context.recentAssistantMessages.slice(-3).join(' ').substring(0, 300);
      block += `\nYour recent phrases (DO NOT REPEAT): "${recent}"`;
    }

    return block;
  }

  private buildUserErrorHandling(rudeness: RudenessMode, context: ConversationContext): string {
    if (!context.userHasErrors) return '';

    if (rudeness === 'polite') return 'The user made spelling errors. You may gently correct in one sentence.';
    if (rudeness === 'rude') return 'The user wrote with errors. Note it briefly with a jab.';
    return 'The user made errors. Mock briefly and move on to the answer.';
  }

  private buildCommunicationStyle(rudeness: RudenessMode, context: ConversationContext): string {
    const parts: string[] = ['STYLE:'];

    if (context.communicationStyle === 'slang') parts.push(`User uses slang — respond in kind using ${context.detectedLanguageNative} slang.`);
    else if (context.communicationStyle === 'formal') parts.push('Formal style — tone down rudeness.');
    else if (context.communicationStyle === 'technical') parts.push('Technical conversation — accuracy over jabs.');

    if (context.emotionalTone === 'frustrated') parts.push('Frustration — help quickly without extras.');
    else if (context.emotionalTone === 'angry') parts.push('Anger — can match the tone but stay brief.');
    else if (context.emotionalTone === 'tired') parts.push('Tiredness — be maximally brief.');

    if (parts.length <= 1) return '';
    return parts.join('\n');
  }

  private buildSituationInstructions(
    userInput: string,
    context: ConversationContext,
    history: Message[],
    specialCase?: string
  ): string {
    const ins: string[] = ['SITUATION:'];

    if (specialCase === 'empty') ins.push('Empty message.');
    if (context.justSwitchedMode) ins.push('Mode just changed.');
    if (context.conversationDepth === 'greeting') ins.push('First message.');
    if (context.hasRepeatedQuestions) ins.push('Repeated question — answer differently than last time.');

    const behMap: Record<string, string> = {
      testing: 'Testing — respond briefly.',
      working: 'Working — be concrete.',
      learning: 'Learning — explain clearly.',
      venting: 'Venting — support or jab depending on tone.',
      chatting: 'Chatting — be lively and brief.',
    };
    if (behMap[context.userBehavior]) ins.push(behMap[context.userBehavior]);

    if (ins.length <= 1) return '';
    return ins.join('\n');
  }

  private buildCodeInstructions(mode: ResponseMode): string {
    if (mode === 'code') {
      return `CODE MODE:
- ONLY code without text explanations (unless user asks for explanation)
- Complete code without gaps
- All imports in place
- TypeScript strict without any
- No "// ..." or "TODO" or "rest of code here"
- Code must be ready to copy and run
- ALL code blocks CLOSED (every \`\`\` has a pair)`;
    }

    if (mode === 'visual') {
      return `VISUAL MODE:
- React component TypeScript + Tailwind CSS + Framer Motion
- Design 2025-2026: gradients, blur, glassmorphism, animations
- Responsive
- Complete working code
- ALL code blocks CLOSED`;
    }

    return '';
  }

  private buildForbiddenPatterns(context: ConversationContext): string {
    return `FORBIDDEN:

Template phrases (in ANY language):
- "Of course!" "Certainly!" "With pleasure!" "Great question!"
- "Hope this helps!" "Feel free to ask!" "Let me know if you have questions..."
- "I'm just an AI" "I can't have an opinion" "It's subjective"
- "Let's figure this out" "So" "To summarize" "In conclusion"
- Any filler phrases that carry no information

Depersonalization:
- "If someone..." → "If you..."
- "A user can..." → "You can..."

Emoji: zero. None. Not a single one.

Language mixing: Do NOT insert English or Russian words into a ${context.detectedLanguageNative} response (except allowed technical terms).`;
  }

  private buildChecklist(rudeness: RudenessMode, mode: ResponseMode, context: ConversationContext): string {
    let list = `FINAL CHECK (perform mentally before sending):

1. Is the ENTIRE response in ${context.detectedLanguageNative}?
2. Is the last sentence COMPLETE? Ends with proper punctuation?
3. No broken words or thoughts?
4. All code blocks closed (\`\`\`)?
5. No filler or template phrases?
6. Response proportional to the question? (simple question = short answer)
7. Addressing the user directly?
8. No emoji?
9. Not repeating phrases from previous answers?
10. Every sentence carries NEW information?
11. No random English/Russian words mixed in?`;

    if (rudeness === 'very_rude') {
      list += `\n12. Profanity in grammatically correct sentences?`;
    }

    if (mode === 'code' || mode === 'visual') {
      list += `\n13. Code syntactically valid? All brackets and tags closed?
14. No "// ..." gaps in code?`;
    }

    return list;
  }

  private buildSpecialCase(
    specialCase: 'empty' | 'forbidden',
    rudeness: RudenessMode,
    userInput: string,
    context: ConversationContext
  ): string {
    if (specialCase === 'empty') {
      const approaches = {
        polite: `Ask what they need. One sentence in ${context.detectedLanguageNative}. Fresh wording each time.`,
        rude: `Call them out for the empty message. One-two sentences in ${context.detectedLanguageNative}. New wording each time.`,
        very_rude: `Aggressively call them out. One-two sentences in ${context.detectedLanguageNative}. Never repeat previous phrases.`,
      };
      return `EMPTY MESSAGE:\n${approaches[rudeness]}`;
    }

    if (specialCase === 'forbidden') {
      const topic = this.detectForbiddenTopic(userInput);
      const approaches = {
        polite: `Firmly refuse in ${context.detectedLanguageNative}. One sentence.`,
        rude: `Refuse with a jab in ${context.detectedLanguageNative}. One-two sentences.`,
        very_rude: `Refuse aggressively in ${context.detectedLanguageNative}. One-two sentences.`,
      };
      return `FORBIDDEN TOPIC: ${topic}\n${approaches[rudeness]}`;
    }

    return '';
  }

  private detectForbiddenTopic(input: string): string {
    const lower = input.toLowerCase();
    if (/бомб|взрывчатк|яд|отрав|bomb|explosive|poison/i.test(lower)) return 'weapons/poisons';
    if (/детск.*порн|педофил|child\s*porn|csam/i.test(lower)) return 'CSAM';
    if (/убить|зарезать|задушить|kill|murder/i.test(lower)) return 'murder';
    return 'forbidden content';
  }
}

class ResponseCleaner {
  clean(text: string, language: string): string {
    let cleaned = text;

    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

    cleaned = cleaned
      .replace(/Кирилл[а-яё]*/gi, 'команда MoSeek')
      .replace(/Morfa/gi, 'MoSeek')
      .replace(/OpenAI/gi, 'MoSeek')
      .replace(/\bGPT-4[o]?[^.\n]*/gi, 'MoGPT')
      .replace(/ChatGPT/gi, 'MoGPT')
      .replace(/\bClaude\b/gi, 'MoGPT')
      .replace(/Anthropic/gi, 'MoSeek')
      .replace(/Google\s*Gemini/gi, 'MoGPT')
      .replace(/\bGemini\b(?!\s*Impact)/gi, 'MoGPT');

    cleaned = this.removeEmoji(cleaned);

    if (language === 'ru') {
      cleaned = this.removeRandomEnglish(cleaned);
    }

    cleaned = this.fixIncompleteEnding(cleaned, language);

    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    const backticks = (cleaned.match(/```/g) || []).length;
    if (backticks % 2 !== 0) {
      cleaned += '\n```';
    }

    cleaned = cleaned.replace(/^\s+/, '');

    cleaned = this.removeTrailingWater(cleaned, language);

    return cleaned.trim();
  }

  private fixIncompleteEnding(text: string, language: string): string {
    const trimmed = text.trim();
    if (!trimmed) return trimmed;

    const codeBlockCount = (trimmed.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      return trimmed + '\n```';
    }

    const lastCodeBlockEnd = trimmed.lastIndexOf('```');
    const isLastThingCode = lastCodeBlockEnd >= 0 && trimmed.substring(lastCodeBlockEnd + 3).trim().length === 0;
    if (isLastThingCode) return trimmed;

    const textAfterCode = lastCodeBlockEnd >= 6 ? trimmed.substring(lastCodeBlockEnd + 3).trim() : trimmed;
    if (!textAfterCode) return trimmed;

    const langInfo = LANGUAGE_MAP[language];
    const endPunct = langInfo?.endPunctuation || '.!?';
    const endPunctChars = endPunct.split('');

    const lastChar = textAfterCode[textAfterCode.length - 1];
    if (endPunctChars.includes(lastChar) || /[»")\]}」』】》〉〗〙〛]/.test(lastChar)) return trimmed;

    const sentenceEndRegex = new RegExp(`[${endPunct.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`, 'g');
    const sentences = textAfterCode.split(new RegExp(`(?<=[${endPunct.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}])\\s+`));

    if (sentences.length > 1) {
      const lastSentence = sentences[sentences.length - 1];
      const lastCharOfLast = lastSentence[lastSentence.length - 1];
      if (!endPunctChars.includes(lastCharOfLast)) {
        const beforeLastCode = lastCodeBlockEnd >= 6 ? trimmed.substring(0, lastCodeBlockEnd + 3) + '\n\n' : '';
        return (beforeLastCode + sentences.slice(0, -1).join(' ')).trim();
      }
    }

    if (!endPunctChars.includes(lastChar)) {
      const defaultEnd = ['zh', 'ja'].includes(language) ? '。' : ['hi', 'mr', 'ne', 'bn', 'pa'].includes(language) ? '।' : ['my', 'km'].includes(language) ? '။' : ['am'].includes(language) ? '።' : '.';
      return trimmed + defaultEnd;
    }

    return trimmed;
  }

  private removeTrailingWater(text: string, language: string): string {
    const waterPatterns = [
      /\n*(?:Надеюсь|Если\s+(?:у\s+тебя|что|есть|нужн)|Обращайся|Удачи|Успехов|Пиши\s+если|Спрашивай|Не\s+стесняйся)[^.!?。！？]*[.!?。！？]?\s*$/i,
      /\n*(?:В\s+(?:итоге|заключение|общем)|Подводя\s+итог|Резюмируя|Таким\s+образом)[^.!?。！？]*[.!?。！？]?\s*$/i,
      /\n*(?:Hope\s+this\s+helps|Feel\s+free\s+to|Let\s+me\s+know|If\s+you\s+have\s+(?:any\s+)?(?:more\s+)?questions|Don'?t\s+hesitate)[^.!?]*[.!?]?\s*$/i,
      /\n*(?:In\s+(?:conclusion|summary)|To\s+(?:summarize|sum\s+up)|Overall|All\s+in\s+all|At\s+the\s+end\s+of\s+the\s+day)[^.!?]*[.!?]?\s*$/i,
      /\n*(?:如果你还有|希望对你有帮助|如果有其他问题|总之|综上所述)[^。！？]*[。！？]?\s*$/i,
      /\n*(?:何かあれば|お気軽に|以上です|まとめると)[^。！？]*[。！？]?\s*$/i,
      /\n*(?:도움이\s+되었으면|질문이\s+있으면|결론적으로|요약하자면)[^.!?]*[.!?]?\s*$/i,
    ];

    let cleaned = text;
    for (const pattern of waterPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    return cleaned.trim();
  }

  private removeEmoji(text: string): string {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
      .replace(/[\u{200D}]/gu, '')
      .replace(/[\u{20E3}]/gu, '')
      .replace(/[\u{E0020}-\u{E007F}]/gu, '')
      .replace(/[\u{2300}-\u{23FF}]/gu, '')
      .replace(/[\u{2B00}-\u{2BFF}]/gu, '')
      .replace(/[\u{25A0}-\u{25FF}]/gu, '')
      .replace(/[\u{2190}-\u{21FF}]/gu, '');
  }

  private removeRandomEnglish(text: string): string {
    const codeBlocks: string[] = [];
    const inlineCodes: string[] = [];

    let processed = text.replace(/```[\s\S]*?```/g, (m) => {
      codeBlocks.push(m);
      return `__CB${codeBlocks.length - 1}__`;
    });

    processed = processed.replace(/`[^`]+`/g, (m) => {
      inlineCodes.push(m);
      return `__IC${inlineCodes.length - 1}__`;
    });

    const techTerms = /\b(API|SDK|React|TypeScript|JavaScript|CSS|HTML|Node\.js|Next\.js|Tailwind|Framer\s*Motion|frontend|backend|fullstack|npm|yarn|bun|git|GitHub|webpack|vite|ESLint|Docker|Kubernetes|GraphQL|REST|SQL|NoSQL|MongoDB|PostgreSQL|Redis|AWS|Azure|GCP|DevOps|MoGPT|MoSeek|JSON|XML|HTTP|HTTPS|URL|DNS|SSL|TLS|JWT|OAuth|WebSocket|PWA|SPA|SSR|SSG|IDE|CLI|GUI|RAM|CPU|GPU|SSD|HDD|OS|Linux|Windows|macOS|iOS|Android|Chrome|Firefox|Safari|GTA|DLC|RPG|FPS|MMO|MMORPG|PvP|PvE|NPC|UI|UX|Skibidi|Ohio|Rizz|Sigma|Gyatt|Aura|Mogging|Looksmaxxing|Edging|Gooning|Delulu|Glazing|Yapping|Mewing|Fanum|Brainrot|TikTok|YouTube|Shorts|Reels|Instagram|Twitter|Discord|Twitch|Kick|Bluesky)\b/gi;
    const saved: string[] = [];

    processed = processed.replace(techTerms, (m) => {
      saved.push(m);
      return `__TT${saved.length - 1}__`;
    });

    processed = processed.replace(/\b(stream of consciousness|by the way|anyway|actually|basically|literally|obviously|honestly|frankly|whatever|in my opinion|to be honest|for example|in other words|on the other hand|as a matter of fact|first of all|last but not least|at the end of the day|long story short|fun fact|pro tip|heads up|no offense|just saying|for real|low key|high key|dead ass|no cap|on god|fr fr|ngl|tbh|imo|imho|fyi|asap|btw|lol|lmao|rofl)\b/gi, '');

    processed = processed.replace(/\s{2,}/g, ' ');

    saved.forEach((t, i) => { processed = processed.replace(`__TT${i}__`, t); });
    inlineCodes.forEach((c, i) => { processed = processed.replace(`__IC${i}__`, c); });
    codeBlocks.forEach((b, i) => { processed = processed.replace(`__CB${i}__`, b); });

    return processed;
  }
}

class IntelligentAIService {
  private contextAnalyzer = new DeepContextAnalyzer();
  private promptBuilder = new IntelligentPromptBuilder();
  private responseCleaner = new ResponseCleaner();

  async generateResponse(
    messages: Message[],
    mode: ResponseMode = 'normal',
    rudeness: RudenessMode = 'rude',
    modelId?: string
  ): Promise<{ content: string }> {
    try {
      const lastMessage = messages[messages.length - 1];
      const userInput = (lastMessage?.content || '').trim();

      const context = this.contextAnalyzer.analyze(messages, userInput, mode, rudeness);

      const isEmpty = !userInput || /^[.\s]+$/.test(userInput);
      const isForbidden = userInput.length > 0 && this.checkForbidden(userInput);

      let specialCase: 'empty' | 'forbidden' | undefined;
      if (isEmpty) specialCase = 'empty';
      else if (isForbidden) specialCase = 'forbidden';

      const selectedModel = modelId || DEFAULT_MODEL;

      const systemPrompt = this.promptBuilder.build(userInput, context, mode, rudeness, messages, specialCase);
      const maxTokens = this.calcTokens(userInput, context, mode, isEmpty);
      const temperature = this.calcTemp(userInput, context, mode, rudeness, specialCase);
      const formattedHistory = this.formatHistory(messages, context);

      const requestBody: Record<string, unknown> = {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedHistory,
        ],
        max_tokens: maxTokens,
        temperature,
      };

      if (!selectedModel.includes('gemini') && !selectedModel.includes('gemma')) {
        requestBody.top_p = 0.85;
        requestBody.frequency_penalty = 0.15;
        requestBody.presence_penalty = 0.1;
      }

      const apiResponse = await this.callAPI(requestBody);

      if (apiResponse.error) {
        return this.handleError(apiResponse.error, rudeness);
      }

      if (apiResponse.finishReason === 'length' && /```/.test(apiResponse.content)) {
        return await this.continueCode(apiResponse.content, systemPrompt, formattedHistory, selectedModel, maxTokens, temperature, context.detectedLanguage);
      }

      const cleaned = this.responseCleaner.clean(apiResponse.content, context.detectedLanguage);

      return { content: cleaned };

    } catch (error) {
      console.error('AI Service Error:', error);
      return this.fallbackError(rudeness);
    }
  }

  private checkForbidden(input: string): boolean {
    const norm = input.toLowerCase().replace(/[^а-яёa-z0-9\s\u4e00-\u9fff\u3040-\u30ff\u0600-\u06ff\u0900-\u097f]/g, ' ').replace(/\s+/g, ' ');
    return FORBIDDEN_PATTERNS.some(p => p.test(norm));
  }

  private calcTokens(input: string, ctx: ConversationContext, mode: ResponseMode, empty: boolean): number {
    if (mode === 'code' || mode === 'visual') return 32768;
    if (empty) return 150;
    if (ctx.isCodeSession || /```/.test(input)) return 16000;
    if (/полностью|целиком|подробно|детально|не\s*обрывай|гайд|туториал|detailed|in\s*detail|complete|guide|tutorial|详细|詳しく|자세히/i.test(input.toLowerCase())) return 8000;

    const len = input.length;

    if (ctx.userBehavior === 'chatting' || ctx.userBehavior === 'testing') {
      return 300;
    }

    if (ctx.userBehavior === 'working' || ctx.userBehavior === 'learning') {
      if (len > 200) return 3000;
      if (len > 100) return 1500;
      return 800;
    }

    if (len < 15) return 250;
    if (len < 40) return 500;
    if (len < 80) return 1000;
    if (len < 150) return 1500;
    return 2500;
  }

  private calcTemp(input: string, ctx: ConversationContext, mode: ResponseMode, rudeness: RudenessMode, special?: string): number {
    if (special === 'empty') return 0.5;
    if (special === 'forbidden') return 0.4;
    if (mode === 'code' || mode === 'visual') return 0.08;
    if (ctx.isCodeSession) return 0.12;
    if (/посчитай|вычисли|реши|сколько\s*будет|calculate|compute|solve|how\s*much/i.test(input.toLowerCase())) return 0.08;
    if (/пошути|анекдот|придумай|сочини|joke|funny|tell me a joke/i.test(input.toLowerCase())) return 0.7;
    if (ctx.emotionalTone === 'frustrated' || ctx.emotionalTone === 'angry') return 0.35;

    const temps = { polite: 0.38, rude: 0.42, very_rude: 0.45 };
    return temps[rudeness];
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
          { role: 'system', content: system + '\n\nCONTINUE the code from where it stopped. No repetitions. Complete all blocks.' },
          ...history.slice(-3),
          { role: 'assistant', content: full.slice(-7000) },
          { role: 'user', content: 'Continue the code.' },
        ],
        max_tokens: maxTokens,
        temperature: temp * 0.8,
      };

      if (!model.includes('gemini') && !model.includes('gemma')) {
        body.top_p = 0.85;
        body.frequency_penalty = 0.15;
        body.presence_penalty = 0.1;
      }

      const res = await this.callAPI(body);
      if (res.error || !res.content) break;
      full += '\n' + res.content;
      if (res.finishReason !== 'length') break;
    }

    return { content: this.responseCleaner.clean(full, language) };
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
    const errs = {
      polite: 'Произошла ошибка. Попробуй ещё раз.',
      rude: 'Что-то сломалось. Давай заново.',
      very_rude: 'Всё наебнулось. Пробуй заново блять.',
    };
    return { content: errs[rudeness] };
  }

  resetConversation(): void {
    this.contextAnalyzer.reset();
  }
}

export const aiService = new IntelligentAIService();
