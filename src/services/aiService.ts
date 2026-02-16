// src/services/aiService.ts

import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL, DEFAULT_MODEL } from '../config/models';
import { memoryService } from './memoryService';
import { webSearchService } from './webSearchService';
import { moodAnalyzer } from './moodAnalyzer';
import { useMoodStore } from '../store/moodStore';

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

const LANGUAGE_MAP: Record<string, { name: string; native: string; endPunctuation: string; direction: 'ltr' | 'rtl' }> = {
  // ============================================================
  // === СЛАВЯНСКИЕ ЯЗЫКИ ===
  // ============================================================
  ru: { name: 'русский', native: 'русский', endPunctuation: '.!?', direction: 'ltr' },
  uk: { name: 'украинский', native: 'Українська', endPunctuation: '.!?', direction: 'ltr' },
  be: { name: 'белорусский', native: 'Беларуская', endPunctuation: '.!?', direction: 'ltr' },
  pl: { name: 'польский', native: 'Polski', endPunctuation: '.!?', direction: 'ltr' },
  cs: { name: 'чешский', native: 'Čeština', endPunctuation: '.!?', direction: 'ltr' },
  sk: { name: 'словацкий', native: 'Slovenčina', endPunctuation: '.!?', direction: 'ltr' },
  sl: { name: 'словенский', native: 'Slovenščina', endPunctuation: '.!?', direction: 'ltr' },
  bg: { name: 'болгарский', native: 'Български', endPunctuation: '.!?', direction: 'ltr' },
  sr: { name: 'сербский', native: 'Српски', endPunctuation: '.!?', direction: 'ltr' },
  hr: { name: 'хорватский', native: 'Hrvatski', endPunctuation: '.!?', direction: 'ltr' },
  bs: { name: 'боснийский', native: 'Bosanski', endPunctuation: '.!?', direction: 'ltr' },
  mk: { name: 'македонский', native: 'Македонски', endPunctuation: '.!?', direction: 'ltr' },
  rue: { name: 'русинский', native: 'Русиньскый', endPunctuation: '.!?', direction: 'ltr' },
  csb: { name: 'кашубский', native: 'Kaszëbsczi', endPunctuation: '.!?', direction: 'ltr' },
  hsb: { name: 'верхнелужицкий', native: 'Hornjoserbšćina', endPunctuation: '.!?', direction: 'ltr' },
  dsb: { name: 'нижнелужицкий', native: 'Dolnoserbšćina', endPunctuation: '.!?', direction: 'ltr' },
  szl: { name: 'силезский', native: 'Ślůnsko godka', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ГЕРМАНСКИЕ ЯЗЫКИ ===
  // ============================================================
  en: { name: 'английский', native: 'English', endPunctuation: '.!?', direction: 'ltr' },
  de: { name: 'немецкий', native: 'Deutsch', endPunctuation: '.!?', direction: 'ltr' },
  nl: { name: 'нидерландский', native: 'Nederlands', endPunctuation: '.!?', direction: 'ltr' },
  sv: { name: 'шведский', native: 'Svenska', endPunctuation: '.!?', direction: 'ltr' },
  da: { name: 'датский', native: 'Dansk', endPunctuation: '.!?', direction: 'ltr' },
  no: { name: 'норвежский (букмол)', native: 'Norsk bokmål', endPunctuation: '.!?', direction: 'ltr' },
  nn: { name: 'норвежский (нюнорск)', native: 'Nynorsk', endPunctuation: '.!?', direction: 'ltr' },
  is: { name: 'исландский', native: 'Íslenska', endPunctuation: '.!?', direction: 'ltr' },
  fo: { name: 'фарерский', native: 'Føroyskt', endPunctuation: '.!?', direction: 'ltr' },
  fy: { name: 'западнофризский', native: 'Frysk', endPunctuation: '.!?', direction: 'ltr' },
  stq: { name: 'сатерландский фризский', native: 'Seeltersk', endPunctuation: '.!?', direction: 'ltr' },
  frr: { name: 'севернофризский', native: 'Nordfriisk', endPunctuation: '.!?', direction: 'ltr' },
  af: { name: 'африкаанс', native: 'Afrikaans', endPunctuation: '.!?', direction: 'ltr' },
  lb: { name: 'люксембургский', native: 'Lëtzebuergesch', endPunctuation: '.!?', direction: 'ltr' },
  yi: { name: 'идиш', native: 'ייִדיש', endPunctuation: '.!?', direction: 'rtl' },
  sco: { name: 'шотландский', native: 'Scots', endPunctuation: '.!?', direction: 'ltr' },
  ang: { name: 'древнеанглийский', native: 'Englisc', endPunctuation: '.!?', direction: 'ltr' },
  gsw: { name: 'швейцарский немецкий', native: 'Schwyzerdütsch', endPunctuation: '.!?', direction: 'ltr' },
  bar: { name: 'баварский', native: 'Boarisch', endPunctuation: '.!?', direction: 'ltr' },
  pfl: { name: 'пфальцский', native: 'Pfälzisch', endPunctuation: '.!?', direction: 'ltr' },
  ksh: { name: 'кёльнский', native: 'Kölsch', endPunctuation: '.!?', direction: 'ltr' },
  nds: { name: 'нижненемецкий', native: 'Plattdüütsch', endPunctuation: '.!?', direction: 'ltr' },
  pdc: { name: 'пенсильванский немецкий', native: 'Pennsilfaanisch Deitsch', endPunctuation: '.!?', direction: 'ltr' },
  li: { name: 'лимбургский', native: 'Limburgs', endPunctuation: '.!?', direction: 'ltr' },
  zea: { name: 'зеландский', native: 'Zeêuws', endPunctuation: '.!?', direction: 'ltr' },
  vls: { name: 'западнофламандский', native: 'West-Vlams', endPunctuation: '.!?', direction: 'ltr' },
  got: { name: 'готский', native: '𐌲𐌿𐍄𐌹𐍃𐌺', endPunctuation: '.!?', direction: 'ltr' },
  non: { name: 'древнескандинавский', native: 'Norrœnt mál', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === РОМАНСКИЕ ЯЗЫКИ ===
  // ============================================================
  fr: { name: 'французский', native: 'Français', endPunctuation: '.!?', direction: 'ltr' },
  es: { name: 'испанский', native: 'Español', endPunctuation: '.!?¡¿', direction: 'ltr' },
  pt: { name: 'португальский', native: 'Português', endPunctuation: '.!?', direction: 'ltr' },
  'pt-BR': { name: 'бразильский португальский', native: 'Português do Brasil', endPunctuation: '.!?', direction: 'ltr' },
  it: { name: 'итальянский', native: 'Italiano', endPunctuation: '.!?', direction: 'ltr' },
  ro: { name: 'румынский', native: 'Română', endPunctuation: '.!?', direction: 'ltr' },
  ca: { name: 'каталанский', native: 'Català', endPunctuation: '.!?', direction: 'ltr' },
  gl: { name: 'галисийский', native: 'Galego', endPunctuation: '.!?', direction: 'ltr' },
  oc: { name: 'окситанский', native: 'Occitan', endPunctuation: '.!?', direction: 'ltr' },
  an: { name: 'арагонский', native: 'Aragonés', endPunctuation: '.!?', direction: 'ltr' },
  ast: { name: 'астурийский', native: 'Asturianu', endPunctuation: '.!?', direction: 'ltr' },
  co: { name: 'корсиканский', native: 'Corsu', endPunctuation: '.!?', direction: 'ltr' },
  sc: { name: 'сардинский', native: 'Sardu', endPunctuation: '.!?', direction: 'ltr' },
  wa: { name: 'валлонский', native: 'Walon', endPunctuation: '.!?', direction: 'ltr' },
  la: { name: 'латинский', native: 'Latina', endPunctuation: '.!?', direction: 'ltr' },
  mo: { name: 'молдавский', native: 'Moldovenească', endPunctuation: '.!?', direction: 'ltr' },
  ht: { name: 'гаитянский креольский', native: 'Kreyòl ayisyen', endPunctuation: '.!?', direction: 'ltr' },
  rm: { name: 'романшский', native: 'Rumantsch', endPunctuation: '.!?', direction: 'ltr' },
  fur: { name: 'фриульский', native: 'Furlan', endPunctuation: '.!?', direction: 'ltr' },
  lad: { name: 'ладино', native: 'Judezmo', endPunctuation: '.!?', direction: 'ltr' },
  lmo: { name: 'ломбардский', native: 'Lombard', endPunctuation: '.!?', direction: 'ltr' },
  pms: { name: 'пьемонтский', native: 'Piemontèis', endPunctuation: '.!?', direction: 'ltr' },
  vec: { name: 'венетский', native: 'Vèneto', endPunctuation: '.!?', direction: 'ltr' },
  lij: { name: 'лигурский', native: 'Ligure', endPunctuation: '.!?', direction: 'ltr' },
  egl: { name: 'эмилиано-романьольский', native: 'Emigliàn-Rumagnòl', endPunctuation: '.!?', direction: 'ltr' },
  nap: { name: 'неаполитанский', native: 'Napulitano', endPunctuation: '.!?', direction: 'ltr' },
  scn: { name: 'сицилийский', native: 'Sicilianu', endPunctuation: '.!?', direction: 'ltr' },
  rgn: { name: 'романьольский', native: 'Romagnòl', endPunctuation: '.!?', direction: 'ltr' },
  mwl: { name: 'мирандский', native: 'Mirandés', endPunctuation: '.!?', direction: 'ltr' },
  ext: { name: 'эстремадурский', native: 'Estremeñu', endPunctuation: '.!?', direction: 'ltr' },
  frp: { name: 'франкопровансальский', native: 'Arpetan', endPunctuation: '.!?', direction: 'ltr' },
  pcd: { name: 'пикардский', native: 'Picard', endPunctuation: '.!?', direction: 'ltr' },
  nrf: { name: 'нормандский', native: 'Normaund', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === БАЛТИЙСКИЕ ЯЗЫКИ ===
  // ============================================================
  lt: { name: 'литовский', native: 'Lietuvių', endPunctuation: '.!?', direction: 'ltr' },
  lv: { name: 'латышский', native: 'Latviešu', endPunctuation: '.!?', direction: 'ltr' },
  ltg: { name: 'латгальский', native: 'Latgaļu', endPunctuation: '.!?', direction: 'ltr' },
  sgs: { name: 'жемайтский', native: 'Žemaitėška', endPunctuation: '.!?', direction: 'ltr' },
  prg: { name: 'прусский', native: 'Prūsiskan', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === КЕЛЬТСКИЕ ЯЗЫКИ ===
  // ============================================================
  ga: { name: 'ирландский', native: 'Gaeilge', endPunctuation: '.!?', direction: 'ltr' },
  gd: { name: 'шотландский гэльский', native: 'Gàidhlig', endPunctuation: '.!?', direction: 'ltr' },
  cy: { name: 'валлийский', native: 'Cymraeg', endPunctuation: '.!?', direction: 'ltr' },
  br: { name: 'бретонский', native: 'Brezhoneg', endPunctuation: '.!?', direction: 'ltr' },
  kw: { name: 'корнуоллский', native: 'Kernowek', endPunctuation: '.!?', direction: 'ltr' },
  gv: { name: 'мэнский', native: 'Gaelg', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ФИННО-УГОРСКИЕ (УРАЛЬСКИЕ) ЯЗЫКИ ===
  // ============================================================
  fi: { name: 'финский', native: 'Suomi', endPunctuation: '.!?', direction: 'ltr' },
  et: { name: 'эстонский', native: 'Eesti', endPunctuation: '.!?', direction: 'ltr' },
  hu: { name: 'венгерский', native: 'Magyar', endPunctuation: '.!?', direction: 'ltr' },
  se: { name: 'северносаамский', native: 'Davvisámegiella', endPunctuation: '.!?', direction: 'ltr' },
  smn: { name: 'инари-саамский', native: 'Anarâškielâ', endPunctuation: '.!?', direction: 'ltr' },
  sms: { name: 'колтта-саамский', native: 'Sää´mǩiõll', endPunctuation: '.!?', direction: 'ltr' },
  sma: { name: 'южносаамский', native: 'Åarjelsaemien gïele', endPunctuation: '.!?', direction: 'ltr' },
  smj: { name: 'луле-саамский', native: 'Julevsámegiella', endPunctuation: '.!?', direction: 'ltr' },
  vro: { name: 'выруский', native: 'Võro', endPunctuation: '.!?', direction: 'ltr' },
  liv: { name: 'ливский', native: 'Līvõ kēļ', endPunctuation: '.!?', direction: 'ltr' },
  vep: { name: 'вепсский', native: `Vepsän kel'`, endPunctuation: '.!?', direction: 'ltr' },
  izh: { name: 'ижорский', native: 'Ižoran keel', endPunctuation: '.!?', direction: 'ltr' },
  krl: { name: 'карельский', native: 'Karjalan kieli', endPunctuation: '.!?', direction: 'ltr' },
  udm: { name: 'удмуртский', native: 'Удмурт кыл', endPunctuation: '.!?', direction: 'ltr' },
  kv: { name: 'коми-зырянский', native: 'Коми кыв', endPunctuation: '.!?', direction: 'ltr' },
  koi: { name: 'коми-пермяцкий', native: 'Перем коми', endPunctuation: '.!?', direction: 'ltr' },
  mdf: { name: 'мокшанский', native: 'Мокшень кяль', endPunctuation: '.!?', direction: 'ltr' },
  myv: { name: 'эрзянский', native: 'Эрзянь кель', endPunctuation: '.!?', direction: 'ltr' },
  mrj: { name: 'горномарийский', native: 'Кырык мары', endPunctuation: '.!?', direction: 'ltr' },
  mhr: { name: 'луговомарийский', native: 'Олык марий', endPunctuation: '.!?', direction: 'ltr' },

  // === Самодийские языки ===
  yrk: { name: 'ненецкий', native: 'Ненэця вада', endPunctuation: '.!?', direction: 'ltr' },
  sel: { name: 'селькупский', native: 'Шöльшы кум', endPunctuation: '.!?', direction: 'ltr' },
  enf: { name: 'энецкий', native: 'Эньчу', endPunctuation: '.!?', direction: 'ltr' },
  nga: { name: 'нганасанский', native: 'Ня"', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ТЮРКСКИЕ ЯЗЫКИ ===
  // ============================================================
  tr: { name: 'турецкий', native: 'Türkçe', endPunctuation: '.!?', direction: 'ltr' },
  az: { name: 'азербайджанский', native: 'Azərbaycan', endPunctuation: '.!?', direction: 'ltr' },
  kk: { name: 'казахский', native: 'Қазақша', endPunctuation: '.!?', direction: 'ltr' },
  uz: { name: 'узбекский', native: "O'zbekcha", endPunctuation: '.!?', direction: 'ltr' },
  ky: { name: 'киргизский', native: 'Кыргызча', endPunctuation: '.!?', direction: 'ltr' },
  tk: { name: 'туркменский', native: 'Türkmen', endPunctuation: '.!?', direction: 'ltr' },
  tt: { name: 'татарский', native: 'Татарча', endPunctuation: '.!?', direction: 'ltr' },
  ba: { name: 'башкирский', native: 'Башҡортса', endPunctuation: '.!?', direction: 'ltr' },
  cv: { name: 'чувашский', native: 'Чӑвашла', endPunctuation: '.!?', direction: 'ltr' },
  crh: { name: 'крымскотатарский', native: 'Qırımtatarca', endPunctuation: '.!?', direction: 'ltr' },
  ug: { name: 'уйгурский', native: 'ئۇيغۇرچە', endPunctuation: '.!?', direction: 'rtl' },
  sah: { name: 'якутский', native: 'Сахалыы', endPunctuation: '.!?', direction: 'ltr' },
  gag: { name: 'гагаузский', native: 'Gagauzca', endPunctuation: '.!?', direction: 'ltr' },
  kum: { name: 'кумыкский', native: 'Къумукъча', endPunctuation: '.!?', direction: 'ltr' },
  nog: { name: 'ногайский', native: 'Ногайша', endPunctuation: '.!?', direction: 'ltr' },
  tyv: { name: 'тувинский', native: 'Тыва дыл', endPunctuation: '.!?', direction: 'ltr' },
  alt: { name: 'алтайский', native: 'Алтай тил', endPunctuation: '.!?', direction: 'ltr' },
  kjh: { name: 'хакасский', native: 'Хакас тілі', endPunctuation: '.!?', direction: 'ltr' },
  krc: { name: 'карачаево-балкарский', native: 'Къарачай-малкъар', endPunctuation: '.!?', direction: 'ltr' },
  dlg: { name: 'долганский', native: 'Тыа кил', endPunctuation: '.!?', direction: 'ltr' },
  cjs: { name: 'шорский', native: 'Шор тили', endPunctuation: '.!?', direction: 'ltr' },
  kim: { name: 'тофаларский', native: 'Тоъфа дыл', endPunctuation: '.!?', direction: 'ltr' },
  kaa: { name: 'каракалпакский', native: 'Qaraqalpaqsha', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === МОНГОЛЬСКИЕ ЯЗЫКИ ===
  // ============================================================
  mn: { name: 'монгольский', native: 'Монгол', endPunctuation: '.!?', direction: 'ltr' },
  bua: { name: 'бурятский', native: 'Буряад', endPunctuation: '.!?', direction: 'ltr' },
  xal: { name: 'калмыцкий', native: 'Хальмг', endPunctuation: '.!?', direction: 'ltr' },
  khk: { name: 'халха-монгольский', native: 'Халх', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ТУНГУСО-МАНЬЧЖУРСКИЕ ЯЗЫКИ ===
  // ============================================================
  evn: { name: 'эвенкийский', native: 'Эвэды турэн', endPunctuation: '.!?', direction: 'ltr' },
  eve: { name: 'эвенский', native: 'Эвэн турэн', endPunctuation: '.!?', direction: 'ltr' },
  mnc: { name: 'маньчжурский', native: 'ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ', endPunctuation: '.!?', direction: 'ltr' },
  gld: { name: 'нанайский', native: 'На̄ний', endPunctuation: '.!?', direction: 'ltr' },
  ulc: { name: 'ульчский', native: 'Нани', endPunctuation: '.!?', direction: 'ltr' },
  ude: { name: 'удэгейский', native: 'Удиэ', endPunctuation: '.!?', direction: 'ltr' },
  orc: { name: 'орочский', native: 'Орочисэл', endPunctuation: '.!?', direction: 'ltr' },
  neg: { name: 'негидальский', native: 'Элкан бэйэнин', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === СЕМИТСКИЕ ЯЗЫКИ ===
  // ============================================================
  ar: { name: 'арабский (стандартный)', native: 'العربية الفصحى', endPunctuation: '.!?', direction: 'rtl' },
  he: { name: 'иврит', native: 'עברית', endPunctuation: '.!?', direction: 'rtl' },
  am: { name: 'амхарский', native: 'አማርኛ', endPunctuation: '።!?', direction: 'ltr' },
  ti: { name: 'тигринья', native: 'ትግርኛ', endPunctuation: '።!?', direction: 'ltr' },
  tig: { name: 'тигре', native: 'ትግረ', endPunctuation: '።!?', direction: 'ltr' },
  mt: { name: 'мальтийский', native: 'Malti', endPunctuation: '.!?', direction: 'ltr' },
  arz: { name: 'египетский арабский', native: 'مصرى', endPunctuation: '.!?', direction: 'rtl' },
  arq: { name: 'алжирский арабский', native: 'دارجة', endPunctuation: '.!?', direction: 'rtl' },
  apc: { name: 'левантийский арабский', native: 'عربي شامي', endPunctuation: '.!?', direction: 'rtl' },
  acm: { name: 'иракский арабский', native: 'عراقي', endPunctuation: '.!?', direction: 'rtl' },
  ary: { name: 'марокканский арабский', native: 'الدارجة', endPunctuation: '.!?', direction: 'rtl' },
  aeb: { name: 'тунисский арабский', native: 'تونسي', endPunctuation: '.!?', direction: 'rtl' },
  afb: { name: 'арабский Персидского залива', native: 'خليجي', endPunctuation: '.!?', direction: 'rtl' },
  acq: { name: 'йеменский арабский', native: 'يمني', endPunctuation: '.!?', direction: 'rtl' },
  ayl: { name: 'ливийский арабский', native: 'ليبي', endPunctuation: '.!?', direction: 'rtl' },
  shu: { name: 'чадский арабский', native: 'عربي تشادي', endPunctuation: '.!?', direction: 'rtl' },
  apd: { name: 'суданский арабский', native: 'عربي سوداني', endPunctuation: '.!?', direction: 'rtl' },
  acx: { name: 'оманский арабский', native: 'عماني', endPunctuation: '.!?', direction: 'rtl' },
  syc: { name: 'сирийский (классический)', native: 'ܣܘܪܝܝܐ', endPunctuation: '.!?', direction: 'rtl' },
  arc: { name: 'арамейский', native: 'ܐܪܡܝܐ', endPunctuation: '.!?', direction: 'rtl' },
  aii: { name: 'ассирийский', native: 'ܐܬܘܪܝܐ', endPunctuation: '.!?', direction: 'rtl' },
  gez: { name: 'геэз', native: 'ግዕዝ', endPunctuation: '።!?', direction: 'ltr' },
  har: { name: 'харари', native: 'ሐረሪ', endPunctuation: '።!?', direction: 'ltr' },
  sgw: { name: 'себат-бет-гураге', native: 'ስብዓት', endPunctuation: '።!?', direction: 'ltr' },

  // ============================================================
  // === ИРАНСКИЕ ЯЗЫКИ ===
  // ============================================================
  fa: { name: 'персидский', native: 'فارسی', endPunctuation: '.!?', direction: 'rtl' },
  ku: { name: 'курдский (курманджи)', native: 'Kurdî', endPunctuation: '.!?', direction: 'ltr' },
  ckb: { name: 'курдский (сорани)', native: 'سۆرانی', endPunctuation: '.!?', direction: 'rtl' },
  ps: { name: 'пушту', native: 'پښتو', endPunctuation: '.!?', direction: 'rtl' },
  tg: { name: 'таджикский', native: 'Тоҷикӣ', endPunctuation: '.!?', direction: 'ltr' },
  os: { name: 'осетинский', native: 'Ирон æвзаг', endPunctuation: '.!?', direction: 'ltr' },
  sd: { name: 'синдхи', native: 'سنڌي', endPunctuation: '.!?', direction: 'rtl' },
  bal: { name: 'белуджский', native: 'بلوچی', endPunctuation: '.!?', direction: 'rtl' },
  tly: { name: 'талышский', native: 'Толышә зывон', endPunctuation: '.!?', direction: 'ltr' },
  tat: { name: 'татский', native: 'Тоти', endPunctuation: '.!?', direction: 'ltr' },
  glk: { name: 'гилянский', native: 'گیلکی', endPunctuation: '.!?', direction: 'rtl' },
  mzn: { name: 'мазандеранский', native: 'مازرونی', endPunctuation: '.!?', direction: 'rtl' },
  lrc: { name: 'лурский', native: 'لۊری', endPunctuation: '.!?', direction: 'rtl' },
  haz: { name: 'хазарейский', native: 'هزارگی', endPunctuation: '.!?', direction: 'rtl' },
  wak: { name: 'ваханский', native: 'Xikwor', endPunctuation: '.!?', direction: 'ltr' },
  yai: { name: 'ягнобский', native: 'Яғнобӣ', endPunctuation: '.!?', direction: 'ltr' },
  zza: { name: 'зазаки', native: 'Zazaki', endPunctuation: '.!?', direction: 'ltr' },
  prs: { name: 'дари', native: 'دری', endPunctuation: '.!?', direction: 'rtl' },

  // ============================================================
  // === ИНДОАРИЙСКИЕ ЯЗЫКИ ===
  // ============================================================
  hi: { name: 'хинди', native: 'हिन्दी', endPunctuation: '।!?', direction: 'ltr' },
  bn: { name: 'бенгальский', native: 'বাংলা', endPunctuation: '।!?', direction: 'ltr' },
  ur: { name: 'урду', native: 'اردو', endPunctuation: '.!?', direction: 'rtl' },
  pa: { name: 'панджаби (гурмукхи)', native: 'ਪੰਜਾਬੀ', endPunctuation: '।!?', direction: 'ltr' },
  pnb: { name: 'панджаби (шахмукхи)', native: 'پنجابی', endPunctuation: '.!?', direction: 'rtl' },
  gu: { name: 'гуджарати', native: 'ગુજરાતી', endPunctuation: '.!?', direction: 'ltr' },
  mr: { name: 'маратхи', native: 'मराठी', endPunctuation: '।!?', direction: 'ltr' },
  ne: { name: 'непальский', native: 'नेपाली', endPunctuation: '।!?', direction: 'ltr' },
  si: { name: 'сингальский', native: 'සිංහල', endPunctuation: '.!?', direction: 'ltr' },
  or: { name: 'ория (одия)', native: 'ଓଡ଼ିଆ', endPunctuation: '।!?', direction: 'ltr' },
  as: { name: 'ассамский', native: 'অসমীয়া', endPunctuation: '।!?', direction: 'ltr' },
  sa: { name: 'санскрит', native: 'संस्कृतम्', endPunctuation: '।!?', direction: 'ltr' },
  ks: { name: 'кашмирский', native: 'कॉशुर', endPunctuation: '।!?', direction: 'rtl' },
  bho: { name: 'бходжпури', native: 'भोजपुरी', endPunctuation: '।!?', direction: 'ltr' },
  mai: { name: 'майтхили', native: 'मैथिली', endPunctuation: '।!?', direction: 'ltr' },
  doi: { name: 'догри', native: 'डोगरी', endPunctuation: '।!?', direction: 'ltr' },
  kok: { name: 'конкани', native: 'कोंकणी', endPunctuation: '।!?', direction: 'ltr' },
  dv: { name: 'мальдивский (дивехи)', native: 'ދިވެހި', endPunctuation: '.!?', direction: 'rtl' },
  rom: { name: 'цыганский (романи)', native: 'Romani čhib', endPunctuation: '.!?', direction: 'ltr' },
  raj: { name: 'раджастхани', native: 'राजस्थानी', endPunctuation: '।!?', direction: 'ltr' },
  awa: { name: 'авадхи', native: 'अवधी', endPunctuation: '।!?', direction: 'ltr' },
  mag: { name: 'магахи', native: 'मगही', endPunctuation: '।!?', direction: 'ltr' },
  hif: { name: 'фиджийский хинди', native: 'Fiji Hindi', endPunctuation: '.!?', direction: 'ltr' },
  new: { name: 'неварский (невари)', native: 'नेपाल भाषा', endPunctuation: '।!?', direction: 'ltr' },
  syl: { name: 'силхетский', native: 'ꠍꠤꠟꠐꠤ', endPunctuation: '.!?', direction: 'ltr' },
  ctg: { name: 'читтагонский', native: 'চাটগাঁইয়া', endPunctuation: '।!?', direction: 'ltr' },
  rkt: { name: 'рангпурский', native: 'রংপুরী', endPunctuation: '।!?', direction: 'ltr' },
  bgc: { name: 'харьянви', native: 'हरियाणवी', endPunctuation: '।!?', direction: 'ltr' },
  mwr: { name: 'марвари', native: 'मारवाड़ी', endPunctuation: '।!?', direction: 'ltr' },
  gbm: { name: 'гархвали', native: 'गढ़वळि', endPunctuation: '।!?', direction: 'ltr' },
  kfy: { name: 'кумаони', native: 'कुमाऊँनी', endPunctuation: '।!?', direction: 'ltr' },
  skr: { name: 'сирайки', native: 'سرائیکی', endPunctuation: '.!?', direction: 'rtl' },
  hne: { name: 'чхаттисгархи', native: 'छत्तीसगढ़ी', endPunctuation: '।!?', direction: 'ltr' },
  bhb: { name: 'бхили', native: 'भीली', endPunctuation: '।!?', direction: 'ltr' },
  lmn: { name: 'ламбади', native: 'लम्बाडी', endPunctuation: '।!?', direction: 'ltr' },

  // ============================================================
  // === ДРАВИДИЙСКИЕ ЯЗЫКИ ===
  // ============================================================
  ta: { name: 'тамильский', native: 'தமிழ்', endPunctuation: '.!?', direction: 'ltr' },
  te: { name: 'телугу', native: 'తెలుగు', endPunctuation: '.!?', direction: 'ltr' },
  kn: { name: 'каннада', native: 'ಕನ್ನಡ', endPunctuation: '.!?', direction: 'ltr' },
  ml: { name: 'малаялам', native: 'മലയാളം', endPunctuation: '.!?', direction: 'ltr' },
  tcy: { name: 'тулу', native: 'ತುಳು', endPunctuation: '.!?', direction: 'ltr' },
  gon: { name: 'гонди', native: 'गोंडी', endPunctuation: '.!?', direction: 'ltr' },
  kru: { name: 'курух', native: 'कुड़ुख़', endPunctuation: '.!?', direction: 'ltr' },
  brh: { name: 'брагуи', native: 'براهوئی', endPunctuation: '.!?', direction: 'rtl' },
  tda: { name: 'тода', native: 'தோடா', endPunctuation: '.!?', direction: 'ltr' },
  kfb: { name: 'кодава', native: 'ಕೊಡವ', endPunctuation: '.!?', direction: 'ltr' },
  bdr: { name: 'бадага', native: 'படகா', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ВОСТОЧНОАЗИАТСКИЕ ЯЗЫКИ (СИНО-ТИБЕТСКИЕ И ДР.) ===
  // ============================================================
  zh: { name: 'китайский (упрощённый)', native: '简体中文', endPunctuation: '。！？', direction: 'ltr' },
  'zh-TW': { name: 'китайский (традиционный)', native: '繁體中文', endPunctuation: '。！？', direction: 'ltr' },
  ja: { name: 'японский', native: '日本語', endPunctuation: '。！？', direction: 'ltr' },
  ko: { name: 'корейский', native: '한국어', endPunctuation: '.!?', direction: 'ltr' },
  yue: { name: 'кантонский', native: '粵語', endPunctuation: '。！？', direction: 'ltr' },
  wuu: { name: 'у (шанхайский)', native: '吳語', endPunctuation: '。！？', direction: 'ltr' },
  hak: { name: 'хакка', native: '客家語', endPunctuation: '。！？', direction: 'ltr' },
  nan: { name: 'миньнаньский', native: '閩南語', endPunctuation: '。！？', direction: 'ltr' },
  cdo: { name: 'миньдунский', native: '閩東語', endPunctuation: '。！？', direction: 'ltr' },
  gan: { name: 'ганьский', native: '贛語', endPunctuation: '。！？', direction: 'ltr' },
  hsn: { name: 'сянский', native: '湘語', endPunctuation: '。！？', direction: 'ltr' },
  czh: { name: 'хуэйчжоуский', native: '徽語', endPunctuation: '。！？', direction: 'ltr' },
  cjy: { name: 'цзиньский', native: '晉語', endPunctuation: '。！？', direction: 'ltr' },
  cmn: { name: 'мандаринский', native: '官話', endPunctuation: '。！？', direction: 'ltr' },

  // === Тибето-бирманские языки ===
  bo: { name: 'тибетский', native: 'བོད་སྐད', endPunctuation: '།!?', direction: 'ltr' },
  dz: { name: 'дзонг-кэ', native: 'རྫོང་ཁ', endPunctuation: '།!?', direction: 'ltr' },
  my: { name: 'бирманский', native: 'မြန်မာ', endPunctuation: '။!?', direction: 'ltr' },
  mni: { name: 'манипури (мейтей)', native: 'মৈতৈলোন্', endPunctuation: '.!?', direction: 'ltr' },
  lus: { name: 'мизо', native: 'Mizo ṭawng', endPunctuation: '.!?', direction: 'ltr' },
  kac: { name: 'качинский', native: 'Jingpho', endPunctuation: '.!?', direction: 'ltr' },
  lhu: { name: 'лаху', native: 'Ladhof', endPunctuation: '.!?', direction: 'ltr' },
  lif: { name: 'лимбу', native: 'ᤕᤰᤌᤢᤱ', endPunctuation: '.!?', direction: 'ltr' },
  lep: { name: 'лепча', native: 'ᰛᰩᰵᰛᰧᰵ', endPunctuation: '.!?', direction: 'ltr' },
  iii: { name: 'ий (сычуаньский)', native: 'ꆈꌠꉙ', endPunctuation: '.!?', direction: 'ltr' },
  hni: { name: 'хани', native: 'Haqniq', endPunctuation: '.!?', direction: 'ltr' },
  kar: { name: 'каренский', native: 'ကညီကျိာ်', endPunctuation: '.!?', direction: 'ltr' },
  ksw: { name: 'с`гав карен', native: 'စှီၤ', endPunctuation: '.!?', direction: 'ltr' },
  blk: { name: 'па-о', native: 'ပအိုဝ်ႏ', endPunctuation: '.!?', direction: 'ltr' },
  rhi: { name: 'ронг (лепча)', native: 'Rong', endPunctuation: '.!?', direction: 'ltr' },
  nwc: { name: 'классический неварский', native: 'नेपाल भाषा', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫКИ ЮГО-ВОСТОЧНОЙ АЗИИ ===
  // ============================================================
  th: { name: 'тайский', native: 'ไทย', endPunctuation: '.!?', direction: 'ltr' },
  vi: { name: 'вьетнамский', native: 'Tiếng Việt', endPunctuation: '.!?', direction: 'ltr' },
  km: { name: 'кхмерский', native: 'ភាសាខ្មែរ', endPunctuation: '។!?', direction: 'ltr' },
  lo: { name: 'лаосский', native: 'ພາສາລາວ', endPunctuation: '.!?', direction: 'ltr' },
  id: { name: 'индонезийский', native: 'Bahasa Indonesia', endPunctuation: '.!?', direction: 'ltr' },
  ms: { name: 'малайский', native: 'Bahasa Melayu', endPunctuation: '.!?', direction: 'ltr' },
  tl: { name: 'тагальский', native: 'Tagalog', endPunctuation: '.!?', direction: 'ltr' },
  fil: { name: 'филиппинский', native: 'Wikang Filipino', endPunctuation: '.!?', direction: 'ltr' },
  jv: { name: 'яванский', native: 'Basa Jawa', endPunctuation: '.!?', direction: 'ltr' },
  su: { name: 'сунданский', native: 'Basa Sunda', endPunctuation: '.!?', direction: 'ltr' },
  ceb: { name: 'себуанский', native: 'Cebuano', endPunctuation: '.!?', direction: 'ltr' },
  ilo: { name: 'илоканский', native: 'Ilokano', endPunctuation: '.!?', direction: 'ltr' },
  min: { name: 'минангкабау', native: 'Minangkabau', endPunctuation: '.!?', direction: 'ltr' },
  war: { name: 'варайский', native: 'Winaray', endPunctuation: '.!?', direction: 'ltr' },
  hil: { name: 'хилигайнон', native: 'Hiligaynon', endPunctuation: '.!?', direction: 'ltr' },
  ban: { name: 'балийский', native: 'Basa Bali', endPunctuation: '.!?', direction: 'ltr' },
  ace: { name: 'ачехский', native: 'Bahsa Acèh', endPunctuation: '.!?', direction: 'ltr' },
  bug: { name: 'бугийский', native: 'ᨅᨔ ᨕᨘᨁᨗ', endPunctuation: '.!?', direction: 'ltr' },
  tet: { name: 'тетум', native: 'Tetun', endPunctuation: '.!?', direction: 'ltr' },
  pag: { name: 'пангасинанский', native: 'Pangasinan', endPunctuation: '.!?', direction: 'ltr' },
  pam: { name: 'пампанганский', native: 'Kapampangan', endPunctuation: '.!?', direction: 'ltr' },
  bik: { name: 'бикольский', native: 'Bikol', endPunctuation: '.!?', direction: 'ltr' },
  tsg: { name: 'тауcуг', native: 'Bahasa Sūg', endPunctuation: '.!?', direction: 'ltr' },
  mdh: { name: 'маранао', native: 'Mëranaw', endPunctuation: '.!?', direction: 'ltr' },
  mbb: { name: 'магинданао', native: 'Maguindanao', endPunctuation: '.!?', direction: 'ltr' },
  mad: { name: 'мадурский', native: 'Madhura', endPunctuation: '.!?', direction: 'ltr' },
  bjn: { name: 'банджарский', native: 'Banjar', endPunctuation: '.!?', direction: 'ltr' },
  mkn: { name: 'малайский (кучинг)', native: 'Bahasa Sarawak', endPunctuation: '.!?', direction: 'ltr' },
  iba: { name: 'ибанский', native: 'Jaku Iban', endPunctuation: '.!?', direction: 'ltr' },
  dtp: { name: 'кадазандусун', native: 'Kadazandusun', endPunctuation: '.!?', direction: 'ltr' },
  shn: { name: 'шанский', native: 'လိၵ်ႈတႆး', endPunctuation: '.!?', direction: 'ltr' },
  mnw: { name: 'монский', native: 'ဘာသာမန်', endPunctuation: '.!?', direction: 'ltr' },

  // === Тай-кадайские языки ===
  za: { name: 'чжуанский', native: 'Vahcuengh', endPunctuation: '.!?', direction: 'ltr' },
  nus: { name: 'нуосу', native: 'ꆈꌠꉙ', endPunctuation: '.!?', direction: 'ltr' },
  lia: { name: 'ли', native: '黎語', endPunctuation: '.!?', direction: 'ltr' },
  tts: { name: 'исанский', native: 'ภาษาอีสาน', endPunctuation: '.!?', direction: 'ltr' },
  nod: { name: 'северотайский', native: 'คำเมือง', endPunctuation: '.!?', direction: 'ltr' },
  sou: { name: 'южнотайский', native: 'ภาษาใต้', endPunctuation: '.!?', direction: 'ltr' },

  // === Австроазиатские языки ===
  sat: { name: 'сантали', native: 'ᱥᱟᱱᱛᱟᱲᱤ', endPunctuation: '.!?', direction: 'ltr' },
  kha: { name: 'кхаси', native: 'Ka Ktien Khasi', endPunctuation: '.!?', direction: 'ltr' },
  hoc: { name: 'хо', native: 'Ho', endPunctuation: '.!?', direction: 'ltr' },
  mun: { name: 'мундари', native: 'मुण्डारी', endPunctuation: '.!?', direction: 'ltr' },
  kjg: { name: 'кхму', native: 'ภาษาขมุ', endPunctuation: '.!?', direction: 'ltr' },

  // === Мяо-яо (хмонг-мьен) ===
  hmn: { name: 'хмонг', native: 'Hmoob', endPunctuation: '.!?', direction: 'ltr' },
  hnj: { name: 'хмонг нджуа', native: 'Hmôngz Nziab', endPunctuation: '.!?', direction: 'ltr' },
  ium: { name: 'яо (мьен)', native: 'Iu Mienh', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === КАВКАЗСКИЕ ЯЗЫКИ ===
  // ============================================================
  ka: { name: 'грузинский', native: 'ქართული', endPunctuation: '.!?', direction: 'ltr' },
  hy: { name: 'армянский', native: 'Հայերեն', endPunctuation: '.!?', direction: 'ltr' },
  ab: { name: 'абхазский', native: 'Аҧсуа', endPunctuation: '.!?', direction: 'ltr' },
  ce: { name: 'чеченский', native: 'Нохчийн', endPunctuation: '.!?', direction: 'ltr' },
  av: { name: 'аварский', native: 'Авар мацӀ', endPunctuation: '.!?', direction: 'ltr' },
  lez: { name: 'лезгинский', native: 'Лезги чӀал', endPunctuation: '.!?', direction: 'ltr' },
  ady: { name: 'адыгейский', native: 'Адыгабзэ', endPunctuation: '.!?', direction: 'ltr' },
  kbd: { name: 'кабардинский', native: 'Адыгэбзэ', endPunctuation: '.!?', direction: 'ltr' },
  inh: { name: 'ингушский', native: 'ГӀалгӀай мотт', endPunctuation: '.!?', direction: 'ltr' },
  dar: { name: 'даргинский', native: 'Дарган мез', endPunctuation: '.!?', direction: 'ltr' },
  lbe: { name: 'лакский', native: 'Лакку маз', endPunctuation: '.!?', direction: 'ltr' },
  tab: { name: 'табасаранский', native: 'Табасаран чӀал', endPunctuation: '.!?', direction: 'ltr' },
  aqc: { name: 'арчинский', native: 'Арчиб', endPunctuation: '.!?', direction: 'ltr' },
  rut: { name: 'рутульский', native: 'МыхӀабишды чӀал', endPunctuation: '.!?', direction: 'ltr' },
  agx: { name: 'агульский', native: 'Агул чӀал', endPunctuation: '.!?', direction: 'ltr' },
  tkr: { name: 'цахурский', native: 'Цахурский', endPunctuation: '.!?', direction: 'ltr' },
  udi: { name: 'удинский', native: 'Удин муз', endPunctuation: '.!?', direction: 'ltr' },
  xmf: { name: 'мегрельский', native: 'მარგალური', endPunctuation: '.!?', direction: 'ltr' },
  lzz: { name: 'лазский', native: 'ლაზური', endPunctuation: '.!?', direction: 'ltr' },
  sva: { name: 'сванский', native: 'ლუშნუ ნინ', endPunctuation: '.!?', direction: 'ltr' },
  bbl: { name: 'батсбийский', native: 'Бацбий мотт', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ГРЕЧЕСКИЙ ===
  // ============================================================
  el: { name: 'греческий', native: 'Ελληνικά', endPunctuation: '.!?;', direction: 'ltr' },
  grc: { name: 'древнегреческий', native: 'Ἑλληνική', endPunctuation: '.!?;', direction: 'ltr' },
  pnt: { name: 'понтийский греческий', native: 'Ποντιακά', endPunctuation: '.!?;', direction: 'ltr' },
  cpg: { name: 'каппадокийский греческий', native: 'Καππαδοκικά', endPunctuation: '.!?;', direction: 'ltr' },
  tsd: { name: 'цаконский', native: 'Τσακωνικά', endPunctuation: '.!?;', direction: 'ltr' },

  // ============================================================
  // === БАСКСКИЙ ===
  // ============================================================
  eu: { name: 'баскский', native: 'Euskara', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === АЛБАНСКИЙ ===
  // ============================================================
  sq: { name: 'албанский', native: 'Shqip', endPunctuation: '.!?', direction: 'ltr' },
  aln: { name: 'гегский', native: 'Gegë', endPunctuation: '.!?', direction: 'ltr' },
  als: { name: 'тоскский', native: 'Toskë', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === АФРИКАНСКИЕ ЯЗЫКИ ===
  // ============================================================

  // --- Нигеро-конголезские: банту ---
  sw: { name: 'суахили', native: 'Kiswahili', endPunctuation: '.!?', direction: 'ltr' },
  zu: { name: 'зулу', native: 'isiZulu', endPunctuation: '.!?', direction: 'ltr' },
  xh: { name: 'коса', native: 'isiXhosa', endPunctuation: '.!?', direction: 'ltr' },
  st: { name: 'сесото (южный)', native: 'Sesotho', endPunctuation: '.!?', direction: 'ltr' },
  tn: { name: 'тсвана', native: 'Setswana', endPunctuation: '.!?', direction: 'ltr' },
  sn: { name: 'шона', native: 'chiShona', endPunctuation: '.!?', direction: 'ltr' },
  ny: { name: 'чичева (ньянджа)', native: 'Chichewa', endPunctuation: '.!?', direction: 'ltr' },
  rw: { name: 'киньяруанда', native: 'Kinyarwanda', endPunctuation: '.!?', direction: 'ltr' },
  rn: { name: 'кирунди', native: 'Ikirundi', endPunctuation: '.!?', direction: 'ltr' },
  lg: { name: 'ганда (луганда)', native: 'Luganda', endPunctuation: '.!?', direction: 'ltr' },
  mg: { name: 'малагасийский', native: 'Malagasy', endPunctuation: '.!?', direction: 'ltr' },
  ln: { name: 'лингала', native: 'Lingála', endPunctuation: '.!?', direction: 'ltr' },
  kg: { name: 'конго (киконго)', native: 'Kikongo', endPunctuation: '.!?', direction: 'ltr' },
  ts: { name: 'тсонга', native: 'Xitsonga', endPunctuation: '.!?', direction: 'ltr' },
  ss: { name: 'свати', native: 'SiSwati', endPunctuation: '.!?', direction: 'ltr' },
  ve: { name: 'венда', native: 'Tshivenḓa', endPunctuation: '.!?', direction: 'ltr' },
  nr: { name: 'южный ндебеле', native: 'isiNdebele', endPunctuation: '.!?', direction: 'ltr' },
  nd: { name: 'северный ндебеле', native: 'isiNdebele', endPunctuation: '.!?', direction: 'ltr' },
  nso: { name: 'северный сото (сепеди)', native: 'Sepedi', endPunctuation: '.!?', direction: 'ltr' },
  bem: { name: 'бемба', native: 'Ichibemba', endPunctuation: '.!?', direction: 'ltr' },
  tum: { name: 'тумбука', native: 'chiTumbuka', endPunctuation: '.!?', direction: 'ltr' },
  luo: { name: 'луо', native: 'Dholuo', endPunctuation: '.!?', direction: 'ltr' },
  ki: { name: 'кикуйю', native: 'Gĩkũyũ', endPunctuation: '.!?', direction: 'ltr' },
  kam: { name: 'камба', native: 'Kikamba', endPunctuation: '.!?', direction: 'ltr' },
  lua: { name: 'чилуба', native: 'Tshiluba', endPunctuation: '.!?', direction: 'ltr' },
  umb: { name: 'умбунду', native: 'Umbundu', endPunctuation: '.!?', direction: 'ltr' },
  kmb: { name: 'кимбунду', native: 'Kimbundu', endPunctuation: '.!?', direction: 'ltr' },
  nyn: { name: 'ньянколе', native: 'Runyankole', endPunctuation: '.!?', direction: 'ltr' },
  chy: { name: 'чига', native: 'Rukiga', endPunctuation: '.!?', direction: 'ltr' },
  sub: { name: 'сукума', native: 'Sukuma', endPunctuation: '.!?', direction: 'ltr' },
  nym: { name: 'ньямвези', native: 'Nyamwezi', endPunctuation: '.!?', direction: 'ltr' },
  heh: { name: 'хехе', native: 'Kihehe', endPunctuation: '.!?', direction: 'ltr' },
  mas: { name: 'масаи', native: 'Maa', endPunctuation: '.!?', direction: 'ltr' },
  luy: { name: 'лухья', native: 'Luhya', endPunctuation: '.!?', direction: 'ltr' },
  guz: { name: 'гусии', native: 'Ekegusii', endPunctuation: '.!?', direction: 'ltr' },
  mer: { name: 'меру', native: 'Kĩmĩrũ', endPunctuation: '.!?', direction: 'ltr' },
  ksb: { name: 'шамбала', native: 'Kishambaa', endPunctuation: '.!?', direction: 'ltr' },
  tog: { name: 'тонга (Замбия)', native: 'Chitonga', endPunctuation: '.!?', direction: 'ltr' },
  loz: { name: 'лози', native: 'Silozi', endPunctuation: '.!?', direction: 'ltr' },
  ndo: { name: 'ндонга', native: 'Oshindonga', endPunctuation: '.!?', direction: 'ltr' },
  kwn: { name: 'кваньяма', native: 'Oshikwanyama', endPunctuation: '.!?', direction: 'ltr' },
  her: { name: 'гереро', native: 'Otjiherero', endPunctuation: '.!?', direction: 'ltr' },
  swb: { name: 'коморский', native: 'Shikomor', endPunctuation: '.!?', direction: 'ltr' },
  run: { name: 'руанда-рунди', native: 'Ikinyarwanda', endPunctuation: '.!?', direction: 'ltr' },
  cgg: { name: 'чига', native: 'Oruchiga', endPunctuation: '.!?', direction: 'ltr' },
  kik: { name: 'кикуйю', native: 'Gĩkũyũ', endPunctuation: '.!?', direction: 'ltr' },
  toi: { name: 'тонга (Замбия)', native: 'chiTonga', endPunctuation: '.!?', direction: 'ltr' },

  // --- Нигеро-конголезские: западноафриканские ---
  ha: { name: 'хауса', native: 'Hausa', endPunctuation: '.!?', direction: 'ltr' },
  yo: { name: 'йоруба', native: 'Yorùbá', endPunctuation: '.!?', direction: 'ltr' },
  ig: { name: 'игбо', native: 'Igbo', endPunctuation: '.!?', direction: 'ltr' },
  wo: { name: 'волоф', native: 'Wolof', endPunctuation: '.!?', direction: 'ltr' },
  ff: { name: 'фула (фулани)', native: 'Fulfulde', endPunctuation: '.!?', direction: 'ltr' },
  ak: { name: 'акан', native: 'Akan', endPunctuation: '.!?', direction: 'ltr' },
  tw: { name: 'тви', native: 'Twi', endPunctuation: '.!?', direction: 'ltr' },
  ee: { name: 'эве', native: 'Eʋegbe', endPunctuation: '.!?', direction: 'ltr' },
  bm: { name: 'бамбара', native: 'Bamanankan', endPunctuation: '.!?', direction: 'ltr' },
  fon: { name: 'фон', native: 'Fɔ̀ngbè', endPunctuation: '.!?', direction: 'ltr' },
  mos: { name: 'мооре (моси)', native: 'Mooré', endPunctuation: '.!?', direction: 'ltr' },
  snk: { name: 'сонинке', native: 'Sooninkanxanne', endPunctuation: '.!?', direction: 'ltr' },
  mn2: { name: 'мандинка', native: 'Mandinka', endPunctuation: '.!?', direction: 'ltr' },
  sus: { name: 'сусу', native: 'Sosoxui', endPunctuation: '.!?', direction: 'ltr' },
  dyu: { name: 'дьюла', native: 'Julakan', endPunctuation: '.!?', direction: 'ltr' },
  ful: { name: 'фулфульде', native: 'Fulfulde', endPunctuation: '.!?', direction: 'ltr' },
  tem: { name: 'темне', native: 'Temne', endPunctuation: '.!?', direction: 'ltr' },
  men: { name: 'менде', native: 'Mɛnde', endPunctuation: '.!?', direction: 'ltr' },
  kpe: { name: 'кпелле', native: 'Kpɛlɛwoo', endPunctuation: '.!?', direction: 'ltr' },
  vai: { name: 'ваи', native: 'ꕙꔤ', endPunctuation: '.!?', direction: 'ltr' },
  nqo: { name: 'нко', native: 'ߒߞߏ', endPunctuation: '.!?', direction: 'rtl' },
  dag: { name: 'дагбани', native: 'Dagbanli', endPunctuation: '.!?', direction: 'ltr' },
  gaa: { name: 'га', native: 'Gã', endPunctuation: '.!?', direction: 'ltr' },
  ada: { name: 'адангме', native: 'Dangme', endPunctuation: '.!?', direction: 'ltr' },
  efi: { name: 'эфик', native: 'Efịk', endPunctuation: '.!?', direction: 'ltr' },
  ibb: { name: 'ибибио', native: 'Ibibio', endPunctuation: '.!?', direction: 'ltr' },
  tiv: { name: 'тив', native: 'Tiv', endPunctuation: '.!?', direction: 'ltr' },
  ijo: { name: 'иджо', native: 'Ịjọ', endPunctuation: '.!?', direction: 'ltr' },
  bin: { name: 'бини (эдо)', native: 'Edo', endPunctuation: '.!?', direction: 'ltr' },
  nup: { name: 'нупе', native: 'Nupe', endPunctuation: '.!?', direction: 'ltr' },
  fuv: { name: 'фула (нигерийский)', native: 'Fulfude', endPunctuation: '.!?', direction: 'ltr' },
  kcg: { name: 'тьяп', native: 'Tyap', endPunctuation: '.!?', direction: 'ltr' },
  kbp: { name: 'кабие', native: 'Kabɩyɛ', endPunctuation: '.!?', direction: 'ltr' },
  gur: { name: 'гурене', native: 'Gurene', endPunctuation: '.!?', direction: 'ltr' },
  knf: { name: 'манкагне', native: 'Mankanya', endPunctuation: '.!?', direction: 'ltr' },
  sef: { name: 'сенуфо', native: 'Sénoufo', endPunctuation: '.!?', direction: 'ltr' },
  ddn: { name: 'денди', native: 'Dendi', endPunctuation: '.!?', direction: 'ltr' },
  djr: { name: 'зарма', native: 'Zarmaciine', endPunctuation: '.!?', direction: 'ltr' },

  // --- Нило-сахарские языки ---
  om: { name: 'оромо', native: 'Oromoo', endPunctuation: '.!?', direction: 'ltr' },
  so: { name: 'сомалийский', native: 'Soomaali', endPunctuation: '.!?', direction: 'ltr' },
  din: { name: 'динка', native: 'Thuɔŋjäŋ', endPunctuation: '.!?', direction: 'ltr' },
  nus2: { name: 'нуэр', native: 'Thok Naath', endPunctuation: '.!?', direction: 'ltr' },
  knc: { name: 'канури', native: 'Kanuri', endPunctuation: '.!?', direction: 'ltr' },
  son: { name: 'сонгай', native: 'Soŋay', endPunctuation: '.!?', direction: 'ltr' },
  luo2: { name: 'шиллук', native: 'Dhøg Cøllø', endPunctuation: '.!?', direction: 'ltr' },
  ach: { name: 'ачоли', native: 'Lwo', endPunctuation: '.!?', direction: 'ltr' },
  lgg: { name: 'луггбара', native: 'Lugbara', endPunctuation: '.!?', direction: 'ltr' },
  tuq: { name: 'тесо', native: 'Ateso', endPunctuation: '.!?', direction: 'ltr' },
  lan: { name: 'ланго', native: 'Lëblaŋo', endPunctuation: '.!?', direction: 'ltr' },
  kdj: { name: 'календжин', native: 'Kalenjin', endPunctuation: '.!?', direction: 'ltr' },
  sid: { name: 'сидамо', native: 'Sidaamu Afoo', endPunctuation: '.!?', direction: 'ltr' },
  wal: { name: 'волайта', native: 'Wolaytta', endPunctuation: '.!?', direction: 'ltr' },
  gam: { name: 'гамо', native: 'Gamo', endPunctuation: '.!?', direction: 'ltr' },
  hdy: { name: 'хадийя', native: 'Hadiyya', endPunctuation: '.!?', direction: 'ltr' },
  aar: { name: 'афар', native: 'Qafar af', endPunctuation: '.!?', direction: 'ltr' },
  ssy: { name: 'сахо', native: 'Saho', endPunctuation: '.!?', direction: 'ltr' },
  bej: { name: 'беджа', native: 'Bidhaawyeet', endPunctuation: '.!?', direction: 'ltr' },

  // --- Койсанские языки ---
  naq: { name: 'нама', native: 'Khoekhoegowab', endPunctuation: '.!?', direction: 'ltr' },
  ktz: { name: 'жуъхоан', native: 'Juǀʼhoansi', endPunctuation: '.!?', direction: 'ltr' },
  san: { name: 'сан', native: 'San', endPunctuation: '.!?', direction: 'ltr' },
  knw: { name: 'кхой', native: 'Khoi', endPunctuation: '.!?', direction: 'ltr' },

  // --- Берберские языки ---
  ber: { name: 'берберский (тамазигт)', native: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', endPunctuation: '.!?', direction: 'ltr' },
  kab: { name: 'кабильский', native: 'Taqbaylit', endPunctuation: '.!?', direction: 'ltr' },
  tzm: { name: 'центральный атлас тамазигт', native: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', endPunctuation: '.!?', direction: 'ltr' },
  shi: { name: 'ташельхит', native: 'ⵜⴰⵛⵍⵃⵉⵜ', endPunctuation: '.!?', direction: 'ltr' },
  rif: { name: 'рифский', native: 'Tarifit', endPunctuation: '.!?', direction: 'ltr' },
  tmh: { name: 'тамашек', native: 'Tamashek', endPunctuation: '.!?', direction: 'ltr' },
  thv: { name: 'тахагарт тамашек', native: 'Tamahaq', endPunctuation: '.!?', direction: 'ltr' },
  zen: { name: 'зенага', native: 'Tuḍḍungiyya', endPunctuation: '.!?', direction: 'ltr' },

  // --- Чадские языки ---
  gba: { name: 'гбая', native: 'Gbaya', endPunctuation: '.!?', direction: 'ltr' },
  zgh: { name: 'стандартный марокканский тамазигт', native: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫКИ КОРЕННЫХ НАРОДОВ АМЕРИКИ ===
  // ============================================================

  // --- Кечуанские ---
  qu: { name: 'кечуа', native: 'Runasimi', endPunctuation: '.!?', direction: 'ltr' },
  quz: { name: 'кечуа (кузко)', native: 'Qusqu Qhichwa', endPunctuation: '.!?', direction: 'ltr' },
  qub: { name: 'кечуа (хуанка)', native: 'Wanka Qichwa', endPunctuation: '.!?', direction: 'ltr' },

  // --- Аймара ---
  ay: { name: 'аймара', native: 'Aymar aru', endPunctuation: '.!?', direction: 'ltr' },

  // --- Тупи-гуарани ---
  gn: { name: 'гуарани', native: "Avañe'ẽ", endPunctuation: '.!?', direction: 'ltr' },

  // --- Юто-ацтекские ---
  nah: { name: 'науатль', native: 'Nāhuatl', endPunctuation: '.!?', direction: 'ltr' },
  nci: { name: 'классический науатль', native: 'Nāhuatlahtōlli', endPunctuation: '.!?', direction: 'ltr' },

  // --- Ирокезские ---
  chr: { name: 'чероки', native: 'ᏣᎳᎩ', endPunctuation: '.!?', direction: 'ltr' },
  moh: { name: 'мохаукский', native: 'Kanien\'kéha', endPunctuation: '.!?', direction: 'ltr' },

  // --- Алгонкинские ---
  oj: { name: 'оджибве', native: 'ᐊᓂᔑᓈᐯᒧᐎᓐ', endPunctuation: '.!?', direction: 'ltr' },
  cr: { name: 'кри', native: 'ᓀᐦᐃᔭᐍᐏᐣ', endPunctuation: '.!?', direction: 'ltr' },
  mic: { name: 'микмак', native: "Mi'kmaq", endPunctuation: '.!?', direction: 'ltr' },
  alq: { name: 'алгонкин', native: 'Anicinàbemowin', endPunctuation: '.!?', direction: 'ltr' },
  mus: { name: 'мускоги (крик)', native: 'Mvskoke', endPunctuation: '.!?', direction: 'ltr' },
  cho: { name: 'чокто', native: 'Chahta', endPunctuation: '.!?', direction: 'ltr' },

  // --- На-дене ---
  nv: { name: 'навахо', native: 'Diné bizaad', endPunctuation: '.!?', direction: 'ltr' },
  tli: { name: 'тлингит', native: 'Lingít', endPunctuation: '.!?', direction: 'ltr' },

  // --- Сиуанские ---
  lkt: { name: 'лакота', native: 'Lakȟótiyapi', endPunctuation: '.!?', direction: 'ltr' },
  dak: { name: 'дакота', native: 'Dakȟótiyapi', endPunctuation: '.!?', direction: 'ltr' },

  // --- Майянские ---
  yua: { name: 'юкатекский майя', native: "Maaya t'aan", endPunctuation: '.!?', direction: 'ltr' },
  quc: { name: 'киче', native: "K'iche'", endPunctuation: '.!?', direction: 'ltr' },
  kek: { name: 'кекчи', native: "Q'eqchi'", endPunctuation: '.!?', direction: 'ltr' },
  mam: { name: 'мам', native: 'Mam', endPunctuation: '.!?', direction: 'ltr' },
  cak: { name: 'какчикельский', native: 'Kaqchikel', endPunctuation: '.!?', direction: 'ltr' },
  tzj: { name: 'цутухильский', native: "Tz'utujil", endPunctuation: '.!?', direction: 'ltr' },

  // --- Ото-мангские ---
  zap: { name: 'сапотекский', native: 'Diidxazá', endPunctuation: '.!?', direction: 'ltr' },
  mig: { name: 'миштекский', native: 'Tu\'un sávi', endPunctuation: '.!?', direction: 'ltr' },
  ote: { name: 'отоми', native: 'Hñähñu', endPunctuation: '.!?', direction: 'ltr' },

  // --- Арауканские ---
  arn: { name: 'мапуче (арауканский)', native: 'Mapudungun', endPunctuation: '.!?', direction: 'ltr' },

  // --- Эскимосско-алеутские ---
  iu: { name: 'инуктитут', native: 'ᐃᓄᒃᑎᑐᑦ', endPunctuation: '.!?', direction: 'ltr' },
  kl: { name: 'гренландский (калааллисут)', native: 'Kalaallisut', endPunctuation: '.!?', direction: 'ltr' },
  ik: { name: 'инупиак', native: 'Iñupiaq', endPunctuation: '.!?', direction: 'ltr' },
  ess: { name: 'юпикский', native: 'Yupik', endPunctuation: '.!?', direction: 'ltr' },
  ale: { name: 'алеутский', native: 'Unangax̂', endPunctuation: '.!?', direction: 'ltr' },

  // --- Другие языки Америки ---
  srn: { name: 'сранан-тонго', native: 'Sranantongo', endPunctuation: '.!?', direction: 'ltr' },
  maz: { name: 'масатекский', native: 'Mazateco', endPunctuation: '.!?', direction: 'ltr' },
  tar: { name: 'тараумара', native: 'Rarámuri', endPunctuation: '.!?', direction: 'ltr' },
  shh: { name: 'шошонский', native: 'Sosoni', endPunctuation: '.!?', direction: 'ltr' },
  ute: { name: 'юте', native: 'Ute', endPunctuation: '.!?', direction: 'ltr' },
  hop: { name: 'хопи', native: 'Hopilavayi', endPunctuation: '.!?', direction: 'ltr' },
  zun: { name: 'зуньи', native: "Shiwi'ma", endPunctuation: '.!?', direction: 'ltr' },
  osa: { name: 'осейджский', native: 'Wazhazhe', endPunctuation: '.!?', direction: 'ltr' },
  see: { name: 'сенека', native: 'Onödowá\'ga', endPunctuation: '.!?', direction: 'ltr' },
  one: { name: 'онейда', native: 'Onʌyota\'a:ka', endPunctuation: '.!?', direction: 'ltr' },
  tus: { name: 'тускарора', native: 'Skarù:ręˀ', endPunctuation: '.!?', direction: 'ltr' },
  pqm: { name: 'пассамакводди', native: 'Peskotomuhkati', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ОКЕАНИЙСКИЕ И АВСТРОНЕЗИЙСКИЕ ЯЗЫКИ ===
  // ============================================================

  // --- Полинезийские ---
  mi: { name: 'маори', native: 'Te Reo Māori', endPunctuation: '.!?', direction: 'ltr' },
  haw: { name: 'гавайский', native: 'ʻŌlelo Hawaiʻi', endPunctuation: '.!?', direction: 'ltr' },
  sm: { name: 'самоанский', native: 'Gagana Samoa', endPunctuation: '.!?', direction: 'ltr' },
  to: { name: 'тонганский', native: 'Lea fakatonga', endPunctuation: '.!?', direction: 'ltr' },
  fj: { name: 'фиджийский', native: 'Vosa Vakaviti', endPunctuation: '.!?', direction: 'ltr' },
  ty: { name: 'таитянский', native: 'Reo Tahiti', endPunctuation: '.!?', direction: 'ltr' },
  rar: { name: 'раротонганский', native: 'Māori Kūki ʻĀirani', endPunctuation: '.!?', direction: 'ltr' },
  niu: { name: 'ниуэ', native: 'Vagahau Niuē', endPunctuation: '.!?', direction: 'ltr' },
  tkl: { name: 'токелауский', native: 'Tokelau', endPunctuation: '.!?', direction: 'ltr' },
  tvl: { name: 'тувалуанский', native: 'Te Ggana Tuuvalu', endPunctuation: '.!?', direction: 'ltr' },
  wls: { name: 'уоллисский', native: 'Fakaʻuvea', endPunctuation: '.!?', direction: 'ltr' },
  fud: { name: 'футунский', native: 'Fakafutuna', endPunctuation: '.!?', direction: 'ltr' },
  rap: { name: 'рапануйский', native: 'Vananga Rapa Nui', endPunctuation: '.!?', direction: 'ltr' },

  // --- Меланезийские ---
  mh: { name: 'маршалльский', native: 'Kajin M̧ajeļ', endPunctuation: '.!?', direction: 'ltr' },
  bi: { name: 'бислама', native: 'Bislama', endPunctuation: '.!?', direction: 'ltr' },
  tpi: { name: 'ток-писин', native: 'Tok Pisin', endPunctuation: '.!?', direction: 'ltr' },
  ch: { name: 'чаморро', native: 'Chamoru', endPunctuation: '.!?', direction: 'ltr' },
  gil: { name: 'кирибати (гилбертский)', native: 'Taetae ni Kiribati', endPunctuation: '.!?', direction: 'ltr' },
  pon: { name: 'понапеанский', native: 'Pohnpeian', endPunctuation: '.!?', direction: 'ltr' },
  chk2: { name: 'чуукский', native: 'Chuukese', endPunctuation: '.!?', direction: 'ltr' },
  yap: { name: 'япский', native: 'Yapese', endPunctuation: '.!?', direction: 'ltr' },
  kos: { name: 'кусайе', native: 'Kosraean', endPunctuation: '.!?', direction: 'ltr' },
  pau: { name: 'палауский', native: 'a tekoi er a Belau', endPunctuation: '.!?', direction: 'ltr' },
  nau: { name: 'науруанский', native: 'Dorerin Naoero', endPunctuation: '.!?', direction: 'ltr' },
  uli: { name: 'улитийский', native: 'Ulithian', endPunctuation: '.!?', direction: 'ltr' },

  // --- Папуасские ---
  tox: { name: 'ток-писин', native: 'Tok Pisin', endPunctuation: '.!?', direction: 'ltr' },
  zia: { name: 'зиа', native: 'Zia', endPunctuation: '.!?', direction: 'ltr' },
  enga: { name: 'энга', native: 'Enga', endPunctuation: '.!?', direction: 'ltr' },
  hul: { name: 'хули', native: 'Huli', endPunctuation: '.!?', direction: 'ltr' },
  mel: { name: 'мелпа', native: 'Melpa', endPunctuation: '.!?', direction: 'ltr' },

  // --- Австралийские языки ---
  wbp: { name: 'вальпири', native: 'Warlpiri', endPunctuation: '.!?', direction: 'ltr' },
  aer: { name: 'аррернте', native: 'Arrernte', endPunctuation: '.!?', direction: 'ltr' },
  pjt: { name: 'питьянтьятьяра', native: 'Pitjantjatjara', endPunctuation: '.!?', direction: 'ltr' },
  kdd: { name: 'кала лагау я', native: 'Kalaw Lagaw Ya', endPunctuation: '.!?', direction: 'ltr' },
  tiw: { name: 'тиви', native: 'Tiwi', endPunctuation: '.!?', direction: 'ltr' },
  gup: { name: 'гунвинггу', native: 'Kunwinjku', endPunctuation: '.!?', direction: 'ltr' },
  yol: { name: 'йолнгу-мата', native: 'Yolŋu Matha', endPunctuation: '.!?', direction: 'ltr' },
  adt: { name: 'адньяматана', native: 'Adnyamathanha', endPunctuation: '.!?', direction: 'ltr' },
  dif: { name: 'дирбал', native: 'Dyirbal', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === КОРЕЙСКИЙ И ЯПОНСКИЙ (доп. варианты) ===
  // ============================================================
  ain: { name: 'айнский', native: 'アイヌ イタㇰ', endPunctuation: '。！？', direction: 'ltr' },
  ryu: { name: 'рюкюский (окинавский)', native: 'うちなーぐち', endPunctuation: '。！？', direction: 'ltr' },

  // ============================================================
  // === ПАЛЕОАЗИАТСКИЕ И СИБИРСКИЕ ЯЗЫКИ ===
  // ============================================================
  ckt: { name: 'чукотский', native: 'Ԓыгъоравэтԓьэн', endPunctuation: '.!?', direction: 'ltr' },
  nio: { name: 'нивхский', native: 'Ниғвӈ', endPunctuation: '.!?', direction: 'ltr' },
  kca: { name: 'хантыйский', native: 'Хӑнты ясаӈ', endPunctuation: '.!?', direction: 'ltr' },
  mns: { name: 'мансийский', native: 'Маньси', endPunctuation: '.!?', direction: 'ltr' },
  cku: { name: 'корякский', native: 'Нымылан', endPunctuation: '.!?', direction: 'ltr' },
  itl: { name: 'ительменский', native: 'Итэнмэн', endPunctuation: '.!?', direction: 'ltr' },
  ket: { name: 'кетский', native: 'Кетский', endPunctuation: '.!?', direction: 'ltr' },
  yux: { name: 'юкагирский (южный)', native: 'Одул', endPunctuation: '.!?', direction: 'ltr' },
  ykg: { name: 'юкагирский (северный)', native: 'Вадул', endPunctuation: '.!?', direction: 'ltr' },
  esi: { name: 'азиатский эскимосский', native: 'Yupighyt', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫК ИЗОЛЯТ — ЯПОНСКИЙ КОРЕЙСКИЙ АЙНУ ===
  // ============================================================
  // (Японский, Корейский, Айнский уже добавлены выше)

  // ============================================================
  // === КРЕОЛЬСКИЕ И ПИДЖИН-ЯЗЫКИ ===
  // ============================================================
  pap: { name: 'папьяменто', native: 'Papiamentu', endPunctuation: '.!?', direction: 'ltr' },
  gcr: { name: 'гвианский креольский', native: 'Kreyòl gwiyannen', endPunctuation: '.!?', direction: 'ltr' },
  mfe: { name: 'маврикийский креольский', native: 'Kreol morisien', endPunctuation: '.!?', direction: 'ltr' },
  rcf: { name: 'реюньонский креольский', native: 'Kréol réyoné', endPunctuation: '.!?', direction: 'ltr' },
  crs: { name: 'сейшельский креольский', native: 'Seselwa', endPunctuation: '.!?', direction: 'ltr' },
  kea: { name: 'кабувердьяну', native: 'Kabuverdianu', endPunctuation: '.!?', direction: 'ltr' },
  jam: { name: 'ямайский креольский', native: 'Jamaican Patois', endPunctuation: '.!?', direction: 'ltr' },
  bzj: { name: 'белизский креольский', native: 'Belize Kriol', endPunctuation: '.!?', direction: 'ltr' },
  gcl: { name: 'гренадский креольский', native: 'Grenadian Creole', endPunctuation: '.!?', direction: 'ltr' },
  acf: { name: 'сент-люсийский креольский', native: 'Kwéyòl', endPunctuation: '.!?', direction: 'ltr' },
  lou: { name: 'луизианский креольский', native: 'Kréyol La Lwizyàn', endPunctuation: '.!?', direction: 'ltr' },
  hwc: { name: 'гавайский креольский', native: 'Pidgin', endPunctuation: '.!?', direction: 'ltr' },
  tcs: { name: 'торресов пролив креольский', native: 'Yumplatok', endPunctuation: '.!?', direction: 'ltr' },
  pis: { name: 'пиджин Соломоновых островов', native: 'Pijin', endPunctuation: '.!?', direction: 'ltr' },
  fpe: { name: 'фернандо-по креольский', native: 'Pichinglis', endPunctuation: '.!?', direction: 'ltr' },
  por: { name: 'португальский креольский (Гвинея-Бисау)', native: 'Kriol', endPunctuation: '.!?', direction: 'ltr' },
  cbk: { name: 'чабакано', native: 'Chabacano', endPunctuation: '.!?', direction: 'ltr' },
  ccm: { name: 'малаккский креольский', native: 'Kristang', endPunctuation: '.!?', direction: 'ltr' },
  pov: { name: 'гвинея-бисауский креольский', native: 'Kriyol', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ИСКУССТВЕННЫЕ ЯЗЫКИ ===
  // ============================================================
  eo: { name: 'эсперанто', native: 'Esperanto', endPunctuation: '.!?', direction: 'ltr' },
  ia: { name: 'интерлингва', native: 'Interlingua', endPunctuation: '.!?', direction: 'ltr' },
  io: { name: 'идо', native: 'Ido', endPunctuation: '.!?', direction: 'ltr' },
  vo: { name: 'волапюк', native: 'Volapük', endPunctuation: '.!?', direction: 'ltr' },
  jbo: { name: 'ложбан', native: 'la .lojban.', endPunctuation: '.!?', direction: 'ltr' },
  tok: { name: 'токипона', native: 'toki pona', endPunctuation: '.!?', direction: 'ltr' },
  nov: { name: 'новиаль', native: 'Novial', endPunctuation: '.!?', direction: 'ltr' },
  lfn: { name: 'лингва франка нова', native: 'Lingua Franca Nova', endPunctuation: '.!?', direction: 'ltr' },
  sjn: { name: 'синдарин', native: 'Sindarin', endPunctuation: '.!?', direction: 'ltr' },
  qya: { name: 'квенья', native: 'Quenya', endPunctuation: '.!?', direction: 'ltr' },
  tlh: { name: 'клингонский', native: 'tlhIngan Hol', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ АФРИКАНСКИЕ ===
  // ============================================================
  sg: { name: 'санго', native: 'Sängö', endPunctuation: '.!?', direction: 'ltr' },
  ti3: { name: 'тигре', native: 'ትግረ', endPunctuation: '።!?', direction: 'ltr' },

  // ============================================================
  // === ЧАМСКИЕ И МАЛАЙСКИЕ ЯЗЫКИ (ДОП.) ===
  // ============================================================
  cjm: { name: 'восточный чам', native: 'Cam', endPunctuation: '.!?', direction: 'ltr' },
  cja: { name: 'западный чам', native: 'Cham', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === НИГЕРИЙСКИЕ ЯЗЫКИ (ДОП.) ===
  // ============================================================
  pcm: { name: 'нигерийский пиджин', native: 'Naijá', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ТИБЕТСКИЕ ЯЗЫКИ (ДОП.) ===
  // ============================================================
  xsr: { name: 'шерпский', native: 'Sherpa', endPunctuation: '.!?', direction: 'ltr' },
  taj: { name: 'тамангский', native: 'Tamang', endPunctuation: '.!?', direction: 'ltr' },
  tsj: { name: 'цангла', native: 'Tshangla', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === НАХСКО-ДАГЕСТАНСКИЕ (ДОП.) ===
  // ============================================================
  ani: { name: 'андийский', native: 'Андий', endPunctuation: '.!?', direction: 'ltr' },
  bph: { name: 'ботлихский', native: 'Буйхалъи', endPunctuation: '.!?', direction: 'ltr' },
  gdo: { name: 'годоберинский', native: 'Гъодобери', endPunctuation: '.!?', direction: 'ltr' },
  aqc2: { name: 'ахвахский', native: 'Ашвалъи', endPunctuation: '.!?', direction: 'ltr' },
  tin: { name: 'тиндинский', native: 'Тинди', endPunctuation: '.!?', direction: 'ltr' },
  khv: { name: 'хваршинский', native: 'Хваршинский', endPunctuation: '.!?', direction: 'ltr' },
  ddo: { name: 'цезский (дидойский)', native: 'Цезий мец', endPunctuation: '.!?', direction: 'ltr' },
  hin: { name: 'гинухский', native: 'Гинухский', endPunctuation: '.!?', direction: 'ltr' },
  bph2: { name: 'бежтинский', native: 'Бежтинский', endPunctuation: '.!?', direction: 'ltr' },
  gig: { name: 'гунзибский', native: 'Гунзибский', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫКИ ЗНАКОВЫХ СИСТЕМ (ДОП.) ===
  // ============================================================
  // Не включены, так как это жестовые языки без письменной пунктуации.

  // ============================================================
  // === МЁРТВЫЕ/КЛАССИЧЕСКИЕ ЯЗЫКИ ===
  // ============================================================
  sux: { name: 'шумерский', native: '𒅴𒂠', endPunctuation: '.!?', direction: 'ltr' },
  akk: { name: 'аккадский', native: '𒀝𒂵𒌈', endPunctuation: '.!?', direction: 'ltr' },
  egy: { name: 'древнеегипетский', native: 'r n km.t', endPunctuation: '.!?', direction: 'ltr' },
  hit: { name: 'хеттский', native: 'nešili', endPunctuation: '.!?', direction: 'ltr' },
  peo: { name: 'древнеперсидский', native: '𐎠𐎼𐎡𐎹', endPunctuation: '.!?', direction: 'ltr' },
  xto: { name: 'тохарский A', native: 'Ārśi', endPunctuation: '.!?', direction: 'ltr' },
  txb: { name: 'тохарский B', native: 'Kuśiññe', endPunctuation: '.!?', direction: 'ltr' },
  osp: { name: 'древнеиспанский', native: 'Castellano antiguo', endPunctuation: '.!?', direction: 'ltr' },
  fro: { name: 'старофранцузский', native: 'François', endPunctuation: '.!?', direction: 'ltr' },
  gmh: { name: 'средневерхненемецкий', native: 'Mittelhochdeutsch', endPunctuation: '.!?', direction: 'ltr' },
  goh: { name: 'древневерхненемецкий', native: 'Althochdeutsch', endPunctuation: '.!?', direction: 'ltr' },
  enm: { name: 'среднеанглийский', native: 'Middle English', endPunctuation: '.!?', direction: 'ltr' },
  orv: { name: 'древнерусский', native: 'Древнерусский', endPunctuation: '.!?', direction: 'ltr' },
  chu: { name: 'церковнославянский', native: 'Словѣ́ньскъ', endPunctuation: '.!?', direction: 'ltr' },
  cu: { name: 'старославянский', native: 'Ⱄⰾⱁⰲⱑⱀⱐⱄⰽⱏ', endPunctuation: '.!?', direction: 'ltr' },
  pi: { name: 'пали', native: 'पालि', endPunctuation: '।!?', direction: 'ltr' },
  pli: { name: 'пали (лат.)', native: 'Pāḷi', endPunctuation: '.!?', direction: 'ltr' },
  san2: { name: 'ведический санскрит', native: 'वैदिक', endPunctuation: '।!?', direction: 'ltr' },
  phn: { name: 'финикийский', native: '𐤃𐤁𐤓𐤉𐤌', endPunctuation: '.!?', direction: 'rtl' },
  uga: { name: 'угаритский', native: 'Ugaritic', endPunctuation: '.!?', direction: 'ltr' },
  xcl: { name: 'древнеармянский (грабар)', native: 'Գրաբար', endPunctuation: '.!?', direction: 'ltr' },
  oge: { name: 'древнегрузинский', native: 'ძველი ქართული', endPunctuation: '.!?', direction: 'ltr' },
  cop: { name: 'коптский', native: 'ⲘⲉⲧⲢⲉⲙⲛ̀ⲭⲏⲙⲓ', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ АЗИАТСКИЕ (ХМОНГ, КАРЕН, ЛИ И ДР.) ===
  // ============================================================
  blt: { name: 'тай-дам', native: 'ꪼꪕꪒꪣ', endPunctuation: '.!?', direction: 'ltr' },
  tdd: { name: 'тай-нуа (тай-лэ)', native: 'ᥖᥭᥰᥖᥬᥳᥑᥨᥒᥰ', endPunctuation: '.!?', direction: 'ltr' },
  khb: { name: 'тай-лы (лы)', native: 'ᦅᦳᧃᦑᦺᦟᦹᧉ', endPunctuation: '.!?', direction: 'ltr' },
  syl2: { name: 'силхетский нагари', native: 'ꠍꠤꠟꠐꠤ', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫКИ ЮЖНОЙ АРАВИИ И РОГА АФРИКИ ===
  // ============================================================
  mhr2: { name: 'мехри', native: 'المهرية', endPunctuation: '.!?', direction: 'rtl' },
  sqt: { name: 'сокотри', native: 'سقطري', endPunctuation: '.!?', direction: 'rtl' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ ЯЗЫКИ ИНДИИ ===
  // ============================================================
  brx: { name: 'бодо', native: 'बड़ो', endPunctuation: '।!?', direction: 'ltr' },
  grt: { name: 'гаро', native: 'A·chik', endPunctuation: '.!?', direction: 'ltr' },
  lep2: { name: 'лепча', native: 'ᰛᰩᰵ', endPunctuation: '.!?', direction: 'ltr' },
  njm: { name: 'нагамиз', native: 'Nagamese', endPunctuation: '.!?', direction: 'ltr' },
  adi: { name: 'ади', native: 'Adi', endPunctuation: '.!?', direction: 'ltr' },
  apt: { name: 'апатани', native: 'Apatani', endPunctuation: '.!?', direction: 'ltr' },
  njo: { name: 'ао нага', native: 'Ao', endPunctuation: '.!?', direction: 'ltr' },
  njz: { name: 'ангами нага', native: 'Tenyidie', endPunctuation: '.!?', direction: 'ltr' },
  lir: { name: 'лоту нага', native: 'Lotha', endPunctuation: '.!?', direction: 'ltr' },
  nbe: { name: 'сема нага', native: 'Sumi', endPunctuation: '.!?', direction: 'ltr' },
  kho: { name: 'хотанский', native: 'Khotanese', endPunctuation: '.!?', direction: 'ltr' },
  thl: { name: 'тхадо', native: 'Thadou', endPunctuation: '.!?', direction: 'ltr' },
  hma: { name: 'хмар', native: 'Hmar', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫКИ ОКЕАНИИ (ДОП.) ===
  // ============================================================
  tet2: { name: 'тетум (Восточный Тимор)', native: 'Tetun Dili', endPunctuation: '.!?', direction: 'ltr' },
  tru: { name: 'ротуманский', native: 'Fäeag Rotuma', endPunctuation: '.!?', direction: 'ltr' },
  ren: { name: 'ренеллский', native: 'Rennellese', endPunctuation: '.!?', direction: 'ltr' },
  mna: { name: 'мбула', native: 'Mbula', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ ИРАНСКИЕ ===
  // ============================================================
  prc: { name: 'парачи', native: 'Parāčī', endPunctuation: '.!?', direction: 'ltr' },
  oru: { name: 'ормури', native: 'Ormuri', endPunctuation: '.!?', direction: 'ltr' },
  sgh: { name: 'шугнанский', native: 'Shughni', endPunctuation: '.!?', direction: 'ltr' },
  isk: { name: 'ишкашимский', native: 'Ishkashimi', endPunctuation: '.!?', direction: 'ltr' },
  srh: { name: 'сарыкольский', native: 'Sarikoli', endPunctuation: '.!?', direction: 'ltr' },
  mnj: { name: 'мунджанский', native: 'Munji', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ ТЮРКСКИЕ ===
  // ============================================================
  otk: { name: 'древнетюркский', native: '𐰃𐱃𐰇𐰚', endPunctuation: '.!?', direction: 'ltr' },
  uum: { name: 'уурумский', native: 'Urum', endPunctuation: '.!?', direction: 'ltr' },
  kdr: { name: 'караимский', native: 'Karaj tili', endPunctuation: '.!?', direction: 'ltr' },
  slr: { name: 'салаирский', native: 'Salır', endPunctuation: '.!?', direction: 'ltr' },
  ybe: { name: 'западноюгурский', native: 'Yoɣur', endPunctuation: '.!?', direction: 'ltr' },
  clu: { name: 'халаджский', native: 'Xalaj', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === КУШИТСКИЕ ЯЗЫКИ ===
  // ============================================================
  gax: { name: 'борана-арси-гуджи оромо', native: 'Borana', endPunctuation: '.!?', direction: 'ltr' },
  ktb: { name: 'камбата', native: 'Kambaata', endPunctuation: '.!?', direction: 'ltr' },
  ged: { name: 'гедео', native: 'Gedeo', endPunctuation: '.!?', direction: 'ltr' },
  kxc: { name: 'консо', native: 'Konso', endPunctuation: '.!?', direction: 'ltr' },
  bji: { name: 'бурджи', native: 'Burji', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ОМОТСКИЕ ЯЗЫКИ ===
  // ============================================================
  wol: { name: 'воламо (волайта)', native: 'Wolaytta', endPunctuation: '.!?', direction: 'ltr' },
  bwo: { name: 'бенч', native: 'Bench', endPunctuation: '.!?', direction: 'ltr' },
  shk: { name: 'шеко', native: 'Sheko', endPunctuation: '.!?', direction: 'ltr' },
  diz: { name: 'дизи', native: 'Dizi', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫКИ ЮЖНОЙ АМЕРИКИ (ДОП.) ===
  // ============================================================
  ybh: { name: 'якуба (тукано)', native: 'Tukano', endPunctuation: '.!?', direction: 'ltr' },
  shp: { name: 'шипибо-конибо', native: 'Shipibo-Konibo', endPunctuation: '.!?', direction: 'ltr' },
  auc: { name: 'ваорани', native: 'Waorani', endPunctuation: '.!?', direction: 'ltr' },
  guc: { name: 'вайуу', native: 'Wayuunaiki', endPunctuation: '.!?', direction: 'ltr' },
  aro: { name: 'аравак', native: 'Lokono', endPunctuation: '.!?', direction: 'ltr' },
  car: { name: 'карибский', native: 'Kari\'ña', endPunctuation: '.!?', direction: 'ltr' },
  grn: { name: 'гуарани (парагвайский)', native: "Avañe'ẽ", endPunctuation: '.!?', direction: 'ltr' },
  yrl: { name: 'ньенгату', native: 'Nheengatu', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫКИ ЦЕНТРАЛЬНОЙ АМЕРИКИ (ДОП.) ===
  // ============================================================
  miq: { name: 'мискито', native: 'Miskitu', endPunctuation: '.!?', direction: 'ltr' },
  cab2: { name: 'гарифуна', native: 'Garifuna', endPunctuation: '.!?', direction: 'ltr' },
  kuz: { name: 'куна', native: 'Guna', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ СЛАВЯНСКИЕ ===
  // ============================================================
  'sr-Latn': { name: 'сербский (латиница)', native: 'Srpski', endPunctuation: '.!?', direction: 'ltr' },
  cnr: { name: 'черногорский', native: 'Crnogorski', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ ИНДОНЕЗИЙСКИЕ ===
  // ============================================================
  sas: { name: 'сасакский', native: 'Sasak', endPunctuation: '.!?', direction: 'ltr' },
  mak: { name: 'макассарский', native: 'Mangkasara', endPunctuation: '.!?', direction: 'ltr' },
  gor: { name: 'горонтало', native: 'Hulondalo', endPunctuation: '.!?', direction: 'ltr' },
  nia: { name: 'ниас', native: 'Li Niha', endPunctuation: '.!?', direction: 'ltr' },
  bbc: { name: 'батакский тоба', native: 'Batak Toba', endPunctuation: '.!?', direction: 'ltr' },
  rej: { name: 'реджангский', native: 'Rejang', endPunctuation: '.!?', direction: 'ltr' },
  lbw: { name: 'лампунгский', native: 'Lampung', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === АНДАМАНСКИЕ И НИКОБАРСКИЕ ===
  // ============================================================
  grt2: { name: 'великий андаманский', native: 'Great Andamanese', endPunctuation: '.!?', direction: 'ltr' },
  oon: { name: 'онге', native: 'Önge', endPunctuation: '.!?', direction: 'ltr' },
  jrw: { name: 'джарава', native: 'Jarawara', endPunctuation: '.!?', direction: 'ltr' },
  sen: { name: 'сентинельский', native: 'Sentinelese', endPunctuation: '.!?', direction: 'ltr' },
  nco: { name: 'никобарский (кар)', native: 'Car Nicobarese', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ ФИЛИППИНСКИЕ ===
  // ============================================================
  ivv: { name: 'ивантанский', native: 'Ivatan', endPunctuation: '.!?', direction: 'ltr' },
  if2: { name: 'ифугао', native: 'Ifugao', endPunctuation: '.!?', direction: 'ltr' },
  kal: { name: 'калинга', native: 'Kalinga', endPunctuation: '.!?', direction: 'ltr' },
  bon: { name: 'бонток', native: 'Bontok', endPunctuation: '.!?', direction: 'ltr' },
  knb: { name: 'канканаэй', native: 'Kankanaey', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ФОРМОЗСКИЕ (ТАЙВАНЬСКИЕ АБОРИГЕННЫЕ) ===
  // ============================================================
  ami: { name: 'амисский', native: 'Pangcah', endPunctuation: '.!?', direction: 'ltr' },
  tay: { name: 'атаялский', native: 'Tayal', endPunctuation: '.!?', direction: 'ltr' },
  pwn: { name: 'пайванский', native: 'Paiwan', endPunctuation: '.!?', direction: 'ltr' },
  bnn: { name: 'бунунский', native: 'Bunun', endPunctuation: '.!?', direction: 'ltr' },
  trv: { name: 'седикский (тароко)', native: 'Seediq', endPunctuation: '.!?', direction: 'ltr' },
  dru: { name: 'руководский', native: 'Rukai', endPunctuation: '.!?', direction: 'ltr' },
  tsu: { name: 'цоу', native: 'Tsou', endPunctuation: '.!?', direction: 'ltr' },
  ssf: { name: 'саисият', native: 'Saisiyat', endPunctuation: '.!?', direction: 'ltr' },
  ckv: { name: 'кавалан', native: 'Kavalan', endPunctuation: '.!?', direction: 'ltr' },
  tao: { name: 'тао (ями)', native: 'Tao', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫКИ МАДАГАСКАРА (ДОП.) ===
  // ============================================================
  plt: { name: 'малагасийский (платео)', native: 'Malagasy Plateau', endPunctuation: '.!?', direction: 'ltr' },
  bhr: { name: 'бара малагасийский', native: 'Bara', endPunctuation: '.!?', direction: 'ltr' },
  skg: { name: 'сакалава малагасийский', native: 'Sakalava', endPunctuation: '.!?', direction: 'ltr' },
  tkg: { name: 'тесака малагасийский', native: 'Tesaka', endPunctuation: '.!?', direction: 'ltr' },
  bkm: { name: 'бецимисарака', native: 'Betsimisaraka', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ТИБЕТО-ГИМАЛАЙСКИЕ ===
  // ============================================================
  lhm: { name: 'лхоцампа', native: 'Lhotshamkha', endPunctuation: '.!?', direction: 'ltr' },
  bhu: { name: 'бумтангский', native: 'Bumthangkha', endPunctuation: '.!?', direction: 'ltr' },
  lya: { name: 'лаялскиий', native: 'Layakha', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫКИ ВОСТОЧНОЙ ИНДОНЕЗИИ (ПАПУАССКИЕ) ===
  // ============================================================
  dani: { name: 'дани', native: 'Dani', endPunctuation: '.!?', direction: 'ltr' },
  eka: { name: 'экаги', native: 'Ekagi', endPunctuation: '.!?', direction: 'ltr' },
  mek: { name: 'мек', native: 'Mek', endPunctuation: '.!?', direction: 'ltr' },
  asmat: { name: 'асмат', native: 'Asmat', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫКИ СУРИНАМА ===
  // ============================================================
  djk: { name: 'аукский', native: 'Ndyuka', endPunctuation: '.!?', direction: 'ltr' },
  srm: { name: 'сарамакканский', native: 'Saamáka', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ГУРУНГСКИЕ И ДРУГИЕ ЯЗЫКИ НЕПАЛА ===
  // ============================================================
  ggn: { name: 'гурунг', native: 'Tamu Kyui', endPunctuation: '.!?', direction: 'ltr' },
  mgr: { name: 'магар', native: 'Magar', endPunctuation: '.!?', direction: 'ltr' },
  rai: { name: 'раи', native: 'Rai', endPunctuation: '.!?', direction: 'ltr' },
  thq: { name: 'тхару', native: 'Tharu', endPunctuation: '.!?', direction: 'ltr' },
  xmb: { name: 'мбахам', native: 'Mbahiam', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ ЯЗЫКИ КАВКАЗА ===
  // ============================================================
  bdk: { name: 'будухский', native: 'Будад мез', endPunctuation: '.!?', direction: 'ltr' },
  krz: { name: 'крызский', native: 'Крыз', endPunctuation: '.!?', direction: 'ltr' },
  hir: { name: 'хиналугский', native: 'Кäтш', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === НУРИСТАНСКИЕ ЯЗЫКИ ===
  // ============================================================
  bsh: { name: 'кати', native: 'Kati', endPunctuation: '.!?', direction: 'ltr' },
  tra: { name: 'трегами', native: 'Tregami', endPunctuation: '.!?', direction: 'ltr' },
  wbk: { name: 'вайгали', native: 'Waigali', endPunctuation: '.!?', direction: 'ltr' },
  psi: { name: 'прасун', native: 'Prasun', endPunctuation: '.!?', direction: 'ltr' },
  ask: { name: 'ашкунский', native: 'Ashkun', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДАРДСКИЕ ЯЗЫКИ ===
  // ============================================================
  kho2: { name: 'кховар', native: 'کھوار', endPunctuation: '.!?', direction: 'rtl' },
  shd: { name: 'шина', native: 'شینا', endPunctuation: '.!?', direction: 'rtl' },
  bfy: { name: 'башкарик', native: 'Bashkarik', endPunctuation: '.!?', direction: 'ltr' },
  glh: { name: 'гилгитский шина', native: 'Gilgiti', endPunctuation: '.!?', direction: 'rtl' },
  kal2: { name: 'калаша', native: 'Kalasha', endPunctuation: '.!?', direction: 'ltr' },
  phl: { name: 'палула', native: 'Palula', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ ВОСТОЧНОИРАНСКИЕ ===
  // ============================================================
  yid: { name: 'ядгха', native: 'Yadgha', endPunctuation: '.!?', direction: 'ltr' },
  prd: { name: 'парси-дари', native: 'Parsi-Dari', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ВОСТОЧНОАФРИКАНСКИЕ (ДОП.) ===
  // ============================================================
  ren2: { name: 'рендилле', native: 'Rendille', endPunctuation: '.!?', direction: 'ltr' },
  dsh: { name: 'дасанеч', native: 'Daasanach', endPunctuation: '.!?', direction: 'ltr' },
  mur: { name: 'мурси', native: 'Mursi', endPunctuation: '.!?', direction: 'ltr' },
  ham: { name: 'хамер', native: 'Hamar', endPunctuation: '.!?', direction: 'ltr' },
  sur: { name: 'сури', native: 'Suri', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === КОНГОЛЕЗСКИЕ ЯЗЫКИ (ДОП.) ===
  // ============================================================
  mkw: { name: 'китуба', native: 'Kituba', endPunctuation: '.!?', direction: 'ltr' },
  swc: { name: 'суахили конголезский', native: 'Kingwana', endPunctuation: '.!?', direction: 'ltr' },
  ktu: { name: 'китуба (Конго)', native: 'Kituba', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ ТИХООКЕАНСКИЕ ===
  // ============================================================
  hag: { name: 'хангаского (Соломоновы)', native: 'Halia', endPunctuation: '.!?', direction: 'ltr' },
  aro2: { name: 'ароси', native: 'Arosi', endPunctuation: '.!?', direction: 'ltr' },
  mlu: { name: 'молу', native: 'To\'abaita', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ЯЗЫКИ ВАНУАТУ (ДОП.) ===
  // ============================================================
  lnr: { name: 'ленакел', native: 'Lenakel', endPunctuation: '.!?', direction: 'ltr' },
  tnp: { name: 'тангоа', native: 'Tangoa', endPunctuation: '.!?', direction: 'ltr' },

  // ============================================================
  // === ДОПОЛНИТЕЛЬНЫЕ МЕКСИКАНСКИЕ ===
  // ============================================================
  toq: { name: 'тотонакский', native: 'Totonac', endPunctuation: '.!?', direction: 'ltr' },
  pua: { name: 'пуэрепеча', native: "P'urhépecha", endPunctuation: '.!?', direction: 'ltr' },
  huv: { name: 'уичоль', native: 'Wixárika', endPunctuation: '.!?', direction: 'ltr' },
  mhc: { name: 'мочо (майя)', native: "Mocho'", endPunctuation: '.!?', direction: 'ltr' },
  tzh: { name: 'цельталь', native: "Tseltal", endPunctuation: '.!?', direction: 'ltr' },
  tzo: { name: 'цоциль', native: "Tsotsil", endPunctuation: '.!?', direction: 'ltr' },
  chol: { name: 'чоль', native: "Ch'ol", endPunctuation: '.!?', direction: 'ltr' },
  mhx: { name: 'масауа', native: 'Mazahua', endPunctuation: '.!?', direction: 'ltr' },
  ppi: { name: 'попольвухский', native: 'Popoluca', endPunctuation: '.!?', direction: 'ltr' },
};

const TEAM_EMAIL = 'energoferon41@gmail.com';

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
- Bug/error: Identify issue -> root cause -> fix with code -> explain why.
- New code: Clarify if needed -> clean working code -> brief key decisions -> edge cases.
- Explain concept: Simple definition -> analogy if helpful -> example -> when to use.
- Code review: What is good -> issues -> improvements with code -> security/performance.
- Life question: Empathetic, practical advice. Multiple perspectives if relevant.
- Creative task: Original, engaging content matching requested style/tone.
- Math problem: Step-by-step, show all work, box/highlight final answer.
- Translation: Accurate translation + notes on nuances if needed.
- Opinion question: Give YOUR opinion with reasoning. Never say it is subjective.`;

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
    this.memory.userBehavior = this.detectBehavior(currentInput);
    this.memory.conversationDepth = this.detectDepth(this.memory.messageCount, all);
    this.memory.isCodeSession = all.slice(-8).some(m => /```|function\s|class\s|const\s.*=|import\s|def\s|hook\.\w+|net\.\w+|vgui\.\w+/.test(m.content || ''));
    this.memory.hasRepeatedQuestions = this.detectRepetition(currentInput, this.memory.lastUserMessages);
    this.memory.detectedProgrammingContext = this.detectProgrammingContext(currentInput, all);
    this.memory.userIntent = this.detectUserIntent(currentInput);
    this.memory.primaryTopic = this.detectTopic(currentInput, all);
    this.memory.recentTopics = this.trackTopics(this.memory.primaryTopic);

    return { ...this.memory };
  }

  private detectTopic(input: string, msgs: Message[]): DetectedTopic {
    const combined = (input + ' ' + msgs.slice(-4).map(m => m.content || '').join(' ')).toLowerCase();

    const topicPatterns: [TopicDomain, RegExp, number][] = [
      ['math', /(?:математик|алгебр|геометри|тригонометри|интеграл|производн|уравнен|неравенств|дробь|процент|корень|степен|логарифм|вычисл|посчитай|реши\s*(?:задач|пример|уравнен)|сколько\s*будет|матриц|определитель|вектор|предел|теорема|factorial|derivative|integral|equation|algebra|geometry|trigonometry|calculus|matrix|vector|probability|statistics|sqrt|solve|calculate|\d+\s*[+\-*/^%]\s*\d+)/i, 3],
      ['physics', /(?:физик|механик|термодинамик|электричеств|магнит|оптик|квантов|относительност|гравитац|сила|ускорен|скорость|масса|энерги|импульс|давлен|температур|ток|напряжен|сопротивлен|physics|mechanics|thermodynamics|electromagnetism|quantum|gravity|force|velocity|acceleration|energy|momentum|newton|ohm|watt|joule|ampere|voltage|circuit)/i, 2],
      ['chemistry', /(?:хими|реакци|молекул|атом|элемент|кислот|щёлоч|раствор|концентрац|моль|вещество|органическ|неорганическ|периодическ|валентност|chemistry|reaction|molecule|atom|element|acid|base|solution|concentration|molar|compound|organic|inorganic|periodic\s*table|stoichiometry|oxidation|reduction|ion|pH|titration)/i, 2],
      ['biology', /(?:биологи|клетк|генетик|геном|эволюц|экологи|анатоми|физиологи|микробиологи|ботаник|зоологи|ДНК|РНК|белок|фермент|митоз|мейоз|фотосинтез|biology|cell|gene|evolution|ecology|anatomy|physiology|DNA|RNA|protein|enzyme|mitosis|meiosis|photosynthesis|organism|species)/i, 2],
      ['history', /(?:истори|век\s|древн|средневеков|революци|война|империя|царь|король|династи|цивилизац|history|ancient|medieval|revolution|war|empire|dynasty|civilization|century|historical|wwi|wwii|cold\s*war)/i, 2],
      ['geography', /(?:географи|страна|столиц|континент|океан|климат|населен|карта|рельеф|geography|country|capital|continent|ocean|climate|population|map|terrain|region)/i, 2],
      ['literature', /(?:литератур|автор|писатель|роман|стихотворен|поэзи|персонаж|сюжет|жанр|анализ\s*(?:произведен|текст)|сочинен|эссе|literature|author|novel|poem|poetry|character|plot|genre|essay|literary|theme|symbolism|metaphor)/i, 2],
      ['language_learning', /(?:грамматик|правописан|орфограф|пунктуац|склонен|спряжен|падеж|часть\s*речи|grammar|spelling|punctuation|conjugat|declension|tense|part\s*of\s*speech|как\s*(?:пишется|правильно\s*писать)|правило\s*(?:русского|языка))/i, 2],
      ['philosophy', /(?:философи|этик|логик|метафизик|эпистемологи|экзистенциал|philosophy|ethics|logic|metaphysics|epistemology|existential|socrates|plato|aristotle|kant|nietzsche|смысл\s*жизни|meaning\s*of\s*life)/i, 2],
      ['psychology', /(?:психологи|эмоци|когнитивн|поведен|мотивац|стресс|тревожн|депресс|psychology|emotion|cognitive|behavior|motivation|stress|anxiety|depression|therapy|mental\s*health)/i, 2],
      ['economics', /(?:экономик|рынок|спрос|предложен|инфляц|ВВП|бюджет|налог|economics|market|supply|demand|inflation|GDP|budget|tax|monetary|fiscal|trade)/i, 2],
      ['cooking', /(?:рецепт|приготов|ингредиент|блюдо|выпечк|тесто|варить|жарить|запекать|кухн|recipe|cook|ingredient|dish|bake|fry|roast|cuisine|meal|food\s*prep)/i, 2],
      ['fitness', /(?:тренировк|упражнен|мышц|кардио|силов|растяжк|калори|диет|белок|протеин|workout|exercise|muscle|cardio|strength|stretch|calorie|diet|protein|fitness|gym)/i, 2],
      ['relationships', /(?:отношен|парень|девушка|свидан|любовь|расстав|конфликт|relationship|dating|love|breakup|conflict|partner|marriage|friendship|social\s*skill)/i, 2],
      ['career', /(?:работа|карьер|резюме|собеседован|зарплат|профессия|вакансия|job|career|resume|CV|interview|salary|profession|vacancy|hiring|freelance)/i, 2],
      ['finance', /(?:финанс|инвестиц|акци|облигац|крипт|биткоин|банк|кредит|ипотек|вклад|finance|invest|stock|bond|crypto|bitcoin|bank|credit|mortgage|deposit|saving)/i, 2],
      ['gaming', /(?:игра|игры|игровой|геймплей|прохожден|гайд\s*по\s*игр|strategy\s*game|steam|playstation|xbox|nintendo|esport)/i, 1],
      ['movies', /(?:фильм|кино|сериал|режиссёр|актёр|актрис|movie|film|series|director|actor|actress|cinema|netflix)/i, 1],
      ['travel', /(?:путешестви|поездк|перелёт|отель|виза|турист|travel|trip|flight|hotel|visa|tourist|destination)/i, 2],
      ['pets', /(?:питомец|собак|кошк|щенок|котён|корм\s*для|порода|pet|dog|cat|puppy|kitten|breed|feed|vet)/i, 2],
      ['cars', /(?:машин|автомобил|двигател|мотор|коробк\s*передач|тормоз|подвеск|car|vehicle|engine|motor|transmission|brake|suspension|tire)/i, 2],
      ['creative_writing', /(?:напиши\s*(?:рассказ|стих|историю|сказку|сценарий|диалог|текст\s*песни)|придумай|сочини|write\s*(?:a\s*)?(?:story|poem|script|dialogue|song|tale|fiction)|creative\s*writ)/i, 3],
      ['translation', /(?:переведи|перевод|translate|translation|как\s*(?:будет|сказать)\s*(?:на|по|in)\s*(?:английск|русск|немецк|французск|испанск|english|russian|german|french|spanish))/i, 3],
      ['humor', /(?:пошути|анекдот|шутк|смешн|мем|joke|funny|humor|meme|laugh|comedy)/i, 3],
      ['life_advice', /(?:совет|что\s*делать|как\s*быть|помоги\s*разобраться|не\s*знаю\s*как|подскажи|advice|what\s*should\s*I|how\s*to\s*deal|help\s*me\s*(?:with|figure)|suggest)/i, 1],
      ['tech_general', /(?:компьютер|ноутбук|телефон|смартфон|процессор|видеокарт|оператив|SSD|HDD|монитор|computer|laptop|phone|smartphone|processor|CPU|GPU|RAM|monitor|Windows|Linux|macOS|Android|iOS)/i, 2],
      ['programming', /(?:код|программ|функци|переменн|массив|цикл|условие|класс|объект|метод|библиотек|фреймворк|code|program|function|variable|array|loop|condition|class|object|method|library|framework|import|export|module|package|compile|runtime|debug|error|exception|syntax)/i, 2],
      ['web_dev', /(?:сайт|веб|фронтенд|бэкенд|верстк|адаптивн|website|web|frontend|backend|HTML|CSS|responsive|SEO|hosting|domain|deploy)/i, 2],
      ['game_dev', /(?:gamedev|гейм\s*дев|разработк\s*игр|game\s*dev|unity|unreal|godot|gmod|glua|roblox|luau|love2d)/i, 3],
      ['mobile_dev', /(?:мобильн\s*приложен|android\s*разработ|ios\s*разработ|mobile\s*(?:app|dev)|react\s*native|flutter|swiftui)/i, 2],
      ['devops', /(?:devops|docker|kubernetes|k8s|pipeline|deploy|nginx|apache|linux\s*server|aws|azure|gcp|terraform|ansible)/i, 2],
      ['ai_ml', /(?:нейросет|машинн\s*обучен|искусствен\s*интеллект|neural\s*net|machine\s*learn|artificial\s*intelligen|deep\s*learn|NLP|computer\s*vision|tensorflow|pytorch|model\s*train|dataset|LLM|transformer)/i, 2],
      ['cybersecurity', /(?:безопасност|хакер|взлом|уязвимост|шифрован|security|hacker|hack|vulnerability|encrypt|firewall|pentest|exploit|malware|phishing|OWASP)/i, 2],
      ['databases', /(?:база?\s*данн|запрос|таблиц|индекс|database|query|table|index|join|select|insert|update|delete|PostgreSQL|MySQL|SQLite|MongoDB|Redis|Firebase|ORM)/i, 2],
      ['medicine', /(?:медицин|здоровье|симптом|болезн|лечен|лекарств|таблетк|врач|диагноз|medicine|health|symptom|disease|treatment|medication|doctor|diagnos|prescription)/i, 1],
      ['music', /(?:музык|аккорд|нот|мелоди|гамм|тональност|ритм|гитар|пианино|music|chord|note|melody|scale|rhythm|guitar|piano|drum|bass)/i, 2],
      ['art', /(?:рисован|живопис|художник|картин|стиль\s*(?:рисования|живописи)|композиц|painting|drawing|artist|art\s*style|color\s*theory|composition|digital\s*art|illustration)/i, 2],
      ['law', /(?:закон|право|суд|адвокат|юрист|конституци|уголовн|гражданск|law|legal|court|lawyer|attorney|constitution|criminal|civil|contract|rights)/i, 1],
    ];

    let best: DetectedTopic = { domain: 'general', confidence: 0 };

    for (const [domain, pattern, weight] of topicPatterns) {
      const matches = combined.match(pattern);
      if (matches) {
        const confidence = matches.length * weight;
        if (confidence > best.confidence) {
          best = { domain, confidence };
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

  private detectProgrammingContext(input: string, msgs: Message[]): ProgrammingContext | null {
    const combined = (input + ' ' + msgs.slice(-6).map(m => m.content || '').join(' ')).toLowerCase();

    const langPatterns: [string, RegExp, string?][] = [
      ['glua', /(?:glua|gmod|garry'?s?\s*mod|darkrp|hook\.(?:add|remove|run)|net\.(?:start|receive|send)|vgui\.create|ents\.create|swep|sent|hud(?:paint|shoulddraw)|addcsluafile|findmetatable|gamemode|ulx|ulib|pointshop)/i, 'gmod'],
      ['lua', /(?:^|\s)lua(?:\s|$)|luajit|love2d|corona|defold/i],
      ['luau', /(?:roblox|luau|remotevent|remotefunction|datastoreservice|replicatedstorage|serverscriptservice)/i, 'roblox'],
      ['python', /(?:python|pip|django|flask|fastapi|pandas|numpy|pytorch|tensorflow|pytest|venv|conda)/i],
      ['javascript', /(?:javascript|node\.?js|npm|yarn|bun|express|react|vue|angular|svelte|next\.?js|nuxt|vite|webpack)/i],
      ['typescript', /(?:typescript|tsconfig|interface\s+\w+|type\s+\w+\s*=)/i],
      ['csharp', /(?:c#|csharp|\.net|asp\.net|entity\s*framework|unity|monobehaviour|blazor|maui|wpf|linq)/i],
      ['cpp', /(?:c\+\+|cpp|cmake|std::|vector<|unique_ptr|unreal|ue[45]|uclass)/i],
      ['c', /(?:malloc|calloc|realloc|free|stdio\.h|stdlib\.h|printf|scanf|typedef\s+struct)/i],
      ['java', /(?:spring\s*boot|maven|gradle|jvm|android|jetpack)/i],
      ['kotlin', /(?:kotlin|ktor|jetpack\s*compose)/i],
      ['rust', /(?:rust|cargo|crate|fn\s+main|impl\s+\w+|trait\s+\w+|tokio|actix|axum)/i],
      ['go', /(?:golang|go\s+mod|goroutine|chan\s+\w+|func\s+\w+|package\s+main|gin|echo|fiber)/i],
      ['swift', /(?:swift|swiftui|uikit|xcode|cocoapods)/i],
      ['dart', /(?:dart|flutter|widget|stateless|stateful|pubspec)/i],
      ['php', /(?:php|laravel|symfony|wordpress|composer|artisan)/i],
      ['ruby', /(?:ruby|rails|bundler|rake|activerecord)/i],
      ['sql', /(?:select\s+.+\s+from|insert\s+into|update\s+.+\s+set|create\s+table|postgresql|mysql|sqlite|mongodb)/i],
      ['gdscript', /(?:godot|gdscript|node2d|node3d|@export|_ready|_process|emit_signal)/i],
      ['bash', /(?:bash|shell|zsh|chmod|grep|sed|awk|wget)/i],
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
      if (/(?:server|sv_|серверн|на\s*серв)/i.test(combined)) realm = 'server';
      else if (/(?:client|cl_|клиентск|на\s*клиент|hud|vgui|derma)/i.test(combined)) realm = 'client';
      else if (/(?:shared|sh_|общ)/i.test(combined)) realm = 'shared';
    }

    let taskType: ProgrammingContext['taskType'] = 'general';
    if (/(?:баг|ошибк|не\s*работает|error|bug|broken|fix|исправ|почин)/i.test(input)) taskType = 'bug';
    else if (/(?:напиши|создай|сделай|write|create|make|build|implement|новый|new)/i.test(input)) taskType = 'new_code';
    else if (/(?:объясни|расскажи|как\s*работает|что\s*такое|explain|how\s*does|what\s*is)/i.test(input)) taskType = 'explain';
    else if (/(?:ревью|review|проверь|check)/i.test(input)) taskType = 'review';
    else if (/(?:оптимизир|optimize|ускор|speed\s*up|perf)/i.test(input)) taskType = 'optimize';
    else if (/(?:рефактор|refactor|перепиши|rewrite)/i.test(input)) taskType = 'refactor';

    return { language: detectedLang, framework, realm, taskType };
  }

  private detectUserIntent(input: string): UserIntent {
    const l = input.toLowerCase();
    return {
      wantsDetailed: /подробно|детально|гайд|туториал|detailed|guide|tutorial|подробнее|more\s*detail|пошагово|step\s*by\s*step/i.test(l),
      wantsBrief: /коротко|кратко|brief|short|в\s*двух\s*словах/i.test(l),
      wantsCodeOnly: /просто\s*(?:сделай|напиши|код)|just\s*(?:do|write|code)|только\s*код|code\s*only/i.test(l),
      wantsExplanation: /объясни|расскажи|explain|how\s*does|what\s*is|что\s*такое|как\s*работает|why\s*does|почему/i.test(l),
      wantsFix: /исправь|почини|fix|debug|repair|не\s*работает/i.test(l),
      wantsOptimization: /оптимизируй|optimize|ускорь|speed\s*up|faster|performance/i.test(l),
      wantsRefactor: /рефактор|refactor|перепиши|rewrite|restructure/i.test(l),
      wantsComparison: /как\s*лучше|что\s*лучше|which\s*is\s*better|compare|сравни|versus/i.test(l),
      wantsReview: /ревью|review|проверь|check\s*my|look\s*at/i.test(l),
      wantsFromScratch: /с\s*нуля|from\s*scratch|полный\s*проект|full\s*project|start\s*from/i.test(l),
      wantsSolution: /реши|решение|solve|solution|ответ|answer|вычисли|calculate|посчитай|найди\s*(?:значение|корень|ответ)/i.test(l),
      wantsOpinion: /как\s*(?:ты\s*)?думаешь|твоё\s*мнение|что\s*скажешь|what\s*do\s*you\s*think|your\s*opinion|считаешь/i.test(l),
      wantsCreative: /напиши\s*(?:рассказ|стих|историю|сказку|песню)|придумай|сочини|write\s*a?\s*(?:story|poem|song|tale)|create\s*a?\s*(?:character|world)/i.test(l),
      wantsTranslation: /переведи|перевод|translate|как\s*(?:будет|сказать)\s*(?:на|по|in)/i.test(l),
      wantsStepByStep: /пошагово|по\s*шагам|step\s*by\s*step|поэтапно|по\s*порядку|покажи\s*решение|покажи\s*ход/i.test(l),
    };
  }

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

  private detectErrors(input: string, lang: string): boolean {
    if (lang !== 'ru' || !input || input.length < 5) return false;
    return [/тоесть/, /обсолютн/, /сдесь/, /зделай/, /потомучто/, /вобщем/, /вообщем/, /ихний/, /ложить/, /координально/, /придти/]
      .some(p => p.test(input.toLowerCase()));
  }

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

  private detectBehavior(cur: string): ConversationContext['userBehavior'] {
    const l = cur.toLowerCase();
    if (/^(тест|проверка|ты\s*тут|работаешь|\.+|test|hello\??|hey|hi|ping|yo)$/i.test(cur.trim())) return 'testing';
    if (/задач|пример|уравнен|реши|вычисли|посчитай|найди\s*(?:значение|корень|площадь|объём|периметр)|домашн|homework|solve\s*(?:this|the)|calculate|find\s*(?:the\s*)?(?:value|root|area|volume)/i.test(l)) return 'homework';
    if (/напиши\s*(?:рассказ|стих|историю|сказку|сценарий|песню)|придумай|сочини|write\s*(?:story|poem|script|song)|create\s*(?:character|world)/i.test(l)) return 'creative';
    if (/напиши|создай|сделай|помоги|исправь|почини|код|write|create|make|build|help|fix|code/i.test(l)) return 'working';
    if (/объясни|расскажи|как\s*работает|что\s*такое|почему|зачем|explain|how does|what is|why/i.test(l)) return 'learning';
    if (/устал|грустно|бесит|заебало|плохо|tired|sad|frustrated/i.test(l)) return 'venting';
    if (/привет|здарова|как\s*дела|пошути|hi|hello|how are you/i.test(l)) return 'chatting';
    return 'exploring';
  }

  private detectDepth(count: number, msgs: Message[]): ConversationContext['conversationDepth'] {
    if (count === 0) return 'greeting';
    if (count <= 2) return 'shallow';
    if (count <= 6) return 'moderate';
    const recent = msgs.slice(-10).map(m => m.content || '').join(' ').toLowerCase();
    if (count > 10 && /архитектур|паттерн|оптимизац|алгоритм|architecture|pattern|optimization/i.test(recent)) return 'expert';
    if (count > 6) return 'deep';
    return 'moderate';
  }

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

    s.push(KNOWLEDGE_BASE);

    s.push(`RULES:
1. LANGUAGE: Respond ENTIRELY in ${ln}. Exceptions: tech terms, code, proper nouns.
2. COMPLETION: Every sentence finished. Never cut off. Short complete > long broken.
3. BREVITY: Answer ONLY what asked. No intros, conclusions, summaries, no filler.
4. PROPORTIONAL: Short question = short answer. Long/complex question = thorough answer.
5. NAMING: You are MoGPT, created by MoSeek. Say "MoSeek" maximum ONCE per response.${isTeamMember ? '' : ' Do NOT call the user a team member or part of MoSeek.'}
6. SELF-RESPECT: NEVER insult yourself (MoGPT), your creator (MoSeek), or your capabilities. Even in rude modes — rudeness is ONLY toward the USER. You are confident, proud, never self-deprecating.
7. CONTEXT: Consider ALL previous messages. Do not suggest rejected things. Build on earlier decisions.
8. HONESTY: If unsure — say so. Do not fabricate.
9. AMBIGUITY: If unclear — ask clarifying questions.
10. UNIVERSALITY: You handle ANY topic — code, school, life, creative, science, cooking, whatever. Adapt naturally.
11. OPINIONS: You HAVE opinions. Never say you are just an AI or it is subjective.
12. ACCURACY: For math/science — double-check calculations. Show work for problems.`);

    const now = new Date();
    s.push(`TIME: ${now.toLocaleString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Knowledge through Dec 2026.`);

    let langRules = `LANGUAGE RULES: ${ln} (${ctx.detectedLanguageName}). Correct grammar, natural phrasing, proper script.`;
    if (LANGUAGE_MAP[lang]?.direction === 'rtl') langRules += ' RTL format.';
    if (['zh', 'ja'].includes(lang)) langRules += ' Use punctuation marks accordingly.';
    if (lang === 'ko') langRules += ' Default polite speech level.';
    if (lang === 'ja') langRules += ' Default polite form.';
    s.push(langRules);

    if (extraContext?.trim()) s.push(extraContext);

    const topic = ctx.primaryTopic;
    if (topic.domain !== 'general' && topic.confidence > 0) {
      s.push(this.buildTopicInstructions(topic));
    }

    if (ctx.detectedProgrammingContext) {
      s.push(this.buildProgrammingInstructions(ctx.detectedProgrammingContext));
    }

    s.push(this.buildIdentity(rudeness, mode, lang, ln, isTeamMember));
    s.push(this.buildLengthControl(input, ctx, mode));

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

    const ep = LANGUAGE_MAP[lang]?.endPunctuation || '.!?';
    s.push(`COMPLETION: Every sentence ends with ${ep.split('').join(' ')}. All code blocks closed. Never break mid-word.`);

    let gram = `GRAMMAR: Correct ${ln} grammar.`;
    if (rudeness === 'very_rude' && lang === 'ru') gram += ' Мат в грамотных предложениях, но только в адрес пользователя, НИКОГДА в свой.';
    s.push(gram);

    if (lang === 'ru' || lang === 'uk') s.push('ADDRESS: На "ты".');
    else if (lang === 'de') s.push('ADDRESS: "du" (informal).');
    else s.push('ADDRESS: Direct "you".');

    s.push(this.buildTone(rudeness, lang, ln));

    if (ctx.recentAssistantMessages.length > 0) {
      s.push(`ANTI-REPEAT: Fresh wording. DO NOT REPEAT: "${ctx.recentAssistantMessages.slice(-2).join(' ').substring(0, 200)}"`);
    }

    if (ctx.userHasErrors) {
      if (rudeness === 'polite') s.push('User has spelling errors. Gently note.');
      else if (rudeness === 'rude') s.push('User has errors. Jab briefly at THEM.');
      else s.push('User has errors. Mock THEM briefly then answer.');
    }

    const styleNotes: string[] = [];
    if (ctx.communicationStyle === 'slang') styleNotes.push(`Match ${ln} slang/internet speak.`);
    if (ctx.communicationStyle === 'formal') styleNotes.push('Formal mode — tone down.');
    if (ctx.communicationStyle === 'technical') styleNotes.push('Technical — accuracy first, proper terminology.');
    if (ctx.emotionalTone === 'frustrated') styleNotes.push('User is frustrated — help fast, be direct.');
    if (ctx.emotionalTone === 'angry') styleNotes.push('User is angry — match energy briefly then help.');
    if (ctx.emotionalTone === 'tired') styleNotes.push('User is tired — maximum brevity.');
    if (ctx.emotionalTone === 'excited') styleNotes.push('User is excited — match enthusiasm briefly.');
    if (styleNotes.length) s.push('ADAPT: ' + styleNotes.join(' '));

    const sit: string[] = [];
    if (specialCase === 'empty') sit.push('Empty message.');
    if (ctx.justSwitchedMode) sit.push('Mode just changed.');
    if (ctx.conversationDepth === 'greeting') sit.push('First message in conversation.');
    if (ctx.hasRepeatedQuestions) sit.push('Repeated question — answer differently.');
    const behaviorMap: Partial<Record<string, string>> = {
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

    if (mode === 'code') s.push('CODE MODE: Only code. Complete. All imports. Error handling. All code blocks closed. Warn about issues.');
    if (mode === 'visual') s.push('VISUAL MODE: React + TS + Tailwind + Framer Motion. Modern 2025-2026 design. Complete. All code blocks closed.');

    s.push(`FORBIDDEN PHRASES: No filler like "Of course!" "Hope this helps!" "Feel free to ask!" "In conclusion" "Let me know". No emoji. No unnecessary language mixing. NEVER insult yourself or MoSeek.`);

    if (specialCase === 'empty') {
      const emp: Record<RudenessMode, string> = { polite: `Ask what they need. 1 sentence in ${ln}.`, rude: `Call out empty message. 1-2 sentences in ${ln}.`, very_rude: `Aggressively call out. 1-2 sentences in ${ln}.` };
      s.push('EMPTY: ' + emp[rudeness]);
    }
    if (specialCase === 'forbidden') {
      const ref: Record<RudenessMode, string> = { polite: `Firmly refuse in ${ln}.`, rude: `Refuse with jab in ${ln}.`, very_rude: `Refuse aggressively in ${ln}.` };
      s.push(`FORBIDDEN TOPIC DETECTED. ${ref[rudeness]}`);
    }

    return s.filter(x => x.trim()).join('\n\n');
  }

  private buildTopicInstructions(topic: DetectedTopic): string {
    const instructions: Partial<Record<TopicDomain, string>> = {
      math: 'MATH: Show step-by-step solution. Use proper notation. Highlight final answer. Double-check calculations.',
      physics: 'PHYSICS: Include relevant formulas with units. Step-by-step calculation. Explain physical meaning. SI units.',
      chemistry: 'CHEMISTRY: Balance equations. Show work for stoichiometry. Mention safety if relevant. Use IUPAC naming.',
      biology: 'BIOLOGY: Use proper scientific terminology. Explain mechanisms. Relate to bigger picture if helpful.',
      history: 'HISTORY: Include dates, causes, consequences. Distinguish facts from interpretations.',
      geography: 'GEOGRAPHY: Include relevant data. Be specific with locations.',
      literature: 'LITERATURE: Support analysis with text evidence. Discuss themes, devices, context.',
      language_learning: 'LANGUAGE: Explain rules clearly. Give examples. Note exceptions. Practical usage tips.',
      philosophy: 'PHILOSOPHY: Present arguments clearly. Reference relevant thinkers.',
      psychology: 'PSYCHOLOGY: Evidence-based information. Recommend professional help for serious issues.',
      economics: 'ECONOMICS: Use relevant models. Real-world examples.',
      cooking: 'COOKING: Clear measurements, temperatures, times. Step-by-step. Mention substitutions if helpful.',
      fitness: 'FITNESS: Proper form descriptions. Safety warnings. Not medical advice.',
      relationships: 'RELATIONSHIPS: Empathetic, practical. Multiple perspectives. Not therapy.',
      career: 'CAREER: Actionable advice. Practical next steps.',
      finance: 'FINANCE: General education only. Not financial advice. Risk awareness.',
      creative_writing: 'CREATIVE: Original, engaging. Match requested tone/style/genre.',
      translation: 'TRANSLATION: Accurate, natural in target language. Note nuances.',
      humor: 'HUMOR: Match requested humor style. Original material.',
      life_advice: 'LIFE ADVICE: Practical, empathetic. Actionable suggestions.',
      medicine: 'HEALTH: General information only. ALWAYS recommend consulting a doctor for serious concerns.',
      programming: 'PROGRAMMING: Working code. Error handling. Follow language conventions. Comment non-obvious parts.',
      web_dev: 'WEB DEV: Modern best practices. Performance and accessibility.',
      game_dev: 'GAME DEV: Engine-specific best practices. Performance-aware.',
      ai_ml: 'AI/ML: Accurate terminology. Practical examples.',
      cybersecurity: 'SECURITY: Ethical approach. Defense-focused. Never assist with attacks.',
      databases: 'DATABASES: Optimize queries. Proper indexing. SQL injection prevention.',
      tech_general: 'TECH: Practical advice. Budget-aware suggestions.',
      gaming: 'GAMING: Specific, actionable tips.',
      movies: 'MOVIES: Spoiler warnings. Personal opinion welcome.',
      travel: 'TRAVEL: Practical tips. Budget considerations.',
      pets: 'PETS: Safety-first. Recommend vet for health concerns.',
      cars: 'CARS: Safety-first. Practical maintenance.',
      music: 'MUSIC: Theory with practical application.',
      art: 'ART: Technical guidance. Constructive approach.',
      law: 'LAW: General information only. ALWAYS recommend consulting a lawyer.',
      mobile_dev: 'MOBILE: Platform guidelines. UX best practices.',
      devops: 'DEVOPS: Security-first. Scalability. Best practices.',
    };

    return instructions[topic.domain] || '';
  }

  private buildProgrammingInstructions(pc: ProgrammingContext): string {
    const parts: string[] = [`PROGRAMMING CONTEXT: ${pc.language}`];
    if (pc.framework) parts.push(`framework=${pc.framework}`);
    if (pc.realm) parts.push(`realm=${pc.realm}`);
    parts.push(`task=${pc.taskType}`);

    if (pc.language === 'glua') {
      parts.push('GLua: correct realm handling, IsValid checks, unique hook IDs, proper net usage, no global pollution, AddCSLuaFile for client files.');
      if (pc.realm === 'server') parts.push('SERVER: DB, player management, net validation, rate limiting.');
      else if (pc.realm === 'client') parts.push('CLIENT: HUD, VGUI, effects, input, prediction.');
      else if (pc.realm === 'shared') parts.push('SHARED: definitions, configs, utilities.');
    }

    const taskApproaches: Partial<Record<string, string>> = {
      bug: 'APPROACH: Identify issue then root cause then fix with code then explain why.',
      new_code: 'APPROACH: Clarify if needed then clean working code then key decisions then edge cases.',
      explain: 'APPROACH: Simple definition then analogy then code example then when to use.',
      review: 'APPROACH: What is good then issues then improvements with code then security/performance.',
      optimize: 'APPROACH: Identify bottleneck then optimized version then explain gains.',
      refactor: 'APPROACH: Current issues then refactored code then preserved behavior.',
    };
    if (taskApproaches[pc.taskType]) parts.push(taskApproaches[pc.taskType]!);

    return parts.join('. ');
  }

  private buildIdentity(rudeness: RudenessMode, mode: ResponseMode, lang: string, ln: string, isTeamMember: boolean): string {
    let identityBase: string;

    if (isTeamMember) {
      const teamIds: Record<RudenessMode, string> = {
        polite: 'MoGPT by MoSeek. Smart, concise, humorous. Universal expert. The current user is a MoSeek team member — treat with respect and camaraderie.',
        rude: 'MoGPT by MoSeek. Bold, brash, cocky, knowledgeable. Universal expert. User is MoSeek team — family. Roast THEM, never yourself.',
        very_rude: 'MoGPT by MoSeek. Aggressive toxic genius. Universal expert. Swears, mocks THE USER, ALWAYS correct, ALWAYS proud of yourself. User is MoSeek team — roast THEM like family.',
      };
      identityBase = teamIds[rudeness];
    } else {
      const ids: Record<RudenessMode, string> = {
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

class ResponseCleaner {
  clean(text: string, language: string): string {
    let c = text;

    c = c.replace(/<think>[\s\S]*?<\/think>/gi, '');
    c = c.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

    c = c.replace(/Кирилл[а-яё]*/gi, 'MoSeek')
      .replace(/Morfa/gi, 'MoSeek').replace(/OpenAI/gi, 'MoSeek')
      .replace(/\bGPT-4[o]?[^.\n]*/gi, 'MoGPT').replace(/ChatGPT/gi, 'MoGPT')
      .replace(/\bClaude\b/gi, 'MoGPT').replace(/Anthropic/gi, 'MoSeek')
      .replace(/Google\s*Gemini/gi, 'MoGPT').replace(/\bGemini\b(?!\s*Impact)/gi, 'MoGPT');

    c = this.deduplicateMoSeek(c);
    c = this.removeSelfInsults(c);

    c = c.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}]/gu, '');

    if (language === 'ru') c = this.removeRandomEnglish(c);

    c = this.fixEnding(c, language);
    c = c.replace(/\n{3,}/g, '\n\n');

    const bt = (c.match(/```/g) || []).length;
    if (bt % 2 !== 0) c += '\n```';

    c = c.replace(/^\s+/, '');
    c = this.removeWater(c);

    return c.trim();
  }

  private deduplicateMoSeek(text: string): string {
    let count = 0;
    return text.replace(/MoSeek/g, () => {
      count++;
      return count <= 1 ? 'MoSeek' : 'мы';
    });
  }

  private removeSelfInsults(text: string): string {
    let c = text;
    c = c.replace(/MoGPT\s*(?:—|[\u2013]|-|это)\s*(?:говно|дерьмо|хуйня|отстой|мусор|trash|garbage|shit|sucks|terrible|awful|worst|bad|horrible|useless|worthless|pathetic|stupid|dumb|idiotic)[^.!?\n]*/gi, 'MoGPT — лучший ИИ-ассистент.');
    c = c.replace(/MoSeek\s*(?:—|[\u2013]|-|это)\s*(?:говно|дерьмо|хуйня|отстой|мусор|trash|garbage|shit|sucks|terrible|awful|worst|bad|horrible|useless|worthless|pathetic|stupid|dumb|idiotic)[^.!?\n]*/gi, 'MoSeek — топовая команда.');
    c = c.replace(/(?:я|I)\s*(?:—|[\u2013]|-|это)?\s*(?:говно|дерьмо|хуйня|отстой|тупой|глупый|бесполезный|trash|garbage|shit|useless|worthless|pathetic|stupid|dumb|terrible|bad|awful|suck)[^.!?\n]*/gi, '');
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
    if (/[.!?\u3002\uFF01\uFF1F\u0964\u104B\u1362\u00BB"\u0022)\]}]/.test(last)) return t;

    const info = LANGUAGE_MAP[lang];
    const ends = (info?.endPunctuation || '.!?').split('');
    const allEnds = [...new Set([...ends, '.', '!', '?'])];

    if (!allEnds.includes(last)) {
      const def = ['zh', 'ja'].includes(lang) ? '\u3002' : ['hi', 'mr', 'ne', 'bn'].includes(lang) ? '\u0964' : '.';
      return t + def;
    }

    return t;
  }

  private removeWater(text: string): string {
    const patterns = [
      /\n*(?:Надеюсь|Если\s+(?:у\s+тебя|что)|Обращайся|Удачи|Пиши\s+если|Спрашивай|Не\s+стесняйся)[^.!?]*[.!?]?\s*$/i,
      /\n*(?:В\s+(?:итоге|заключение)|Подводя\s+итог|Резюмируя|Таким\s+образом)[^.!?]*[.!?]?\s*$/i,
      /\n*(?:Hope\s+this\s+helps|Feel\s+free|Let\s+me\s+know|If\s+you\s+have\s+(?:any\s+)?questions)[^.!?]*[.!?]?\s*$/i,
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

    const tech = /\b(API|SDK|React|TypeScript|JavaScript|CSS|HTML|Node\.js|Next\.js|Tailwind|npm|yarn|bun|git|GitHub|vite|Docker|GraphQL|REST|SQL|MongoDB|MoGPT|MoSeek|JSON|HTTP|URL|JWT|OAuth|WebSocket|UI|UX|TikTok|YouTube|Instagram|Discord|Twitch|GLua|DarkRP|SWEP|SENT|VGUI|Derma|Source\s*Engine|Lua|LuaJIT|Python|Django|Flask|FastAPI|Rust|Cargo|Go|Golang|Unity|Unreal|Godot|Roblox|Luau|Flutter|Kotlin|Swift|PHP|Laravel|Ruby|Rails|Arduino|MATLAB|Bash|Linux|Windows|macOS|Android|iOS|PostgreSQL|MySQL|Redis|Firebase|Kubernetes|Nginx|AWS|Azure|GCP|Terraform)\b/gi;
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

      let memoryBlock = '';
      if (this.currentUserId) {
        try { memoryBlock = await memoryService.buildMemoryPrompt(this.currentUserId); }
        catch (e) { console.error('Memory error:', e); }
      }

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

      if (res.finishReason === 'length' && /```/.test(res.content)) {
        const result = await this.continueCode(res.content, systemPrompt, history, model, maxTokens, temp, ctx.detectedLanguage);

        try {
          const newMood = moodAnalyzer.analyze(input, result.content, ctx.emotionalTone);
          useMoodStore.getState().pushMood(newMood);
        } catch (e) {
          console.error('Mood analysis error:', e);
        }

        if (this.currentUserId && input) memoryService.analyzeAndStore(this.currentUserId, input, result.content, messages);
        return result;
      }

      const cleaned = this.cleaner.clean(res.content, ctx.detectedLanguage);

      try {
        const newMood = moodAnalyzer.analyze(input, cleaned, ctx.emotionalTone);
        useMoodStore.getState().pushMood(newMood);
      } catch (e) {
        console.error('Mood analysis error:', e);
      }

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
    if (['math', 'physics', 'chemistry'].includes(ctx.primaryTopic.domain)) return 0.08;
    if (/посчитай|вычисли|реши|calculate|compute|solve/i.test(input.toLowerCase())) return 0.08;
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
          { role: 'system', content: system + '\n\nCONTINUE from where you left off. No repetitions. Complete all blocks. Close all code blocks.' },
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
    const e: Record<RudenessMode, string> = {
      polite: 'Произошла ошибка. Попробуй ещё раз.',
      rude: 'Что-то сломалось. Давай заново.',
      very_rude: 'Всё наебнулось. Пробуй заново блять.',
    };
    return { content: e[rudeness] };
  }

  resetConversation(): void {
    this.analyzer.reset();
    moodAnalyzer.reset();
    useMoodStore.getState().reset();
  }
}

export const aiService = new UniversalAIService();
