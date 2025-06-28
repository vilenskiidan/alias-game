import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Game Store with local state management
const useGameStore = () => {
  const [gameState, setGameState] = useState({
    teams: [],
    currentTeam: 0,
    gameStarted: false,
    currentScreen: 'home', // 'home', 'game', 'turn', 'end'
    turnScore: 0,
    timeLeft: 60,
    winner: null,
    currentWord: '',
    wordsGuessed: 0,
    wordsSkipped: 0
  });

  // Sample Hebrew words for demo (in production, this would come from Gemini API)
  const sampleWords = [
    'אבטיח', 'אגס', 'אוזן', 'אווירון', 'אוטובוס', 'אוכל', 'אופניים', 'אייל', 'אילנית', 'אמא',
    'אמש', 'אננס', 'אריה', 'אשכולית', 'אש', 'בובה', 'בולען', 'בועה', 'בית חולים', 'בית ספר',
    'בלון', 'ברווז', 'בריכה', 'בשורה', 'גדר', 'גז', 'גזר', 'גלקסיה', 'גרב', 'גרזן',
    'גשם', 'דבורה', 'דג', 'דגל', 'דלת', 'דלי', 'דניס', 'דרך', 'הפתעה', 'הצגה',
    'הר געש', 'הר', 'ואזה', 'וזלין', 'וטרן', 'זבוב', 'זברה', 'זכוכית', 'זמן', 'זנב',
    'חגורה', 'חדר כושר', 'חולצה', 'חול', 'חורף', 'חטיף', 'חלב', 'חמסין', 'חנוכייה', 'חציל',
    'חרב', 'חרמון', 'חתול', 'טלוויזיה', 'טלפון', 'טנא', 'טניס', 'טוסיק', 'טוסט', 'יומן',
    'יונה', 'ים', 'ינשוף', 'ירח', 'כדורגל', 'כדורסל', 'כדור', 'כובע', 'כוכב', 'כולסטרול',
    'כותנה', 'כינור', 'כיתה', 'כפכף', 'כרית', 'לב', 'לבנה', 'לוח שנה', 'לחם', 'לימון',
    'לילה', 'ליצן', 'לשון', 'מגבת', 'מגן דוד', 'מדורה', 'מזגן', 'מזרן', 'מטחנה', 'מטרייה',
    'מכונית', 'מכנסיים', 'מלפפון', 'מלקחיים', 'מנגינה', 'מסך', 'מסיבה', 'מסעדה', 'מעגל', 'מעיל',
    'מפל', 'מפת שולחן', 'מצנח', 'מצרך', 'מקבוק', 'מרפק', 'מרתון', 'משאית', 'משקפת', 'מתנה',
    'נחש', 'נסיעה', 'נעל', 'נר', 'נשר', 'נתב"ג', 'סבון', 'סדין', 'סוכה', 'סכין',
    'סל', 'סלט', 'סלע', 'סנאי', 'סנדוויץ', 'ספל', 'ספרייה', 'סרגל', 'סתיו', 'עגבנייה',
    'עוגה', 'עוף', 'עורב', 'עזה', 'עין', 'עיפרון', 'עיתון', 'עלה', 'עסק', 'עץ דקל',
    'עץ', 'פחית', 'פיל', 'פיצה', 'פלפל', 'פסל', 'פסטה', 'פקק', 'פנס', 'פנים',
    'פסטיבל', 'פרגולה', 'פרח', 'פרפר', 'פרצוף', 'ציפור', 'צוק', 'צוללת', 'צחוק', 'צבע',
    'צדף', 'צמח', 'צמיד', 'צנצנת', 'צפרדע', 'קוביה', 'קולנוע', 'קור', 'קטן', 'קיר',
    'קשת', 'קלמר', 'קניון', 'קפיץ', 'קפה', 'קש', 'קצת', 'ראש', 'רוח', 'ריח',
    'ריקוד', 'רמזור', 'רמקול', 'רעש', 'רפסודה', 'רפסיה', 'רכב', 'רעב', 'ריצה', 'רכבת',
    'רמפה', 'רעיון', 'שאול', 'שוקולד', 'שולחן', 'שועל', 'שוק', 'שופר', 'שיער', 'שטר',
    'שמשיה', 'שמש', 'שן', 'שנה', 'שניצל', 'שעון', 'שפם', 'שפן', 'שקד', 'שקית',
    'שרוך', 'שש בש', 'שתייה', 'תאנה', 'תבור', 'תאטרון', 'תבשיל', 'תג', 'תיק', 'תינוק',
    'תמר', 'תמונה', 'תנין', 'תנור', 'תקרה', 'תקווה', 'תרמוס', 'תרנגול',
    'עגיל', 'גרביל', 'בת יענה', 'ארון', 'אגם', 'נדנדה', 'רשת', 'גרביים', 'פרחים', 'משקוף',
    'חריצים', 'כיסא', 'נעליים', 'מדפים', 'משקפיים', 'צומת', 'מראה', 'מדרגות', 'ספר', 'קפץ',
    'שקע', 'עיגול', 'כספומט', 'נודניק', 'מגנט', 'יהלום', 'להב', 'לצייר', 'שימוע', 'מנדרינה',
    'רומניה', 'מחוג', 'גומי', 'דקה', 'גירפה', 'קשיש', 'רקדנית', 'קרם', 'להרוס',
    'דריכה', 'מקפצה', 'ידיים', 'ציפורניים', 'שמיכה'
];

  const addTeam = (name, color) => {
    setGameState(prev => ({
      ...prev,
      teams: [...prev.teams, { name, color, position: 0, id: prev.teams.length, totalScore: 0 }]
    }));
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, gameStarted: true, currentScreen: 'game' }));
  };

  const startTurn = (teamId) => {
    const randomWord = sampleWords[Math.floor(Math.random() * sampleWords.length)];
    setGameState(prev => ({ 
      ...prev, 
      currentTeam: teamId, 
      currentScreen: 'turn',
      turnScore: 0,
      timeLeft: 60,
      currentWord: randomWord,
      wordsGuessed: 0,
      wordsSkipped: 0
    }));
  };

  const getNewWord = () => {
    const randomWord = sampleWords[Math.floor(Math.random() * sampleWords.length)];
    setGameState(prev => ({ ...prev, currentWord: randomWord }));
  };

  const handleGotIt = () => {
    setGameState(prev => ({
      ...prev,
      turnScore: prev.turnScore + 1,
      wordsGuessed: prev.wordsGuessed + 1
    }));
    getNewWord();
  };

  const handleSkip = () => {
    setGameState(prev => ({
      ...prev,
      turnScore: prev.turnScore - 1,
      wordsSkipped: prev.wordsSkipped + 1
    }));
    getNewWord();
  };

  const endTurn = () => {
    setGameState(prev => {
      const newTeams = [...prev.teams];
      const newPosition = Math.max(0, Math.min(30, newTeams[prev.currentTeam].position + prev.turnScore));
      newTeams[prev.currentTeam].position = newPosition;
      newTeams[prev.currentTeam].totalScore += prev.turnScore;
      
      const winner = newTeams.find(team => team.position >= 30);
      
      return {
        ...prev,
        teams: newTeams,
        currentScreen: winner ? 'end' : 'game',
        winner: winner?.name || null,
        currentTeam: (prev.currentTeam + 1) % prev.teams.length
      };
    });
  };

  const setTimeLeft = (time) => {
    setGameState(prev => ({ ...prev, timeLeft: time }));
  };

  const resetGame = () => {
    setGameState({
      teams: [],
      currentTeam: 0,
      gameStarted: false,
      currentScreen: 'home',
      turnScore: 0,
      timeLeft: 60,
      winner: null,
      currentWord: '',
      wordsGuessed: 0,
      wordsSkipped: 0
    });
  };

  return {
    gameState,
    addTeam,
    startGame,
    startTurn,
    endTurn,
    handleGotIt,
    handleSkip,
    setTimeLeft,
    resetGame
  };
};

