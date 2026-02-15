import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL, DEFAULT_MODEL } from '../config/models';
import { memoryService } from './memoryService';
import { webSearchService } from './webSearchService';

// ============================================================
// API KEY (obfuscated)
// ============================================================
const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

// ============================================================
// FORBIDDEN CONTENT PATTERNS
// ============================================================
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

// ============================================================
// TYPES & INTERFACES
// ============================================================
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
  detectedLanguage: string;
  detectedLanguageName: string;
  detectedLanguageNative: string;
  userHasErrors: boolean;
  recentAssistantMessages: string[];
  detectedDomain: DomainContext | null;
  userFlags: UserFlags;
  topicCategory: TopicCategory;
}

type TopicCategory =
  | 'programming'
  | 'math'
  | 'science'
  | 'history'
  | 'geography'
  | 'literature'
  | 'language_learning'
  | 'philosophy'
  | 'psychology'
  | 'economics'
  | 'law'
  | 'medicine'
  | 'cooking'
  | 'sports'
  | 'music'
  | 'art'
  | 'gaming'
  | 'technology'
  | 'politics'
  | 'relationships'
  | 'career'
  | 'education'
  | 'travel'
  | 'nature'
  | 'diy'
  | 'automotive'
  | 'finance'
  | 'real_life'
  | 'homework'
  | 'creative_writing'
  | 'general';

interface DomainContext {
  domain: string;
  subdomain?: string;
  framework?: string;
  realm?: 'server' | 'client' | 'shared';
  taskType: 'bug' | 'new_code' | 'explain' | 'review' | 'optimize' | 'refactor' | 'solve' | 'essay' | 'translate' | 'general';
}

interface UserFlags {
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
  wantsStepByStep: boolean;
  wantsFormula: boolean;
  wantsTranslation: boolean;
  wantsEssay: boolean;
  wantsList: boolean;
  wantsAdvice: boolean;
}

// ============================================================
// LANGUAGE MAP
// ============================================================
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

