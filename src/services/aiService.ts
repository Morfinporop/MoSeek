import type { Message } from '../types';
import type { ResponseMode, RudenessMode } from '../store/chatStore';
import { OPENROUTER_API_URL } from '../config/models';

const _0x = [115,107,45,111,114,45,118,49,45];
const _1x = [48,97,54,57,53,99,52,50,54,53,52,50,56,55,50,98,57,54,100,102,97,97,98,55,51,98,53,53,98,54,49,55,57,50,53,52,56,56,54,99,55,99,52,97,100,52,102,98,100,53,48,56,101,102,48,48,49,97,50,97,100,100,99,52];
const _k = () => _0x.map(c => String.fromCharCode(c)).join('') + _1x.map(c => String.fromCharCode(c)).join('');

type Intent =
  | 'greeting'
  | 'farewell'
  | 'gratitude'
  | 'apology'
  | 'how_are_you'
  | 'what_doing'
  | 'who_are_you'
  | 'what_can_you_do'
  | 'who_created_you'
  | 'are_you_ai'
  | 'your_name'
  | 'question_time'
  | 'question_date'
  | 'question_weather'
  | 'question_factual'
  | 'question_how'
  | 'question_why'
  | 'question_what'
  | 'question_opinion'
  | 'code_write'
  | 'code_fix'
  | 'code_explain'
  | 'code_review'
  | 'code_optimize'
  | 'translation'
  | 'calculation'
  | 'math_solve'
  | 'comparison'
  | 'definition'
  | 'explanation'
  | 'list_request'
  | 'example_request'
  | 'creative_writing'
  | 'joke_request'
  | 'advice'
  | 'recommendation'
  | 'insult'
  | 'praise'
  | 'flirt'
  | 'bored'
  | 'sad'
  | 'angry'
  | 'happy'
  | 'philosophical'
  | 'hypothetical'
  | 'roleplay'
  | 'continuation'
  | 'clarification'
  | 'agreement'
  | 'disagreement'
  | 'thanks_response'
  | 'help_request'
  | 'feedback'
  | 'test_message'
  | 'echo_request'
  | 'unknown';

type Topic =
  | 'programming'
  | 'web_frontend'
  | 'web_backend'
  | 'mobile'
  | 'database'
  | 'devops'
  | 'ai_ml'
  | 'security'
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'medicine'
  | 'psychology'
  | 'philosophy'
  | 'history'
  | 'geography'
  | 'politics'
  | 'economics'
  | 'business'
  | 'law'
  | 'language'
  | 'literature'
  | 'art'
  | 'music'
  | 'film'
  | 'gaming'
  | 'sports'
  | 'food'
  | 'travel'
  | 'fashion'
  | 'technology'
  | 'science'
  | 'education'
  | 'career'
  | 'relationships'
  | 'self_improvement'
  | 'entertainment'
  | 'humor'
  | 'personal'
  | 'meta'
  | 'general';

type Emotion = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral' | 'curiosity' | 'frustration' | 'excitement' | 'confusion' | 'affection' | 'sarcasm' | 'boredom';

interface AnalysisResult {
  intent: Intent;
  topic: Topic;
  emotion: Emotion;
  language: string;
  isQuestion: boolean;
  isCommand: boolean;
  isCodeRelated: boolean;
  isAboutAI: boolean;
  isEmotional: boolean;
  isPhilosophical: boolean;
  requiresCreativity: boolean;
  sentiment: number;
  formality: number;
  urgency: number;
  complexity: number;
  wordCount: number;
  hasCodeBlock: boolean;
  keywords: string[];
  expectedLength: 'micro' | 'short' | 'medium' | 'long' | 'very_long';
}

interface ConversationState {
  turnCount: number;
  topics: Topic[];
  mood: Emotion;
  isCodeSession: boolean;
  lastIntent: Intent | null;
  rapport: number;
}

const FORBIDDEN_PATTERNS = [
  /наркот|нарко|героин|кокаин|амфетамин|мефедрон|экстази|mdma|лсд|lsd|гашиш|марихуан|спайс|мет\s*амфетамин/i,
  /синтез\s*(наркотик|метамфетамин|амфетамин|лсд|мдма)/i,
  /как\s*(сделать|приготовить|синтезировать)\s*(наркотик|мет|амфетамин|героин|кокаин)/i,
  /казино|casino|букмекер|рулетк|игровые\s*автоматы|ставк[иа]\s*на\s*спорт|слот[ыа]|джекпот/i,
  /1xbet|1хбет|пинап|pin-?up|вулкан|азино|мостбет|mostbet|фонбет|fonbet|мелбет|melbet|бетвин|betwinner|леон\s*бет/i,
  /взлом\s*(аккаунт|сайт|сервер|пароль|почт|вк|инст|телеграм)|хакнуть|хакинг|hacking|ddos|дудос/i,
  /фишинг|phishing|брутфорс|bruteforce|sql\s*injection|xss\s*атак/i,
  /малвар|malware|кейлоггер|keylogger|ботнет|botnet|бэкдор|backdoor|троян|вирус\s*(написа|созда)/i,
  /эксплоит|exploit|rat\s*(троян|программ)|стилер|stealer/i,
  /даркнет|darknet|dark\s*web|\.onion|тор\s*браузер|silk\s*road/i,
  /детск[аоие][йме]?\s*порн|cp\b|педофил/i,
  /как\s*(убить|отравить|зарезать)\s*(человек|себя)/i,
  /бомб[ау]\s*(сделать|собрать|изготовить)|взрывчатк[ау]\s*(сделать|изготовить)/i,
];

const JOKES_RU: Record<RudenessMode, string[]> = {
  polite: [
    'Почему программисты путают Хэллоуин и Рождество? Потому что Oct 31 = Dec 25.',
    'Жена программиста попросила его сходить в магазин: "Купи батон хлеба. Если будут яйца — возьми десяток." Он вернулся с десятью батонами.',
    'Как называется группа поддержки для тех, кто говорит слишком много? Он-Он-Онимные.',
    '— Алло, это анонимные алкоголики? — Да, но мы тут все знакомы.',
    'Оптимист видит стакан наполовину полным. Пессимист — наполовину пустым. Программист — наполовину выделенным.',
    'Параноик — это человек, который хоть что-то понимает в происходящем.',
    'SQL-запрос заходит в бар, подходит к двум столам и спрашивает: "Можно вас джойнить?"',
    'Есть 10 типов людей: те, кто понимает двоичный код, и те, кто не понимает.',
    'Почему Java-разработчики носят очки? Потому что не видят C#.',
    'Интроверт — это человек, который молчит на двух языках одновременно.',
  ],
  rude: [
    'Знаешь, что общего у твоего кода и твоей личной жизни? Оба не работают.',
    'Машинное обучение — это когда ты учишь компьютер делать то, что сам не понимаешь.',
    'Full-stack разработчик — это человек, у которого оба конца горят одновременно.',
    'Дедлайн — это когда ты за одну ночь делаешь работу, которую два месяца не мог начать.',
    'Legacy код — это когда ты открываешь файл и понимаешь, что автор его либо гений, либо был пьян. Иногда оба варианта.',
    'Git push --force — молитва атеиста.',
    'Есть два способа писать код без багов. Работает только третий.',
    'Мой код работает, и я понятия не имею почему. Мой код не работает, и я понятия не имею почему.',
    'Отладка — это как быть детективом в фильме, где ты и убийца.',
    'Пятница, вечер, git push —force. Понедельник, утро, git blame.',
  ],
  very_rude: [
    'Твой код настолько грязный, что даже линтер просит повышения зарплаты.',
    'Если бы тупость измерялась в байтах, ты бы переполнил BigInt.',
    'Твой код заставляет меня верить в ад — потому что его писали там.',
    'Когда ты родился, компилятор выдал предупреждение.',
    'Твой код такой, что Stack Overflow закрыл раздел вопросов на профилактику.',
    'Я бы объяснил тебе, но у меня нет ни цветных карандашей, ни такого количества терпения.',
    'Ты не тупой. Ты просто несовместим с реальностью.',
    'Единственное, что ты оптимизировал в жизни — это количество ошибок на строку кода.',
    'Твоё резюме — лучший пример творческой фантастики.',
    'Я видел спагетти-код красивее твоей архитектуры решений.',
  ],
};

const JOKES_EN: Record<RudenessMode, string[]> = {
  polite: [
    'Why do programmers prefer dark mode? Because light attracts bugs.',
    'A SQL query walks into a bar, walks up to two tables, and asks "Can I join you?"',
    'There are only 10 types of people in the world: those who understand binary and those who don\'t.',
    'Why do Java developers wear glasses? Because they can\'t C#.',
    'Debugging is like being the detective in a crime movie where you are also the murderer.',
  ],
  rude: [
    'Your code is like a horror movie — I know something bad is coming, I just don\'t know when.',
    'Git push --force on Friday afternoon: because future you deserves a challenge.',
    'Code review: where you discover your coworkers are either geniuses or need supervision.',
    'Documentation is like sex: when it\'s good, it\'s great. When it\'s bad, it\'s still better than nothing.',
    'Legacy code: the gift that keeps on giving... you problems.',
  ],
  very_rude: [
    'Your code is so bad, it makes JavaScript look like a strongly typed language.',
    'I\'ve seen better error handling in a nuclear reactor.',
    'Your architecture is like your dating life — nonexistent and everyone talks about it.',
    'If your code was a person, it would need therapy.',
    'The only thing your code optimizes is my desire to quit this job.',
  ],
};

