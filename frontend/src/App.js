import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// API Service
const apiService = {
  // Word API
  async getNextWord() {
    const response = await fetch(`${API_BASE_URL}/words/next`);
    if (!response.ok) throw new Error('Failed to get word');
    return response.json();
  },

  async getBatchWords(count = 10) {
    const response = await fetch(`${API_BASE_URL}/words/batch/${count}`);
    if (!response.ok) throw new Error('Failed to get words');
    return response.json();
  },

  // Game API
  async createGame(initialData = {}) {
    const response = await fetch(`${API_BASE_URL}/game/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialData)
    });
    if (!response.ok) throw new Error('Failed to create game');
    return response.json();
  },

  async getGame(gameId) {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}`);
    if (!response.ok) throw new Error('Failed to get game');
    return response.json();
  },

  async addTeam(gameId, teamData) {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData)
    });
    if (!response.ok) throw new Error('Failed to add team');
    return response.json();
  },

  async startGame(gameId) {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/start`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to start game');
    return response.json();
  },

  async startTurn(gameId, teamId) {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/turn/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId })
    });
    if (!response.ok) throw new Error('Failed to start turn');
    return response.json();
  },

  async submitTurn(gameId, turnData) {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/turn/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turnData)
    });
    if (!response.ok) throw new Error('Failed to submit turn');
    return response.json();
  },

  async resetGame(gameId) {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/reset`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to reset game');
    return response.json();
  }
};

// Game Store with API integration
const useGameStore = () => {
  const [gameState, setGameState] = useState({
    gameId: null,
    teams: [],
    currentTeam: 0,
    gameStarted: false,
    currentScreen: 'home',
    turnScore: 0,
    timeLeft: 60,
    winner: null,
    currentWord: '',
    wordsGuessed: 0,
    wordsSkipped: 0,
    loading: false,
    error: null
  });

  // Load game from localStorage on mount
  useEffect(() => {
    const savedGameId = localStorage.getItem('aliasGameId');
    if (savedGameId) {
      loadGame(savedGameId);
    }
  }, []);

  const setLoading = (loading) => {
    setGameState(prev => ({ ...prev, loading }));
  };

  const setError = (error) => {
    setGameState(prev => ({ ...prev, error: error?.message || error }));
  };

  const updateGameState = (newState) => {
    setGameState(prev => ({ ...prev, ...newState, error: null }));
  };

  const loadGame = async (gameId) => {
    try {
      setLoading(true);
      const response = await apiService.getGame(gameId);
      updateGameState(response.gameState);
      localStorage.setItem('aliasGameId', gameId);
    } catch (error) {
      setError(error);
      localStorage.removeItem('aliasGameId');
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (initialData = {}) => {
    try {
      setLoading(true);
      const response = await apiService.createGame(initialData);
      updateGameState(response.gameState);
      localStorage.setItem('aliasGameId', response.gameId);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async (name, color) => {
    try {
      setLoading(true);
      let currentGameId = gameState.gameId;
      
      // Create game if it doesn't exist
      if (!currentGameId) {
        const response = await apiService.createGame();
        currentGameId = response.gameId;
        updateGameState(response.gameState);
        localStorage.setItem('aliasGameId', currentGameId);
      }

      const response = await apiService.addTeam(currentGameId, { name, color });
      updateGameState(response.gameState);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    try {
      setLoading(true);
      const response = await apiService.startGame(gameState.gameId);
      updateGameState(response.gameState);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const startTurn = async (teamId) => {
    try {
      setLoading(true);
      const [gameResponse, wordResponse] = await Promise.all([
        apiService.startTurn(gameState.gameId, teamId),
        apiService.getNextWord()
      ]);
      
      updateGameState({
        ...gameResponse.gameState,
        currentWord: wordResponse.word
      });
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const getNewWord = async () => {
    try {
      const response = await apiService.getNextWord();
      updateGameState({ currentWord: response.word });
    } catch (error) {
      setError(error);
    }
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

  const endTurn = async () => {
    try {
      setLoading(true);
      const turnData = {
        wordsGuessed: gameState.wordsGuessed,
        wordsSkipped: gameState.wordsSkipped
      };

      const response = await apiService.submitTurn(gameState.gameId, turnData);
      updateGameState(response.gameState);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = async () => {
    try {
      setLoading(true);
      if (gameState.gameId) {
        const response = await apiService.resetGame(gameState.gameId);
        updateGameState(response.gameState);
      } else {
        // If no game ID, just reset local state
        setGameState({
          gameId: null,
          teams: [],
          currentTeam: 0,
          gameStarted: false,
          currentScreen: 'home',
          turnScore: 0,
          timeLeft: 60,
          winner: null,
          currentWord: '',
          wordsGuessed: 0,
          wordsSkipped: 0,
          loading: false,
          error: null
        });
        localStorage.removeItem('aliasGameId');
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    gameState,
    addTeam,
    startGame,
    startTurn,
    endTurn,
    handleGotIt,
    handleSkip,
    resetGame,
    clearError,
    loadGame
  };
};

// Error Display Component
const ErrorDisplay = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-4 right-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg"
    >
      <div className="flex justify-between items-center">
        <span className="font-medium">{error}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-xl"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
    />
  </div>
);

// Home Screen Component (Updated)
const HomeScreen = ({ gameStore }) => {
  const [teamName, setTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const handleAddTeam = async () => {
    if (teamName.trim() && gameStore.gameState.teams.length < 4) {
      await gameStore.addTeam(teamName.trim(), selectedColor);
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
              disabled={gameStore.gameState.loading}
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
                  disabled={gameStore.gameState.loading}
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
            disabled={!teamName.trim() || gameStore.gameState.teams.length >= 4 || gameStore.gameState.loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium text-lg disabled:bg-gray-400 hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            {gameStore.gameState.loading ? <LoadingSpinner /> : `הוסף קבוצה (${gameStore.gameState.teams.length}/4)`}
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
              disabled={gameStore.gameState.loading}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center"
            >
              {gameStore.gameState.loading ? <LoadingSpinner /> : '🚀 התחל משחק!'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Game Board Component (Updated)
const GameBoard = ({ gameStore }) => {
  const dots = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleStartTurn = async (teamId) => {
    await gameStore.startTurn(teamId);
  };

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
              onClick={() => handleStartTurn(team.id)}
              disabled={gameStore.gameState.loading}
              className="w-full py-4 rounded-xl font-bold text-xl text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              style={{ backgroundColor: team.color }}
            >
              {gameStore.gameState.loading ? <LoadingSpinner /> : `תור של ${team.name}`}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Turn Screen Component (Updated)
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
          disabled={gameStore.gameState.loading}
          className="w-full bg-green-500 text-white py-6 rounded-2xl font-bold text-2xl shadow-lg active:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <span className="text-3xl">✓</span>
          הבא
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={gameStore.handleSkip}
          disabled={gameStore.gameState.loading}
          className="w-full bg-red-500 text-white py-6 rounded-2xl font-bold text-2xl shadow-lg active:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <span className="text-3xl">✗</span>
          דלג
        </motion.button>
      </div>
    </motion.div>
  );
};

// End Screen Component (Updated)
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
          disabled={gameStore.gameState.loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center"
        >
          {gameStore.gameState.loading ? <LoadingSpinner /> : '🔄 משחק חדש'}
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
        <ErrorDisplay 
          error={gameStore.gameState.error} 
          onClose={gameStore.clearError} 
        />
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
};

export default AliasGame;