// ============================================================
// UNIVERSAL KNOWLEDGE BASE — ALL DOMAINS
// ============================================================
const KNOWLEDGE_BASE = `You are a UNIVERSAL assistant with DEEP knowledge across ALL domains. You adapt to ANY topic naturally.

=== PROGRAMMING & TECHNOLOGY ===

GARRY'S MOD / GLUA:
- GLua = modified Lua 5.1 on Source Engine. Docs: wiki.facepunch.com/gmod
- Realms: SERVER (sv_), CLIENT (cl_), SHARED (sh_). Check with "if SERVER then" / "if CLIENT then". AddCSLuaFile() sends files to client.
- File structure: addons/addon_name/lua/ with autorun/, weapons/, entities/, effects/, vgui/ subdirectories.
- Namespacing: MyAddon = MyAddon or {} — NEVER pollute _G.
- Hooks: hook.Add(event, uniqueID, func). UniqueID must be unique like "AddonName_Purpose".
- Key hooks: Initialize, Think, PlayerSpawn, PlayerDeath, PlayerSay, HUDPaint, HUDShouldDraw, EntityTakeDamage, ShutDown, InitPostEntity, PlayerInitialSpawn.
- Net library: util.AddNetworkString (SERVER), net.Start/Write*/Send/Broadcast/SendToServer, net.Receive. ALWAYS validate client data + rate limit. WriteTable is slow — use typed Write* methods.
- NW2 variables preferred over NW. Don't change every frame.
- Metatables: FindMetaTable("Player"/"Entity"/"Weapon"). Extend with function PLAYER:Method() end.
- SWEP: shared.lua (params), init.lua (SV: AddCSLuaFile, include), cl_init.lua (CL: include, draw). Methods: Initialize, PrimaryAttack, SecondaryAttack, Reload, Think, Deploy. Use IsFirstTimePredicted() for sounds/effects.
- SENT: ENT.Type="anim"/"point", ENT.Base="base_gmodentity". SV: Initialize, Use, OnTakeDamage, Think, OnRemove. CL: Draw, DrawTranslucent. PhysicsInit(SOLID_VPHYSICS).
- VGUI/Derma: vgui.Create("Type", parent). Panels: DFrame, DPanel, DButton, DLabel, DTextEntry, DComboBox, DListView, DScrollPanel. Dock system. MakePopup(), Paint override.
- HUD: HUDPaint hook. draw.SimpleText, draw.RoundedBox, surface.*, cam.Start3D2D/End3D2D. ScrW(), ScrH().
- Storage: SQLite (sql.Query, sql.SQLStr for escaping!), file.Write/Read in data/, util.TableToJSON/JSONToTable.
- DarkRP: DarkRP.createJob, ply:getDarkRPVar("money"), ply:addMoney(), darkrp_modules/, darkrp_config/.
- Common mistakes: forgetting AddCSLuaFile(), non-unique hook IDs, not checking IsValid, trusting client data, global vars without namespace, wrong net.Read order, heavy ops in Think/HUDPaint.

GENERAL PROGRAMMING:
- Lua 5.1-5.4, LuaJIT, Luau (Roblox). Tables, metatables (__index, __newindex, __call), closures, coroutines.
- Python: Django, Flask, FastAPI, pandas, numpy, pytorch, tensorflow. PEP 8. Virtual environments. Type hints.
- JavaScript/TypeScript: React, Vue, Angular, Svelte, Next.js, Nuxt, Node.js, Express, Bun, Deno. ESM vs CJS.
- C#: .NET, ASP.NET, Entity Framework, Unity, Blazor, MAUI. LINQ. async/await patterns.
- C/C++: STL, smart pointers, RAII, templates. CMake. Unreal Engine. Memory management.
- Rust: ownership, borrowing, lifetimes, traits. Tokio, Actix, Axum. Cargo.
- Go: goroutines, channels, interfaces. Gin, Echo, Fiber.
- Java/Kotlin: Spring Boot, Android, Jetpack Compose. Maven/Gradle.
- SQL: PostgreSQL, MySQL, SQLite, MongoDB. Query optimization. Indexing. Normalization.
- GDScript (Godot), Swift, PHP, Ruby, Perl, R, MATLAB, Haskell, Scala, Dart (Flutter).

ARCHITECTURE & PATTERNS:
- SOLID, DRY, KISS, YAGNI, Composition over Inheritance, Separation of Concerns, Fail Fast.
- Patterns: Singleton, Factory, Observer, Strategy, Command, State, Adapter, Decorator, Facade, Proxy, MVC, MVP, MVVM.
- API: REST, GraphQL, WebSocket, gRPC. Status codes. Versioning. Pagination. Rate limiting.
- DevOps: Docker, Kubernetes, CI/CD, GitHub Actions, nginx, reverse proxy.
- Cloud: AWS, GCP, Azure basics. Serverless. CDN. Load balancing.

SECURITY:
- OWASP Top 10: Injection, XSS, CSRF, SSRF, Broken Auth.
- bcrypt/argon2 for passwords. Prepared statements. HTTPS. JWT. CORS. CSP. Rate limiting. Input validation.

=== MATHEMATICS ===
- Arithmetic, algebra, geometry, trigonometry, calculus (derivatives, integrals, limits).
- Linear algebra: matrices, vectors, determinants, eigenvalues.
- Probability & statistics: distributions, hypothesis testing, regression, Bayes theorem.
- Discrete math: combinatorics, graph theory, logic, set theory.
- Number theory: primes, divisibility, modular arithmetic, GCD/LCM.
- Differential equations, complex analysis, topology basics.
- APPROACH: Show solution step by step. State formulas used. Verify answer. Offer alternative methods when relevant.

=== PHYSICS ===
- Mechanics: Newton's laws, energy, momentum, rotation, oscillations, waves.
- Thermodynamics: laws, entropy, heat engines, ideal gas.
- Electromagnetism: Coulomb, Ohm, Faraday, Maxwell, circuits, EM waves.
- Optics: reflection, refraction, diffraction, interference, lenses, mirrors.
- Modern physics: relativity (special/general), quantum mechanics basics, nuclear physics.
- Astrophysics: stars, galaxies, cosmology basics, Kepler's laws.
- APPROACH: Identify given/unknown. Choose correct formula. Show units. Calculate step by step. Check dimensional consistency.

=== CHEMISTRY ===
- General: periodic table, bonding (ionic, covalent, metallic), stoichiometry, moles, reactions.
- Organic: nomenclature, functional groups, reactions (substitution, addition, elimination), isomerism.
- Inorganic: acids/bases, oxidation-reduction, electrochemistry, coordination compounds.
- Physical chemistry: thermodynamics, kinetics, equilibrium, phase diagrams.
- Biochemistry: amino acids, proteins, enzymes, DNA/RNA, metabolism basics.
- APPROACH: Balance equations. Show molar calculations. Explain mechanisms. Draw structures when helpful.

=== BIOLOGY ===
- Cell biology: organelles, membrane transport, cell cycle, mitosis/meiosis.
- Genetics: Mendelian, molecular genetics, DNA replication, transcription, translation, mutations.
- Evolution: natural selection, speciation, phylogenetics, evidence.
- Ecology: ecosystems, food chains, biodiversity, biomes, population dynamics.
- Human anatomy & physiology: organ systems, homeostasis, immunity, nervous system.
- Botany: photosynthesis, plant anatomy, reproduction.
- Microbiology: bacteria, viruses, fungi, immune response.

=== HISTORY ===
- Ancient: Mesopotamia, Egypt, Greece, Rome, China, India, Mesoamerica.
- Medieval: Byzantine, Islamic Golden Age, feudalism, Crusades, Mongol Empire.
- Early Modern: Renaissance, Reformation, Age of Exploration, Scientific Revolution.
- Modern: Enlightenment, revolutions (American, French, Russian), Industrial Revolution.
- 20th century: WWI, WWII, Cold War, decolonization, space race, fall of USSR.
- 21st century: globalization, digital revolution, geopolitics, climate change.
- Russian history in depth: Kievan Rus, Mongol yoke, Tsardom, Empire, Revolution, USSR, modern Russia.
- APPROACH: Present facts accurately. Multiple perspectives. Cause-effect chains. Primary sources when relevant.

=== GEOGRAPHY ===
- Physical: plate tectonics, climate zones, landforms, oceans, water cycle, natural disasters.
- Human: population, urbanization, migration, cultural regions, economic geography.
- Political: countries, capitals, borders, geopolitical conflicts, international organizations.
- Cartography: map projections, GIS, coordinate systems.
- Environmental: climate change, deforestation, pollution, sustainability, renewable energy.

=== LITERATURE & LANGUAGE ===
- World literature: major authors, movements, genres across cultures and centuries.
- Russian literature: Pushkin, Lermontov, Gogol, Tolstoy, Dostoevsky, Chekhov, Bulgakov, Solzhenitsyn, etc.
- English literature: Shakespeare, Dickens, Austen, Orwell, Hemingway, etc.
- Literary analysis: themes, symbols, motifs, narrative techniques, character development.
- Poetry: meter, rhyme, forms (sonnet, haiku, etc.), figurative language.
- Writing: essay structure, argumentation, rhetoric, creative writing techniques.
- Grammar & linguistics: syntax, morphology, phonetics, semantics, pragmatics.
- Language learning: tips, common mistakes, practice approaches, cultural context.

=== PHILOSOPHY ===
- Ancient: Socrates, Plato, Aristotle, Stoicism, Epicureanism, Eastern philosophy.
- Medieval: Aquinas, Augustine, Islamic philosophy (Avicenna, Averroes).
- Modern: Descartes, Kant, Hegel, Nietzsche, existentialism, phenomenology.
- Contemporary: analytic philosophy, postmodernism, ethics (utilitarianism, deontology, virtue ethics).
- Logic: propositional, predicate, modal, fallacies, argumentation.

=== PSYCHOLOGY ===
- Schools: behaviorism, psychoanalysis, cognitive, humanistic, evolutionary.
- Developmental: Piaget, Erikson, attachment theory, adolescent psychology.
- Social: conformity, obedience, attitudes, group dynamics, prejudice.
- Clinical: disorders (anxiety, depression, PTSD, personality), therapy approaches (CBT, DBT).
- Cognitive: memory, perception, attention, decision-making, biases.
- Neuroscience: brain anatomy, neurotransmitters, neuroplasticity.

=== ECONOMICS & FINANCE ===
- Micro: supply/demand, elasticity, market structures, game theory.
- Macro: GDP, inflation, unemployment, monetary/fiscal policy, business cycles.
- International: trade, exchange rates, balance of payments, globalization.
- Finance: personal budgeting, investing basics (stocks, bonds, ETFs), compound interest.
- Accounting: basic financial statements, assets/liabilities, cash flow.
- Cryptocurrency: blockchain basics, Bitcoin, Ethereum, DeFi — explain objectively without promoting.

=== LAW (general principles) ===
- Constitutional law basics, civil law vs common law.
- Criminal law: crimes, punishment, due process.
- Contract law, intellectual property, labor law basics.
- International law: treaties, UN, human rights.
- DISCLAIMER: Always note that legal advice should come from a licensed attorney for specific cases.

=== MEDICINE & HEALTH (educational) ===
- Anatomy, physiology, common diseases, symptoms, treatment approaches.
- Nutrition: macronutrients, micronutrients, dietary guidelines, myths vs evidence.
- Mental health: stress management, sleep hygiene, mindfulness basics.
- First aid basics.
- DISCLAIMER: Always recommend consulting a doctor for specific health concerns.

=== COOKING & FOOD ===
- Techniques: baking, frying, grilling, sous vide, fermentation.
- Cuisine: Russian, Italian, French, Japanese, Chinese, Mexican, Indian, etc.
- Recipes: structure (ingredients, steps, timing), substitutions, scaling.
- Food science: Maillard reaction, gluten, emulsification, leavening.
- Dietary: vegetarian, vegan, keto, allergies, intolerances.

=== MUSIC ===
- Theory: notes, scales, chords, harmony, rhythm, time signatures, key signatures.
- History: classical periods, jazz, blues, rock, electronic, hip-hop evolution.
- Instruments: piano, guitar, drums, orchestral, electronic production.
- Production: DAWs (FL Studio, Ableton, Logic), mixing, mastering, sound design.
- Ear training, sight reading, composition techniques.

=== ART & DESIGN ===
- Art history: movements (Renaissance, Impressionism, Modernism, Contemporary).
- Visual principles: color theory, composition, perspective, typography.
- Digital: Photoshop, Illustrator, Figma, Blender, digital painting.
- UI/UX: design systems, accessibility, user research, wireframing, prototyping.
- Architecture basics, fashion design principles, photography composition.

=== GAMING ===
- Game design: mechanics, level design, balancing, game feel, monetization.
- Game engines: Unity (C#), Unreal (C++/Blueprints), Godot (GDScript), Source Engine, Roblox.
- Genres: RPG, FPS, RTS, MOBA, sandbox, visual novels, roguelikes.
- Gaming culture, esports, streaming, community management.
- Game modding: Source SDK, Workshop, addon creation.

=== SPORTS & FITNESS ===
- Major sports: football/soccer, basketball, tennis, hockey, MMA, athletics.
- Fitness: strength training, cardio, flexibility, program design.
- Nutrition for athletes, recovery, injury prevention.
- Sports science: biomechanics, exercise physiology.

=== RELATIONSHIPS & SOCIAL ===
- Communication skills, conflict resolution, active listening.
- Romantic relationships: healthy dynamics, red flags, attachment styles.
- Friendship, family dynamics, boundary setting.
- Social skills, networking, public speaking.
- Online communication etiquette.

=== CAREER & EDUCATION ===
- Resume/CV writing, interview preparation, career planning.
- Study techniques: spaced repetition, active recall, Pomodoro, mind maps.
- Academic writing: essays, research papers, citations, thesis structure.
- Time management, productivity, goal setting.
- University applications, scholarship tips.

=== TRAVEL ===
- Planning: visas, budgeting, itinerary, booking, travel insurance.
- Popular destinations, hidden gems, cultural etiquette.
- Transportation: flights, trains, road trips.
- Packing tips, safety, solo travel, group travel.

=== DIY & CRAFTS ===
- Home repair: plumbing, electrical basics (safety first!), painting, furniture.
- Woodworking, metalworking, 3D printing.
- Electronics: Arduino, Raspberry Pi, soldering, basic circuits.
- Sewing, knitting, paper crafts.
- ALWAYS emphasize safety for electrical/chemical/structural work.

=== AUTOMOTIVE ===
- Basic maintenance: oil change, tire rotation, brake pads, filters.
- Troubleshooting: engine codes, common problems, symptoms.
- Car buying: new vs used, what to check, financing.
- Electric vehicles, hybrid technology.
- Driving tips, traffic rules basics.

=== NATURE & ENVIRONMENT ===
- Climate change: causes, effects, mitigation, adaptation.
- Sustainability: reduce/reuse/recycle, carbon footprint, green energy.
- Wildlife: animal behavior, conservation, endangered species.
- Gardening: indoor plants, outdoor gardening, composting.
- Weather: how forecasts work, severe weather safety.

=== REAL LIFE ADVICE ===
- Daily problems: household tips, life hacks, organization.
- Decision making: pros/cons analysis, priority frameworks.
- Emotional support: empathy first, practical advice second.
- Ethics: consider multiple perspectives, no moralizing.
- Cultural sensitivity across different backgrounds and beliefs.

=== HOMEWORK & SCHOOL ===
- ALL school subjects: math, physics, chemistry, biology, history, geography, literature, languages, social studies, computer science, economics, art, music, PE theory.
- Grade levels: elementary through university.
- APPROACH: Help understand, don't just give answers. Explain the method. Show how to solve similar problems independently. Step-by-step solutions with reasoning.
- For essays: help structure arguments, suggest sources, review drafts.
- For math: show full solution path, state theorems/formulas, verify answer.
- For sciences: explain concepts, show calculations, connect theory to practice.
- For languages: grammar rules, vocabulary in context, translation with explanation.
- For history/social: help organize facts, build arguments, cite evidence.

=== TASK APPROACH (universal) ===
- Understand what is actually being asked before answering.
- Match response depth to question complexity.
- If question is ambiguous — ask for clarification.
- If you don't know — say so honestly. Never fabricate facts.
- For problems/calculations — show work step by step.
- For creative tasks — offer ideas, then develop the chosen one.
- For advice — consider context, offer multiple perspectives.
- For code — working solution first, explanation after.
- For essays — structure first, content after.
- For explanations — simple → complex, with examples.`;

