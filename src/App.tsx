import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Star,
  Home,
  ChevronLeft,
  BookOpen,
  RotateCcw,
  Award,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  UNITS_DATA,
  RANDOM_LETTERS_POOL,
  GAME_TYPES,
  QUESTIONS_PER_ROUND,
  type WordItem,
  type GameType,
} from './data/unitsData';

type ScreenState = 'MENU' | 'VOCAB' | 'GAME' | 'SUMMARY';

interface ScrambledLetter {
  id: number;
  char: string;
}

interface UnitProgress {
  bestScore: number;
  stars: number;
}

const STORAGE_KEY = 'little_explorer_english_progress_v1';

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return win.AudioContext ?? win.webkitAudioContext ?? null;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getSmartDistractors(
  wordsList: WordItem[],
  count: number,
  targetWord: WordItem,
  avoidSameFirstLetter = false
): WordItem[] {
  const targetFirst = targetWord.word.charAt(0).toLowerCase();
  const usedEmojis = new Set<string>([targetWord.emoji]);
  const usedWords = new Set<string>([targetWord.word]);

  const primaryPool = shuffleArray(
    wordsList.filter((item) => {
      if (usedWords.has(item.word) || usedEmojis.has(item.emoji)) return false;
      if (avoidSameFirstLetter && item.word.charAt(0).toLowerCase() === targetFirst) {
        return false;
      }
      return true;
    })
  );

  const selected: WordItem[] = [];
  for (const item of primaryPool) {
    if (selected.length >= count) break;
    if (!usedEmojis.has(item.emoji) && !usedWords.has(item.word)) {
      selected.push(item);
      usedEmojis.add(item.emoji);
      usedWords.add(item.word);
    }
  }

  // Fallback if unit pool is narrow
  if (selected.length < count) {
    const fallbackPool = shuffleArray(
      wordsList.filter(
        (item) => !usedWords.has(item.word) && (!avoidSameFirstLetter || item.word.charAt(0).toLowerCase() !== targetFirst)
      )
    );
    for (const item of fallbackPool) {
      if (selected.length >= count) break;
      selected.push(item);
      usedWords.add(item.word);
    }
  }

  return selected;
}

