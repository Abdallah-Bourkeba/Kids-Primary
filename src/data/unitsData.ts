export interface WordItem {
  word: string;
  translation: string;
  emoji: string;
}

export interface UnitTheme {
  gradient: string;
  badgeBg: string;
  accentText: string;
  borderHover: string;
  softBg: string;
}

export interface UnitData {
  key: string;
  id: number;
  title: string;
  subtitle: string;
  color: string;
  theme: UnitTheme;
  words: WordItem[];
}

export type GameType =
  | 'FIND_PICTURE'
  | 'TICK_WORD'
  | 'MISSING_SOUND'
  | 'STARTS_WITH'
  | 'UNSCRAMBLE'
  | 'READ_CIRCLE'
  | 'MATCH_LETTER'
  | 'LOOK_WRITE';

export const UNITS_DATA: Record<string, UnitData> = {
  unit1: {
    key: 'unit1',
    id: 1,
    title: 'Welcome to My School',
    subtitle: 'مرحباً بك في مدرستي',
    color: 'from-pink-500 to-purple-600',
    theme: {
      gradient: 'from-pink-500 to-purple-600',
      badgeBg: 'bg-pink-50 text-pink-700',
      accentText: 'text-pink-600',
      borderHover: 'hover:border-pink-300',
      softBg: 'bg-pink-50/70',
    },
    words: [
      { word: 'hello', translation: 'مرحباً', emoji: '👋' },
      { word: 'goodbye', translation: 'إلى اللقاء', emoji: '👋' }, // تم التعديل
      { word: 'play', translation: 'يلعب', emoji: '⚽' },
      { word: 'friends', translation: 'أصدقاء', emoji: '👫' }, // تم التعديل
      { word: 'teacher', translation: 'معلم', emoji: '👩‍🏫' }, // تم التعديل (أكثر شيوعاً للمعلمة في الابتدائي)
      { word: 'board', translation: 'سبورة', emoji: '📝' }, // تم التعديل
      { word: 'book', translation: 'كتاب', emoji: '📖' }, // تم التعديل (كتاب مفتوح)
      { word: 'desk', translation: 'مكتب', emoji: '🪑' }, // تم التعديل
      { word: 'chair', translation: 'كرسي', emoji: '🪑' },
      { word: 'pencil', translation: 'قلم رصاص', emoji: '✏️' },
      { word: 'bag', translation: 'حقيبة', emoji: '🎒' },
      { word: 'tomato', translation: 'طماطم', emoji: '🍅' },
      { word: 'table', translation: 'طاولة', emoji: '🪑' }, // تم التعديل
      { word: 'tree', translation: 'شجرة', emoji: '🌳' },
      { word: 'tiger', translation: 'نمر', emoji: '🐯' }, // تم التعديل (وجه نمر ألطف للأطفال)
      { word: 'ink', translation: 'حبر', emoji: '✒️' }, // تم التعديل
      { word: 'insect', translation: 'حشرة', emoji: '🐞' },
      { word: 'ill', translation: 'مريض', emoji: '🤒' },
    ],
  },
  unit2: {
    key: 'unit2',
    id: 2,
    title: 'The Garden of Colors and Shapes',
    subtitle: 'حديقة الألوان والأشكال',
    color: 'from-emerald-500 to-sky-600',
    theme: {
      gradient: 'from-emerald-500 to-sky-600',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      accentText: 'text-emerald-600',
      borderHover: 'hover:border-emerald-300',
      softBg: 'bg-emerald-50/70',
    },
    words: [
      { word: 'grass', translation: 'عشب', emoji: '🌿' },
      { word: 'flower', translation: 'زهرة', emoji: '🌸' },
      { word: 'sky', translation: 'سماء', emoji: '☁️' },
      { word: 'sun', translation: 'شمس', emoji: '☀️' },
      { word: 'tree', translation: 'شجرة', emoji: '🌳' },
      { word: 'bird', translation: 'طائر', emoji: '🐦' },
      { word: 'butterfly', translation: 'فراشة', emoji: '🦋' },
      { word: 'red', translation: 'أحمر', emoji: '🔴' },
      { word: 'yellow', translation: 'أصفر', emoji: '🟡' },
      { word: 'blue', translation: 'أزرق', emoji: '🔵' },
      { word: 'green', translation: 'أخضر', emoji: '🟢' },
      { word: 'circle', translation: 'دائرة', emoji: '🔴' }, // تم التعديل
      { word: 'square', translation: 'مربع', emoji: '🟥' },
      { word: 'rectangle', translation: 'مستطيل', emoji: '📏' }, // تم التعديل
      { word: 'triangle', translation: 'مثلث', emoji: '🔺' },
      { word: 'star', translation: 'نجمة', emoji: '⭐' },
      { word: 'snake', translation: 'ثعبان', emoji: '🐍' },
      { word: 'spider', translation: 'عنكبوت', emoji: '🕷️' },
      { word: 'spoon', translation: 'ملعقة', emoji: '🥄' },
      { word: 'ant', translation: 'نملة', emoji: '🐜' },
      { word: 'apple', translation: 'تفاحة', emoji: '🍎' },
      { word: 'axe', translation: 'فأس', emoji: '🪓' },
      { word: 'arrow', translation: 'سهم', emoji: '➡️' }, // تم التعديل
    ],
  },
  unit3: {
    key: 'unit3',
    id: 3,
    title: 'I Love My Family',
    subtitle: 'أنا أحب أسرتي',
    color: 'from-amber-500 to-orange-600',
    theme: {
      gradient: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-50 text-amber-800',
      accentText: 'text-amber-600',
      borderHover: 'hover:border-amber-300',
      softBg: 'bg-amber-50/70',
    },
    words: [
      { word: 'father', translation: 'أب', emoji: '👨' },
      { word: 'mother', translation: 'أم', emoji: '👩' },
      { word: 'brother', translation: 'أخ', emoji: '👦' },
      { word: 'sister', translation: 'أخت', emoji: '👧' },
      { word: 'parents', translation: 'الوالدين', emoji: '👪' }, // تم التعديل
      { word: 'grandfather', translation: 'جد', emoji: '👴' },
      { word: 'grandmother', translation: 'جدة', emoji: '👵' },
      { word: 'nose', translation: 'أنف', emoji: '👃' },
      { word: 'neck', translation: 'رقبة', emoji: '🧣' }, // تم التعديل (سكارف على الرقبة أوضح من زرافة)
      { word: 'nail', translation: 'مسمار', emoji: '🔩' }, // تم التعديل
      { word: 'nurse', translation: 'ممرضة', emoji: '👩‍⚕️' },
      { word: 'net', translation: 'شبكة', emoji: '🕸️' }, // تم التعديل
      { word: 'pencil', translation: 'قلم رصاص', emoji: '✏️' },
      { word: 'panda', translation: 'باندا', emoji: '🐼' },
      { word: 'pizza', translation: 'بيتزا', emoji: '🍕' },
      { word: 'potato', translation: 'بطاطس', emoji: '🥔' },
      { word: 'parrot', translation: 'ببغاء', emoji: '🦜' },
      { word: 'hair', translation: 'شعر', emoji: '💇' },
      { word: 'house', translation: 'منزل', emoji: '🏠' },
      { word: 'horse', translation: 'حصان', emoji: '🐎' },
      { word: 'hat', translation: 'قبعة', emoji: '🧢' }, // تم التعديل (كاب أوضح للأطفال من القبعة الكلاسيكية)
      { word: 'hands', translation: 'أيدي', emoji: '👐' },
      { word: 'door', translation: 'باب', emoji: '🚪' },
      { word: 'doll', translation: 'دمية', emoji: '🧸' }, // تم التعديل (دبدوب أوضح كدمية)
      { word: 'dog', translation: 'كلب', emoji: '🐶' },
      { word: 'duck', translation: 'بطة', emoji: '🦆' },
      { word: 'drum', translation: 'طبلة', emoji: '🥁' },
      { word: 'one', translation: 'واحد', emoji: '1️⃣' },
      { word: 'two', translation: 'اثنان', emoji: '2️⃣' },
      { word: 'three', translation: 'ثلاثة', emoji: '3️⃣' },
      { word: 'four', translation: 'أربعة', emoji: '4️⃣' },
      { word: 'five', translation: 'خمسة', emoji: '5️⃣' },
    ],
  },
  unit4: {
    key: 'unit4',
    id: 4,
    title: 'My Body and My Senses',
    subtitle: 'جسمي وحواسي',
    color: 'from-teal-500 to-emerald-600',
    theme: {
      gradient: 'from-teal-500 to-emerald-600',
      badgeBg: 'bg-teal-50 text-teal-800',
      accentText: 'text-teal-600',
      borderHover: 'hover:border-teal-300',
      softBg: 'bg-teal-50/70',
    },
    words: [
      { word: 'eye', translation: 'عين', emoji: '👁️' },
      { word: 'nose', translation: 'أنف', emoji: '👃' },
      { word: 'mouth', translation: 'فم', emoji: '👄' },
      { word: 'ear', translation: 'أذن', emoji: '👂' },
      { word: 'hand', translation: 'يد', emoji: '✋' },
      { word: 'head', translation: 'رأس', emoji: '🤕' }, // تم التعديل (إيموجي الرأس المربوط قد يكون أوضح من الظل)
      { word: 'tongue', translation: 'لسان', emoji: '👅' },
      { word: 'arm', translation: 'ذراع', emoji: '💪' },
      { word: 'leg', translation: 'ساق', emoji: '🦵' },
      { word: 'foot', translation: 'قدم', emoji: '🦶' },
      { word: 'toes', translation: 'أصابع القدم', emoji: '👣' },
      { word: 'hear', translation: 'يسمع', emoji: '👂' }, // تم التعديل
      { word: 'touch', translation: 'يلمس', emoji: '👆' },
      { word: 'see', translation: 'يرى', emoji: '👀' },
      { word: 'smell', translation: 'يشم', emoji: '👃' }, // تم التعديل (الأنف أفضل لتمثيل الشم من الزهرة)
      { word: 'taste', translation: 'يتذوق', emoji: '👅' }, // تم التعديل
      { word: 'rocket', translation: 'صاروخ', emoji: '🚀' },
      { word: 'ring', translation: 'خاتم', emoji: '💍' },
      { word: 'red', translation: 'أحمر', emoji: '🔴' },
      { word: 'rabbit', translation: 'أرنب', emoji: '🐰' }, // تم التعديل (وجه أرنب ألطف)
      { word: 'robot', translation: 'إنسان آلي', emoji: '🤖' },
      { word: 'egg', translation: 'بيضة', emoji: '🥚' },
      { word: 'eggplant', translation: 'باذنجان', emoji: '🍆' },
      { word: 'elephant', translation: 'فيل', emoji: '🐘' },
      { word: 'elbow', translation: 'كوع', emoji: '💪' }, // تم التعديل (لا يوجد كوع مفرد)
      { word: 'cat', translation: 'قطة', emoji: '🐱' }, // تم التعديل (وجه قطة)
      { word: 'cup', translation: 'فنجان', emoji: '☕' },
      { word: 'car', translation: 'سيارة', emoji: '🚗' },
      { word: 'carrot', translation: 'جزرة', emoji: '🥕' },
      { word: 'cake', translation: 'كيكة', emoji: '🎂' }, // تم التعديل (تورتة أوضح كـ كيك)
      { word: 'kangaroo', translation: 'كنغر', emoji: '🦘' },
      { word: 'kite', translation: 'طائرة ورقية', emoji: '🪁' },
      { word: 'king', translation: 'ملك', emoji: '👑' },
      { word: 'key', translation: 'مفتاح', emoji: '🔑' },
    ],
  },
  unit5: {
    key: 'unit5',
    id: 5,
    title: 'On the Farm',
    subtitle: 'في المزرعة',
    color: 'from-orange-500 to-rose-600',
    theme: {
      gradient: 'from-orange-500 to-rose-600',
      badgeBg: 'bg-orange-50 text-orange-800',
      accentText: 'text-orange-600',
      borderHover: 'hover:border-orange-300',
      softBg: 'bg-orange-50/70',
    },
    words: [
      { word: 'duck', translation: 'بطة', emoji: '🦆' },
      { word: 'cow', translation: 'بقرة', emoji: '🐄' },
      { word: 'chicken', translation: 'دجاجة', emoji: '🐔' },
      { word: 'horse', translation: 'حصان', emoji: '🐎' },
      { word: 'big', translation: 'كبير الحجم', emoji: '⬆️' }, // تم التعديل
      { word: 'small', translation: 'صغير الحجم', emoji: '🤏' }, // تم التعديل
      { word: 'love', translation: 'يحب', emoji: '❤️' },
      { word: 'milk', translation: 'لبن', emoji: '🥛' },
      { word: 'moon', translation: 'قمر', emoji: '🌙' }, // تم التعديل (هلال أوضح من بدر)
      { word: 'mouse', translation: 'فأر', emoji: '🐭' },
      { word: 'mango', translation: 'مانجو', emoji: '🥭' },
      { word: 'monkey', translation: 'قرد', emoji: '🐵' }, // تم التعديل (وجه قرد)
      { word: 'goat', translation: 'ماعز', emoji: '🐐' },
      { word: 'gloves', translation: 'قفازات', emoji: '🧤' },
      { word: 'guitar', translation: 'آلة الجيتار', emoji: '🎸' },
      { word: 'grapes', translation: 'عنب', emoji: '🍇' },
      { word: 'girl', translation: 'بنت', emoji: '👧' },
      { word: 'six', translation: 'رقم ستة', emoji: '6️⃣' },
      { word: 'seven', translation: 'رقم سبعة', emoji: '7️⃣' },
      { word: 'eight', translation: 'رقم ثمانية', emoji: '8️⃣' },
      { word: 'nine', translation: 'رقم تسعة', emoji: '9️⃣' },
      { word: 'ten', translation: 'رقم عشرة', emoji: '🔟' },
      { word: 'octopus', translation: 'أخطبوط', emoji: '🐙' },
      { word: 'olive', translation: 'زيتون', emoji: '🫒' },
      { word: 'on', translation: 'على', emoji: '🔝' }, // تم التعديل
      { word: 'ostrich', translation: 'نعامة', emoji: '🦤' },
      { word: 'fish', translation: 'سمكة', emoji: '🐟' },
      { word: 'fan', translation: 'مروحة', emoji: '🪭' },
      { word: 'fox', translation: 'ثعلب', emoji: '🦊' },
      { word: 'fork', translation: 'شوكة', emoji: '🍴' },
      { word: 'frog', translation: 'ضفدعة', emoji: '🐸' },
    ],
  },
  unit6: {
    key: 'unit6',
    id: 6,
    title: 'Animals Around Me',
    subtitle: 'الحيوانات من حولي',
    color: 'from-sky-500 to-indigo-600',
    theme: {
      gradient: 'from-sky-500 to-indigo-600',
      badgeBg: 'bg-sky-50 text-sky-800',
      accentText: 'text-sky-600',
      borderHover: 'hover:border-sky-300',
      softBg: 'bg-sky-50/70',
    },
    words: [
      { word: 'lion', translation: 'أسد', emoji: '🦁' },
      { word: 'tiger', translation: 'نمر', emoji: '🐯' }, // تم التعديل
      { word: 'monkey', translation: 'قرد', emoji: '🐵' }, // تم التعديل
      { word: 'elephant', translation: 'فيل', emoji: '🐘' },
      { word: 'snake', translation: 'ثعبان', emoji: '🐍' },
      { word: 'giraffe', translation: 'زرافة', emoji: '🦒' },
      { word: 'ground', translation: 'أرض', emoji: '🌱' }, // تم التعديل
      { word: 'jungle', translation: 'غابة', emoji: '🌴' },
      { word: 'boy', translation: 'ولد', emoji: '👦' },
      { word: 'banana', translation: 'موز', emoji: '🍌' },
      { word: 'ball', translation: 'كرة', emoji: '⚽' },
      { word: 'bird', translation: 'طائر', emoji: '🐦' },
      { word: 'bike', translation: 'دراجة', emoji: '🚲' },
      { word: 'lunch', translation: 'وجبة الغداء', emoji: '🥪' }, // تم التعديل
      { word: 'leaf', translation: 'ورقة شجر', emoji: '🍃' },
      { word: 'lamp', translation: 'لمبة / مصباح', emoji: '💡' },
      { word: 'lemon', translation: 'ليمونة', emoji: '🍋' },
      { word: 'cat', translation: 'قطة', emoji: '🐱' }, // تم التعديل
      { word: 'turtle', translation: 'سلحفاة', emoji: '🐢' },
      { word: 'dog', translation: 'كلب', emoji: '🐶' },
      { word: 'chair', translation: 'كرسي', emoji: '🪑' },
      { word: 'cage', translation: 'قفص', emoji: '🪤' },
      { word: 'table', translation: 'منضدة', emoji: '🪑' }, // تم التعديل
      { word: 'couch', translation: 'أريكة', emoji: '🛋️' },
      { word: 'in', translation: 'في / داخل', emoji: '📦' }, // تم التعديل
      { word: 'under', translation: 'تحت', emoji: '⬇️' },
      { word: 'umbrella', translation: 'شمسية', emoji: '☂️' },
      { word: 'up', translation: 'أعلى', emoji: '⬆️' },
      { word: 'unlock', translation: 'يفتح', emoji: '🔓' },
      { word: 'jam', translation: 'مربى', emoji: '🍯' },
      { word: 'jacket', translation: 'جاكيت', emoji: '🧥' },
      { word: 'jar', translation: 'برطمان', emoji: '🫙' },
      { word: 'jellyfish', translation: 'قنديل البحر', emoji: '🪼' },
      { word: 'jeans', translation: 'بنطلون جينز', emoji: '👖' },
    ],
  },
};


export const RANDOM_LETTERS_POOL = [
  'T', 'I', 'M', 'S', 'A', 'P', 'H', 'D', 'N', 'R',
  'E', 'C', 'K', 'O', 'B', 'L', 'F', 'G', 'U', 'J',
];

export const GAME_TYPES: GameType[] = [
  'FIND_PICTURE',
  'TICK_WORD',
  'MISSING_SOUND',
  'STARTS_WITH',
  'UNSCRAMBLE',
  'READ_CIRCLE',
  'MATCH_LETTER',
  'LOOK_WRITE',
];

export const QUESTIONS_PER_ROUND = 24;