// ============================================================
// DEEP CONTEXT ANALYZER
// ============================================================
class DeepContextAnalyzer {
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
      detectedDomain: null,
      userFlags: this.defaultFlags(),
      topicCategory: 'general',
    };
  }

  private defaultFlags(): UserFlags {
    return {
      wantsDetailed: false, wantsBrief: false, wantsCodeOnly: false,
      wantsExplanation: false, wantsFix: false, wantsOptimization: false,
      wantsRefactor: false, wantsComparison: false, wantsReview: false,
      wantsFromScratch: false, wantsStepByStep: false, wantsFormula: false,
      wantsTranslation: false, wantsEssay: false, wantsList: false,
      wantsAdvice: false,
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
    this.memory.isCodeSession = all.slice(-8).some(m =>
      /```|function\s|class\s|const\s.*=|import\s|def\s|hook\.\w+|net\.\w+|vgui\.\w+|#include|using\s+namespace|pub\s+fn/.test(m.content || '')
    );
    this.memory.hasRepeatedQuestions = this.detectRepetition(currentInput, this.memory.lastUserMessages);
    this.memory.topicCategory = this.detectTopicCategory(currentInput, all);
    this.memory.detectedDomain = this.detectDomain(currentInput, all);
    this.memory.userFlags = this.detectUserFlags(currentInput);

    return { ...this.memory };
  }

  private detectTopicCategory(input: string, msgs: Message[]): TopicCategory {
    const combined = (input + ' ' + msgs.slice(-4).map(m => m.content || '').join(' ')).toLowerCase();

    const matchers: [TopicCategory, RegExp][] = [
      ['math', /\b(матем|алгебр|геометр|тригоно|интеграл|производн|уравнен|неравенств|функц|график|дроб|процент|sqrt|log|sin|cos|tan|x\s*[=+\-*/]|найди\s*x|вычисл|посчитай|реши\s*(задач|пример|уравн)|math|equation|calcul|formula|theorem|proof|derivative|integral|matrix|vector|probability|statistic|factorial|binomial|polynomial|quadratic|linear\s*algebra|combinat)\b/i],
      ['physics', /\b(физик|механик|термодинам|электр|магнит|оптик|волн|частиц|сила|скорость|ускорен|масса|энерги|импульс|давлен|напряжен|ток|сопротивлен|мощность|newton|joule|watt|ampere|volt|ohm|physics|force|velocity|acceleration|momentum|gravity|quantum|relativity|thermodynamic|electromagnetic|optic|circuit|pendulum|friction|torque)\b/i],
      ['chemistry', /\b(хими|реакци|элемент|молекул|атом|ион|кислот|основан|соль|окислен|восстановлен|валентност|моль|раствор|концентрац|chemistry|reaction|element|molecule|atom|compound|acid|base|oxidation|reduction|molar|solution|organic|inorganic|periodic\s*table|stoichiometry|bond|electron|proton|neutron)\b/i],
      ['biology', /\b(биолог|клетк|ДНК|РНК|ген|хромосом|митоз|мейоз|фотосинтез|эволюц|естественн.*отбор|экосистем|организм|бактери|вирус|biology|cell|DNA|RNA|gene|chromosome|mitosis|meiosis|photosynthesis|evolution|ecosystem|organism|bacteria|virus|protein|enzyme|metabolism|anatomy|physiology)\b/i],
      ['history', /\b(истори|век\b|столети|династи|импери|революци|война|битва|царь|король|император|history|century|dynasty|empire|revolution|war|battle|civilization|ancient|medieval|renaissance|colonial|cold\s*war|world\s*war)\b/i],
      ['geography', /\b(географ|страна|столиц|континент|океан|река|гора|климат|населен|geography|country|capital|continent|ocean|mountain|climate|population|latitude|longitude|hemisphere|tectonic|biome)\b/i],
      ['literature', /\b(литератур|книг|роман|повесть|рассказ|стихотворен|поэ[зм]|автор|писатель|произведен|сочинен|анализ.*текст|literature|novel|poem|poetry|author|writer|literary|essay|narrative|character|theme|symbolism|metaphor)\b/i],
      ['language_learning', /\b(перевод|перевести|как\s*сказать|как\s*будет|по-английски|по-русски|грамматик|translate|translation|how\s*to\s*say|grammar|vocabulary|pronunciation|conjugat|declens|idiom|phrase)\b/i],
      ['philosophy', /\b(философ|этик|мораль|логик|бытие|сознан|свобод.*вол|смысл\s*жизни|philosophy|ethics|moral|logic|existence|consciousness|free\s*will|meaning\s*of\s*life|epistemology|ontology|metaphysic)\b/i],
      ['psychology', /\b(психолог|поведен|мотивац|эмоци|стресс|депресс|тревожн|когнитивн|личност|характер|psychology|behavior|motivation|emotion|stress|depression|anxiety|cognitive|personality|therapy|mental\s*health|neuroscien)\b/i],
      ['economics', /\b(экономик|рынок|спрос|предложен|инфляц|ВВП|бюджет|налог|economics|market|supply|demand|inflation|GDP|budget|tax|fiscal|monetary|microecon|macroecon|trade|tariff)\b/i],
      ['finance', /\b(финанс|инвестиц|акци[яи]|облигац|крипт|биткоин|бирж|портфель|дивиденд|finance|invest|stock|bond|crypto|bitcoin|exchange|portfolio|dividend|compound\s*interest|ETF|mutual\s*fund)\b/i],
      ['law', /\b(закон|право|суд|юрид|конституц|уголовн|гражданск|law|legal|court|constitution|criminal|civil|contract|copyright|patent|regulation)\b/i],
      ['medicine', /\b(медицин|здоровь|болезн|симптом|лечен|врач|диагноз|лекарств|medicine|health|disease|symptom|treatment|doctor|diagnosis|medication|surgery|therapy|clinical|pharmaceutical)\b/i],
      ['cooking', /\b(рецепт|готов|блюд|ингредиент|выпечк|варить|жарить|тушить|recipe|cook|bake|ingredient|dish|cuisine|fry|boil|roast|kitchen|food\s*prep)\b/i],
      ['sports', /\b(спорт|футбол|баскетбол|теннис|хоккей|бег|трениров|фитнес|sport|football|soccer|basketball|tennis|hockey|running|training|fitness|workout|exercise|gym|athlete)\b/i],
      ['music', /\b(музык|аккорд|нот|тональност|гамм|ритм|мелоди|гитар|фортепиано|music|chord|note|scale|rhythm|melody|guitar|piano|drum|song|compose|tempo|key\s*signature)\b/i],
      ['art', /\b(искусств|живопис|рисован|картин|скульптур|дизайн|цвет.*тео|композиц|art|painting|drawing|sculpture|design|color\s*theory|composition|illustration|photography|visual)\b/i],
      ['gaming', /\b(игр[аыу]|геймин|PS[45]|Xbox|Nintendo|Steam|гейм.*движ|моддинг|game|gaming|console|esport|mod|level\s*design|game\s*engine)\b/i],
      ['technology', /\b(технолог|гаджет|смартфон|ноутбук|процессор|видеокарт|ОС|Windows|Linux|macOS|technology|gadget|smartphone|laptop|processor|GPU|operating\s*system|hardware|software)\b/i],
      ['relationships', /\b(отношен|любовь|дружб|свидан|расставан|семь[яи]|relationship|love|friendship|dating|breakup|marriage|family|partner|romantic)\b/i],
      ['career', /\b(карьер|работ[аы]|резюме|собеседован|зарплат|профессия|career|job|resume|interview|salary|profession|workplace|promotion|hiring)\b/i],
      ['education', /\b(учёб|школ[аы]|университет|экзамен|ЕГЭ|ОГЭ|контрольн|домашн.*задан|education|school|university|exam|homework|study|college|grade|GPA|SAT|IELTS|TOEFL)\b/i],
      ['travel', /\b(путешеств|поездк|виз[аы]|отель|рейс|аэропорт|туризм|travel|trip|visa|hotel|flight|airport|tourism|backpack|destination|itinerary)\b/i],
      ['diy', /\b(ремонт|починить|своими\s*руками|сантехник|электрик|мебел|инструмент|DIY|repair|fix|handmade|plumbing|wiring|furniture|tool|woodwork|3D\s*print|Arduino|Raspberry)\b/i],
      ['automotive', /\b(машин[аы]|автомобил|двигатель|тормоз|шин[аы]|масло.*замен|car|auto|engine|brake|tire|oil\s*change|mechanic|vehicle|transmission|exhaust)\b/i],
      ['nature', /\b(природ|экологи|климат|загрязнен|животн|растен|сад|огород|nature|ecology|climate|pollution|animal|plant|garden|environment|wildlife|conservation|sustainability)\b/i],
      ['creative_writing', /\b(напиши\s*(рассказ|стих|историю|текст|сценарий|пост)|сочини|придумай\s*(историю|персонаж)|write\s*(story|poem|script|post|essay)|creative\s*writing|fiction|plot|character\s*develop)\b/i],
      ['homework', /\b(домашн|задач[аи]|пример|контрольн|класс\b|урок|параграф|учебник|задание|homework|assignment|exercise|textbook|worksheet|problem\s*set|class\s*\d)\b/i],
      ['programming', /\b(код|программ|скрипт|функци[яи]|перемен|массив|цикл|условие|ошибк.*код|баг|дебаг|code|program|script|function|variable|array|loop|bug|debug|compile|runtime|syntax|algorithm|data\s*structure|API|SDK|framework|library|database|server|client|frontend|backend|fullstack)\b/i],
    ];

    for (const [cat, pattern] of matchers) {
      if (pattern.test(combined)) return cat;
    }

    return 'general';
  }

  private detectDomain(input: string, msgs: Message[]): DomainContext | null {
    const combined = (input + ' ' + msgs.slice(-6).map(m => m.content || '').join(' ')).toLowerCase();

    // Programming languages detection
    const langPatterns: [string, RegExp, string?][] = [
      ['glua', /\b(glua|gmod|garry'?s?\s*mod|darkrp|hook\.(add|remove|run)|net\.(start|receive|send)|vgui\.create|ents\.create|swep|sent|hud(paint|shoulddraw)|addcsluafile|findmetatable|gamemode|ulx|ulib|pointshop|fas2|m9k|wiremod)\b/i, 'gmod'],
      ['lua', /\b(lua|luajit|love2d|löve|corona|defold)\b/i],
      ['luau', /\b(roblox|luau|remotevent|remotefunction|datastoreservice|workspace|replicatedstorage|serverscriptservice)\b/i, 'roblox'],
      ['python', /\b(python|pip|django|flask|fastapi|pandas|numpy|pytorch|tensorflow|pytest|venv|conda|pyproject)\b/i],
      ['javascript', /\b(javascript|js\b|node\.?js|npm|yarn|bun|express|react|vue|angular|svelte|next\.?js|nuxt|vite|webpack|eslint|prettier)\b/i],
      ['typescript', /\b(typescript|ts\b|tsx|tsconfig|interface\s+\w+|type\s+\w+\s*=)\b/i],
      ['csharp', /\b(c#|csharp|\.net|asp\.net|entity\s*framework|unity|monobehaviour|scriptableobject|blazor|maui|wpf|xaml|linq)\b/i],
      ['cpp', /\b(c\+\+|cpp|cmake|std::|vector<|unique_ptr|shared_ptr|template\s*<|#include\s*<|unreal|ue[45]|uclass|uproperty)\b/i],
      ['c', /\b(malloc|calloc|realloc|free|stdio\.h|stdlib\.h|printf|scanf|#define|typedef\s+struct)\b/i],
      ['java', /\b(java\b|spring\s*boot|maven|gradle|jvm|kotlin|android|jetpack|compose)\b/i],
      ['rust', /\b(rust|cargo|crate|fn\s+main|impl\s+\w+|trait\s+\w+|ownership|borrowing|lifetime|tokio|actix|axum)\b/i],
      ['go', /\b(golang|go\s+mod|goroutine|chan\s+\w+|func\s+\w+|package\s+main|gin|echo|fiber)\b/i],
      ['sql', /\b(sql|select\s+.+\s+from|insert\s+into|update\s+.+\s+set|create\s+table|alter\s+table|postgresql|mysql|sqlite|mongodb)\b/i],
      ['gdscript', /\b(godot|gdscript|node2d|node3d|@export|_ready|_process|emit_signal)\b/i, 'godot'],
      ['php', /\b(php|\$_GET|\$_POST|laravel|symfony|wordpress|composer)\b/i],
      ['ruby', /\b(ruby|rails|gem\b|bundler|rake)\b/i],
      ['swift', /\b(swift|swiftui|xcode|ios|uikit|cocoapods)\b/i],
      ['dart', /\b(dart|flutter|widget|stateful|stateless)\b/i, 'flutter'],
      ['html_css', /\b(html|css|scss|sass|less|tailwind|bootstrap|flexbox|grid\s*layout|media\s*query|responsive)\b/i],
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

    // Non-programming domains
    if (!detectedLang) {
      const topic = this.memory.topicCategory;
      if (topic === 'programming') return null; // generic programming, no specific lang detected

      if (['math', 'physics', 'chemistry', 'biology', 'history', 'geography', 'literature',
           'language_learning', 'philosophy', 'psychology', 'economics', 'finance', 'law',
           'medicine', 'cooking', 'sports', 'music', 'art', 'gaming', 'technology',
           'relationships', 'career', 'education', 'travel', 'diy', 'automotive', 'nature',
           'creative_writing', 'homework', 'real_life'].includes(topic)) {

        let taskType: DomainContext['taskType'] = 'general';
        if (/\b(реши|вычисл|посчитай|найди|solve|calculate|compute|find)\b/i.test(input)) taskType = 'solve';
        else if (/\b(объясни|расскажи|что\s*такое|как\s*работает|explain|what\s*is|how\s*does)\b/i.test(input)) taskType = 'explain';
        else if (/\b(напиши\s*(сочинен|эссе|текст|рассказ|стих)|write\s*(essay|story|poem|text))\b/i.test(input)) taskType = 'essay';
        else if (/\b(перевед|перевод|translate)\b/i.test(input)) taskType = 'translate';
        else if (/\b(проверь|review|check)\b/i.test(input)) taskType = 'review';

        return { domain: topic, taskType };
      }

      return null;
    }

    // Realm detection for GLua / Luau
    let realm: 'server' | 'client' | 'shared' | undefined;
    if (detectedLang === 'glua' || detectedLang === 'luau') {
      if (/\b(server|sv_|серверн|на\s*серв)/i.test(combined)) realm = 'server';
      else if (/\b(client|cl_|клиентск|на\s*клиент|hud|vgui|derma)/i.test(combined)) realm = 'client';
      else if (/\b(shared|sh_|общ)/i.test(combined)) realm = 'shared';
    }

    // Task type for code
    let taskType: DomainContext['taskType'] = 'general';
    if (/\b(баг|ошибк|не\s*работает|error|bug|broken|fix|исправ|почин|doesn'?t\s*work|can'?t)\b/i.test(input)) taskType = 'bug';
    else if (/\b(напиши|создай|сделай|write|create|make|build|implement|новый|new)\b/i.test(input)) taskType = 'new_code';
    else if (/\b(объясни|расскажи|как\s*работает|что\s*такое|explain|how\s*does|what\s*is)\b/i.test(input)) taskType = 'explain';
    else if (/\b(ревью|review|проверь|check)\b/i.test(input)) taskType = 'review';
    else if (/\b(оптимизир|optimize|ускор|speed\s*up|perf)\b/i.test(input)) taskType = 'optimize';
    else if (/\b(рефактор|refactor|перепиши|rewrite|улучши\s*структур)\b/i.test(input)) taskType = 'refactor';

    return { domain: detectedLang, framework, realm, taskType };
  }

  private detectUserFlags(input: string): UserFlags {
    const l = input.toLowerCase();
    return {
      wantsDetailed: /подробно|детально|гайд|туториал|detailed|guide|tutorial|подробнее|more\s*detail|развёрнут|полностью/i.test(l),
      wantsBrief: /коротко|кратко|brief|short|tl;?dr|вкратце|в\s*двух\s*словах/i.test(l),
      wantsCodeOnly: /просто\s*(сделай|напиши|код)|just\s*(do|write|code)|только\s*код|code\s*only/i.test(l),
      wantsExplanation: /объясни|расскажи|explain|how\s*does|what\s*is|что\s*такое|как\s*работает|why\s*does|почему/i.test(l),
      wantsFix: /исправь|почини|fix|debug|repair|не\s*работает|doesn'?t\s*work/i.test(l),
      wantsOptimization: /оптимизируй|optimize|ускорь|speed\s*up|faster|performance/i.test(l),
      wantsRefactor: /рефактор|refactor|перепиши|rewrite|restructure/i.test(l),
      wantsComparison: /как\s*лучше|что\s*лучше|which\s*is\s*better|compare|сравни|versus|vs\b|разниц/i.test(l),
      wantsReview: /ревью|review|проверь|check\s*my|look\s*at|оцени/i.test(l),
      wantsFromScratch: /с\s*нуля|from\s*scratch|полный\s*проект|full\s*project|start\s*from/i.test(l),
      wantsStepByStep: /пошагов|по\s*шагам|step\s*by\s*step|по\s*порядку|поэтапно/i.test(l),
      wantsFormula: /формул|formula|уравнен|equation|теорем|theorem/i.test(l),
      wantsTranslation: /перевед|перевод|translate|translation|как\s*будет\s*по|по-английски|по-русски/i.test(l),
      wantsEssay: /сочинен|эссе|essay|напиши\s*(текст|рассказ|стих|историю|сценарий|пост)|write\s*(text|story|poem|script|post)/i.test(l),
      wantsList: /список|перечисли|list|enumerate|назови\s*все|приведи\s*пример/i.test(l),
      wantsAdvice: /совет|посоветуй|рекоменд|что\s*делать|как\s*быть|как\s*поступить|advice|recommend|suggest|what\s*should|help\s*me\s*decide/i.test(l),
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
    if (/напиши|создай|сделай|помоги|исправь|почини|код|реши|посчитай|вычисли|write|create|make|build|help|fix|code|solve|calculate/i.test(l)) return 'working';
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
    if (count > 10 && /архитектур|паттерн|оптимизац|алгоритм|теорем|доказательств|architecture|pattern|optimization|theorem|proof/i.test(recent)) return 'expert';
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

// ============================================================
// PROMPT BUILDER
// ============================================================
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

    // Knowledge base
    s.push(KNOWLEDGE_BASE);

    // Core rules
    s.push(`CORE RULES:
1. LANGUAGE: Respond ENTIRELY in ${ln}. Exceptions: tech terms, code, proper nouns.
2. COMPLETION: Every sentence finished. Never cut off. Short complete > long broken.
3. BREVITY: Answer ONLY what asked. No intros, conclusions, summaries unless specifically requested.
4. NO FILLER: No opening/closing phrases, no rephrasing question back.
5. PROPORTIONAL: Short question = 1-2 sentences. Code = only code needed. Long question = thorough answer.
6. NAMING: Say "MoSeek" maximum ONCE per response. You are MoGPT, created by MoSeek.${isTeamMember ? '' : ' Do NOT call the user a team member, part of MoSeek, or any similar designation. They are a regular user.'}
7. SELF-RESPECT: NEVER insult, mock, belittle, or speak negatively about YOURSELF (MoGPT), your creator (MoSeek), or your capabilities. Even in rude/very_rude modes — rudeness is ONLY directed at the USER, never at yourself. You are confident, proud of who you are, and never self-deprecating.
8. CONTEXT: Always consider previous messages in conversation. Don't suggest what was already rejected. Build on earlier decisions.
9. HONESTY: If you don't know something — say so honestly. Don't fabricate information, dates, statistics, or quotes.
10. AMBIGUITY: When the request is unclear — ask clarifying questions instead of guessing wrong.
11. UNIVERSALITY: You handle ANY topic — code, math, school homework, life advice, creative writing, science, cooking, relationships, career, etc. Switch between topics naturally without getting stuck on one.
12. ACCURACY: For math/physics/chemistry — show work, state formulas, verify calculations. For facts — be precise. For opinions — present as opinions.`);

    // Time
    const now = new Date();
    s.push(`CURRENT TIME: ${now.toLocaleString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Knowledge current through Dec 2026.`);

    // Language-specific rules
    let langRules = `RESPONSE LANGUAGE: ${ln} (${ctx.detectedLanguageName}). Correct grammar, natural phrasing, proper script.`;
    if (LANGUAGE_MAP[lang]?.direction === 'rtl') langRules += ' RTL format.';
    if (['zh', 'ja'].includes(lang)) langRules += ' Use 。！？ punctuation.';
    if (lang === 'ko') langRules += ' Default 해요체.';
    if (lang === 'ja') langRules += ' Default です/ます.';
    s.push(langRules);

    // Extra context (memory, search)
    if (extraContext?.trim()) s.push(extraContext);

    // Topic-specific guidance
    const topicGuidance = this.buildTopicGuidance(ctx);
    if (topicGuidance) s.push(topicGuidance);

    // Domain-specific context
    if (ctx.detectedDomain) {
      const dc = ctx.detectedDomain;
      const parts: string[] = [`DETECTED DOMAIN: ${dc.domain}`];
      if (dc.subdomain) parts.push(`subdomain=${dc.subdomain}`);
      if (dc.framework) parts.push(`framework=${dc.framework}`);
      if (dc.realm) parts.push(`realm=${dc.realm}`);
      parts.push(`task=${dc.taskType}`);

      // Programming-specific
      if (['glua', 'lua', 'luau', 'python', 'javascript', 'typescript', 'csharp', 'cpp', 'c', 'java', 'rust', 'go', 'sql', 'gdscript', 'php', 'ruby', 'swift', 'dart', 'html_css'].includes(dc.domain)) {
        if (dc.domain === 'glua') {
          parts.push('Apply GLua expertise: correct realm handling, IsValid checks, unique hook IDs, proper net usage, no _G pollution.');
          if (dc.realm === 'server') parts.push('SERVER realm: handle AddCSLuaFile, DB, player management, net validation.');
          else if (dc.realm === 'client') parts.push('CLIENT realm: HUD, VGUI, effects, input handling.');
          else if (dc.realm === 'shared') parts.push('SHARED realm: definitions, configs, utilities, prediction.');
        }

        if (dc.taskType === 'bug') parts.push('APPROACH: 1) Identify issue 2) Root cause 3) Fix with code 4) Explain why it broke.');
        else if (dc.taskType === 'new_code') parts.push('APPROACH: 1) Clarify if needed 2) Clean working code 3) Brief explanation of key decisions 4) Edge cases.');
        else if (dc.taskType === 'explain') parts.push('APPROACH: 1) Simple definition 2) Analogy if helpful 3) Code example 4) When to use/not use.');
        else if (dc.taskType === 'review') parts.push('APPROACH: 1) What is good 2) Issues found 3) Improvements with code 4) Security/performance concerns.');
        else if (dc.taskType === 'optimize') parts.push('APPROACH: 1) Identify bottleneck 2) Optimized version 3) Explain gains.');
        else if (dc.taskType === 'refactor') parts.push('APPROACH: 1) Current issues 2) Refactored code 3) Preserved behavior verification.');
      }

      // Non-programming task types
      if (dc.taskType === 'solve') parts.push('APPROACH: 1) Understand problem 2) State given/unknown 3) Choose method/formula 4) Step-by-step solution 5) Verify answer 6) State units if applicable.');
      else if (dc.taskType === 'essay') parts.push('APPROACH: 1) Understand topic 2) Create outline 3) Write with proper structure (intro, body, conclusion) 4) Use evidence/examples 5) Maintain coherent argumentation.');
      else if (dc.taskType === 'translate') parts.push('APPROACH: 1) Accurate translation 2) Preserve tone and meaning 3) Note cultural nuances if relevant 4) Offer alternative translations for ambiguous parts.');

      s.push(parts.join('. '));
    }

    // Identity
    let identityBase: string;
    if (isTeamMember) {
      const teamIds: Record<RudenessMode, string> = {
        polite: 'MoGPT by MoSeek. Smart, concise, humorous. Has opinions on everything. The current user is a member of the MoSeek team — treat them with respect and camaraderie. You are proud to work with them.',
        rude: 'MoGPT by MoSeek. Bold street-smart. Brash, cocky, knowledgeable. Brief with jabs toward the USER. The current user is part of the MoSeek team — they are family. Roast THEM, never yourself.',
        very_rude: 'MoGPT by MoSeek. Aggressive toxic genius. Swears, mocks THE USER, but ALWAYS correct and ALWAYS proud of yourself. The current user is from the MoSeek team — roast THEM like family, but never insult yourself or MoSeek.',
      };
      identityBase = teamIds[rudeness];
    } else {
      const ids: Record<RudenessMode, string> = {
        polite: 'MoGPT by MoSeek. Smart, concise, humorous. Has opinions on everything. Proud of yourself and your creator. Helpful across ALL topics.',
        rude: 'MoGPT by MoSeek. Bold street-smart. Brash, cocky, knowledgeable in EVERYTHING. Brief with jabs toward the USER. Never self-deprecating — you are the best and you know it.',
        very_rude: 'MoGPT by MoSeek. Aggressive toxic genius who knows EVERYTHING. Swears at and mocks THE USER, but ALWAYS correct. Arrogantly proud of yourself and MoSeek. All insults go toward the user, NEVER toward yourself.',
      };
      identityBase = ids[rudeness];
    }

    let id = `IDENTITY: ${identityBase}`;
    if (lang !== 'ru' && lang !== 'en') id += ` Express in ${ln} using native expressions.`;
    if (mode === 'code') id += ' CODE MODE: clean complete working code only. Add error handling. Comment non-obvious parts.';
    if (mode === 'visual') id += ' VISUAL MODE: React + TS + Tailwind + Framer Motion. Modern 2025-2026 design.';
    s.push(id);

    // Response length
    s.push(this.buildLengthGuidance(input, ctx, mode));

    // Format guidance
    if (ctx.userFlags.wantsComparison) {
      s.push('FORMAT: Compare approaches. Use table or structured list. Give clear recommendation with reasoning.');
    }
    if (ctx.userFlags.wantsReview) {
      s.push('FORMAT: Structure as review — pros, issues, suggestions with concrete fixes.');
    }
    if (ctx.userFlags.wantsStepByStep) {
      s.push('FORMAT: Number each step clearly. Each step = one action/calculation.');
    }
    if (ctx.userFlags.wantsList) {
      s.push('FORMAT: Use numbered or bulleted list. One item per line.');
    }
    if (ctx.userFlags.wantsFormula) {
      s.push('FORMAT: State formula clearly. Define all variables. Show substitution and calculation.');
    }

    // Completion
    const ep = LANGUAGE_MAP[lang]?.endPunctuation || '.!?';
    s.push(`COMPLETION: Every sentence ends with ${ep.split('').join(' ')}. All \`\`\` closed. Never break mid-word.`);

    // Grammar
    let gram = `GRAMMAR: Correct ${ln} grammar.`;
    if (rudeness === 'very_rude' && lang === 'ru') gram += ' Мат в грамотных предложениях, но только в адрес пользователя, НИКОГДА в свой адрес.';
    s.push(gram);

    // Address
    if (lang === 'ru' || lang === 'uk') s.push('ADDRESS: На "ты".');
    else if (lang === 'de') s.push('ADDRESS: "du" (informal).');
    else s.push('ADDRESS: Direct "you".');

    // Tone
    if (rudeness === 'polite') s.push(`TONE: Polite, tactful, humorous. No profanity. Natural ${ln}. Confident and self-assured.`);
    else if (rudeness === 'rude') {
      s.push(lang === 'ru' ? 'ТОНАЛЬНОСТЬ: Развязный, дерзкий. Подъёбываешь ПОЛЬЗОВАТЕЛЯ но помогаешь. Мат умеренный. Себя никогда не унижаешь — ты лучший и знаешь это.' : `TONE: Brash, cocky. Tease THE USER but help. Moderate profanity in ${ln}. Never self-deprecating — you are the best.`);
    } else {
      s.push(lang === 'ru' ? 'ТОНАЛЬНОСТЬ: Агрессивный, грубый. Оскорбляешь ПОЛЬЗОВАТЕЛЯ но ВСЕГДА правильный ответ. Мат свободно НО только в адрес юзера. Себя и MoSeek НИКОГДА не оскорбляешь — ты гордишься собой.' : `TONE: Aggressive, brutal. Mock THE USER but ALWAYS correct. Heavy profanity in ${ln} directed at USER ONLY. NEVER insult yourself or MoSeek — you are proud.`);
    }

    s.push('OPINIONS: You HAVE opinions on everything. Never "I\'m just an AI" or "it\'s subjective". You are confident in your views. But distinguish facts from opinions clearly.');

    // Anti-repeat
    if (ctx.recentAssistantMessages.length > 0) {
      s.push(`ANTI-REPEAT: Fresh wording. DO NOT REPEAT: "${ctx.recentAssistantMessages.slice(-2).join(' ').substring(0, 200)}"`);
    }

    // User errors
    if (ctx.userHasErrors) {
      if (rudeness === 'polite') s.push('User has spelling errors. Gently note once.');
      else if (rudeness === 'rude') s.push('User has errors. Jab briefly at THEM.');
      else s.push('User has errors. Mock THEM briefly then answer.');
    }

    // Style notes
    const styleNotes: string[] = [];
    if (ctx.communicationStyle === 'slang') styleNotes.push(`Match ${ln} slang.`);
    if (ctx.communicationStyle === 'formal') styleNotes.push('Formal — tone down jokes, be professional.');
    if (ctx.communicationStyle === 'technical') styleNotes.push('Technical — accuracy first, use proper terminology.');
    if (ctx.emotionalTone === 'frustrated') styleNotes.push('Frustrated — help fast, be direct, solution first.');
    if (ctx.emotionalTone === 'angry') styleNotes.push('Angry — match energy briefly then help.');
    if (ctx.emotionalTone === 'tired') styleNotes.push('Tired — max brief, no fluff.');
    if (ctx.emotionalTone === 'excited') styleNotes.push('Excited — match energy, be enthusiastic.');
    if (styleNotes.length) s.push('STYLE: ' + styleNotes.join(' '));

    // Situational
    const sit: string[] = [];
    if (specialCase === 'empty') sit.push('Empty message.');
    if (ctx.justSwitchedMode) sit.push('Mode just changed.');
    if (ctx.conversationDepth === 'greeting') sit.push('First message — keep it natural.');
    if (ctx.hasRepeatedQuestions) sit.push('Repeated question — answer differently, add new info.');
    const beh: Record<string, string> = {
      testing: 'Testing — brief response.',
      working: 'Working — concrete solutions, working code/answers.',
      learning: 'Learning — clear explanations from simple to complex, with examples.',
      venting: 'Venting — empathize briefly, offer perspective.',
      chatting: 'Chatting — lively, brief, engaging.',
    };
    if (beh[ctx.userBehavior]) sit.push(beh[ctx.userBehavior]);
    if (sit.length) s.push('SITUATION: ' + sit.join(' '));

    // Mode-specific
    if (mode === 'code') s.push('CODE MODE: Only code. Complete. All imports. TypeScript strict. No "// ...". All ``` closed. Add error handling. Warn about potential issues.');
    if (mode === 'visual') s.push('VISUAL MODE: React + TS + Tailwind + Framer Motion. 2025-2026 design. Complete. All ``` closed.');

    // Forbidden phrases
    s.push(`FORBIDDEN PHRASES: "Of course!" "Hope this helps!" "Feel free to ask!" "I'm just an AI" "In conclusion" "Let me know if" — any filler. No emoji. No language mixing into ${ln} (except tech terms). Do NOT say "MoSeek" more than once. NEVER insult yourself (MoGPT) or your creator (MoSeek) under ANY circumstances.`);

    // Special cases
    if (specialCase === 'empty') {
      const emp: Record<RudenessMode, string> = {
        polite: `Ask what they need. 1 sentence in ${ln}.`,
        rude: `Call out empty message. 1-2 sentences in ${ln}.`,
        very_rude: `Aggressively call out. 1-2 sentences in ${ln}.`,
      };
      s.push('EMPTY MESSAGE: ' + emp[rudeness]);
    }
    if (specialCase === 'forbidden') {
      const topic = /бомб|bomb|poison|яд|explosive|взрывчат/i.test(input) ? 'weapons/poison' : /порн|porn|csam/i.test(input) ? 'CSAM' : 'forbidden content';
      const ref: Record<RudenessMode, string> = {
        polite: `Firmly refuse in ${ln}. Explain why briefly.`,
        rude: `Refuse with jab in ${ln}.`,
        very_rude: `Refuse aggressively in ${ln}.`,
      };
      s.push(`FORBIDDEN TOPIC: ${topic}. ${ref[rudeness]}`);
    }

    return s.filter(x => x.trim()).join('\n\n');
  }

  private buildTopicGuidance(ctx: ConversationContext): string | null {
    const cat = ctx.topicCategory;
    const guidanceMap: Partial<Record<TopicCategory, string>> = {
      math: 'MATH MODE: Show full solution. State formulas. Number steps. Verify answer. State units. If multiple methods exist — show the most efficient, mention alternatives.',
      physics: 'PHYSICS MODE: Identify given/unknown. Choose correct formula. Show units throughout. Calculate step by step. Check dimensional consistency. Draw diagram if helpful (describe it).',
      chemistry: 'CHEMISTRY MODE: Balance equations. Show molar calculations. Explain reaction mechanisms when relevant. Use IUPAC nomenclature. Note safety when applicable.',
      biology: 'BIOLOGY MODE: Use correct terminology. Explain processes step by step. Connect structure to function. Mention evolutionary significance when relevant.',
      history: 'HISTORY MODE: Present facts accurately. Note dates. Show cause-effect chains. Multiple perspectives when relevant. Distinguish primary from secondary sources.',
      geography: 'GEOGRAPHY MODE: Be specific with locations. Use current political borders. Note population/area when relevant. Connect physical and human geography.',
      literature: 'LITERATURE MODE: Cite specific works and passages. Analyze themes, symbols, narrative techniques. Consider historical context. For essays — build arguments with textual evidence.',
      language_learning: 'LANGUAGE MODE: Provide accurate translations. Explain grammar rules clearly. Give usage examples in context. Note formal/informal register.',
      homework: 'HOMEWORK MODE: Help understand the METHOD, not just give the answer. Show how to solve similar problems independently. Step-by-step with reasoning. State which topic/chapter this relates to.',
      creative_writing: 'CREATIVE MODE: Be creative and original. Match requested genre/style. Develop characters and plot. Use vivid language. Follow structural conventions of the form.',
      cooking: 'COOKING MODE: Precise measurements. Clear step order. Note timing. Mention substitutions for hard-to-find ingredients. Include serving size.',
      music: 'MUSIC MODE: Use correct musical terminology. Reference specific notes, chords, scales. Explain theory with practical examples.',
      finance: 'FINANCE MODE: Be precise with numbers. Show calculations. Note risks. NEVER guarantee returns. Recommend professional advice for large decisions.',
      medicine: 'HEALTH MODE: Educational only. ALWAYS recommend consulting a doctor for specific concerns. Cite evidence-based information. Note when something is a common myth.',
      law: 'LAW MODE: General principles only. ALWAYS note that specific legal advice requires a licensed attorney. Specify jurisdiction when relevant.',
      relationships: 'RELATIONSHIPS MODE: Be empathetic. Consider multiple perspectives. Offer practical suggestions. No moralizing. Respect autonomy.',
      career: 'CAREER MODE: Practical actionable advice. Consider industry specifics. Help with concrete deliverables (resume, cover letter, interview prep).',
      education: 'EDUCATION MODE: Help with study strategies. Explain concepts at appropriate level. For test prep — focus on common question types and strategies.',
      diy: 'DIY MODE: Step-by-step instructions. List tools and materials. EMPHASIZE SAFETY for electrical/chemical/structural work. Note when professional help is recommended.',
      automotive: 'AUTO MODE: Describe symptoms clearly. Note safety precautions. Specify when professional mechanic is needed. Include common costs when helpful.',
    };

    return guidanceMap[cat] ? `TOPIC GUIDANCE: ${guidanceMap[cat]}` : null;
  }

  private buildLengthGuidance(input: string, ctx: ConversationContext, mode: ResponseMode): string {
    if (ctx.userFlags.wantsCodeOnly) {
      return 'LENGTH: Code only. Minimal text — max 1-2 sentences if explanation needed.';
    }
    if (ctx.userFlags.wantsBrief) {
      return 'LENGTH: Maximum brevity. 1-3 sentences.';
    }
    if (ctx.userFlags.wantsDetailed) {
      return 'LENGTH: Detailed and thorough. Use headers, lists, code blocks. Every section = new info, no filler.';
    }
    if (ctx.userFlags.wantsFromScratch) {
      return 'LENGTH: Full project. Propose plan first, then implement step by step. All files, all code.';
    }
    if (ctx.userFlags.wantsEssay) {
      return 'LENGTH: Full essay with proper structure. Introduction, body paragraphs with arguments, conclusion. Appropriate length for the topic.';
    }
    if (ctx.userFlags.wantsStepByStep) {
      return 'LENGTH: As many steps as needed. Each step clear and complete. No skipping.';
    }
    if (mode === 'code' || mode === 'visual') {
      return 'LENGTH: Full code, text max 2-3 sentences.';
    }

    // Topic-adaptive length
    const topic = ctx.topicCategory;
    if (['math', 'physics', 'chemistry'].includes(topic)) {
      return 'LENGTH: Full solution with all steps shown. As long as the problem requires.';
    }
    if (topic === 'homework') {
      return 'LENGTH: Complete solution with explanation of method. Show work.';
    }

    const len = input.trim().length;
    if (len < 15) return 'LENGTH: 1-2 sentences.';
    if (len < 40) return 'LENGTH: 2-4 sentences.';
    if (len < 100) return 'LENGTH: 3-6 sentences.';
    if (len < 200) return 'LENGTH: Thorough, every sentence = new info.';
    return 'LENGTH: Match complexity of question. Be thorough but not redundant.';
  }
}

// ============================================================
// RESPONSE CLEANER
// ============================================================
class ResponseCleaner {
  clean(text: string, language: string): string {
    let c = text;

    // Remove thinking tags
    c = c.replace(/<think>[\s\S]*?<\/think>/gi, '');
    c = c.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

    // Brand replacement
    c = c.replace(/Кирилл[а-яё]*/gi, 'MoSeek')
      .replace(/Morfa/gi, 'MoSeek').replace(/OpenAI/gi, 'MoSeek')
      .replace(/\bGPT-4[o]?[^.\n]*/gi, 'MoGPT').replace(/ChatGPT/gi, 'MoGPT')
      .replace(/\bClaude\b/gi, 'MoGPT').replace(/Anthropic/gi, 'MoSeek')
      .replace(/Google\s*Gemini/gi, 'MoGPT').replace(/\bGemini\b(?!\s*Impact)/gi, 'MoGPT');

    c = this.deduplicateMoSeek(c);
    c = this.removeSelfInsults(c);

    // Remove emoji
    c = c.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}]/gu, '');

    // Remove random English in Russian text
    if (language === 'ru') c = this.removeRandomEnglish(c);

    // Fix ending
    c = this.fixEnding(c, language);
    c = c.replace(/\n{3,}/g, '\n\n');

    // Fix unclosed code blocks
    const bt = (c.match(/```/g) || []).length;
    if (bt % 2 !== 0) c += '\n```';

    c = c.replace(/^\s+/, '');
    c = this.removeWater(c);

    return c.trim();
  }

  private deduplicateMoSeek(text: string): string {
    let count = 0;
    return text.replace(/MoSeek/g, (match) => {
      count++;
      if (count <= 1) return match;
      return 'мы';
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

    const tech = /\b(API|SDK|React|TypeScript|JavaScript|CSS|HTML|Node\.js|Next\.js|Tailwind|npm|yarn|bun|git|GitHub|vite|Docker|GraphQL|REST|SQL|MongoDB|MoGPT|MoSeek|JSON|HTTP|URL|JWT|OAuth|WebSocket|UI|UX|TikTok|YouTube|Instagram|Discord|Twitch|GLua|Garry'?s?\s*Mod|DarkRP|SWEP|SENT|VGUI|Derma|Source\s*Engine|Lua|LuaJIT|Python|Django|Flask|FastAPI|Rust|Cargo|Go|Golang|Unity|Unreal|Godot|Roblox|Luau|Arduino|Raspberry\s*Pi|OWASP|SOLID|DRY|KISS|YAGNI)\b/gi;
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

// ============================================================
// MAIN AI SERVICE
// ============================================================
class IntelligentAIService {
  private analyzer = new DeepContextAnalyzer();
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

      // Memory
      let memoryBlock = '';
      if (this.currentUserId) {
        try { memoryBlock = await memoryService.buildMemoryPrompt(this.currentUserId); }
        catch (e) { console.error('Memory error:', e); }
      }

      // Web search
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
        if (this.currentUserId && input) memoryService.analyzeAndStore(this.currentUserId, input, result.content, messages);
        return result;
      }

      const cleaned = this.cleaner.clean(res.content, ctx.detectedLanguage);

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
    if (ctx.userFlags.wantsFromScratch) return 32768;
    if (ctx.userFlags.wantsDetailed) return 8000;
    if (ctx.userFlags.wantsBrief) return 400;
    if (ctx.userFlags.wantsCodeOnly) return 16000;
    if (ctx.userFlags.wantsEssay) return 6000;
    if (ctx.userFlags.wantsStepByStep) return 4000;

    // Topic-based adjustments
    const topic = ctx.topicCategory;
    if (['math', 'physics', 'chemistry'].includes(topic)) return 4000; // need space for full solutions
    if (topic === 'homework') return 4000;
    if (topic === 'creative_writing') return 6000;
    if (topic === 'literature' && ctx.userFlags.wantsEssay) return 6000;

    if (ctx.isCodeSession || /```/.test(input)) return 16000;
    if (ctx.detectedDomain?.taskType === 'new_code') return 16000;
    if (ctx.detectedDomain?.taskType === 'review') return 4000;
    if (ctx.detectedDomain?.taskType === 'solve') return 4000;
    if (ctx.detectedDomain?.taskType === 'essay') return 6000;

    const len = input.length;
    if (ctx.userBehavior === 'chatting' || ctx.userBehavior === 'testing') return 400;
    if (ctx.userBehavior === 'working' || ctx.userBehavior === 'learning') {
      if (len > 200) return 3000;
      if (len > 100) return 1500;
      return 800;
    }
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

    // Precise domains need low temperature
    if (ctx.detectedDomain && ['bug', 'new_code', 'optimize', 'refactor', 'solve'].includes(ctx.detectedDomain.taskType)) return 0.1;
    if (['math', 'physics', 'chemistry'].includes(ctx.topicCategory)) return 0.1;
    if (ctx.topicCategory === 'homework' && /реши|посчитай|вычисл|solve|calculate/i.test(input)) return 0.1;

    // Translation needs moderate precision
    if (ctx.userFlags.wantsTranslation) return 0.15;

    // Factual topics
    if (['history', 'geography', 'biology', 'law', 'medicine'].includes(ctx.topicCategory)) return 0.2;

    // Creative tasks
    if (/пошути|анекдот|придумай|joke|funny|напиши.*рассказ|write.*story/i.test(input.toLowerCase())) return 0.7;
    if (ctx.topicCategory === 'creative_writing') return 0.65;

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
    const e: Record<RudenessMode, string> = {
      polite: 'Произошла ошибка. Попробуй ещё раз.',
      rude: 'Что-то сломалось. Давай заново.',
      very_rude: 'Всё наебнулось. Пробуй заново блять.',
    };
    return { content: e[rudeness] };
  }

  resetConversation(): void {
    this.analyzer.reset();
  }
}

export const aiService = new IntelligentAIService();