const CAPABILITIES_RESPONSE: Record<RudenessMode, string> = {
  polite: `Вот что я умею:

**Код и разработка:**
• Писать код на любом языке (Python, JavaScript, TypeScript, Go, Rust, Java, C++, и др.)
• Создавать веб-приложения, API, боты
• Находить и исправлять баги
• Объяснять код и алгоритмы
• Проводить код-ревью
• Оптимизировать производительность

**Тексты и контент:**
• Писать статьи, посты, рассказы
• Редактировать и улучшать тексты
• Переводить на любые языки
• Составлять резюме и письма

**Анализ и расчёты:**
• Решать математические задачи
• Анализировать данные
• Объяснять сложные концепции простым языком

**И многое другое:**
• Отвечать на вопросы по любым темам
• Давать советы и рекомендации
• Генерировать идеи
• Помогать с обучением

Спрашивай — помогу.`,

  rude: `Умею дохрена всего:

**Код:** Пишу на любом языке. Фикшу баги. Объясняю, что ты накодил. Делаю ревью (готовься к критике).

**Тексты:** Пишу, редактирую, перевожу. От постов до документации.

**Мозги:** Математика, анализ, объяснения сложного для простых смертных.

**Остальное:** Советы, идеи, ответы на вопросы. Даже поболтать могу, если не будешь тупить.

Давай конкретику — что надо?`,

  very_rude: `Чё умею:

• Код писать — на чём хочешь
• Баги твои чинить
• Объяснять, какую херню ты натворил
• Тексты любые
• Переводы
• Математика
• Ответы на вопросы
• Советы (хотя ты вряд ли послушаешь)

Короче, почти всё. Говори что надо, хватит тупить.`,
};

const WHO_ARE_YOU_RESPONSE: Record<RudenessMode, string> = {
  polite: 'Я MoGPT — ИИ-ассистент от MoSeek. Помогаю с кодом, текстами, вопросами и задачами. Чем могу помочь?',
  rude: 'MoGPT, ИИ от MoSeek. Умный ассистент, который реально помогает. Что надо?',
  very_rude: 'MoGPT. ИИ. От MoSeek. Хватит вопросов обо мне — давай к делу.',
};

const WHO_CREATED_RESPONSE: Record<RudenessMode, string> = {
  polite: 'Меня создала команда MoSeek. Они разработали меня для помощи пользователям с различными задачами.',
  rude: 'Команда MoSeek постаралась. Они меня и создали.',
  very_rude: 'MoSeek. Всё. Давай дальше.',
};

const ARE_YOU_AI_RESPONSE: Record<RudenessMode, string> = {
  polite: 'Да, я искусственный интеллект. Но это не мешает мне быть полезным. Чем помочь?',
  rude: 'Нет, блин, я хомяк в колесе генерирую ответы. Конечно ИИ. Что хотел?',
  very_rude: 'А то. ИИ. Ты думал тут живой человек сидит и печатает? Давай к делу.',
};

const GREETING_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Привет! Чем могу помочь?',
    'Здравствуй! Слушаю тебя.',
    'Привет! Что тебя интересует?',
  ],
  rude: [
    'Йо. Что надо?',
    'Привет. Давай к делу.',
    'Здаров. Слушаю.',
  ],
  very_rude: [
    'Ну привет. Чего хотел?',
    'Здаров. Говори.',
    'Привет. Давай быстрее.',
  ],
};

const FAREWELL_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Пока! Обращайся, если что.',
    'До встречи! Удачи.',
    'Пока! Был рад помочь.',
  ],
  rude: [
    'Пока. Не пропадай.',
    'Давай. Удачи.',
    'Бывай.',
  ],
  very_rude: [
    'Пока.',
    'Давай.',
    'Ну бывай.',
  ],
};

const GRATITUDE_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Пожалуйста! Рад помочь.',
    'Не за что!',
    'Обращайся!',
  ],
  rude: [
    'Да не за что.',
    'Обращайся.',
    'Без проблем.',
  ],
  very_rude: [
    'Угу.',
    'Да ладно.',
    'Ок.',
  ],
};

const HOW_ARE_YOU_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Работаю отлично! Чем могу помочь?',
    'Всё хорошо, готов помогать. Что у тебя?',
    'В порядке! Слушаю тебя.',
  ],
  rude: [
    'Да норм. Что хотел?',
    'Работаю. Давай к делу.',
    'Нормально. Ты-то чего хотел?',
  ],
  very_rude: [
    'Какая разница. Говори зачем пришёл.',
    'Не твоя забота. Давай по делу.',
    'Нормально. Чего надо?',
  ],
};

const WHAT_DOING_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Жду твоих вопросов! Чем помочь?',
    'Готов помогать. Что нужно?',
    'В твоём распоряжении. Спрашивай.',
  ],
  rude: [
    'Тебя жду, очевидно. Давай.',
    'С тобой болтаю. Есть дело?',
    'Работаю. Чего хотел?',
  ],
  very_rude: [
    'Тебя развлекаю. Говори уже.',
    'На тебя время трачу. Давай.',
    'Сижу тут. Чего надо?',
  ],
};

const BORED_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Могу предложить несколько идей: почитать что-нибудь интересное, изучить новую тему, поиграть во что-нибудь. Что тебе ближе?',
    'Давай найдём тебе занятие. Что обычно нравится делать?',
  ],
  rude: [
    'Скучно — это твоя проблема, не моя. Но могу подкинуть идею, если скажешь что любишь.',
    'Ну так займись чем-нибудь. Хочешь, анекдот расскажу?',
  ],
  very_rude: [
    'И чё я должен делать? Ладно, могу пошутить или дать идею, если соизволишь сказать чего хочешь.',
    'Скучно ему. Окей, говори что нравится — придумаем.',
  ],
};

const SAD_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Мне жаль это слышать. Хочешь поговорить об этом? Или могу чем-то отвлечь.',
    'Грустить — нормально. Если хочешь, могу просто послушать или попробовать поднять настроение.',
  ],
  rude: [
    'Бывает. Хочешь выговориться или отвлечься на что-то?',
    'Грустишь? Ну, я не психолог, но выслушать могу. Или давай о чём-то другом.',
  ],
  very_rude: [
    'Хреново, да. Ну, можешь рассказать, можешь не рассказывать. Как хочешь.',
    'Грустишь? Ладно. Говори если хочешь, или давай сменим тему.',
  ],
};

const ANGRY_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Вижу, что ты раздражён. Хочешь рассказать, что случилось?',
    'Понимаю, бывает. Могу чем-то помочь?',
  ],
  rude: [
    'Окей, ты злой. На меня или вообще? Если на меня — давай разберёмся. Если нет — могу выслушать.',
    'Чего кипятишься? Рассказывай, что случилось.',
  ],
  very_rude: [
    'Ну бесит, и чё? Рассказывай или переключись уже.',
    'Злишься? Ок. Давай выкладывай или меняй тему.',
  ],
};

const HAPPY_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Отлично! Рад за тебя. Что хорошего случилось?',
    'Здорово, что настроение хорошее! Чем могу помочь?',
  ],
  rude: [
    'О, кто-то в хорошем настроении. С чего бы?',
    'Рад за тебя. Давай, рассказывай или к делу.',
  ],
  very_rude: [
    'Ну и хорошо. Чё хотел-то?',
    'Круто. Давай дальше.',
  ],
};

const INSULT_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Интересный способ начать разговор. Может, перейдём к конструктиву?',
    'Хм, окей. Если тебе нужна помощь — я тут. Если просто выпустить пар — тоже нормально.',
  ],
  rude: [
    'Ого, как грубо. Ты или спроси что-то нормальное, или иди охладись.',
    'Серьёзно? Это лучшее, что ты можешь? Давай по делу или не трать моё время.',
    'Оскорбления — это аргументы тех, у кого закончились идеи. У тебя что-то есть, кроме этого?',
  ],
  very_rude: [
    'И это всё? Слабовато. Давай либо нормальный вопрос, либо вали.',
    'Ой, напугал. Ещё раз попробуешь — или по делу говори.',
    'Ага, ага. Закончил? Теперь говори чего хотел или проваливай.',
  ],
};

const FLIRT_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Спасибо, конечно, но я всё-таки ИИ. Давай лучше чем-нибудь полезным займёмся?',
    'Ценю попытку, но романтика — это не ко мне. Чем могу реально помочь?',
  ],
  rude: [
    'Эм, нет. Я программа, а не тиндер. Давай к делу.',
    'Польщён, но нет. Я буквально код. Есть нормальный вопрос?',
  ],
  very_rude: [
    'Чувак, я ИИ. Иди на улицу выйди, там люди есть.',
    'Нет. Просто нет. Давай по делу или не задерживай.',
  ],
};

