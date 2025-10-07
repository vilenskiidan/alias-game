const express = require('express');
const wordService = require('../services/wordService');

const router = express.Router();

const resolveLanguage = (req) => {
  const lang = (req.query.lang || req.query.language || 'he').toLowerCase();
  return lang === 'en' ? 'en' : 'he';
};

// Get next word
router.get('/next', (req, res) => {
  try {
    const language = resolveLanguage(req);
    const result = wordService.getNextWord(language);
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
    const language = resolveLanguage(req);
    const count = parseInt(req.params.count, 10) || 10;

    if (count < 1 || count > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 1000'
      });
    }

    const words = wordService.getBatchWords(count, language);
    res.json({
      success: true,
      language,
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
    const language = resolveLanguage(req);
    const stats = wordService.getStats(language);
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
