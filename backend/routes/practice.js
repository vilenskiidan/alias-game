    // backend/routes/practice.js
const express = require('express');
const practiceLeaderboard = require('../services/practiceLeaderboard');

const router = express.Router();

// Submit a new practice score
router.post('/score', (req, res) => {
  try {
    const { playerName, score, wordsAttempted, accuracy } = req.body;
    
    // Validate required fields
    if (!playerName || typeof score !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Player name and score are required'
      });
    }

    // Add score to leaderboard
    const result = practiceLeaderboard.addScore(playerName, score, {
      wordsAttempted,
      accuracy,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Score submitted successfully',
      rank: result.rank,
      total: result.total,
      score: result.scoreEntry
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get leaderboard
router.get('/leaderboard', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const leaderboard = practiceLeaderboard.getLeaderboard(limit);
    
    res.json({
      success: true,
      leaderboard,
      stats: practiceLeaderboard.getStats()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get player statistics
router.get('/player/:playerName', (req, res) => {
  try {
    const { playerName } = req.params;
    const stats = practiceLeaderboard.getPlayerStats(playerName);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get leaderboard statistics
router.get('/stats', (req, res) => {
  try {
    const stats = practiceLeaderboard.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin: Clear leaderboard
router.delete('/leaderboard', (req, res) => {
  try {
    const result = practiceLeaderboard.clearLeaderboard();
    res.json({
      success: true,
      message: `Cleared ${result.cleared} scores`,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin: Remove specific score
router.delete('/score/:scoreId', (req, res) => {
  try {
    const { scoreId } = req.params;
    const result = practiceLeaderboard.removeScore(parseFloat(scoreId));
    
    if (!result.removed) {
      return res.status(404).json({
        success: false,
        error: 'Score not found'
      });
    }

    res.json({
      success: true,
      message: 'Score removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;