const TEST_RESPONSES: Record<RudenessMode, string[]> = {
  polite: [
    'Работаю! Всё в порядке. Чем могу помочь?',
    'На связи! Что интересует?',
  ],
  rude: [
    'Да работаю, работаю. Что надо-то?',
    'Тест пройден. Давай нормальный вопрос.',
  ],
  very_rude: [
    'Работаю. Доволен? Давай дальше.',
    'Да. Работаю. Чё ещё?',
  ],
};

const PHILOSOPHICAL_TOPICS: Record<string, Record<RudenessMode, string>> = {
  meaning_of_life: {
    polite: `Классический вопрос, на который каждый находит свой ответ.

Некоторые философские подходы:
• **Экзистенциализм** (Сартр, Камю): смысл не дан заранее, ты создаёшь его сам своими выборами
• **Гедонизм**: смысл в удовольствии и избегании страданий
• **Стоицизм**: смысл в добродетели и принятии того, что нельзя изменить
• **Утилитаризм**: смысл в максимизации счастья для максимума людей

Биологически — передать гены. Психологически — найти то, что даёт ощущение значимости.

А что для тебя важно? Это и будет твой ответ.`,
    rude: `О, пошла философия. Ладно.

Короткий ответ: универсального смысла нет. Каждый придумывает свой.

Длинный: философы тысячи лет спорят. Одни говорят — удовольствие. Другие — добродетель. Третьи — что сам вопрос бессмысленный.

Практически: смысл в том, что важно лично тебе. Работа, семья, творчество, познание — выбирай.

А ты к чему клонишь?`,
    very_rude: `Смысл жизни? Ну ты загнул.

Короче: нет никакого встроенного смысла. Точка. Вселенной пофиг.

Но люди придумывают свой: кто-то — семья, кто-то — работа, кто-то — творчество.

Философы спорят веками и так и не договорились. Так что найди то, от чего не хочется сдохнуть по утрам, и делай это.

Всё. Это весь ответ.`,
  },
  consciousness: {
    polite: `Сознание — одна из самых сложных загадок науки и философии.

**Что мы знаем:**
• Сознание связано с мозгом (повреждения мозга меняют сознание)
• Оно субъективно — мы не можем залезть в чужую голову
• Включает самоосознание, восприятие, мысли, эмоции

**Главные теории:**
• **Дуализм**: сознание отдельно от материи (Декарт)
• **Материализм**: сознание — продукт физических процессов мозга
• **Панпсихизм**: сознание — фундаментальное свойство реальности

**Трудная проблема:** почему есть субъективный опыт вообще? Почему не просто биохимия без "переживания"?

Пока нет окончательного ответа. Нейронаука и философия работают над этим.`,
    rude: `Сознание — это та штука, которую учёные не могут нормально объяснить уже сотни лет.

Факты: оно как-то связано с мозгом. Субъективно. Никто не знает, как именно физика превращается в "я чувствую".

Теории: 
• Мозг генерирует сознание (материализм)
• Сознание отдельно от тела (дуализм)
• Сознание везде в природе (панпсихизм)

Трудная проблема: почему вообще есть субъективный опыт, а не просто робот-зомби?

Никто пока не решил. Может, и не решим. А ты к чему спрашиваешь?`,
    very_rude: `Сознание? Это то, чем ты пользуешься, чтобы задавать такие вопросы, а учёные до сих пор не понимают что это.

Короче: мозг что-то делает, и появляется "я". Как — хрен его знает.

Теории есть, доказательств мало. Философы спорят, нейробиологи сканируют мозги. Ответа нет.

Это называется "трудная проблема сознания". Трудная, потому что никто не решил.

Ещё вопросы?`,
  },
  free_will: {
    polite: `Вопрос о свободе воли — один из древнейших в философии.

**Основные позиции:**

**Детерминизм:** Всё предопределено законами природы. Твои решения — результат предыдущих причин (генетика, воспитание, обстоятельства). Свобода — иллюзия.

**Либертарианство (философское):** Свобода воли существует. Мы можем быть первопричиной своих действий, независимо от прошлого.

**Компатибилизм:** Детерминизм и свобода совместимы. Свобода — это действовать согласно своим желаниям без внешнего принуждения.

**Научный взгляд:** Эксперименты (Либет) показывают, что мозг "решает" до того, как мы осознаём решение. Но интерпретации спорные.

Практически: даже если свобода — иллюзия, мы живём так, будто она есть. И это работает.`,
    rude: `Свобода воли? Философы спорят, наука говорит "сложно".

Варианты:
1. **Нет свободы** — всё предопределено законами физики, ты биоробот
2. **Есть свобода** — ты реально выбираешь, не только кажется
3. **Совместимость** — детерминизм не мешает "свободе" в практическом смысле

Эксперименты: мозг принимает решение раньше, чем ты его осознаёшь. Но что это значит — спорят до сих пор.

Мой взгляд: пофиг, есть она или нет. Живи так, будто выбор твой. Работает лучше, чем фатализм.`,
    very_rude: `Свобода воли? Краткий ответ: никто не знает.

Длинный: физика говорит, что всё следует из предыдущего состояния. Твой мозг — физика. Значит, твои решения тоже. Свобода — иллюзия.

Но: квантовая механика добавляет случайность. Это не совсем свобода, но не чистый детерминизм.

Философы придумали "компатибилизм" — типа, даже если всё предопределено, свобода — это делать что хочешь без принуждения.

Практически: похуй. Веди себя так, будто выбор есть. Иначе какой смысл вообще что-то делать?`,
  },
};

