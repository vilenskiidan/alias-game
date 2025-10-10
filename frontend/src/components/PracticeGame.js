// frontend/src/components/PracticeGame.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';

// Hardcoded explanations for MVP - we'll replace this with AI later
const PRACTICE_WORDS = [
  {
    word: "חתול",
    explanations: [
      "בעל חיים שאוהב לטפס על עצים", // Hard
      "בעל חיים בבית שאומר מיאו", // Medium  
      "חיית מחמד שצדה עכברים" // Easy
    ]
  },
  {
    word: "שמש",
    explanations: [
      "מקור האנרגיה של כדור הארץ",
      "הכוכב שנותן לנו אור ביום",
      "צהוב, חם, זורח בשמיים"
    ]
  },
  {
    word: "מכונית", 
    explanations: [
      "כלי תחבורה עם מנוע בעירה פנימית",
      "רכב עם ארבעה גלגלים ומנוע",
      "מה שנוסעים בו על הכביש"
    ]
  },
  {
    word: "ספר",
    explanations: [
      "אוסף דפים כרוכים עם תוכן כתוב",
      "דבר שקורים בו סיפורים ומידע",
      "מה שלומדים ממנו בבית ספר"
    ]
  },
  {
    word: "עץ",
    explanations: [
      "אורגניזם רב-שנתי עם גזע ועלים",
      "צמח גבוה עם ענפים וגזע",
      "ירוק, גבוה, גדל ביער"
    ]
  },
  {
    word: "טלפון",
    explanations: [
      "מכשיר תקשורת אלקטרוני נייד",
      "מכשיר שמדברים בו למרחקים",
      "מה שמתקשרים בו לחברים"
    ]
  },
  {
    word: "מים",
    explanations: [
      "H2O במצב נוזלי",
      "נוזל שותים כשצמאים",
      "מה שזורם מהברז"
    ]
  },
  {
    word: "לחם",
    explanations: [
      "מוצר אפייה מקמח חיטה מותסס",
      "מזון בסיסי שאופים בתנור",
      "מה שאוכלים עם חמאה לארוחת בוקר"
    ]
  },
  {
    word: "כדור",
    explanations: [
      "עצם גיאומטרי תלת-ממדי עגול",
      "צורה עגולה ששוחקים בה",
      "עגול, קופץ, משחק איתו"
    ]
  },
  {
    word: "בית",
    explanations: [
      "מבנה מגורים עם קירות וגג",
      "מקום שגרים בו משפחות",
      "איפה שחוזרים לישון בלילה"
    ]
  }
];

