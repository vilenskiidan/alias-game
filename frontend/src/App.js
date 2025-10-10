import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { getTranslation } from './locales/translations';
import { useWordPool } from './locales/words';
import LanguageToggle from './components/LanguageToggle';
import PracticeGame from './components/PracticeGame';
import { PracticeResults, Leaderboard } from './components/PracticeResults';

const DEFAULT_GAME_SETTINGS = Object.freeze({
  winningPosition: 30,
  turnDuration: 60
});

const createInitialState = (overrides = {}) => {
  const { gameSettings = {}, ...rest } = overrides;
  return {
    gameId: null,
    teams: [],
    currentTeam: 0,
    gameStarted: false,
    currentScreen: 'home',
    turnScore: 0,
    timeLeft: DEFAULT_GAME_SETTINGS.turnDuration,
    winner: null,
    currentWord: '',
    wordsGuessed: 0,
    wordsSkipped: 0,
    practiceResults: null,
    gameOver: false,
    finalRoundTurns: null,
    finalRoundLeaderId: null,
    startingTeamId: null,
    gameSettings: { ...DEFAULT_GAME_SETTINGS, ...gameSettings },
    ...rest
  };
};

const loadPersistedState = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem('aliasGameState');
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return createInitialState(parsed || {});
  } catch (error) {
    console.warn('Failed to load saved game state:', error);
    return null;
  }
};

// Updated useGameStore hook with timer fix
const generateGameId = () => `game_${Date.now()}`;