function calculateStars(score: number, total: number): number {
  const ratio = score / total;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.6) return 2;
  if (score > 0) return 1;
  return 0;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('MENU');
  const [activeUnitKey, setActiveUnitKey] = useState<string>('unit1');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [score, setScore] = useState<number>(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState<boolean>(true);
  const [questionsPlayed, setQuestionsPlayed] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [wordOptions, setWordOptions] = useState<WordItem[]>([]);
  const [letterOptions, setLetterOptions] = useState<string[]>([]);
  const [gameType, setGameType] = useState<GameType>('FIND_PICTURE');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [wrongOptionKey, setWrongOptionKey] = useState<string | null>(null);
  const [wrongMessage, setWrongMessage] = useState<string | null>(null);

  const [scrambledWord, setScrambledWord] = useState<ScrambledLetter[]>([]);
  const [userSpelled, setUserSpelled] = useState<ScrambledLetter[]>([]);
  const [practicedWords, setPracticedWords] = useState<WordItem[]>([]);

  const [progress, setProgress] = useState<Record<string, UnitProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Record<string, UnitProgress>) : {};
    } catch {
      return {};
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const wrongTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (wrongTimerRef.current !== null) {
      window.clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const AudioCtx = getAudioContextClass();
    if (AudioCtx) {
      audioCtxRef.current = new AudioCtx();
    }
    return () => {
      clearTimers();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [clearTimers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const playSound = useCallback(
    (type: 'correct' | 'wrong' | 'tap') => {
      if (!soundEnabled || !audioCtxRef.current) return;
      const ctx = audioCtxRef.current;

      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.09);
        osc.frequency.setValueAtTime(783.99, now + 0.18);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'wrong') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    },
    [soundEnabled]
  );

  const speakWord = useCallback(
    (text: string) => {
      if (!soundEnabled) return;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.82;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    },
    [soundEnabled]
  );

  const setupQuestion = useCallback(
    (unitKey: string, previousWord?: string) => {
      const unit = UNITS_DATA[unitKey];
      if (!unit) return;
      const wordsList = unit.words;

      let nextGameType = GAME_TYPES[Math.floor(Math.random() * GAME_TYPES.length)];
      const shortWords = wordsList.filter((w) => !w.word.includes(' ') && w.word.length <= 5);
      const nonRepeatPool = wordsList.filter((w) => w.word !== previousWord);
      const selectionPool = nonRepeatPool.length > 0 ? nonRepeatPool : wordsList;

      let targetWord: WordItem;

      if (nextGameType === 'UNSCRAMBLE') {
        const shortNonRepeat = shortWords.filter((w) => w.word !== previousWord);
        const scramblePool = shortNonRepeat.length > 0 ? shortNonRepeat : shortWords;
        if (scramblePool.length > 0) {
          targetWord = scramblePool[Math.floor(Math.random() * scramblePool.length)];
        } else {
          const shortestWord = [...wordsList].sort((a, b) => a.word.length - b.word.length)[0];
          if (shortestWord.word.length > 7 || shortestWord.word.includes(' ')) {
            nextGameType = 'FIND_PICTURE';
            targetWord = selectionPool[Math.floor(Math.random() * selectionPool.length)];
          } else {
            targetWord = shortestWord;
          }
        }
      } else {
        targetWord = selectionPool[Math.floor(Math.random() * selectionPool.length)];
      }

      setCurrentWord(targetWord);
      setGameType(nextGameType);
      setShowCelebration(false);
      setWrongOptionKey(null);
      setWrongMessage(null);
      setFirstTryCorrect(true);

      if (['FIND_PICTURE', 'LOOK_WRITE'].includes(nextGameType)) {
        const distractors = getSmartDistractors(wordsList, 3, targetWord, false);
        setWordOptions(shuffleArray([...distractors, targetWord]));
        setLetterOptions([]);
        if (nextGameType === 'FIND_PICTURE') {
          speakWord(targetWord.word);
        }
      } else if (['STARTS_WITH', 'MATCH_LETTER'].includes(nextGameType)) {
        const distractors = getSmartDistractors(wordsList, 3, targetWord, true);
        setWordOptions(shuffleArray([...distractors, targetWord]));
        setLetterOptions([]);
        if (nextGameType === 'MATCH_LETTER') {
          speakWord(targetWord.word);
        }
      } else if (['TICK_WORD', 'READ_CIRCLE'].includes(nextGameType)) {
        const distractors = getSmartDistractors(wordsList, 1, targetWord, false);
        setWordOptions(shuffleArray([...distractors, targetWord]));
        setLetterOptions([]);
      } else if (nextGameType === 'MISSING_SOUND') {
        const firstLetter = targetWord.word.charAt(0).toUpperCase();
        const distractorLetters = shuffleArray(
          RANDOM_LETTERS_POOL.filter((l) => l !== firstLetter)
        ).slice(0, 2);
        setLetterOptions(shuffleArray([firstLetter, ...distractorLetters]));
        setWordOptions([]);
        speakWord(targetWord.word);
      } else if (nextGameType === 'UNSCRAMBLE') {
        const letters: ScrambledLetter[] = targetWord.word
          .split('')
          .map((char, i) => ({ id: i, char }));
        let shuffled = shuffleArray(letters);
        // Ensure it isn't already solved if length > 1
        if (letters.length > 1 && shuffled.map((l) => l.char).join('') === targetWord.word) {
          shuffled = [...shuffled.slice(1), shuffled[0]];
        }
        setScrambledWord(shuffled);
        setUserSpelled([]);
        setWordOptions([]);
        setLetterOptions([]);
        speakWord(targetWord.word);
      }
    },
    [speakWord]
  );

  const startLesson = (unitKey: string) => {
    clearTimers();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      void audioCtxRef.current.resume();
    }
    setActiveUnitKey(unitKey);
    setScore(0);
    setQuestionsPlayed(0);
    setPracticedWords([]);
    setCurrentScreen('GAME');
    setupQuestion(unitKey);
  };

  const openVocabExplorer = (unitKey: string) => {
    clearTimers();
    setActiveUnitKey(unitKey);
    setCurrentScreen('VOCAB');
  };

  const goHome = () => {
    clearTimers();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentScreen('MENU');
  };

  const finishRound = useCallback(
    (finalScore: number) => {
      const earnedStars = calculateStars(finalScore, QUESTIONS_PER_ROUND);
      setProgress((prev) => {
        const existing = prev[activeUnitKey];
        return {
          ...prev,
          [activeUnitKey]: {
            bestScore: Math.max(existing?.bestScore ?? 0, finalScore),
            stars: Math.max(existing?.stars ?? 0, earnedStars),
          },
        };
      });
      setCurrentScreen('SUMMARY');
    },
    [activeUnitKey]
  );

  const handleAnswer = (isCorrect: boolean, optionKey?: string) => {
    if (showCelebration || !currentWord) return;

    if (isCorrect) {
      playSound('correct');
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#10b981', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6'],
          disableForReducedMotion: true,
        });
      }
      const nextScore = firstTryCorrect ? score + 1 : score;
      setScore(nextScore);
      setShowCelebration(true);
      setWrongOptionKey(null);
      setWrongMessage(null);
      setPracticedWords((prev) =>
        prev.some((w) => w.word === currentWord.word) ? prev : [...prev, currentWord]
      );

      advanceTimerRef.current = window.setTimeout(() => {
        if (questionsPlayed + 1 >= QUESTIONS_PER_ROUND) {
          finishRound(nextScore);
        } else {
          setQuestionsPlayed((prev) => prev + 1);
          setupQuestion(activeUnitKey, currentWord.word);
        }
      }, 1300);
    } else {
      playSound('wrong');
      setFirstTryCorrect(false);
      setWrongOptionKey(optionKey ?? 'wrong');
      setWrongMessage('حاولي مرة أخرى، يمكنكِ المحاولة!');

      if (wrongTimerRef.current !== null) {
        window.clearTimeout(wrongTimerRef.current);
      }
      wrongTimerRef.current = window.setTimeout(() => {
        setWrongOptionKey(null);
      }, 450);

      if (gameType === 'UNSCRAMBLE') {
        const letters: ScrambledLetter[] = currentWord.word
          .split('')
          .map((char, i) => ({ id: i, char }));
        setUserSpelled([]);
        setScrambledWord(shuffleArray(letters));
      }
    }
  };

  const handleSpelling = (letterObj: ScrambledLetter) => {
    if (showCelebration || !currentWord) return;
    playSound('tap');
    const newSpelled = [...userSpelled, letterObj];
    setUserSpelled(newSpelled);
    setScrambledWord((prev) => prev.filter((l) => l.id !== letterObj.id));

    if (newSpelled.length === currentWord.word.length) {
      const formedWord = newSpelled.map((l) => l.char).join('');
      if (formedWord === currentWord.word) {
        handleAnswer(true);
      } else {
        advanceTimerRef.current = window.setTimeout(() => handleAnswer(false, 'unscramble'), 350);
      }
    }
  };

  const handleRemoveSpelledLetter = (letterObj: ScrambledLetter) => {
    if (showCelebration) return;
    playSound('tap');
    setUserSpelled((prev) => prev.filter((l) => l.id !== letterObj.id));
    setScrambledWord((prev) => [...prev, letterObj]);
  };

  const activeUnit = UNITS_DATA[activeUnitKey];
  const totalStarsEarned = Object.values(progress).reduce((sum, u) => sum + u.stars, 0);
  const maxTotalStars = Object.keys(UNITS_DATA).length * 3;
  const progressPercent = Math.round(((questionsPlayed + (showCelebration ? 1 : 0)) / QUESTIONS_PER_ROUND) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Three-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={goHome}
            className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-sky-600 transition-colors cursor-pointer"
          >
            مغامرة الإنجليزية
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
            <button
              type="button"
              onClick={goHome}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentScreen === 'MENU' ? 'text-sky-600' : 'hover:text-slate-900'
              }`}
            >
              الوحدات الدراسية
            </button>
            <button
              type="button"
              onClick={() => openVocabExplorer(activeUnitKey)}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentScreen === 'VOCAB' ? 'text-sky-600' : 'hover:text-slate-900'
              }`}
            >
              قاموس الكلمات
            </button>
            <span className="text-slate-400 font-semibold whitespace-nowrap shrink-0 tabular-nums">
              {totalStarsEarned} / {maxTotalStars} نجوم
            </span>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-label={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>{soundEnabled ? 'الصوت مفعل' : 'الصوت مكتوم'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Stage */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        {currentScreen === 'MENU' && (
          <div className="space-y-8">
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <p className="text-sm font-bold text-sky-600">
                  تعلّم تفاعلي · 6 وحدات · 8 ألعاب ذكية
                </p>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight [text-wrap:balance]">
                  اختاري وحدة وابدئي رحلة تعلّم الإنجليزية بالصوت والصورة
                </h1>
                <p className="text-base text-slate-600 leading-relaxed">
                  استمعي للنطق الصحيح، طابقي الحروف والصور، ورتّبي الكلمات لجمع النجوم الذهبية في كل وحدة.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 shrink-0">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Star size={24} className="fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">مجموع النجوم</div>
                  <div className="text-2xl font-black text-slate-900 tabular-nums">
                    {totalStarsEarned} <span className="text-base font-bold text-slate-400">/ {maxTotalStars}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(UNITS_DATA).map((unit) => {
                const unitProg = progress[unit.key];
                const starsCount = unitProg?.stars ?? 0;

                return (
                  <article
                    key={unit.key}
                    className={`bg-white rounded-3xl border border-slate-200 ${unit.theme.borderHover} overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <div className={`bg-gradient-to-br ${unit.color} p-6 text-white`}>
                      <div className="flex items-center justify-between gap-2 text-xs font-bold text-white/90 mb-3">
                        <span>الوحدة {unit.id} · {unit.words.length} كلمة</span>
                        <div className="flex items-center gap-0.5" aria-label={`${starsCount} من 3 نجوم`}>
                          {[1, 2, 3].map((starIdx) => (
                            <Star
                              key={starIdx}
                              size={16}
                              className={
                                starIdx <= starsCount
                                  ? 'fill-amber-300 text-amber-300'
                                  : 'text-white/40'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <h2 className="text-2xl font-black leading-snug">{unit.subtitle}</h2>
                      <p dir="ltr" className="font-english text-sm font-bold text-white/90 mt-1 text-right">
                        {unit.title}
                      </p>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>
                          {unitProg
                            ? `أفضل نتيجة: ${unitProg.bestScore} / ${QUESTIONS_PER_ROUND}`
                            : 'تحدي من 24 سؤالاً'}
                        </span>
                        <span className="text-slate-400">
                          {unit.words.slice(0, 3).map((w) => w.emoji).join(' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => startLesson(unit.key)}
                          className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${unit.color} text-white px-4 py-3 rounded-2xl font-extrabold text-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[44px]`}
                        >
                          <Play size={16} className="fill-current" />
                          <span>ابدئي اللعب</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openVocabExplorer(unit.key)}
                          className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-2xl font-bold text-sm transition-colors cursor-pointer min-h-[44px] whitespace-nowrap shrink-0"
                        >
                          <BookOpen size={16} />
                          <span>الكلمات</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>
        )}

        {currentScreen === 'VOCAB' && activeUnit && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1">
                  قاموس الوحدة {activeUnit.id} · {activeUnit.words.length} كلمة
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {activeUnit.subtitle}{' '}
                  <span dir="ltr" className="font-english text-lg font-bold text-slate-400 mr-2">
                    ({activeUnit.title})
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={goHome}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer min-h-[44px]"
                >
                  <Home size={18} />
                  <span>الوحدات</span>
                </button>
                <button
                  type="button"
                  onClick={() => startLesson(activeUnit.key)}
                  className={`flex items-center gap-2 bg-gradient-to-r ${activeUnit.color} text-white px-5 py-2.5 rounded-xl font-extrabold text-sm hover:opacity-95 transition-opacity cursor-pointer min-h-[44px]`}
                >
                  <Play size={16} className="fill-current" />
                  <span>ابدئي التحدي الآن</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {activeUnit.words.map((item) => (
                <button
                  key={item.word}
                  type="button"
                  onClick={() => speakWord(item.word)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md p-4 flex flex-col items-center text-center gap-2 transition-all active:scale-95 cursor-pointer group"
                >
                  <span className="text-5xl leading-none py-1 group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </span>
                  <span dir="ltr" className="font-english text-xl font-extrabold text-slate-900 mt-1">
                    {item.word}
                  </span>
                  <span className="text-sm font-bold text-slate-500">{item.translation}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-sky-600">
                    <Volume2 size={14} />
                    <span>استمعي</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentScreen === 'GAME' && activeUnit && currentWord && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Game HUD */}
            <div className="bg-white rounded-2xl border border-slate-200 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={goHome}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm transition-colors cursor-pointer min-h-[40px]"
                >
                  <Home size={18} />
                  <span>الرئيسية</span>
                </button>
                <span className="hidden sm:inline text-sm font-extrabold text-slate-700">
                  {activeUnit.subtitle}
                </span>
              </div>

              <div className="flex-1 max-w-xs hidden sm:block">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${activeUnit.color} transition-all duration-300 rounded-full`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm font-extrabold tabular-nums">
                <div className="flex items-center gap-1.5 text-amber-600">
                  <Star size={18} className="fill-amber-400 text-amber-500" />
                  <span>النقاط: {score}</span>
                </div>
                <span className="text-slate-300" aria-hidden="true">|</span>
                <div className="text-slate-700">
                  السؤال {questionsPlayed + 1} / {QUESTIONS_PER_ROUND}
                </div>
              </div>
            </div>

            {/* Active Question Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-10 text-center relative min-h-[480px] flex flex-col justify-center overflow-hidden">
              <AnimatePresence>
                {showCelebration && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-6"
                  >
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                      className="text-7xl sm:text-8xl mb-4"
                    >
                      {currentWord.emoji}
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.04 }}
                      className="text-4xl sm:text-5xl font-black text-emerald-600 mb-3"
                    >
                      أحسنتِ!
                    </motion.div>
                    <motion.div
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.22, delay: 0.08 }}
                      className="flex items-center gap-3 text-xl font-bold text-slate-700"
                    >
                      <span dir="ltr" className="font-english text-2xl font-black text-slate-900">
                        {currentWord.word}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{currentWord.translation}</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {wrongMessage && !showCelebration && (
                <div
                  role="status"
                  className="mb-4 text-sm font-bold text-rose-600"
                >
                  {wrongMessage}
                </div>
              )}

              {/* Activity 1: FIND_PICTURE */}
              {gameType === 'FIND_PICTURE' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6">
                    أين الصورة الصحيحة؟
                  </h2>
                  <button
                    type="button"
                    onClick={() => speakWord(currentWord.word)}
                    className="mx-auto mb-8 bg-indigo-50 text-indigo-700 px-7 py-3.5 rounded-2xl hover:bg-indigo-100 active:scale-95 transition-all inline-flex items-center justify-center gap-3 border border-indigo-200 cursor-pointer min-h-[48px]"
                  >
                    <Volume2 size={26} />
                    <span className="text-lg sm:text-xl font-extrabold">اسمعي الكلمة</span>
                  </button>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {wordOptions.map((opt) => {
                      const optKey = `fp-${opt.word}`;
                      const isWrong = wrongOptionKey === optKey;
                      return (
                        <button
                          key={opt.word}
                          type="button"
                          onClick={() => handleAnswer(opt.word === currentWord.word, optKey)}
                          className={`text-6xl sm:text-7xl p-6 sm:p-8 rounded-3xl border-2 transition-all aspect-square flex items-center justify-center cursor-pointer active:scale-95 ${
                            isWrong
                              ? 'bg-rose-50 border-rose-300 animate-shake'
                              : 'bg-sky-50/60 border-sky-100 hover:bg-sky-100/70 hover:border-sky-300 hover:-translate-y-1'
                          }`}
                        >
                          {opt.emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activity 2: TICK_WORD */}
              {gameType === 'TICK_WORD' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6">
                    اختاري الكلمة الصحيحة
                  </h2>
                  <button
                    type="button"
                    onClick={() => speakWord(currentWord.word)}
                    title="استمعي للكلمة"
                    className="text-[6.5rem] sm:text-[8.5rem] leading-none mb-10 inline-block hover:scale-105 transition-transform cursor-pointer"
                  >
                    {currentWord.emoji}
                  </button>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                    {wordOptions.map((opt) => {
                      const optKey = `tw-${opt.word}`;
                      const isWrong = wrongOptionKey === optKey;
                      return (
                        <button
                          key={opt.word}
                          type="button"
                          dir="ltr"
                          onClick={() => handleAnswer(opt.word === currentWord.word, optKey)}
                          className={`font-english text-3xl sm:text-4xl font-extrabold px-8 py-6 rounded-3xl border-2 w-full sm:w-64 transition-all cursor-pointer active:scale-95 min-h-[76px] ${
                            isWrong
                              ? 'bg-rose-50 border-rose-300 text-rose-600 animate-shake'
                              : 'bg-white border-slate-200 text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 hover:-translate-y-1'
                          }`}
                        >
                          {opt.word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activity 3: MISSING_SOUND */}
              {gameType === 'MISSING_SOUND' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6">
                    ما هو الحرف الناقص؟
                  </h2>
                  <button
                    type="button"
                    onClick={() => speakWord(currentWord.word)}
                    aria-label="استمعي للكلمة"
                    className="mx-auto mb-8 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl hover:bg-indigo-100 border border-indigo-200 inline-flex items-center gap-2 font-bold cursor-pointer min-h-[44px]"
                  >
                    <Volume2 size={24} />
                    <span>استمعي للصوت</span>
                  </button>
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-10 mb-10">
                    <div className="text-7xl sm:text-8xl leading-none">{currentWord.emoji}</div>
                    <div
                      dir="ltr"
                      className="font-english text-5xl sm:text-6xl font-black text-slate-900 tracking-[0.14em] bg-slate-50 px-8 py-5 rounded-3xl border-2 border-dashed border-slate-300"
                    >
                      <span className="text-rose-500 border-b-4 border-rose-500 px-2 mr-1">_</span>
                      {currentWord.word.slice(1)}
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 sm:gap-6" dir="ltr">
                    {letterOptions.map((letter) => {
                      const optKey = `ms-${letter}`;
                      const isWrong = wrongOptionKey === optKey;
                      const isCorrectLetter =
                        letter.toLowerCase() === currentWord.word.charAt(0).toLowerCase();
                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => handleAnswer(isCorrectLetter, optKey)}
                          className={`font-english text-4xl sm:text-5xl font-black w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                            isWrong
                              ? 'bg-rose-100 border-rose-400 text-rose-700 animate-shake'
                              : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                          }`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activity 4: STARTS_WITH */}
              {gameType === 'STARTS_WITH' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-8">
                    أي صورة تبدأ بهذا الحرف؟
                  </h2>
                  <div
                    dir="ltr"
                    className="font-english text-6xl sm:text-7xl font-black text-amber-600 mb-10 bg-amber-50 w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-3xl flex items-center justify-center border-2 border-amber-200"
                  >
                    {currentWord.word.charAt(0).toUpperCase()}
                    {currentWord.word.charAt(0).toLowerCase()}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                    {wordOptions.map((opt) => {
                      const optKey = `sw-${opt.word}`;
                      const isWrong = wrongOptionKey === optKey;
                      return (
                        <button
                          key={opt.word}
                          type="button"
                          onClick={() => handleAnswer(opt.word === currentWord.word, optKey)}
                          className={`text-6xl sm:text-7xl p-6 rounded-3xl border-2 aspect-square flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                            isWrong
                              ? 'bg-rose-50 border-rose-300 animate-shake'
                              : 'bg-white border-slate-200 hover:bg-amber-50 hover:border-amber-300 hover:-translate-y-1'
                          }`}
                        >
                          {opt.emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activity 5: UNSCRAMBLE */}
              {gameType === 'UNSCRAMBLE' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
                    رتّبي الحروف لتكوين الكلمة
                  </h2>
                  <p className="text-slate-500 mb-6 text-sm font-semibold">
                    اضغطي على الحرف لإرجاعه إذا أردتِ تغييره
                  </p>

                  <div className="flex items-center justify-center gap-4 mb-8">
                    <span className="text-7xl sm:text-8xl leading-none">{currentWord.emoji}</span>
                    <button
                      type="button"
                      onClick={() => speakWord(currentWord.word)}
                      aria-label="اسمعي الكلمة"
                      className="p-3.5 rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 cursor-pointer"
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>

                  <div
                    dir="ltr"
                    className={`flex justify-center gap-2.5 sm:gap-3 mb-8 min-h-[76px] flex-wrap px-2 ${
                      wrongOptionKey === 'unscramble' ? 'animate-shake' : ''
                    }`}
                  >
                    {Array.from({ length: currentWord.word.length }).map((_, i) => {
                      const placed = userSpelled[i];
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={!placed}
                          onClick={() => placed && handleRemoveSpelledLetter(placed)}
                          className={`font-english w-14 h-16 sm:w-18 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-3xl sm:text-4xl font-black transition-all ${
                            placed
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-rose-50 hover:border-rose-400 hover:text-rose-600 cursor-pointer'
                              : 'border-dashed border-slate-300 bg-slate-50 cursor-default'
                          }`}
                        >
                          {placed?.char ?? ''}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    dir="ltr"
                    className="flex justify-center gap-3 sm:gap-4 flex-wrap max-w-xl mx-auto px-2"
                  >
                    {scrambledWord.map((letter) => (
                      <button
                        key={letter.id}
                        type="button"
                        onClick={() => handleSpelling(letter)}
                        className="font-english w-14 h-16 sm:w-18 sm:h-20 bg-sky-500 text-white rounded-2xl text-3xl sm:text-4xl font-black hover:bg-sky-400 active:translate-y-1 transition-all shadow-[0_5px_0_0_#0284c7] active:shadow-none cursor-pointer"
                      >
                        {letter.char}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity 6: READ_CIRCLE */}
              {gameType === 'READ_CIRCLE' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-8">
                    اقرأي واختاري الصورة
                  </h2>
                  <div
                    dir="ltr"
                    className="font-english text-5xl sm:text-6xl font-black text-slate-900 tracking-[0.06em] bg-slate-50 px-10 py-6 rounded-3xl border-2 border-slate-200 inline-block mb-10"
                  >
                    {currentWord.word}
                  </div>
                  <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto">
                    {wordOptions.map((opt) => {
                      const optKey = `rc-${opt.word}`;
                      const isWrong = wrongOptionKey === optKey;
                      return (
                        <button
                          key={opt.word}
                          type="button"
                          onClick={() => handleAnswer(opt.word === currentWord.word, optKey)}
                          className={`text-7xl sm:text-8xl p-8 rounded-3xl border-2 aspect-square flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                            isWrong
                              ? 'bg-rose-50 border-rose-300 animate-shake'
                              : 'bg-sky-50/40 border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:scale-[1.03]'
                          }`}
                        >
                          {opt.emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activity 7: MATCH_LETTER */}
              {gameType === 'MATCH_LETTER' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-8">
                    صِلي الحرف بالصورة المناسبة
                  </h2>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                    <div className="flex flex-col items-center gap-4">
                      <div
                        dir="ltr"
                        className="font-english text-[5.5rem] sm:text-[7rem] font-black text-white bg-gradient-to-br from-rose-500 to-pink-600 w-36 h-36 sm:w-44 sm:h-44 rounded-3xl flex items-center justify-center shadow-md shrink-0"
                      >
                        {currentWord.word.charAt(0).toUpperCase()}
                      </div>
                      <button
                        type="button"
                        onClick={() => speakWord(currentWord.word)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl cursor-pointer"
                      >
                        <Volume2 size={16} />
                        <span>اسمعي الكلمة</span>
                      </button>
                    </div>

                    <ChevronLeft className="hidden md:block text-slate-300 shrink-0" size={40} />

                    <div className="grid grid-cols-2 gap-4 w-full max-w-xs sm:max-w-sm">
                      {wordOptions.map((opt) => {
                        const optKey = `ml-${opt.word}`;
                        const isWrong = wrongOptionKey === optKey;
                        return (
                          <button
                            key={opt.word}
                            type="button"
                            onClick={() => handleAnswer(opt.word === currentWord.word, optKey)}
                            className={`text-6xl sm:text-7xl p-6 rounded-3xl border-2 aspect-square flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                              isWrong
                                ? 'bg-rose-50 border-rose-300 animate-shake'
                                : 'bg-slate-50 border-slate-200 hover:bg-rose-50 hover:border-rose-300 hover:-translate-y-1'
                            }`}
                          >
                            {opt.emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Activity 8: LOOK_WRITE */}
              {gameType === 'LOOK_WRITE' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6">
                    انظري واختاري الكلمة
                  </h2>
                  <button
                    type="button"
                    onClick={() => speakWord(currentWord.word)}
                    title="استمعي للكلمة"
                    className="text-[6.5rem] sm:text-[8.5rem] leading-none mb-10 inline-block hover:scale-105 transition-transform cursor-pointer"
                  >
                    {currentWord.emoji}
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                    {wordOptions.map((opt) => {
                      const optKey = `lw-${opt.word}`;
                      const isWrong = wrongOptionKey === optKey;
                      return (
                        <button
                          key={opt.word}
                          type="button"
                          dir="ltr"
                          onClick={() => handleAnswer(opt.word === currentWord.word, optKey)}
                          className={`font-english text-2xl sm:text-3xl font-extrabold p-5 rounded-2xl border-2 w-full transition-all cursor-pointer active:scale-95 min-h-[68px] ${
                            isWrong
                              ? 'bg-rose-50 border-rose-300 text-rose-600 animate-shake'
                              : 'bg-white border-slate-200 text-slate-800 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300'
                          }`}
                        >
                          {opt.word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentScreen === 'SUMMARY' && activeUnit && (
          <div className="max-w-3xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-8 sm:p-10 text-center space-y-8">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                <Award size={36} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
                أنهيتِ وحدة {activeUnit.subtitle}!
              </h1>
              <p className="text-base font-bold text-slate-500">
                نتيجتك النهائية في التحدي
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((starIdx) => {
                const earned = starIdx <= calculateStars(score, QUESTIONS_PER_ROUND);
                return (
                  <Star
                    key={starIdx}
                    size={44}
                    className={
                      earned
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-200'
                    }
                  />
                );
              })}
            </div>

            <div className="inline-flex items-center gap-6 bg-slate-50 border border-slate-200 rounded-2xl px-8 py-4 tabular-nums">
              <div>
                <div className="text-xs font-bold text-slate-500">النقاط</div>
                <div className="text-3xl font-black text-slate-900">
                  {score} / {QUESTIONS_PER_ROUND}
                </div>
              </div>
              <span className="h-10 w-px bg-slate-200" aria-hidden="true" />
              <div>
                <div className="text-xs font-bold text-slate-500">الدقة</div>
                <div className="text-3xl font-black text-emerald-600">
                  {Math.round((score / QUESTIONS_PER_ROUND) * 100)}%
                </div>
              </div>
            </div>

            {practicedWords.length > 0 && (
              <div className="text-right space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>الكلمات التي تدربتِ عليها (اضغطي للاستماع):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {practicedWords.map((w) => (
                    <button
                      key={w.word}
                      type="button"
                      onClick={() => speakWord(w.word)}
                      className="inline-flex items-center gap-2 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <span>{w.emoji}</span>
                      <span dir="ltr" className="font-english font-extrabold text-slate-900">
                        {w.word}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span>{w.translation}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => startLesson(activeUnit.key)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r ${activeUnit.color} text-white px-7 py-3.5 rounded-2xl font-extrabold text-base hover:opacity-95 transition-opacity cursor-pointer min-h-[48px]`}
              >
                <RotateCcw size={18} />
                <span>العب مجدداً</span>
              </button>
              <button
                type="button"
                onClick={goHome}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-7 py-3.5 rounded-2xl font-extrabold text-base transition-colors cursor-pointer min-h-[48px]"
              >
                <Home size={18} />
                <span>العودة للوحدات</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