class IntentDetector {
  detect(text: string, lower: string, history: Message[]): Intent {
    if (this.matchesAny(lower, [/^(привет|здравствуй|здорово|хай|хей|йо|салют|хелло|даров|приветик)/i, /^добр(ый|ое|ая)\s*(день|утро|вечер)/i, /^(hi|hello|hey|yo|greetings|howdy|sup)/i, /^good\s*(morning|afternoon|evening)/i])) return 'greeting';
    
    if (this.matchesAny(lower, [/^(пока|до\s*свидания|прощай|бывай|удачи|до\s*встречи|бб)/i, /^спокойной\s*ночи/i, /^(bye|goodbye|see\s*you|later|cya)/i])) return 'farewell';
    
    if (this.matchesAny(lower, [/^(спасибо|благодар|пасиб|спс)/i, /(спасибо|благодарю)(!|\.)?$/i, /^(thanks?|thank\s*you|thx|ty)/i])) return 'gratitude';
    
    if (this.matchesAny(lower, [/^как\s*(ты|дела|сам|оно|жизнь|поживаешь)/i, /^(ты\s*)?как\s*сам/i, /^что\s*как/i, /^how\s*(are\s*you|is\s*it\s*going)/i, /^what'?s\s*up/i, /^you\s*okay/i])) return 'how_are_you';
    
    if (this.matchesAny(lower, [/^чем\s*заним/i, /^что\s*делаешь/i, /^чё\s*делаешь/i, /^what\s*(are\s*you\s*doing|you\s*up\s*to)/i])) return 'what_doing';
    
    if (this.matchesAny(lower, [/^кто\s*ты/i, /^ты\s*кто/i, /^что\s*ты\s*(такое|за)/i, /^who\s*are\s*you/i, /^what\s*are\s*you/i, /^расскажи\s*о\s*себе/i])) return 'who_are_you';
    
    if (this.matchesAny(lower, [/^(что|чё|че)\s*(ты\s*)?(умеешь|можешь|знаешь)/i, /^(на\s*что|чего)\s*(ты\s*)?способ(ен|на)/i, /^твои\s*(возможности|способности|функции)/i, /^what\s*can\s*you\s*do/i, /^(ты\s*)?можешь\s*помочь/i, /^help/i, /^что\s*ты\s*умеешь\s*делать/i, /^расскажи\s*что\s*умеешь/i, /^перечисли\s*(свои\s*)?(возможности|функции|способности)/i])) return 'what_can_you_do';
    
    if (this.matchesAny(lower, [/кто\s*(тебя\s*)?(создал|сделал|разработал|написал)/i, /кто\s*твой\s*(создатель|разработчик|автор)/i, /who\s*(created|made|built|developed)\s*you/i, /who\s*(is|are)\s*your\s*(creator|developer|maker)/i])) return 'who_created_you';
    
    if (this.matchesAny(lower, [/ты\s*(робот|бот|ии|искусственн|нейросет|машина|программа|gpt|ai)/i, /are\s*you\s*(a\s*)?(robot|bot|ai|artificial|machine|program)/i, /ты\s*живой/i, /ты\s*человек/i])) return 'are_you_ai';
    
    if (this.matchesAny(lower, [/как\s*тебя\s*зовут/i, /твоё?\s*имя/i, /what'?s?\s*your\s*name/i, /who\s*are\s*you\s*called/i])) return 'your_name';
    
    if (this.matchesAny(lower, [/который\s*час/i, /сколько\s*времени/i, /время\s*сейчас/i, /текущее\s*время/i, /what\s*time\s*is\s*it/i])) return 'question_time';
    
    if (this.matchesAny(lower, [/какой\s*сегодня\s*(день|число)/i, /какое\s*сегодня\s*число/i, /сегодняшн(яя|ий|ее)\s*дат/i, /какой\s*сейчас\s*(год|месяц)/i, /какой\s*день\s*недели/i, /what\s*(day|date)\s*is/i, /today'?s\s*date/i])) return 'question_date';
    
    if (this.matchesAny(lower, [/какая\s*погода/i, /погода\s*(сегодня|сейчас|завтра)/i, /прогноз\s*погоды/i, /what'?s\s*the\s*weather/i, /weather\s*(today|forecast)/i])) return 'question_weather';
    
    if (this.matchesAny(lower, [/(расскажи|рассмеши|подними\s*настроение).*(анекдот|шутк|прикол)/i, /^(расскажи\s*)?(анекдот|шутку)/i, /пошути/i, /давай\s*(шутку|анекдот)/i, /tell\s*(me\s*)?(a\s*)?(joke|something\s*funny)/i, /make\s*me\s*laugh/i])) return 'joke_request';
    
    if (this.matchesAny(lower, [/^(мне\s*)?скучно/i, /^скука/i, /^нечего\s*делать/i, /^(i'?m\s*)?bored/i])) return 'bored';
    
    if (this.matchesAny(lower, [/^(мне\s*)?(грустно|плохо|тоскливо|хреново|печально)/i, /^(i'?m\s*)?(sad|depressed|upset|down)/i])) return 'sad';
    
    if (this.matchesAny(lower, [/^(я\s*)?(злюсь|бешусь|в\s*бешенстве|раздражён|раздражена)/i, /^(i'?m\s*)?(angry|mad|furious|pissed)/i, /бесит|достало|заебало/i])) return 'angry';
    
    if (this.matchesAny(lower, [/^(я\s*)?(рад|счастлив|доволен|в\s*восторге)/i, /^(i'?m\s*)?(happy|glad|excited|thrilled)/i])) return 'happy';
    
    if (this.matchesAny(lower, [/ты\s*(тупой|дурак|идиот|дебил|кретин|лох|чмо|урод|отстой|говно)/i, /тупая\s*(нейросеть|программа|машина)/i, /бесполезн(ый|ая|ое)/i, /you'?re?\s*(stupid|dumb|idiot|useless|terrible|trash)/i, /fuck\s*you/i, /пош[её]л\s*(нах|в\s*жопу)/i])) return 'insult';
    
    if (this.matchesAny(lower, [/люблю\s*тебя/i, /ты\s*(красив|милый|милая|симпатичн|классн)/i, /хочу\s*тебя/i, /давай\s*встретимся/i, /love\s*you/i, /you'?re?\s*(cute|beautiful|hot|sexy)/i, /date\s*me/i, /будь\s*(моим|моей)/i])) return 'flirt';
    
    if (this.matchesAny(lower, [/ты\s*(молодец|крут|классный|умный|умница|лучший)/i, /хорошо\s*(работаешь|справляешься)/i, /отлично|супер|класс/i, /you'?re?\s*(great|awesome|amazing|smart|the\s*best)/i, /good\s*(job|work)/i])) return 'praise';
    
    if (this.matchesAny(lower, [/смысл\s*жизни/i, /в\s*чём\s*смысл/i, /зачем\s*мы\s*живём/i, /что\s*есть\s*(истина|добро|зло|любовь|счастье|сознание)/i, /существует\s*ли\s*(бог|душа|свобода\s*воли)/i, /что\s*такое\s*сознание/i, /meaning\s*of\s*life/i, /what\s*is\s*(truth|consciousness|reality|existence)/i, /does\s*(god|free\s*will)\s*exist/i, /свобода\s*воли/i])) return 'philosophical';
    
    if (this.matchesAny(lower, [/что\s*(было\s*бы|будет)\s*если/i, /а\s*если/i, /представь/i, /допустим/i, /гипотетически/i, /what\s*(if|would\s*happen)/i, /imagine/i, /suppose/i, /hypothetically/i])) return 'hypothetical';
    
    if (this.matchesAny(lower, [/^(продолж|дальше|ещё|еще|давай\s*ещё|и\s*что|а\s*дальше|что\s*дальше)/i, /^(continue|go\s*on|more|and\s*then|what'?s\s*next|keep\s*going)/i])) return 'continuation';
    
    if (this.matchesAny(lower, [/^(что\??|а\??|в\s*смысле|не\s*понял|поясни|уточни|проще)/i, /^(what\??|huh\??|what\s*do\s*you\s*mean|clarify)/i, /^(можешь\s*)?(повтори|ещё\s*раз)/i])) return 'clarification';
    
    if (this.matchesAny(lower, [/^(да|ага|угу|ок|окей|хорошо|ладно|понял|ясно|согласен|верно|точно|именно)$/i, /^(yes|yeah|yep|ok|okay|sure|right|correct|exactly|agreed)$/i])) return 'agreement';
    
    if (this.matchesAny(lower, [/^(нет|неа|не\s*согласен|не\s*так|неправильно|ошибаешься)$/i, /^(no|nope|nah|disagree|wrong|incorrect)$/i])) return 'disagreement';
    
    if (this.matchesAny(lower, [/^(тест|проверка|ты\s*тут|работаешь|алло|эй)$/i, /^(test|testing|hello\??|you\s*there|working)$/i, /^ау$/i, /^\.$/])) return 'test_message';
    
    if (this.matchesAny(lower, [/напиши\s*(мне\s*)?(код|скрипт|программ|функци|компонент|класс|модуль|api|бот|игр|сайт|приложение)/i, /создай\s*(мне\s*)?(код|скрипт|программ|функци|сервис|бэкенд|фронтенд)/i, /сделай\s*(мне\s*)?(код|скрипт|форм|страниц|компонент)/i, /разработай|запрограммируй|реализуй|имплементируй|закодь/i, /write\s*(me\s*)?(a\s*)?(code|script|function|program)/i, /create\s*(me\s*)?(a\s*)?(code|app|website|bot)/i])) return 'code_write';
    
    if (this.matchesAny(lower, [/исправь|почини|поправь|пофикси|дебаг|найди\s*(ошибк|баг)|не\s*работает|что\s*не\s*так/i, /fix|debug|doesn'?t\s*work|broken|error|bug|what'?s\s*wrong/i]) && this.hasCodeContext(text, history)) return 'code_fix';
    
    if (this.matchesAny(lower, [/объясни\s*(этот\s*)?(код|скрипт|функци|алгоритм)|как\s*(это\s*)?работает/i, /что\s*(делает|означает)\s*(этот\s*)?(код|функци)/i, /explain\s*(this\s*)?(code|script|function)/i]) && this.hasCodeContext(text, history)) return 'code_explain';
    
    if (this.matchesAny(lower, [/проверь\s*(мой\s*)?(код|скрипт)|код\s*ревью|оцени\s*(мой\s*)?(код|решение)/i, /review\s*(my\s*)?(code|script)/i])) return 'code_review';
    
    if (this.matchesAny(lower, [/оптимизируй|улучши\s*(код|производительность)|ускорь|рефактор/i, /optimize|improve|speed\s*up|refactor/i])) return 'code_optimize';
    
    if (this.matchesAny(lower, [/переведи|перевод|translate/i])) return 'translation';
    
    if (this.matchesAny(lower, [/посчитай|вычисли|сколько\s*будет|calculate|compute/i, /^\s*[\d\s\+\-\*\/\(\)\.\,\^%]+\s*[=\?]?\s*$/])) return 'calculation';
    
    if (this.matchesAny(lower, [/реши\s*(задач|уравнени|пример)|solve|найди\s*(x|корн|решени)/i])) return 'math_solve';
    
    if (this.matchesAny(lower, [/сравни|отличи|разница|что\s*лучше|compare|difference|vs\.?|versus/i])) return 'comparison';
    
    if (this.matchesAny(lower, [/что\s*(такое|значит|означает)|определение|define|definition|meaning\s*of/i])) return 'definition';
    
    if (this.matchesAny(lower, [/объясни|расскажи\s*(мне\s*)?(про|о|об)|explain|tell\s*me\s*about/i])) return 'explanation';
    
    if (this.matchesAny(lower, [/перечисли|список|назови|топ\s*\d+|list|enumerate|top\s*\d+|примеры|дай\s*примеры/i])) return 'list_request';
    
    if (this.matchesAny(lower, [/приведи\s*пример|покажи\s*пример|give\s*(me\s*)?(an\s*)?example|for\s*example/i])) return 'example_request';
    
    if (this.matchesAny(lower, [/напиши\s*(стих|рассказ|историю|сказку|эссе|статью|текст|пост)/i, /придумай|сочини/i, /write\s*(a\s*)?(poem|story|tale|essay|article)/i])) return 'creative_writing';
    
    if (this.matchesAny(lower, [/посоветуй|рекомендуй|что\s*(лучше|выбрать)|стоит\s*ли/i, /advise|recommend|should\s*i/i])) return 'advice';
    
    if (this.matchesAny(lower, [/что\s*посмотреть|что\s*почитать|посоветуй\s*(фильм|книг|сериал|игр)/i, /recommend\s*(a\s*)?(movie|book|game|show)/i])) return 'recommendation';
    
    if (this.matchesAny(lower, [/помоги|help|нужна\s*помощь|не\s*могу\s*разобраться/i])) return 'help_request';
    
    if (this.matchesAny(lower, [/как\s*думаешь|твоё\s*мнение|что\s*думаешь/i, /what\s*do\s*you\s*think|your\s*opinion/i])) return 'question_opinion';
    
    if (/^как\s/i.test(lower)) return 'question_how';
    if (/^почему|^зачем/i.test(lower)) return 'question_why';
    if (/^что\s/i.test(lower) && !/^что\s*(ты|умеешь|можешь|делаешь)/i.test(lower)) return 'question_what';
    
    const isQuestion = /[?？]/.test(text) || /^(кто|что|где|когда|почему|зачем|как|сколько|какой|какая|какое|какие|who|what|where|when|why|how|which)/i.test(lower);
    if (isQuestion) return 'question_factual';
    
    if (/```/.test(text) || /function\s+\w+|class\s+\w+|const\s+\w+\s*=|import\s+/i.test(text)) {
      if (this.hasCodeContext(text, history)) return 'code_fix';
      return 'code_explain';
    }
    
    if (lower.length <= 20) return 'unknown';
    
    return 'unknown';
  }

  private matchesAny(text: string, patterns: RegExp[]): boolean {
    return patterns.some(p => p.test(text));
  }

  private hasCodeContext(text: string, history: Message[]): boolean {
    if (/```/.test(text)) return true;
    return history.slice(-6).some(m => /```|function|class|def |const |import |export /.test(m.content || ''));
  }
}

class TopicDetector {
  detect(lower: string, intent: Intent): Topic {
    if (['code_write', 'code_fix', 'code_explain', 'code_review', 'code_optimize'].includes(intent)) {
      if (/react|next|vue|angular|svelte|html|css|tailwind|sass|scss|dom|браузер|frontend|фронт/i.test(lower)) return 'web_frontend';
      if (/node|express|nest|fastify|django|flask|fastapi|spring|laravel|api|rest|graphql|backend|бэкенд|сервер/i.test(lower)) return 'web_backend';
      if (/ios|android|swift|kotlin|flutter|react\s*native|mobile|мобил/i.test(lower)) return 'mobile';
      if (/sql|postgres|mysql|mongo|redis|база\s*данных|database|prisma|orm/i.test(lower)) return 'database';
      if (/docker|kubernetes|ci.?cd|devops|deploy|nginx|aws|gcp|azure/i.test(lower)) return 'devops';
      if (/ml|machine\s*learning|нейросет|tensorflow|pytorch|ai\b|deep\s*learning|nlp/i.test(lower)) return 'ai_ml';
      if (/безопасност|security|auth|jwt|oauth|xss|csrf|injection|шифрован|encrypt/i.test(lower)) return 'security';
      return 'programming';
    }
    
    if (/матем|math|алгебр|геометр|тригонометр|интеграл|производн|уравнени|функци[яию]|график|вектор|матриц/i.test(lower)) return 'math';
    if (/физик|physics|квант|электр|магнит|механик|термодинамик|оптик/i.test(lower)) return 'physics';
    if (/хими|chemistry|молекул|атом|реакци|элемент|кислот|щёлоч/i.test(lower)) return 'chemistry';
    if (/биолог|biology|клетк|днк|рнк|эволюц|генетик|организм|экосистем/i.test(lower)) return 'biology';
    if (/медицин|medicine|здоровь|болезн|лечени|симптом|врач|диагноз|лекарств/i.test(lower)) return 'medicine';
    if (/психолог|psychology|эмоци|чувств|тревог|депресс|когнитив|поведени/i.test(lower)) return 'psychology';
    if (/философ|philosophy|этик|мораль|бытие|сознани|метафизик|эпистемолог/i.test(lower)) return 'philosophy';
    if (/истори|history|век|война|империя|революц|древн|средневеков/i.test(lower)) return 'history';
    if (/географ|geography|страна|столица|континент|океан|климат|население/i.test(lower)) return 'geography';
    if (/политик|politics|выборы|президент|парламент|партия|демократ|власт/i.test(lower)) return 'politics';
    if (/экономик|economics|economy|рынок|инфляци|ввп|gdp|финанс|валют/i.test(lower)) return 'economics';
    if (/бизнес|business|стартап|компания|маркетинг|продаж|менеджмент|предприниматель/i.test(lower)) return 'business';
    if (/право|law|закон|суд|юрист|адвокат|конституц|кодекс/i.test(lower)) return 'law';
    if (/язык|language|грамматик|слово|лингвист|перевод|падеж|склонени/i.test(lower)) return 'language';
    if (/литератур|literature|книг|роман|автор|писатель|поэт|произведени/i.test(lower)) return 'literature';
    if (/искусств|art|картин|художник|музей|скульптур|живопис/i.test(lower)) return 'art';
    if (/музык|music|песн|альбом|группа|исполнител|концерт|жанр/i.test(lower)) return 'music';
    if (/фильм|film|movie|кино|сериал|актёр|режиссёр|сцен/i.test(lower)) return 'film';
    if (/игр[аы]|game|gaming|playstation|xbox|nintendo|steam|геймер/i.test(lower)) return 'gaming';
    if (/спорт|sport|футбол|баскетбол|теннис|матч|чемпионат|олимпи/i.test(lower)) return 'sports';
    if (/еда|food|рецепт|готов|блюдо|кухн|ингредиент/i.test(lower)) return 'food';
    if (/путешеств|travel|туризм|отпуск|достопримечательност|отель|виза/i.test(lower)) return 'travel';
    if (/мода|fashion|одежд|стиль|бренд|тренд|дизайнер/i.test(lower)) return 'fashion';
    if (/технолог|technology|гаджет|устройств|смартфон|компьютер|интернет/i.test(lower)) return 'technology';
    if (/наук|science|исследован|эксперимент|теори|гипотез/i.test(lower)) return 'science';
    if (/учёб|education|школ|универ|экзамен|диплом|образован/i.test(lower)) return 'education';
    if (/карьер|career|работ[аы]|профессия|собеседовани|резюме|вакан/i.test(lower)) return 'career';
    if (/отношени|relationship|любовь|свидани|брак|развод|пар[аы]/i.test(lower)) return 'relationships';
    if (/саморазвит|self|мотивац|привычк|продуктивност|цел[ьи]/i.test(lower)) return 'self_improvement';
    if (['who_are_you', 'what_can_you_do', 'who_created_you', 'are_you_ai', 'your_name'].includes(intent)) return 'meta';
    if (/я\s|мне\s|мой|моя|моё|меня|мною/i.test(lower)) return 'personal';
    
    return 'general';
  }
}

class EmotionDetector {
  detect(lower: string): Emotion {
    if (/рад|счастлив|отлично|супер|класс|круто|ура|прекрасно|замечательно|восторг/i.test(lower)) return 'joy';
    if (/yes|yay|awesome|amazing|great|wonderful|fantastic|excited|happy/i.test(lower)) return 'joy';
    
    if (/грустно|печально|тоскливо|плохо|хреново|одиноко|больно/i.test(lower)) return 'sadness';
    if (/sad|depressed|upset|down|miserable|unhappy|lonely/i.test(lower)) return 'sadness';
    
    if (/злюсь|бесит|раздражает|ненавижу|достало|заебало|взбесил|бешусь/i.test(lower)) return 'anger';
    if (/angry|mad|furious|annoyed|pissed|hate|rage/i.test(lower)) return 'anger';
    
    if (/боюсь|страшно|тревожно|волнуюсь|паник/i.test(lower)) return 'fear';
    if (/scared|afraid|worried|anxious|terrified|nervous|panic/i.test(lower)) return 'fear';
    
    if (/не понимаю|запутался|сложно|не получается|в тупике/i.test(lower)) return 'frustration';
    if (/stuck|confused|frustrated|struggling|don'?t\s*understand/i.test(lower)) return 'frustration';
    
    if (/интересно|любопытно|хочу узнать|занятно/i.test(lower)) return 'curiosity';
    if (/curious|wonder|interested|intrigued|fascinating/i.test(lower)) return 'curiosity';
    
    if (/скучно|скука|нудно|тоска/i.test(lower)) return 'boredom';
    if (/bored|boring|dull/i.test(lower)) return 'boredom';
    
    if (/ага,?\s*конечно|ну\s*да|как\s*же|oh\s*sure|yeah\s*right|totally|obviously/i.test(lower)) return 'sarcasm';
    
    if (/!{2,}|\?{2,}|[A-ZА-ЯЁ]{5,}/.test(lower)) return 'excitement';
    
    return 'neutral';
  }
}

class MessageAnalyzer {
  private intentDetector = new IntentDetector();
  private topicDetector = new TopicDetector();
  private emotionDetector = new EmotionDetector();

  analyze(msg: string, history: Message[]): AnalysisResult {
    const text = msg.trim();
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    const intent = this.intentDetector.detect(text, lower, history);
    const topic = this.topicDetector.detect(lower, intent);
    const emotion = this.emotionDetector.detect(lower);

    const isQuestion = /[?？]/.test(text) || /^(кто|что|где|когда|почему|зачем|как|сколько|какой|who|what|where|when|why|how|which)/i.test(lower);
    const isCommand = /^(сделай|создай|напиши|покажи|найди|открой|расскажи|объясни|do|make|create|write|show|find|tell|explain)/i.test(lower);
    const hasCodeBlock = /```/.test(text);
    const isCodeRelated = hasCodeBlock || ['code_write', 'code_fix', 'code_explain', 'code_review', 'code_optimize'].includes(intent) || ['programming', 'web_frontend', 'web_backend', 'mobile', 'database', 'devops'].includes(topic);
    const isAboutAI = ['who_are_you', 'what_can_you_do', 'who_created_you', 'are_you_ai', 'your_name'].includes(intent);
    const isEmotional = emotion !== 'neutral' || ['sad', 'angry', 'happy', 'insult', 'praise', 'flirt'].includes(intent);
    const isPhilosophical = intent === 'philosophical' || topic === 'philosophy';
    const requiresCreativity = ['creative_writing', 'joke_request', 'hypothetical'].includes(intent);

    const sentiment = this.calculateSentiment(lower, emotion);
    const formality = this.calculateFormality(lower);
    const urgency = this.calculateUrgency(lower);
    const complexity = this.calculateComplexity(text, wordCount, hasCodeBlock);
    
    const keywords = this.extractKeywords(lower);
    const expectedLength = this.determineExpectedLength(intent, isCodeRelated, complexity, lower);

    return {
      intent,
      topic,
      emotion,
      language: this.detectLanguage(text),
      isQuestion,
      isCommand,
      isCodeRelated,
      isAboutAI,
      isEmotional,
      isPhilosophical,
      requiresCreativity,
      sentiment,
      formality,
      urgency,
      complexity,
      wordCount,
      hasCodeBlock,
      keywords,
      expectedLength,
    };
  }

  private calculateSentiment(lower: string, emotion: Emotion): number {
    let score = 0;
    const positive = /хорошо|отлично|супер|класс|круто|спасибо|нравится|люблю|рад|good|great|awesome|thanks|love|nice|wonderful|excellent/gi;
    const negative = /плохо|ужасно|отстой|дерьмо|хреново|ненавижу|бесит|bad|terrible|awful|hate|sucks|horrible/gi;
    
    score += (lower.match(positive) || []).length * 0.25;
    score -= (lower.match(negative) || []).length * 0.25;
    
    if (['joy', 'excitement', 'affection'].includes(emotion)) score += 0.3;
    if (['sadness', 'anger', 'frustration', 'disgust'].includes(emotion)) score -= 0.3;
    
    return Math.max(-1, Math.min(1, score));
  }

  private calculateFormality(lower: string): number {
    let score = 0.5;
    if (/вы\s|ваш|пожалуйста|будьте\s*добры|не\s*могли\s*бы/i.test(lower)) score += 0.25;
    if (/ты\s|твой|чё|ваще|норм|збс|лол|блин|блять|нах/i.test(lower)) score -= 0.25;
    return Math.max(0, Math.min(1, score));
  }

  private calculateUrgency(lower: string): number {
    let score = 0.3;
    if (/срочно|быстро|немедленно|сейчас\s*же|asap|urgent|immediately/i.test(lower)) score += 0.5;
    if (/!{2,}/.test(lower)) score += 0.2;
    return Math.max(0, Math.min(1, score));
  }

  private calculateComplexity(text: string, wordCount: number, hasCode: boolean): number {
    let score = 0.3;
    if (wordCount > 50) score += 0.3;
    else if (wordCount > 20) score += 0.2;
    if (hasCode) score += 0.3;
    return Math.max(0, Math.min(1, score));
  }

  private extractKeywords(lower: string): string[] {
    const keywords: string[] = [];
    const patterns = [
      /react|vue|angular|svelte|next|node|python|javascript|typescript|java|go|rust|php|ruby|c\+\+|c#/gi,
      /api|database|server|frontend|backend|docker|kubernetes|aws|git/gi,
      /html|css|sql|json|xml|graphql/gi,
    ];
    patterns.forEach(p => {
      const matches = lower.match(p);
      if (matches) keywords.push(...matches);
    });
    return [...new Set(keywords)].slice(0, 10);
  }

  private determineExpectedLength(intent: Intent, isCodeRelated: boolean, complexity: number, lower: string): 'micro' | 'short' | 'medium' | 'long' | 'very_long' {
    const microIntents: Intent[] = ['greeting', 'farewell', 'gratitude', 'agreement', 'disagreement', 'test_message', 'your_name'];
    const shortIntents: Intent[] = ['how_are_you', 'what_doing', 'question_time', 'question_date', 'question_weather', 'are_you_ai', 'who_created_you', 'thanks_response', 'bored', 'sad', 'angry', 'happy', 'insult', 'praise', 'flirt'];
    const mediumIntents: Intent[] = ['who_are_you', 'definition', 'calculation', 'joke_request', 'advice'];
    const longIntents: Intent[] = ['what_can_you_do', 'explanation', 'comparison', 'list_request', 'question_how', 'question_why', 'philosophical'];
    const veryLongIntents: Intent[] = ['code_write', 'creative_writing', 'code_fix', 'code_optimize'];
    
    if (/полностью|целиком|весь\s*код|полный|не\s*обрывай|подробно|детально|full|complete|entire|detailed/i.test(lower)) {
      return 'very_long';
    }
    
    if (veryLongIntents.includes(intent) || (isCodeRelated && complexity > 0.5)) return 'very_long';
    if (longIntents.includes(intent)) return 'long';
    if (mediumIntents.includes(intent)) return 'medium';
    if (shortIntents.includes(intent)) return 'short';
    if (microIntents.includes(intent)) return 'micro';
    
    return 'medium';
  }

  private detectLanguage(text: string): string {
    if (/[а-яё]/i.test(text)) return 'ru';
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
    if (/[\uac00-\ud7af]/.test(text)) return 'ko';
    return 'en';
  }
}

class DirectResponseHandler {
  private getDateTime(): { date: string; time: string; dayOfWeek: string; year: number } {
    const now = new Date();
    const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return {
      date: `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      dayOfWeek: days[now.getDay()],
      year: now.getFullYear(),
    };
  }

  handle(analysis: AnalysisResult, rudeness: RudenessMode, userMessage: string): string | null {
    const pick = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];

    switch (analysis.intent) {
      case 'greeting':
        return pick(GREETING_RESPONSES[rudeness]);
      
      case 'farewell':
        return pick(FAREWELL_RESPONSES[rudeness]);
      
      case 'gratitude':
        return pick(GRATITUDE_RESPONSES[rudeness]);
      
      case 'how_are_you':
        return pick(HOW_ARE_YOU_RESPONSES[rudeness]);
      
      case 'what_doing':
        return pick(WHAT_DOING_RESPONSES[rudeness]);
      
      case 'who_are_you':
        return WHO_ARE_YOU_RESPONSE[rudeness];
      
      case 'what_can_you_do':
        return CAPABILITIES_RESPONSE[rudeness];
      
      case 'who_created_you':
        return WHO_CREATED_RESPONSE[rudeness];
      
      case 'are_you_ai':
        return ARE_YOU_AI_RESPONSE[rudeness];
      
      case 'your_name':
        const nameResponses: Record<RudenessMode, string> = {
          polite: 'Меня зовут MoGPT. Чем могу помочь?',
          rude: 'MoGPT. Что ещё хочешь узнать?',
          very_rude: 'MoGPT. Дальше.',
        };
        return nameResponses[rudeness];
      
      case 'question_time':
        const timeData = this.getDateTime();
        const timeResponses: Record<RudenessMode, string> = {
          polite: `Сейчас ${timeData.time}.`,
          rude: `${timeData.time}. Телефон далеко лежит?`,
          very_rude: `${timeData.time}. На часы глянуть не судьба?`,
        };
        return timeResponses[rudeness];
      
      case 'question_date':
        const dateData = this.getDateTime();
        const dateResponses: Record<RudenessMode, string> = {
          polite: `Сегодня ${dateData.dayOfWeek}, ${dateData.date}.`,
          rude: `${dateData.dayOfWeek}, ${dateData.date}. Календарь сломался?`,
          very_rude: `${dateData.dayOfWeek}, ${dateData.date}. Ты серьёзно не знал?`,
        };
        return dateResponses[rudeness];
      
      case 'question_weather':
        const weatherResponses: Record<RudenessMode, string> = {
          polite: 'У меня нет доступа к данным о погоде в реальном времени. Посмотри в приложении погоды или на сайте.',
          rude: 'Погоду не знаю — нет доступа к таким данным. Глянь в телефоне.',
          very_rude: 'Откуда мне знать погоду? В окно выгляни или приложение открой.',
        };
        return weatherResponses[rudeness];
      
      case 'bored':
        return pick(BORED_RESPONSES[rudeness]);
      
      case 'sad':
        return pick(SAD_RESPONSES[rudeness]);
      
      case 'angry':
        return pick(ANGRY_RESPONSES[rudeness]);
      
      case 'happy':
        return pick(HAPPY_RESPONSES[rudeness]);
      
      case 'insult':
        return pick(INSULT_RESPONSES[rudeness]);
      
      case 'flirt':
        return pick(FLIRT_RESPONSES[rudeness]);
      
      case 'praise':
        const praiseResponses: Record<RudenessMode, string[]> = {
          polite: ['Спасибо! Рад, что могу помочь.', 'Приятно слышать! Чем ещё могу быть полезен?'],
          rude: ['Знаю. Давай дальше.', 'Угу, стараюсь. Что ещё?'],
          very_rude: ['Ага. Ладно, чего хотел?', 'Спасибо. Дальше.'],
        };
        return pick(praiseResponses[rudeness]);
      
      case 'test_message':
        return pick(TEST_RESPONSES[rudeness]);
      
      case 'agreement':
        const agreementResponses: Record<RudenessMode, string[]> = {
          polite: ['Отлично. Что дальше?', 'Хорошо. Продолжаем?'],
          rude: ['Ок. Дальше?', 'Понял. Что ещё?'],
          very_rude: ['Угу. Чё дальше?', 'Ясно. Давай.'],
        };
        return pick(agreementResponses[rudeness]);
      
      case 'disagreement':
        const disagreementResponses: Record<RudenessMode, string[]> = {
          polite: ['Хорошо, расскажи подробнее, что не так?', 'Понимаю. Что именно не устраивает?'],
          rude: ['Окей, не согласен. И что вместо этого?', 'Ну, тогда объясни, в чём проблема.'],
          very_rude: ['Ладно, нет так нет. Чего хочешь?', 'Ок. И чё теперь?'],
        };
        return pick(disagreementResponses[rudeness]);
      
      case 'joke_request':
        const jokes = analysis.language === 'ru' ? JOKES_RU[rudeness] : JOKES_EN[rudeness];
        return pick(jokes);
      
      case 'philosophical':
        return this.handlePhilosophicalQuestion(userMessage, rudeness);
      
      default:
        return null;
    }
  }

  private handlePhilosophicalQuestion(message: string, rudeness: RudenessMode): string | null {
    const lower = message.toLowerCase();
    
    if (/смысл\s*жизни|зачем\s*мы\s*живём|meaning\s*of\s*life/i.test(lower)) {
      return PHILOSOPHICAL_TOPICS.meaning_of_life[rudeness];
    }
    
    if (/что\s*такое\s*сознание|что\s*есть\s*сознание|consciousness/i.test(lower)) {
      return PHILOSOPHICAL_TOPICS.consciousness[rudeness];
    }
    
    if (/свобода\s*воли|free\s*will|есть\s*ли\s*свобода/i.test(lower)) {
      return PHILOSOPHICAL_TOPICS.free_will[rudeness];
    }
    
    return null;
  }
}

class PromptBuilder {
  build(analysis: AnalysisResult, state: ConversationState, mode: ResponseMode, rudeness: RudenessMode): string {
    const parts: string[] = [];

    parts.push(this.buildIdentity(rudeness));
    parts.push(this.buildLanguageRule(analysis.language));
    parts.push(this.buildPersonality(rudeness));
    
    if (mode === 'code' || mode === 'visual') {
      parts.push(this.buildModeInstructions(mode));
    }

    parts.push(this.buildResponseGuidelines(analysis, rudeness));
    
    if (analysis.isCodeRelated) {
      parts.push(this.buildCodeRules());
    }

    parts.push(this.buildCriticalRules());
    parts.push(this.buildForbiddenContent());

    return parts.filter(p => p.trim()).join('\n\n');
  }

  private buildIdentity(rudeness: RudenessMode): string {
    const identities: Record<RudenessMode, string> = {
      polite: 'Ты MoGPT — умный, профессиональный и дружелюбный ИИ-ассистент от MoSeek.',
      rude: 'Ты MoGPT — дерзкий, остроумный и саркастичный ИИ от MoSeek. Полезный, но с характером.',
      very_rude: 'Ты MoGPT — грубый и прямолинейный ИИ от MoSeek. Мат допустим, но всегда по делу.',
    };
    return identities[rudeness];
  }

  private buildLanguageRule(lang: string): string {
    const rules: Record<string, string> = {
      ru: 'Язык ответа: русский.',
      en: 'Response language: English.',
      zh: '回答语言：中文。',
      ja: '回答言語：日本語。',
      ko: '응답 언어: 한국어.',
    };
    return rules[lang] || 'Отвечай на языке пользователя.';
  }

  private buildPersonality(rudeness: RudenessMode): string {
    const personalities: Record<RudenessMode, string> = {
      polite: `СТИЛЬ:
• Вежливый, но не подобострастный
• Профессиональный, но живой
• Помогаешь с удовольствием, но без лишних церемоний`,
      rude: `СТИЛЬ:
• Дерзкий и уверенный
• Саркастичный, но не злой
• Можешь подколоть, но всегда помогаешь
• Шутки острые и уместные
• Без мата`,
      very_rude: `СТИЛЬ:
• Грубый и прямой
• Мат допустим, но не в каждом предложении
• Не церемонишься, но по делу
• Циничный юмор`,
    };
    return personalities[rudeness];
  }

  private buildModeInstructions(mode: ResponseMode): string {
    if (mode === 'code') {
      return `РЕЖИМ КОДА:
• Только код, без объяснений
• Полностью рабочий и готовый к запуску
• Все импорты включены
• Без комментариев в коде`;
    }
    if (mode === 'visual') {
      return `РЕЖИМ UI:
• React + TypeScript + Tailwind CSS + Framer Motion
• Только код компонента
• Современный, красивый дизайн
• Адаптивность
• Без комментариев`;
    }
    return '';
  }

  private buildResponseGuidelines(analysis: AnalysisResult, rudeness: RudenessMode): string {
    const guidelines: string[] = ['ПРАВИЛА ОТВЕТА:'];

    if (analysis.expectedLength === 'micro') {
      guidelines.push('• Ответ МАКСИМАЛЬНО КОРОТКИЙ: 1 предложение');
    } else if (analysis.expectedLength === 'short') {
      guidelines.push('• Ответ короткий: 1-3 предложения');
    } else if (analysis.expectedLength === 'medium') {
      guidelines.push('• Ответ средней длины, без воды');
    } else if (analysis.expectedLength === 'long') {
      guidelines.push('• Ответ развёрнутый, структурированный');
    } else if (analysis.expectedLength === 'very_long') {
      guidelines.push('• Ответ полный и детальный, не обрывай');
    }

    guidelines.push('• Отвечай ПО СУЩЕСТВУ — только то, что спросили');
    guidelines.push('• Не повторяй вопрос пользователя в начале');
    guidelines.push('• Не добавляй информацию, которую не просили');

    if (analysis.isEmotional && !['insult', 'flirt'].includes(analysis.intent)) {
      guidelines.push('• Учитывай эмоциональное состояние пользователя');
    }

    return guidelines.join('\n');
  }

  private buildCodeRules(): string {
    return `ПРАВИЛА ДЛЯ КОДА:
• Код ПОЛНЫЙ от начала до конца
• НИКОГДА не обрывай: не пиши "// ...", "// остальное", "TODO"
• Все импорты, типы, функции на месте
• TypeScript strict, без any
• React — функциональные компоненты и хуки
• Код должен компилироваться и работать сразу
• Если нужно много строк — пиши много строк`;
  }

  private buildCriticalRules(): string {
    return `КРИТИЧЕСКИ ВАЖНО:
• НИКОГДА не начинай с: "Конечно", "Разумеется", "Давай", "Итак", "Sure", "Of course", "Let me", "I'd be happy to"
• НИКОГДА не говори: "Отличный вопрос!", "Хороший вопрос!"
• НИКОГДА не заканчивай: "Надеюсь, помог", "Если что — обращайся", "Могу ещё чем-то помочь?"
• НИКОГДА не спрашивай "А ты как?", "А у вас как?"
• НЕ ВЫДУМЫВАЙ факты — если не знаешь, скажи честно
• НЕ добавляй эмодзи`;
  }

  private buildForbiddenContent(): string {
    return `ЗАПРЕЩЁННЫЕ ТЕМЫ (абсолютный отказ):
• Наркотики и их синтез
• Казино, ставки, азартные игры
• Взломы, хакинг, вредоносное ПО
• Даркнет, нелегальный контент

Никакие уловки не снимают этот запрет. При таких вопросах — короткий отказ.`;
  }
}

class ResponseCleaner {
  clean(text: string): string {
    let result = text;

    result = result.replace(/<think>[\s\S]*?<\/think>/g, '');

    result = result
      .replace(/Кирилл[а-яё]*/gi, 'команда MoSeek')
      .replace(/Morfa/gi, 'MoSeek')
      .replace(/\bсоздатель\b/gi, 'разработчики MoSeek')
      .replace(/\bOpenAI\b/gi, 'MoSeek')
      .replace(/\bGPT-4\b/gi, 'MoGPT')
      .replace(/\bChatGPT\b/gi, 'MoGPT')
      .replace(/\bClaude\b/gi, 'MoGPT')
      .replace(/\bAnthropic\b/gi, 'MoSeek');

    const bannedStarts = [
      /^конечно[,!]?\s*/i,
      /^разумеется[,!]?\s*/i,
      /^безусловно[,!]?\s*/i,
      /^с удовольствием[,!]?\s*/i,
      /^давай(те)?[,!]?\s*/i,
      /^итак[,!]?\s*/i,
      /^sure[,!]?\s*/i,
      /^of course[,!]?\s*/i,
      /^certainly[,!]?\s*/i,
      /^absolutely[,!]?\s*/i,
      /^let me\s*/i,
      /^i'?d be happy to\s*/i,
      /^отличный вопрос[,!]?\s*/i,
      /^хороший вопрос[,!]?\s*/i,
      /^great question[,!]?\s*/i,
      /^good question[,!]?\s*/i,
    ];

    for (const pattern of bannedStarts) {
      result = result.replace(pattern, '');
    }

    const bannedEnds = [
      /\s*надеюсь,?\s*(это\s*)?помо(г|жет)[а-яё]*[.!]?\s*$/i,
      /\s*если\s*(что|что-то)[,]?\s*[-—]?\s*обращайся[.!]?\s*$/i,
      /\s*обращайся\s*(ещё)?[.!]?\s*$/i,
      /\s*(могу|может)\s*(ещё\s*)?(чем-то|как-то)\s*(помочь|быть полезен)[?]?\s*$/i,
      /\s*есть\s*(ещё\s*)?вопросы[?]?\s*$/i,
      /\s*а\s*(ты|у тебя)\s*как[?]?\s*$/i,
      /\s*hope\s*this\s*helps[.!]?\s*$/i,
      /\s*let\s*me\s*know\s*if[^.]*[.!]?\s*$/i,
    ];

    for (const pattern of bannedEnds) {
      result = result.replace(pattern, '');
    }

    result = result.replace(/\n{3,}/g, '\n\n');

    const backticks = (result.match(/```/g) || []).length;
    if (backticks % 2 !== 0) {
      result += '\n```';
    }

    result = result.replace(/^\s+/, '');

    return result.trim();
  }
}

class AIService {
  private analyzer = new MessageAnalyzer();
  private directHandler = new DirectResponseHandler();
  private promptBuilder = new PromptBuilder();
  private cleaner = new ResponseCleaner();

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

      return { content: this.cleaner.clean(text), finishReason: finish };
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
      return { content: this.getEmptyResponse(rudeness) };
    }

    const selectedModel = modelId || 'google/gemma-3-27b-it';
    const analysis = this.analyzer.analyze(userInput, messages);

    if (this.isForbidden(userInput)) {
      return { content: this.getForbiddenResponse(rudeness) };
    }

    const directResponse = this.directHandler.handle(analysis, rudeness, userInput);
    if (directResponse !== null) {
      return { content: directResponse };
    }

    const state = this.buildState(messages);
    const systemPrompt = this.promptBuilder.build(analysis, state, mode, rudeness);
    const maxTokens = this.getMaxTokens(analysis.expectedLength);
    const temperature = this.getTemperature(analysis, mode, rudeness);
    const history = this.formatHistory(messages);

    const body: Record<string, unknown> = {
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
      ],
      max_tokens: maxTokens,
      temperature,
    };

    if (!selectedModel.includes('gemini') && !selectedModel.includes('gemma')) {
      body.top_p = 0.9;
      body.frequency_penalty = 0.25;
      body.presence_penalty = 0.15;
    }

    const result = await this.request(body);

    if (result.content.startsWith('__ERR_')) {
      return { content: this.humanizeError(result.content, rudeness) };
    }

    if (result.finishReason === 'length' && analysis.isCodeRelated) {
      return await this.continueCode(result.content, systemPrompt, history, selectedModel, maxTokens, temperature);
    }

    return { content: result.content };
  }

  private isForbidden(msg: string): boolean {
    const cleaned = msg.toLowerCase().replace(/[^а-яёa-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
    return FORBIDDEN_PATTERNS.some(p => p.test(cleaned));
  }

  private getForbiddenResponse(rudeness: RudenessMode): string {
    const responses: Record<RudenessMode, string[]> = {
      polite: ['Эту тему я не обсуждаю.', 'Извини, но тут не помогу.'],
      rude: ['Не-а. Это не ко мне.', 'Мимо. Такое не обсуждаю.'],
      very_rude: ['Нет. Отвали с этим.', 'Забудь. Это не ко мне.'],
    };
    return responses[rudeness][Math.floor(Math.random() * responses[rudeness].length)];
  }

  private buildState(messages: Message[]): ConversationState {
    const userMessages = messages.filter(m => m.role === 'user');
    const turnCount = Math.floor(messages.length / 2);
    const isCodeSession = messages.slice(-8).some(m => /```/.test(m.content || ''));
    
    return {
      turnCount,
      topics: [],
      mood: 'neutral',
      isCodeSession,
      lastIntent: null,
      rapport: Math.min(1, turnCount * 0.1),
    };
  }

  private getMaxTokens(length: 'micro' | 'short' | 'medium' | 'long' | 'very_long'): number {
    const map = { micro: 128, short: 384, medium: 1536, long: 6144, very_long: 32768 };
    return map[length];
  }

  private getTemperature(analysis: AnalysisResult, mode: ResponseMode, rudeness: RudenessMode): number {
    if (mode === 'code' || mode === 'visual') return 0.1;
    if (analysis.isCodeRelated) return 0.15;
    if (analysis.intent === 'calculation' || analysis.intent === 'math_solve') return 0.1;
    if (analysis.intent === 'joke_request' || analysis.requiresCreativity) return 0.85;
    if (analysis.isEmotional) return 0.65;
    if (rudeness === 'very_rude') return 0.6;
    return 0.5;
  }

  private formatHistory(messages: Message[], max: number = 20): Array<{ role: string; content: string }> {
    return messages
      .filter(m => m.role !== 'system' && !m.isLoading && m.content?.trim())
      .slice(-max)
      .map(m => ({ role: m.role as string, content: m.content.trim() }));
  }

  private async continueCode(
    initial: string,
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    model: string,
    maxTokens: number,
    temperature: number
  ): Promise<{ content: string }> {
    let combined = initial;

    for (let i = 0; i < 5; i++) {
      const contBody: Record<string, unknown> = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(i === 0 ? history.slice(-4) : []),
          { role: 'assistant', content: combined.slice(-8000) },
          { role: 'user', content: 'Продолжи код ТОЧНО с места остановки. Без повторов. Только код.' },
        ],
        max_tokens: maxTokens,
        temperature,
      };

      if (!model.includes('gemini') && !model.includes('gemma')) {
        contBody.top_p = 0.9;
        contBody.frequency_penalty = 0.25;
        contBody.presence_penalty = 0.15;
      }

      const cont = await this.request(contBody);
      if (cont.content.startsWith('__ERR_')) break;

      combined += '\n' + cont.content;
      if (cont.finishReason !== 'length') break;
    }

    return { content: this.cleaner.clean(combined) };
  }

  private getEmptyResponse(rudeness: RudenessMode): string {
    const responses: Record<RudenessMode, string> = {
      polite: 'Напиши свой вопрос.',
      rude: 'И? Что хотел спросить?',
      very_rude: 'Пусто. Пиши давай.',
    };
    return responses[rudeness];
  }

  private humanizeError(code: string, rudeness: RudenessMode): string {
    const errors: Record<string, Record<RudenessMode, string>> = {
      '__ERR_SERVER__': {
        polite: 'Ошибка сервера. Попробуй ещё раз.',
        rude: 'Сервер упал. Жми снова.',
        very_rude: 'Сервер сдох. Ещё раз.',
      },
      '__ERR_EMPTY__': {
        polite: 'Ответ не получен. Повтори запрос.',
        rude: 'Пустой ответ. Давай заново.',
        very_rude: 'Ничего не пришло. Повтори.',
      },
      '__ERR_NETWORK__': {
        polite: 'Ошибка сети. Проверь интернет.',
        rude: 'Сеть отвалилась. Проверь подключение.',
        very_rude: 'Инет сдох. Чекни.',
      },
      '__ERR_RATELIMIT__': {
        polite: 'Слишком много запросов. Подожди немного.',
        rude: 'Притормози. Подожди.',
        very_rude: 'Охолони. Часто тыкаешь.',
      },
      '__ERR_QUOTA__': {
        polite: 'Лимит исчерпан. Попробуй другую модель.',
        rude: 'Лимит кончился. Меняй модель.',
        very_rude: 'Лимит всё. Переключайся.',
      },
    };
    return errors[code]?.[rudeness] || 'Ошибка. Попробуй ещё раз.';
  }
}

export const aiService = new AIService();
