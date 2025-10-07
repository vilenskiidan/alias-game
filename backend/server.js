// backend/server.js - Updated version with practice routes
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const gameRoutes = require('./routes/game');
const wordRoutes = require('./routes/words');
const practiceRoutes = require('./routes/practice'); // NEW
const gameStateService = require('./services/gameState');
const wordService = require('./services/wordService');
const practiceLeaderboard = require('./services/practiceLeaderboard'); // NEW

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['https://play.getalias.xyz', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize services
async function initializeServices() {
  try {
    await wordService.loadWords();
    console.log('Word service initialized successfully');
    
    // Start game cleanup interval (every hour)
    gameStateService.startCleanupInterval();
    console.log('Game state service initialized successfully');
    
    // Practice leaderboard is ready (in-memory)
    console.log('Practice leaderboard service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Routes
app.use('/api/game', gameRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/practice', practiceRoutes); // NEW

// Health check endpoint - UPDATED with practice stats
app.get('/api/health', (req, res) => {
  const practiceStats = practiceLeaderboard.getStats();
  
  let wordCount = {};
  try {
    wordCount = {
      he: wordService.getWordCount('he'),
      en: wordService.getWordCount('en')
    };
  } catch (error) {
    console.error('Failed to read word counts:', error.message);
  }

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    wordCount,
    activeGames: gameStateService.getActiveGameCount(),
    practiceScores: practiceStats.totalScores, // NEW
    practicePlayers: practiceStats.uniquePlayers // NEW
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
initializeServices().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Alias Game Backend running on port ${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏆 Practice API: http://localhost:${PORT}/api/practice`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