const useGameStore = () => {
  const { language } = useLanguage();
  const wordPool = useWordPool(language);
  const {
    ensureReady,
    getCurrentWord,
    getNextWord,
    initializeWords,
    isLoading: wordPoolLoading,
    isReady: wordPoolReady,
    error: wordPoolError
  } = wordPool;

  const [gameState, setGameState] = useState(() => loadPersistedState() || createInitialState());
  const saveTimerRef = useRef(null);

  // Persist state with a short debounce to avoid hammering localStorage
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      window.localStorage.setItem('aliasGameState', JSON.stringify(gameState));
    }, 250);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [gameState]);

  // Ensure the word pool is ready when the language changes
  useEffect(() => {
    ensureReady();
  }, [ensureReady]);

  // CLIENT-SIDE FUNCTIONS (All instant!)
  const createNewGame = useCallback(() => {
    const gameId = generateGameId();
    setGameState(() => createInitialState({ gameId }));
    return gameId;
  }, []);

  const addTeam = useCallback((name, color) => {
    setGameState(prev => {
      const existingTeams = Array.isArray(prev.teams) ? prev.teams : [];
      const newTeam = {
        id: existingTeams.length,
        name,
        color,
        position: 0,
        totalScore: 0,
        lastTurnScore: 0,
        turnsPlayed: 0
      };

      return {
        ...prev,
        gameId: prev.gameId || generateGameId(),
        teams: [...existingTeams, newTeam]
      };
    });
  }, []);

  const startGame = useCallback(async () => {
    await ensureReady();
    const initialWord = getCurrentWord() || getNextWord() || '';
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      currentScreen: 'game',
      currentTeam: 0,
      turnScore: 0,
      wordsGuessed: 0,
      wordsSkipped: 0,
      currentWord: initialWord,
      timeLeft: prev.gameSettings.turnDuration,
      winner: null,
      gameOver: false,
      finalRoundTurns: null,
      finalRoundLeaderId: null,
      startingTeamId: null  // Will be set when first turn is taken
    }));
  }, [ensureReady, getCurrentWord, getNextWord]);

  const startTurn = useCallback(async (teamIndex) => {
    if (gameState.gameOver) {
      return;
    }
    await ensureReady();
    const startingWord = getCurrentWord() || getNextWord() || '';

    setGameState(prev => {
      if (prev.gameOver) {
        return prev;
      }

      // Set starting team on first turn
      const isFirstTurn = prev.startingTeamId === null;
      const newStartingTeamId = isFirstTurn ? prev.teams[teamIndex]?.id : prev.startingTeamId;

      return {
        ...prev,
        currentTeam: teamIndex,
        currentScreen: 'turn',
        turnScore: 0,
        timeLeft: prev.gameSettings.turnDuration,
        wordsGuessed: 0,
        wordsSkipped: 0,
        currentWord: startingWord,
        startingTeamId: newStartingTeamId
      };
    });
  }, [ensureReady, getCurrentWord, getNextWord, gameState.gameOver]);

  const handleGotIt = useCallback(() => {
    if (gameState.gameOver) {
      return;
    }
    const nextWord = getNextWord() || '';
    setGameState(prev => {
      if (prev.gameOver) {
        return prev;
      }
      return {
        ...prev,
        turnScore: prev.turnScore + 1,
        wordsGuessed: prev.wordsGuessed + 1,
        currentWord: nextWord
      };
    });
  }, [getNextWord, gameState.gameOver]);

  const handleSkip = useCallback(() => {
    if (gameState.gameOver) {
      return;
    }
    const nextWord = getNextWord() || '';
    setGameState(prev => {
      if (prev.gameOver) {
        return prev;
      }
      return {
        ...prev,
        turnScore: Math.max(0, prev.turnScore - 1),
        wordsSkipped: prev.wordsSkipped + 1,
        currentWord: nextWord
      };
    });
  }, [getNextWord, gameState.gameOver]);

  // End a turn, handling final-round logic and overflow scoring
  const endTurn = useCallback(() => {
    setGameState(prev => {
      if (!Array.isArray(prev.teams) || prev.teams.length === 0) {
        return prev;
      }

      const teamCount = prev.teams.length;
      const currentTeamIndex = ((prev.currentTeam % teamCount) + teamCount) % teamCount;
      const currentTeam = prev.teams[currentTeamIndex];
      if (!currentTeam) {
        return prev;
      }

      const finalScore = prev.wordsGuessed - prev.wordsSkipped;
      const updatedTeams = prev.teams.map((team, index) => {
        if (index !== currentTeamIndex) {
          return team;
        }

        const rawPosition = Math.max(0, team.position + finalScore);
        return {
          ...team,
          position: rawPosition,
          totalScore: team.totalScore + finalScore,
          lastTurnScore: finalScore,
          turnsPlayed: team.turnsPlayed + 1
        };
      });

      const updatedTeam = updatedTeams[currentTeamIndex];
      const winningPosition = prev.gameSettings.winningPosition;
      const reachedGoal = updatedTeam.position >= winningPosition;

      let finalRoundTurns = prev.finalRoundTurns;
      let finalRoundLeaderId = prev.finalRoundLeaderId;

      const isStartingTeam = updatedTeam.id === prev.startingTeamId;
      const shouldTriggerFinalRound =
        reachedGoal &&
        finalRoundTurns === null &&
        isStartingTeam &&
        teamCount > 1;

      if (shouldTriggerFinalRound) {
        finalRoundTurns = updatedTeam.turnsPlayed;
        finalRoundLeaderId = updatedTeam.id;
        console.log('🎯 Final round triggered! Starting team reached goal. Turns:', finalRoundTurns);
      }

      const roundComplete =
        finalRoundTurns !== null &&
        updatedTeams.every(team => team.turnsPlayed >= finalRoundTurns);

      let winnerName = prev.winner;
      let gameOver = prev.gameOver;
      let currentScreen = prev.currentScreen === 'turn' ? 'game' : prev.currentScreen;
      let nextTeamIndex = (currentTeamIndex + 1) % teamCount;

      console.log('End turn check:', {
        reachedGoal,
        shouldTriggerFinalRound,
        finalRoundTurns,
        roundComplete,
        isStartingTeam,
        startingTeamId: prev.startingTeamId,
        currentTeamId: updatedTeam.id,
        turnsPlayed: updatedTeam.turnsPlayed
      });

      // Check if game should end
      if (reachedGoal && !shouldTriggerFinalRound && prev.finalRoundTurns === null) {
        // Immediate win - non-starting team reached goal first OR single team game
        console.log('🏆 Immediate win!');
        winnerName = updatedTeam.name;
        gameOver = true;
        currentScreen = 'end';
        nextTeamIndex = currentTeamIndex;
      } else if (roundComplete) {
        // Final round complete - all teams have equal turns
        console.log('🏁 Final round complete!');
        const rankedTeams = [...updatedTeams].sort((a, b) => b.position - a.position);
        const winningTeam = rankedTeams[0] || null;
        winnerName = winningTeam ? winningTeam.name : null;
        gameOver = true;
        currentScreen = 'end';
        nextTeamIndex = winningTeam
          ? updatedTeams.findIndex(team => team.id === winningTeam.id)
          : currentTeamIndex;
      }

      return {
        ...prev,
        teams: updatedTeams,
        currentTeam: nextTeamIndex,
        currentScreen,
        winner: winnerName,
        gameOver,
        finalRoundTurns,
        finalRoundLeaderId,
        turnScore: 0,
        wordsGuessed: 0,
        wordsSkipped: 0,
        timeLeft: prev.gameSettings.turnDuration,
        currentWord: ''
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('aliasGameState');
    }
    setGameState(() => createInitialState());
    initializeWords();
  }, [initializeWords]);

  // Practice mode functions
  const startPractice = useCallback(() => {
    setGameState(prev => ({ ...prev, currentScreen: 'practice' }));
  }, []);

  const finishPractice = useCallback((results) => {
    setGameState(prev => ({
      ...prev,
      currentScreen: 'practice-results',
      practiceResults: results
    }));
  }, []);

  const showLeaderboard = useCallback(() => {
    setGameState(prev => ({ ...prev, currentScreen: 'leaderboard' }));
  }, []);

  const backToHome = useCallback(() => {
    setGameState(prev => ({ ...prev, currentScreen: 'home', practiceResults: null }));
  }, []);

  return {
    gameState,
    setGameState, // Expose setGameState for direct timer updates
    addTeam,
    startGame,
    startTurn,
    endTurn,
    handleGotIt,
    handleSkip,
    resetGame, // Make sure resetGame is included in the return
    startPractice,
    finishPractice,
    showLeaderboard,
    backToHome,
    wordPoolReady,
    wordPoolLoading,
    wordPoolError
  };
};

// Home Screen Component
const HomeScreen = ({ gameStore }) => {
  const { language } = useLanguage();
  const [teamName, setTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#E8B4B8');

  const colors = ['#E8B4B8', '#A8C09A', '#A0826D', '#8B6F47', '#6B5D54', '#D4A5A5'];

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
      className="min-h-screen p-4 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#FFF8F3' }}
    >
      <LanguageToggle />

      <div className="rounded-3xl p-8 w-full max-w-md shadow-2xl"
        style={{ backgroundColor: '#F5E6D3' }}
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold text-center mb-8"
          style={{ color: '#6B5D54' }}
        >
          {getTranslation(language, 'gameTitle')}
        </motion.h1>
        
        <div className="space-y-6">
          {/* Practice Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={gameStore.startPractice}
            className="w-full text-white py-4 rounded-lg font-bold text-xl transition-colors shadow-lg flex items-center justify-center gap-3"
            style={{ backgroundColor: '#A0826D' }}
          >
            {getTranslation(language, 'practiceMode')}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px" style={{ backgroundColor: '#A0826D', opacity: 0.3 }}></div>
            <span className="text-sm" style={{ color: '#8B6F47' }}>{getTranslation(language, 'or')}</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#A0826D', opacity: 0.3 }}></div>
          </div>

          {/* Team setup */}
          <div>
            <label className="block text-right text-lg font-medium mb-2" style={{ color: '#6B5D54' }}>
              {getTranslation(language, 'teamName')}
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTeam()}
              className="w-full p-3 border-2 rounded-lg text-right focus:outline-none transition-colors"
              style={{
                borderColor: '#A0826D',
                backgroundColor: '#FFF8F3'
              }}
              placeholder={getTranslation(language, 'teamNamePlaceholder')}
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-right text-lg font-medium mb-2" style={{ color: '#6B5D54' }}>
              {getTranslation(language, 'teamColor')}
            </label>
            <div className="flex justify-center gap-2 flex-wrap">
              {colors.map(color => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedColor(color)}
                  className="w-10 h-10 rounded-full border-4 transition-all shadow-lg"
                  style={{
                    backgroundColor: color,
                    borderColor: selectedColor === color ? '#6B5D54' : '#A0826D'
                  }}
                />
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddTeam}
            disabled={!teamName.trim() || gameStore.gameState.teams.length >= 4}
            className="w-full text-white py-3 rounded-lg font-medium text-lg transition-colors"
            style={{
              backgroundColor: !teamName.trim() || gameStore.gameState.teams.length >= 4 ? '#A0826D80' : '#8B6F47'
            }}
          >
            {getTranslation(language, 'addTeam')} ({gameStore.gameState.teams.length}/4)
          </motion.button>

          <AnimatePresence>
            {gameStore.gameState.teams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <h3 className="text-right font-medium" style={{ color: '#6B5D54' }}>
                  {getTranslation(language, 'registeredTeams')}
                </h3>
                {gameStore.gameState.teams.map((team, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-end gap-2 p-3 rounded-lg"
                    style={{ backgroundColor: '#FFF8F3' }}
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

          {gameStore.wordPoolError && (
            <div className="text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg py-2">
              {language === 'he' ? 'לא הצלחנו לטעון מילים. נסו לרענן.' : 'Unable to load words. Please try again.'}
            </div>
          )}

          {gameStore.gameState.teams.length >= 2 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={gameStore.startGame}
              disabled={gameStore.wordPoolLoading || gameStore.wordPoolError}
              className="w-full py-4 rounded-lg font-bold text-xl transition-colors shadow-lg text-white"
              style={{
                backgroundColor: gameStore.wordPoolLoading || gameStore.wordPoolError ? '#A0826D80' : '#B8D4B8',
                cursor: gameStore.wordPoolLoading || gameStore.wordPoolError ? 'not-allowed' : 'pointer'
              }}
            >
              {gameStore.wordPoolLoading
                ? language === 'he' ? 'טוען מילים...' : 'Loading words...'
                : getTranslation(language, 'startGame')}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Game Board Component
const GameBoard = ({ gameStore }) => {
  const { language } = useLanguage();
  const winningPosition = gameStore.gameState.gameSettings?.winningPosition || DEFAULT_GAME_SETTINGS.winningPosition;
  const dots = Array.from({ length: winningPosition }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4"
      style={{ backgroundColor: '#FFF8F3' }}
    >
      <LanguageToggle />

      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-3xl font-bold text-center mb-6"
          style={{ color: '#6B5D54' }}
        >
          {getTranslation(language, 'gameBoard')}
        </motion.h2>

        {gameStore.gameState.finalRoundTurns !== null && !gameStore.gameState.gameOver && (
          <div className="mb-4 text-center rounded-xl px-4 py-3"
            style={{
              color: '#8B6F47',
              backgroundColor: '#F5E6D3',
              border: '1px solid #A0826D'
            }}
          >
            {language === 'he'
              ? 'סיבוב אחרון בעיצומו — כל הקבוצות מקבלות הזדמנות לסיים את התור שלהן.'
              : 'Final round in progress — every team gets one last turn.'}
          </div>
        )}
        
        {/* Game Tracks */}
        <div className="space-y-6 mb-8">
          {gameStore.gameState.teams.map((team, teamIndex) => {
            const cappedPosition = Math.min(team.position, winningPosition);
            const overflow = Math.max(0, team.position - winningPosition);
            const positionLabel = overflow > 0
              ? `${cappedPosition}/${winningPosition} (+${overflow})`
              : `${cappedPosition}/${winningPosition}`;

            return (
            <motion.div
              key={team.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: teamIndex * 0.1 }}
              className="rounded-2xl p-4 shadow-lg"
              style={{ backgroundColor: '#F5E6D3' }}
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
                    <span className="font-bold text-lg" style={{ color: '#6B5D54' }}>{team.name}</span>
                    <div className="text-sm" style={{ color: '#8B6F47' }}>
                      {getTranslation(language, 'position')}: {positionLabel} | {getTranslation(language, 'totalScore')}: {team.lastTurnScore || 0}
                    </div>
                  </div>
                </div>
                {/* Fixed: Compare with teamIndex, not team.id */}
                {gameStore.gameState.currentTeam === teamIndex && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ backgroundColor: '#F5E6D3', color: '#8B6F47', border: '2px solid #A0826D' }}
                  >
                    {getTranslation(language, 'currentTurn')}
                  </motion.div>
                )}
              </div>
              
              {/* Track - rest of the component stays the same */}
              <div className="relative mb-2">
                <div className="flex gap-1 flex-wrap">
                  {dots.map((dot, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className="w-4 h-4 rounded-full border-2 transition-all shadow-sm"
                      style={{
                        borderColor: index === winningPosition - 1 ? '#F59E0B' :
                                    index < cappedPosition ? '#B8D4B8' : '#A0826D',
                        backgroundColor: index === winningPosition - 1 ? '#FCD34D' :
                                        index < cappedPosition ? '#B8D4B8' : '#FFF8F3'
                      }}
                    />
                  ))}
                </div>
                
                {/* Pawn */}
                {team.position > 0 && (
                  <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: Math.min((Math.max(cappedPosition, 1) - 1) * 20, (winningPosition - 1) * 20) }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="absolute -top-3 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-lg border-2 border-white"
                    style={{ backgroundColor: team.color }}
                  >
                    🎯
                  </motion.div>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="w-full rounded-full h-2" style={{ backgroundColor: '#FFF8F3' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(cappedPosition / winningPosition) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
              </div>
            </motion.div>
            );
          })}
        </div>

        {/* Turn Buttons - Fixed to pass team index instead of team.id */}
        <div className="space-y-3">
          {gameStore.gameState.teams.map((team, teamIndex) => {
            const finalRoundTurns = gameStore.gameState.finalRoundTurns;
            const hasCompletedFinalTurn =
              finalRoundTurns !== null && team.turnsPlayed >= finalRoundTurns;
            const buttonDisabled = gameStore.gameState.gameOver || hasCompletedFinalTurn;

            return (
              <motion.button
                key={team.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: teamIndex * 0.1 }}
              whileHover={{ scale: buttonDisabled ? 1 : 1.02 }}
              whileTap={{ scale: buttonDisabled ? 1 : 0.98 }}
                disabled={buttonDisabled}
                onClick={() => gameStore.startTurn(teamIndex)}
                className="w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all text-white"
                style={{
                  backgroundColor: buttonDisabled ? '#A0826D80' : team.color,
                  cursor: buttonDisabled ? 'not-allowed' : 'pointer'
                }}
              >
                {getTranslation(language, 'teamTurn')} {team.name}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// Fixed TurnScreen Component
const TurnScreen = ({ gameStore }) => {
  const { language } = useLanguage();
  const timerRef = useRef(null);
  const endTurnCalledRef = useRef(false);

  const { setGameState, endTurn } = gameStore;
  const {
    gameSettings,
    currentScreen,
    teams,
    currentTeam,
    timeLeft,
    turnScore,
    wordsGuessed,
    wordsSkipped,
    currentWord
  } = gameStore.gameState;
  const turnDuration = gameSettings?.turnDuration || DEFAULT_GAME_SETTINGS.turnDuration;

  // Reset endTurn flag when entering turn screen
  useEffect(() => {
    if (currentScreen === 'turn') {
      endTurnCalledRef.current = false;
    }
  }, [currentScreen]);

  // Handle time expiration separately
  useEffect(() => {
    if (currentScreen === 'turn' && timeLeft <= 0 && !endTurnCalledRef.current) {
      endTurnCalledRef.current = true;
      endTurn();
    }
  }, [currentScreen, timeLeft, endTurn]);

  // Timer interval effect
  useEffect(() => {
    // Only run timer when on turn screen
    if (currentScreen !== 'turn' || timeLeft <= 0) {
      return undefined;
    }

    // Start timer interval
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.currentScreen !== 'turn' || prev.timeLeft <= 0) {
          return prev;
        }

        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentScreen, timeLeft, setGameState]);

  const currentTeamData = teams[currentTeam];
  const safeDuration = turnDuration > 0 ? turnDuration : DEFAULT_GAME_SETTINGS.turnDuration;
  const progress = ((safeDuration - timeLeft) / safeDuration) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: currentTeamData?.color || '#3B82F6' }}
    >
      <LanguageToggle />
      
      {/* Header */}
      <div className="text-center py-6 text-white relative">
        <motion.h2 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-2xl font-bold"
        >
          🎯 {currentTeamData?.name}
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
            {getTranslation(language, 'score')}: <span className="font-bold">{turnScore}</span>
          </div>
          <div className="text-sm flex justify-center gap-4">
            <span>✓ {wordsGuessed}</span>
            <span>✗ {wordsSkipped}</span>
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
          key={currentWord}
          initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-8 shadow-2xl max-w-sm w-full relative overflow-hidden"
          style={{ backgroundColor: '#F5E6D3' }}
        >
          <motion.div
            className="absolute inset-0 opacity-0"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,248,243,0.5), transparent)' }}
            animate={{ x: [-200, 400], opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
          <div className="text-5xl font-bold text-center relative z-10" dir="rtl" style={{ color: '#6B5D54' }}>
            {currentWord || 'מילה'}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={gameStore.handleGotIt}
          className="w-full text-white py-6 rounded-2xl font-bold text-2xl shadow-lg active:shadow-xl transition-all flex items-center justify-center gap-3"
          style={{ backgroundColor: '#B8D4B8' }}
        >
          <span className="text-3xl">✓</span>
          {getTranslation(language, 'gotIt')}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={gameStore.handleSkip}
          className="w-full text-white py-6 rounded-2xl font-bold text-2xl shadow-lg active:shadow-xl transition-all flex items-center justify-center gap-3"
          style={{ backgroundColor: '#D4A5A5' }}
        >
          <span className="text-3xl">✗</span>
          {getTranslation(language, 'skip')}
        </motion.button>
      </div>
    </motion.div>
  );
};

// End Screen Component
const EndScreen = ({ gameStore }) => {
  const { language } = useLanguage();
  const winnerTeam = gameStore.gameState.teams.find(t => t.name === gameStore.gameState.winner);
  const winningPosition = gameStore.gameState.gameSettings?.winningPosition || DEFAULT_GAME_SETTINGS.winningPosition;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#FFF8F3' }}
    >
      <LanguageToggle />

      <div className="rounded-3xl p-8 w-full max-w-md shadow-2xl text-center"
        style={{ backgroundColor: '#F5E6D3' }}
      >
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#6B5D54' }}>
            {getTranslation(language, 'congratulations')}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {winnerTeam && (
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: winnerTeam.color }}
              />
            )}
            <p className="text-xl" style={{ color: '#8B6F47' }}>
              {gameStore.gameState.winner} {getTranslation(language, 'winner')}
            </p>
          </div>
          
          {/* Game Statistics */}
          <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#FFF8F3' }}>
            <h3 className="font-bold mb-2" style={{ color: '#6B5D54' }}>
              {getTranslation(language, 'gameSummary')}
            </h3>
            <div className="space-y-1 text-sm">
              {gameStore.gameState.teams
                .sort((a, b) => b.position - a.position)
                .map((team, index) => {
                  const cappedPosition = Math.min(team.position, winningPosition);
                  const overflow = Math.max(0, team.position - winningPosition);
                  const positionLabel = overflow > 0
                    ? `${cappedPosition}/${winningPosition} (+${overflow})`
                    : `${cappedPosition}/${winningPosition}`;

                  return (
                    <div key={team.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}</span>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: team.color }}
                        />
                        <span>{team.name}</span>
                      </div>
                      <span className="font-bold">{positionLabel}</span>
                    </div>
                  );
                })}
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
          className="w-full text-white py-4 rounded-lg font-bold text-xl transition-colors shadow-lg"
          style={{ backgroundColor: '#8B6F47' }}
        >
          {getTranslation(language, 'newGame')}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Main Game Component
const GameWithLanguage = () => {
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
      case 'practice':
        return (
          <PracticeGame 
            onFinish={gameStore.finishPractice}
            onBack={gameStore.backToHome}
          />
        );
      case 'practice-results':
        return (
          <PracticeResults 
            results={gameStore.gameState.practiceResults}
            onPlayAgain={gameStore.startPractice}
            onBack={gameStore.backToHome}
            onShowLeaderboard={gameStore.showLeaderboard}
          />
        );
      case 'leaderboard':
        return (
          <Leaderboard 
            onBack={() => gameStore.gameState.practiceResults ? 
              gameStore.finishPractice(gameStore.gameState.practiceResults) : 
              gameStore.backToHome()
            }
            currentScore={gameStore.gameState.practiceResults?.score}
          />
        );
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

// Main App Component
const AliasGame = () => {
  return (
    <LanguageProvider>
      <GameWithLanguage />
    </LanguageProvider>
  );
};

export default AliasGame;