// Home Screen Component
const HomeScreen = ({ gameStore }) => {
  const [teamName, setTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const handleAddTeam = () => {
    if (teamName.trim() && gameStore.gameState.teams.length < 4) {
      gameStore.addTeam(teamName.trim(), selectedColor);
      setTeamName('');
      setSelectedColor(colors[gameStore.gameState.teams.length + 1] || colors[0]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 flex flex-col items-center justify-center"
    >
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <motion.h1 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold text-center mb-8 text-gray-800"
        >
          🎯 אליאס
        </motion.h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-right text-lg font-medium text-gray-700 mb-2">
              שם הקבוצה
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTeam()}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-right focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="תבחרו שם לקבוצה"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-right text-lg font-medium text-gray-700 mb-2">
              צבע הקבוצה
            </label>
            <div className="flex justify-center gap-2 flex-wrap">
              {colors.map(color => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${
                    selectedColor === color ? 'border-gray-800 shadow-lg' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddTeam}
            disabled={!teamName.trim() || gameStore.gameState.teams.length >= 4}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium text-lg disabled:bg-gray-400 hover:bg-purple-700 transition-colors"
          >
            הוסף קבוצה ({gameStore.gameState.teams.length}/4)
          </motion.button>

          <AnimatePresence>
            {gameStore.gameState.teams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <h3 className="text-right font-medium text-gray-700">קבוצות רשומות:</h3>
                {gameStore.gameState.teams.map((team, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-end gap-2 p-3 bg-gray-100 rounded-lg"
                  >
                    <span className="text-right font-medium">{team.name}</span>
                    <div 
                      className="w-5 h-5 rounded-full shadow-sm" 
                      style={{ backgroundColor: team.color }}
                    ></div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {gameStore.gameState.teams.length >= 2 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={gameStore.startGame}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              🚀 התחל משחק!
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Game Board Component
const GameBoard = ({ gameStore }) => {
  const dots = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-3xl font-bold text-white text-center mb-6"
        >
          🏁 לוח המשחק
        </motion.h2>
        
        {/* Game Tracks */}
        <div className="space-y-6 mb-8">
          {gameStore.gameState.teams.map((team, teamIndex) => (
            <motion.div 
              key={team.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: teamIndex * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center text-white font-bold" 
                    style={{ backgroundColor: team.color }}
                  >
                    {teamIndex + 1}
                  </div>
                  <div>
                    <span className="font-bold text-lg">{team.name}</span>
                    <div className="text-sm text-gray-600">
                      מיקום: {team.position}/30 | ניקוד כולל: {team.totalScore || 0}
                    </div>
                  </div>
                </div>
                {gameStore.gameState.currentTeam === team.id && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="bg-yellow-400 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold"
                  >
                    תור נוכחי
                  </motion.div>
                )}
              </div>
              
              {/* Track */}
              <div className="relative mb-2">
                <div className="flex gap-1 flex-wrap">
                  {dots.map((dot, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        index < team.position 
                          ? 'border-green-500 bg-green-500 shadow-sm' 
                          : 'border-gray-300 bg-white'
                      } ${index === 29 ? 'border-yellow-500 bg-yellow-400' : ''}`}
                    />
                  ))}
                </div>
                
                {/* Pawn */}
                {team.position > 0 && (
                  <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: Math.min((team.position - 1) * 20, 580) }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="absolute -top-3 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-lg border-2 border-white"
                    style={{ backgroundColor: team.color }}
                  >
                    🎯
                  </motion.div>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(team.position / 30) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Turn Buttons */}
        <div className="space-y-3">
          {gameStore.gameState.teams.map((team, index) => (
            <motion.button
              key={team.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => gameStore.startTurn(team.id)}
              className="w-full py-4 rounded-xl font-bold text-xl text-white shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: team.color }}
            >
               תור של {team.name}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Turn Screen Component
const TurnScreen = ({ gameStore }) => {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          gameStore.endTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStore]);

  const currentTeam = gameStore.gameState.teams[gameStore.gameState.currentTeam];
  const progress = ((60 - timeLeft) / 60) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: currentTeam?.color || '#3B82F6' }}
    >
      {/* Header */}
      <div className="text-center py-6 text-white relative">
        <motion.h2 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-2xl font-bold"
        >
          🎯 {currentTeam?.name}
        </motion.h2>
        
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={`text-7xl font-bold mt-2 ${timeLeft <= 10 ? 'text-red-200' : ''}`}
        >
          {timeLeft}
        </motion.div>
        
        <div className="mt-4 space-y-2">
          <div className="text-lg">
            ניקוד: <span className="font-bold">{gameStore.gameState.turnScore}</span>
          </div>
          <div className="text-sm flex justify-center gap-4">
            <span>✓ {gameStore.gameState.wordsGuessed}</span>
            <span>✗ {gameStore.gameState.wordsSkipped}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-white"
          />
        </div>
      </div>

      {/* Word Display */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          key={gameStore.gameState.currentWord}
          initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
            animate={{ x: [-200, 400], opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
          <div className="text-5xl font-bold text-center text-gray-800 relative z-10" dir="rtl">
            {gameStore.gameState.currentWord || 'מילה'}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={gameStore.handleGotIt}
          className="w-full bg-green-500 text-white py-6 rounded-2xl font-bold text-2xl shadow-lg active:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <span className="text-3xl">✓</span>
          הבא
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={gameStore.handleSkip}
          className="w-full bg-red-500 text-white py-6 rounded-2xl font-bold text-2xl shadow-lg active:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <span className="text-3xl">✗</span>
          דלג
        </motion.button>
      </div>
    </motion.div>
  );
};

// End Screen Component
const EndScreen = ({ gameStore }) => {
  const winnerTeam = gameStore.gameState.teams.find(t => t.name === gameStore.gameState.winner);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-center">
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">🎉 מזל טוב!</h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {winnerTeam && (
              <div 
                className="w-6 h-6 rounded-full" 
                style={{ backgroundColor: winnerTeam.color }}
              />
            )}
            <p className="text-xl text-gray-600">
              {gameStore.gameState.winner} ניצחה!
            </p>
          </div>
          
          {/* Game Statistics */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-700 mb-2">סיכום המשחק</h3>
            <div className="space-y-1 text-sm">
              {gameStore.gameState.teams
                .sort((a, b) => b.position - a.position)
                .map((team, index) => (
                <div key={team.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}</span>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: team.color }}
                    />
                    <span>{team.name}</span>
                  </div>
                  <span className="font-bold">{team.position}/30</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={gameStore.resetGame}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-blue-700 transition-colors shadow-lg"
        >
          🔄 משחק חדש
        </motion.button>
      </div>
    </motion.div>
  );
};

// Main App Component
const AliasGame = () => {
  const gameStore = useGameStore();

  const renderScreen = () => {
    switch (gameStore.gameState.currentScreen) {
      case 'home':
        return <HomeScreen gameStore={gameStore} />;
      case 'game':
        return <GameBoard gameStore={gameStore} />;
      case 'turn':
        return <TurnScreen gameStore={gameStore} />;
      case 'end':
        return <EndScreen gameStore={gameStore} />;
      default:
        return <HomeScreen gameStore={gameStore} />;
    }
  };

  return (
    <div className="font-sans select-none">
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
};

export default AliasGame;