const PracticeGame = ({ onFinish, onBack }) => {
  const { language } = useLanguage();
  const [gameState, setGameState] = useState({
    isPlaying: false,
    timeLeft: 60,
    score: 0,
    streak: 0,
    currentWordIndex: 0,
    currentExplanationLevel: 0, // 0=hard, 1=medium, 2=easy
    explanationStartTime: 0,
    wordsUsed: [],
    currentGuess: '',
    showResult: false,
    lastGuessCorrect: null
  });

  // Shuffle words at game start
  const [shuffledWords, setShuffledWords] = useState([]);

  useEffect(() => {
    // Shuffle words when component mounts using Fisher-Yates algorithm
    const shuffle = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    setShuffledWords(shuffle(PRACTICE_WORDS));
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState.isPlaying && gameState.timeLeft > 0) {
      interval = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            // Game over
            onFinish({
              score: prev.score,
              wordsAttempted: prev.wordsUsed.length,
              totalTime: 60
            });
            return { ...prev, timeLeft: 0, isPlaying: false };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.timeLeft, onFinish]);

  // Explanation progression effect
  useEffect(() => {
    let timeout;
    if (gameState.isPlaying && gameState.currentExplanationLevel < 2) {
      timeout = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          currentExplanationLevel: Math.min(2, prev.currentExplanationLevel + 1)
        }));
      }, 15000); // 15 seconds between explanation levels
    }
    return () => clearTimeout(timeout);
  }, [gameState.currentExplanationLevel, gameState.explanationStartTime, gameState.isPlaying]);

  const startGame = () => {
    setGameState({
      isPlaying: true,
      timeLeft: 60,
      score: 0,
      streak: 0,
      currentWordIndex: 0,
      currentExplanationLevel: 0,
      explanationStartTime: Date.now(),
      wordsUsed: [],
      currentGuess: '',
      showResult: false,
      lastGuessCorrect: null
    });
  };

  const submitGuess = () => {
    if (!gameState.currentGuess.trim()) return;

    const currentWord = shuffledWords[gameState.currentWordIndex];
    const isCorrect = gameState.currentGuess.trim().toLowerCase() === currentWord.word.toLowerCase();
    
    let points = 0;
    if (isCorrect) {
      // Calculate points based on explanation level when guessed
      if (gameState.currentExplanationLevel === 0) points = 3; // Hard
      else if (gameState.currentExplanationLevel === 1) points = 2; // Medium
      else points = 1; // Easy
      
      // Streak bonus
      if (gameState.streak >= 3) points += 1;
    }

    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      streak: isCorrect ? prev.streak + 1 : 0,
      wordsUsed: [...prev.wordsUsed, {
        word: currentWord.word,
        guess: prev.currentGuess,
        correct: isCorrect,
        explanationLevel: prev.currentExplanationLevel,
        points
      }],
      showResult: true,
      lastGuessCorrect: isCorrect,
      currentGuess: ''
    }));

    // Show result briefly, then next word
    setTimeout(() => {
      nextWord();
    }, 1500);
  };

  const nextWord = () => {
    const nextIndex = (gameState.currentWordIndex + 1) % shuffledWords.length;
    setGameState(prev => ({
      ...prev,
      currentWordIndex: nextIndex,
      currentExplanationLevel: 0,
      explanationStartTime: Date.now(),
      showResult: false,
      lastGuessCorrect: null
    }));
  };

  const skipWord = () => {
    setGameState(prev => ({
      ...prev,
      streak: 0, // Break streak on skip
      wordsUsed: [...prev.wordsUsed, {
        word: shuffledWords[prev.currentWordIndex].word,
        guess: 'דילוג',
        correct: false,
        explanationLevel: prev.currentExplanationLevel,
        points: 0
      }]
    }));
    nextWord();
  };

  if (shuffledWords.length === 0) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8F3' }}>
      <div className="text-xl" style={{ color: '#6B5D54' }}>{getTranslation(language, 'loading')}</div>
    </div>;
  }

  const currentWord = shuffledWords[gameState.currentWordIndex];
  const currentExplanation = currentWord?.explanations[gameState.currentExplanationLevel];

  if (!gameState.isPlaying) {
    // Start screen
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: '#FFF8F3' }}
      >
        <div className="rounded-3xl p-8 w-full max-w-md shadow-2xl"
          style={{ backgroundColor: '#F5E6D3' }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#6B5D54' }}>
              {getTranslation(language, 'practiceTitle')}
            </h2>
            <p className="mb-6 text-lg leading-relaxed" style={{ color: '#8B6F47' }}>
              {getTranslation(language, 'practiceDescription')}<br/>
              {getTranslation(language, 'practiceTimer')}<br/>
              {getTranslation(language, 'practiceHints')}
            </p>

            <div className="rounded-lg p-4 mb-6 text-sm" style={{ backgroundColor: '#FFF8F3' }}>
              <div className="font-bold mb-2" style={{ color: '#6B5D54' }}>{getTranslation(language, 'scoringSystem')}</div>
              <div className={`space-y-1 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                <div>{getTranslation(language, 'hardExplanation')}</div>
                <div>{getTranslation(language, 'mediumExplanation')}</div>
                <div>{getTranslation(language, 'easyExplanation')}</div>
                <div>{getTranslation(language, 'streakBonus')}</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="w-full text-white py-4 rounded-xl font-bold text-xl mb-4 shadow-lg"
              style={{ backgroundColor: '#A0826D' }}
            >
              {getTranslation(language, 'startPractice')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="w-full text-white py-3 rounded-xl font-medium"
              style={{ backgroundColor: '#8B6F47' }}
            >
              {getTranslation(language, 'backToMenu')}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Game screen
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FFF8F3' }}
    >
      {/* Header with timer and score */}
      <div className="text-center py-6 relative" style={{ color: '#6B5D54' }}>
        <div className="flex justify-between items-center px-6 mb-4">
          <div className="text-2xl font-bold">
            {getTranslation(language, 'score')}: {gameState.score}
          </div>
          <div className="text-2xl font-bold">
            {gameState.timeLeft}s
          </div>
        </div>

        {gameState.streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-4 py-1 rounded-full text-sm font-bold inline-block"
            style={{ backgroundColor: '#F5E6D3', color: '#8B6F47', border: '2px solid #A0826D' }}
          >
            {getTranslation(language, 'streak')} {gameState.streak}
          </motion.div>
        )}

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: '#F5E6D3' }}>
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${(gameState.timeLeft / 60) * 100}%` }}
            className="h-full"
            style={{ backgroundColor: '#A0826D' }}
          />
        </div>
      </div>

      {/* Explanation display */}
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {!gameState.showResult ? (
            <motion.div
              key={`explanation-${gameState.currentWordIndex}-${gameState.currentExplanationLevel}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="rounded-3xl p-8 shadow-2xl max-w-md w-full relative"
              style={{ backgroundColor: '#F5E6D3' }}
            >
              {/* Difficulty indicator */}
              <div className={`absolute top-4 ${language === 'he' ? 'left-4' : 'right-4'}`}>
                <div className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: gameState.currentExplanationLevel === 0 ? '#D4A5A5' :
                                    gameState.currentExplanationLevel === 1 ? '#F5E6D3' :
                                    '#B8D4B8',
                    color: gameState.currentExplanationLevel === 1 ? '#8B6F47' : '#FFF8F3',
                    border: gameState.currentExplanationLevel === 1 ? '2px solid #A0826D' : 'none'
                  }}
                >
                  {gameState.currentExplanationLevel === 0 ? getTranslation(language, 'hard') :
                   gameState.currentExplanationLevel === 1 ? getTranslation(language, 'medium') :
                   getTranslation(language, 'easy')}
                </div>
              </div>

              <div className="text-2xl font-bold text-center mt-6 leading-relaxed" dir="rtl" style={{ color: '#6B5D54' }}>
                {currentExplanation}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="rounded-3xl p-8 shadow-2xl max-w-md w-full text-center border-4"
              style={{
                backgroundColor: '#F5E6D3',
                borderColor: gameState.lastGuessCorrect ? '#B8D4B8' : '#D4A5A5'
              }}
            >
              <div className="text-6xl mb-4"
                style={{ color: gameState.lastGuessCorrect ? '#B8D4B8' : '#D4A5A5' }}
              >
                {gameState.lastGuessCorrect ? '✅' : '❌'}
              </div>
              <div className="text-2xl font-bold mb-2" style={{ color: '#6B5D54' }}>
                {currentWord.word}
              </div>
              {gameState.lastGuessCorrect && (
                <div className="text-lg font-medium" style={{ color: '#8B6F47' }}>
                  +{gameState.wordsUsed[gameState.wordsUsed.length - 1]?.points || 0} {getTranslation(language, 'points')}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input and buttons */}
      {!gameState.showResult && (
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={gameState.currentGuess}
              onChange={(e) => setGameState(prev => ({ ...prev, currentGuess: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
              className="flex-1 p-4 rounded-xl border-2 text-center text-xl font-bold"
              style={{
                borderColor: '#A0826D',
                backgroundColor: '#F5E6D3',
                color: '#6B5D54'
              }}
              placeholder={getTranslation(language, 'yourAnswer')}
              dir={language === 'he' ? 'rtl' : 'ltr'}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={submitGuess}
              disabled={!gameState.currentGuess.trim()}
              className="flex-1 text-white py-4 rounded-xl font-bold text-xl shadow-lg"
              style={{
                backgroundColor: !gameState.currentGuess.trim() ? '#A0826D80' : '#B8D4B8'
              }}
            >
              {getTranslation(language, 'submit')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={skipWord}
              className="flex-1 text-white py-4 rounded-xl font-bold text-xl shadow-lg"
              style={{ backgroundColor: '#D4A5A5' }}
            >
              {getTranslation(language, 'skipWord')}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PracticeGame;