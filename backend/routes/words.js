const express = require('express');
const wordService = require('../services/wordService');

const router = express.Router();

// Get next word
router.get('/next', (req, res) => {
  try {
    const result = wordService.getNextWord();
    res.json({
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

// Get batch of words
router.get('/batch/:count?', (req, res) => {
  try {
    const count = parseInt(req.params.count) || 10;
    
    if (count < 1 || count > 100) {
      return res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 100'
      });
    }

    const words = wordService.getBatchWords(count);
    res.json({
      success: true,
      words,
      count: words.length,
      requested: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get word service stats
router.get('/stats', (req, res) => {
  try {
    const stats = wordService.getStats();
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

// Admin: Reload words from file
router.post('/reload', async (req, res) => {
  try {
    const stats = await wordService.reloadWords();
    res.json({
      success: true,
      message: 'Words reloaded successfully',
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;