const express = require('express');
const gameStateService = require('../services/gameState');

const router = express.Router();

// Create new game
router.post('/create', (req, res) => {
  try {
    const initialData = req.body;
    const result = gameStateService.createGame(initialData);
    
    res.status(201).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get game state
router.get('/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    const gameState = gameStateService.getGame(gameId);
    
    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// Add team to game
router.post('/:gameId/teams', (req, res) => {
  try {
    const { gameId } = req.params;
    const teamData = req.body;
    
    if (!teamData.name || !teamData.color) {
      return res.status(400).json({
        success: false,
        error: 'Team name and color are required'
      });
    }

    const gameState = gameStateService.addTeam(gameId, teamData);
    
    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Start game
router.post('/:gameId/start', (req, res) => {
  try {
    const { gameId } = req.params;
    const gameState = gameStateService.startGame(gameId);
    
    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Start turn
router.post('/:gameId/turn/start', (req, res) => {
  try {
    const { gameId } = req.params;
    const { teamId } = req.body;
    
    if (teamId === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Team ID is required'
      });
    }

    const gameState = gameStateService.startTurn(gameId, teamId);
    
    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Submit turn result
router.post('/:gameId/turn/submit', (req, res) => {
  try {
    const { gameId } = req.params;
    const turnData = req.body;
    
    // Validate turn data
    if (typeof turnData.wordsGuessed !== 'number' || typeof turnData.wordsSkipped !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'wordsGuessed and wordsSkipped must be numbers'
      });
    }

    if (turnData.wordsGuessed < 0 || turnData.wordsSkipped < 0) {
      return res.status(400).json({
        success: false,
        error: 'wordsGuessed and wordsSkipped cannot be negative'
      });
    }

    const gameState = gameStateService.submitTurnResult(gameId, turnData);
    
    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Reset game
router.post('/:gameId/reset', (req, res) => {
  try {
    const { gameId } = req.params;
    const gameState = gameStateService.resetGame(gameId);
    
    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete game
router.delete('/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    const deleted = gameStateService.deleteGame(gameId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get game statistics
router.get('/:gameId/stats', (req, res) => {
  try {
    const { gameId } = req.params;
    const stats = gameStateService.getGameStats(gameId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

// Admin: Get all games
router.get('/', (req, res) => {
  try {
    const games = gameStateService.getAllGames();
    
    res.json({
      success: true,
      games,
      count: games.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin: Cleanup old games
router.post('/cleanup', (req, res) => {
  try {
    const cleaned = gameStateService.cleanupOldGames();
    
    res.json({
      success: true,
      message: `Cleaned up ${cleaned} old games`,
      cleaned
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;