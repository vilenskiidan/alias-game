// frontend/src/components/PracticeResults.js - CLIENT-SIDE ONLY VERSION
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';

const PracticeResults = ({ results, onPlayAgain, onBack, onShowLeaderboard }) => {
  const { language } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [globalRank, setGlobalRank] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if this is a new personal best (local storage for personal tracking)
    const savedBest = localStorage.getItem('aliasPersonalBest');
    const previousBest = savedBest ? parseInt(savedBest) : 0;
    
    if (results.score > previousBest) {
      localStorage.setItem('aliasPersonalBest', results.score.toString());
      setIsNewRecord(true);
    }
  }, [results.score]);

  const handleScoreSubmission = async (playerName) => {
    if (!playerName.trim() || results.score < 4) return;

    setSubmittingScore(true);
    setError(null);

    try {
      // Save to localStorage (local leaderboard)
      const savedScores = JSON.parse(localStorage.getItem('aliasLeaderboard') || '[]');
      const newScore = {
        name: playerName.trim(),
        score: results.score,
        date: new Date().toLocaleDateString('he-IL'),
        timestamp: Date.now(),
        wordsAttempted: results.wordsAttempted,
        accuracy: results.wordsAttempted > 0 ? 
          Math.round((results.score / results.wordsAttempted) * 100) : 0
      };
      
      const updatedScores = [...savedScores, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Keep top 10
      
      localStorage.setItem('aliasLeaderboard', JSON.stringify(updatedScores));
      
      // Calculate rank
      const rank = updatedScores.findIndex(s => s.timestamp === newScore.timestamp) + 1;
      setGlobalRank(rank);
      setScoreSubmitted(true);

    } catch (error) {
      console.error('Failed to submit score:', error);
      setError(getTranslation(language, 'saveError'));
    } finally {
      setSubmittingScore(false);
    }
  };

  const accuracy = results.wordsAttempted > 0 ? 
    Math.round((results.score / results.wordsAttempted) * 100) : 0;

  const getScoreMessage = (score) => {
    if (score >= 15) return { text: getTranslation(language, 'scoreChampion'), color: "text-yellow-600" };
    if (score >= 10) return { text: getTranslation(language, 'scoreExcellent'), color: "text-green-600" };
    if (score >= 7) return { text: getTranslation(language, 'scoreVeryGood'), color: "text-blue-600" };
    if (score >= 4) return { text: getTranslation(language, 'scoreNotBad'), color: "text-purple-600" };
    return { text: getTranslation(language, 'scorePracticeMore'), color: "text-gray-600" };
  };

  const scoreMessage = getScoreMessage(results.score);
  const qualifiesForLeaderboard = results.score >= 4;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        {/* Celebration header */}
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-center mb-6"
        >
          {isNewRecord && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 mb-4"
            >
              <div className="text-2xl">🎉</div>
              <div className="text-lg font-bold text-yellow-800">{getTranslation(language, 'personalBest')}</div>
            </motion.div>
          )}

          {globalRank && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-100 border-2 border-blue-400 rounded-lg p-3 mb-4"
            >
              <div className="text-2xl">🏆</div>
              <div className="text-lg font-bold text-blue-800">
                #{globalRank} {getTranslation(language, 'achievements')}
              </div>
            </motion.div>
          )}

          <div className="text-6xl mb-4">
            {results.score >= 10 ? '🏆' : results.score >= 7 ? '🌟' : results.score >= 4 ? '👏' : '💪'}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {results.score} {getTranslation(language, 'points')}
          </h2>
          
          <p className={`text-xl font-medium ${scoreMessage.color} mb-4`}>
            {scoreMessage.text}
          </p>
        </motion.div>

        {/* Score breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-100 rounded-xl p-4 mb-6"
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">{results.score}</div>
              <div className="text-sm text-gray-600">{getTranslation(language, 'totalPoints')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{results.wordsAttempted}</div>
              <div className="text-sm text-gray-600">{getTranslation(language, 'wordsAttempted')}</div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-4 text-blue-600 font-medium py-2 text-sm"
          >
            {showDetails ? getTranslation(language, 'hideDetails') : getTranslation(language, 'showDetails')}
          </motion.button>
          
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-300 space-y-2 text-sm"
            >
              <div className="flex justify-between">
                <span>{getTranslation(language, 'accuracy')}</span>
                <span className="font-bold">{accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span>{getTranslation(language, 'averageTime')}</span>
                <span className="font-bold">
                  {results.wordsAttempted > 0 ? Math.round(60 / results.wordsAttempted) : 0}s
                </span>
              </div>
              <div className="flex justify-between">
                <span>{getTranslation(language, 'personalRecord')}</span>
                <span className="font-bold">
                  {localStorage.getItem('aliasPersonalBest') || 0}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Local leaderboard qualification */}
        {qualifiesForLeaderboard && !scoreSubmitted && (
          <ScoreSubmissionForm 
            onSubmit={handleScoreSubmission}
            submitting={submittingScore}
            error={error}
            score={results.score}
            language={language}
          />
        )}

        {scoreSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-400 rounded-xl p-4 mb-6 text-center"
          >
            <div className="text-2xl mb-2">🎖️</div>
            <div className="font-bold text-gray-800 mb-1">{getTranslation(language, 'saveSuccess')}</div>
            <div className="text-sm text-gray-700">
              {getTranslation(language, 'savedToGlobal')}
              {globalRank && ` #${globalRank} מקומית`}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlayAgain}
            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg"
          >
            {getTranslation(language, 'playAgain')}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onShowLeaderboard}
            className="w-full bg-yellow-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg"
          >
            {getTranslation(language, 'globalLeaderboard')}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="w-full bg-gray-500 text-white py-3 rounded-xl font-medium"
          >
            {getTranslation(language, 'backToMainMenu')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Score Submission Component
const ScoreSubmissionForm = ({ onSubmit, submitting, error, score, language }) => {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = () => {
    if (playerName.trim() && !submitting) {
      onSubmit(playerName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-100 border-2 border-green-400 rounded-xl p-4 mb-6"
    >
      <div className="text-center mb-4">
        <div className="text-2xl mb-2">🏆</div>
        <div className="font-bold text-green-800 mb-1">
          {score} {getTranslation(language, 'points')} - {getTranslation(language, 'qualificationTitle')}
        </div>
        <div className="text-sm text-green-700">
          {getTranslation(language, 'qualificationText')}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-2">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          className="flex-1 p-3 rounded-lg border-2 border-green-300 text-center font-medium"
          placeholder={getTranslation(language, 'enterName')}
          maxLength={20}
          dir={language === 'he' ? 'rtl' : 'ltr'}
          disabled={submitting}
        />
        <motion.button
          whileHover={{ scale: submitting ? 1 : 1.05 }}
          whileTap={{ scale: submitting ? 1 : 0.95 }}
          onClick={handleSubmit}
          disabled={!playerName.trim() || submitting}
          className="bg-green-600 text-white px-4 py-3 rounded-lg font-bold disabled:bg-gray-400 flex items-center gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              {getTranslation(language, 'saving')}
            </>
          ) : (
            getTranslation(language, 'save')
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Leaderboard Component - LOCAL STORAGE ONLY
const Leaderboard = ({ onBack, currentScore = null }) => {
  const { language } = useLanguage();
  const [scores, setScores] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    loadScores();
    
    // If there's a current score >= 4, show name input
    if (currentScore && currentScore >= 4) {
      setShowNameInput(true);
    }
  }, [currentScore]);

  const loadScores = () => {
    try {
      const savedScores = localStorage.getItem('aliasLeaderboard');
      if (savedScores) {
        setScores(JSON.parse(savedScores));
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const saveScore = () => {
    if (!playerName.trim() || !currentScore || currentScore < 4) return;

    try {
      const newScore = {
        name: playerName.trim(),
        score: currentScore,
        date: new Date().toLocaleDateString('he-IL'),
        timestamp: Date.now()
      };
      
      const savedScores = JSON.parse(localStorage.getItem('aliasLeaderboard') || '[]');
      const updatedScores = [...savedScores, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      localStorage.setItem('aliasLeaderboard', JSON.stringify(updatedScores));
      setScores(updatedScores);
      setShowNameInput(false);
      setPlayerName('');
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const getPodiumPosition = (index) => {
    if (index === 0) return { emoji: '🥇', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (index === 1) return { emoji: '🥈', color: 'text-gray-600', bg: 'bg-gray-100' };
    if (index === 2) return { emoji: '🥉', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { emoji: '🏅', color: 'text-purple-600', bg: 'bg-purple-100' };
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center mb-6"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {getTranslation(language, 'leaderboardTitle')}
          </h2>
          <p className="text-gray-600">
            {getTranslation(language, 'achievementsAbove')}
          </p>
        </motion.div>

        {/* Name input for new score */}
        {showNameInput && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 border-2 border-green-400 rounded-xl p-4 mb-6"
          >
            <div className="text-center mb-4">
              <div className="text-2xl mb-2">🎉</div>
              <div className="font-bold text-green-800 mb-1">
                {currentScore} {getTranslation(language, 'points')} - {getTranslation(language, 'qualificationTitle')}
              </div>
              <div className="text-sm text-green-700">
                {getTranslation(language, 'qualificationText')}
              </div>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveScore()}
                className="flex-1 p-3 rounded-lg border-2 border-green-300 text-center font-medium"
                placeholder={getTranslation(language, 'enterName')}
                maxLength={15}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveScore}
                disabled={!playerName.trim()}
                className="bg-green-600 text-white px-4 py-3 rounded-lg font-bold disabled:bg-gray-400"
              >
                {getTranslation(language, 'save')}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Leaderboard list */}
        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {scores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎯</div>
              <div>{getTranslation(language, 'noScoresYet')}</div>
              <div className="text-sm">{getTranslation(language, 'beFirst')}</div>
            </div>
          ) : (
            scores.map((score, index) => {
              const position = getPodiumPosition(index);
              
              return (
                <motion.div
                  key={`${score.name}-${score.score}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 bg-gray-50 ${position.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{position.emoji}</div>
                    <div>
                      <div className={`font-bold ${position.color}`}>
                        {score.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {score.date}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <div className={`text-2xl font-bold ${position.color}`}>
                      {score.score}
                    </div>
                    <div className="text-xs text-gray-500">
                      #{index + 1}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg"
          >
            {getTranslation(language, 'back')}
          </motion.button>
          
          {/* Clear leaderboard button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => {
              if (window.confirm(getTranslation(language, 'confirmClear'))) {
                localStorage.removeItem('aliasLeaderboard');
                setScores([]);
              }
            }}
            className="w-full bg-red-500 text-white py-2 rounded-lg text-sm opacity-50 hover:opacity-100 transition-opacity"
          >
            {getTranslation(language, 'clearLeaderboard')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export { PracticeResults, Leaderboard };