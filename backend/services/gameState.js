const crypto = require('crypto');

class GameStateService {
  constructor() {
    this.games = new Map(); // gameId -> gameState
    this.cleanupInterval = null;
    this.GAME_EXPIRY_HOURS = 24;
  }

  generateGameId() {
    return crypto.randomBytes(8).toString('hex');
  }

  createGame(initialData = {}) {
    const gameId = this.generateGameId();
    const now = Date.now();
    
    const gameState = {
      gameId,
      teams: initialData.teams || [],
      currentTeam: 0,
      gameStarted: false,
      currentScreen: 'home',
      turnScore: 0,
      timeLeft: 60,
      winner: null,
      currentWord: '',
      wordsGuessed: 0,
      wordsSkipped: 0,
      createdAt: now,
      lastActivity: now,
      turnHistory: [],
      gameSettings: {
        winningPosition: 30,
        turnDuration: 60,
        ...initialData.settings
      }
    };

    this.games.set(gameId, gameState);
    console.log(`Created new game: ${gameId}`);
    
    return { gameId, gameState };
  }

  getGame(gameId) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }
    
    // Update last activity
    game.lastActivity = Date.now();
    return game;
  }

  updateGame(gameId, updates) {
    const game = this.getGame(gameId);
    
    // Merge updates
    Object.assign(game, updates);
    game.lastActivity = Date.now();
    
    return game;
  }

  addTeam(gameId, teamData) {
    const game = this.getGame(gameId);
    
    if (game.teams.length >= 4) {
      throw new Error('Maximum 4 teams allowed');
    }

    const team = {
      id: game.teams.length,
      name: teamData.name,
      color: teamData.color,
      position: 0,
      totalScore: 0,
      turnsPlayed: 0,
      ...teamData
    };

    game.teams.push(team);
    game.lastActivity = Date.now();
    
    return game;
  }

  startGame(gameId) {
    const game = this.getGame(gameId);
    
    if (game.teams.length < 2) {
      throw new Error('Need at least 2 teams to start game');
    }

    game.gameStarted = true;
    game.currentScreen = 'game';
    game.lastActivity = Date.now();
    
    return game;
  }

  startTurn(gameId, teamId) {
    const game = this.getGame(gameId);
    
    if (!game.gameStarted) {
      throw new Error('Game not started');
    }

    if (game.winner) {
      throw new Error('Game already finished');
    }

    game.currentTeam = teamId;
    game.currentScreen = 'turn';
    game.turnScore = 0;
    game.timeLeft = game.gameSettings.turnDuration;
    game.wordsGuessed = 0;
    game.wordsSkipped = 0;
    game.lastActivity = Date.now();
    
    return game;
  }

  submitTurnResult(gameId, turnData) {
    const game = this.getGame(gameId);
    const team = game.teams[game.currentTeam];
    
    if (!team) {
      throw new Error('Invalid team');
    }

    // Calculate final score
    const finalScore = turnData.wordsGuessed - turnData.wordsSkipped;
    
    // Update team position (can't go below 0)
    const newPosition = Math.max(0, Math.min(
      game.gameSettings.winningPosition, 
      team.position + finalScore
    ));
    
    team.position = newPosition;
    team.totalScore += finalScore;
    team.turnsPlayed++;

    // Record turn in history
    game.turnHistory.push({
      teamId: game.currentTeam,
      teamName: team.name,
      score: finalScore,
      wordsGuessed: turnData.wordsGuessed,
      wordsSkipped: turnData.wordsSkipped,
      timestamp: Date.now(),
      newPosition: newPosition
    });

    // Check for winner
    if (newPosition >= game.gameSettings.winningPosition) {
      game.winner = team.name;
      game.currentScreen = 'end';
    } else {
      game.currentScreen = 'game';
      game.currentTeam = (game.currentTeam + 1) % game.teams.length;
    }

    game.lastActivity = Date.now();
    
    return game;
  }

  deleteGame(gameId) {
    const deleted = this.games.delete(gameId);
    if (deleted) {
      console.log(`Deleted game: ${gameId}`);
    }
    return deleted;
  }

  resetGame(gameId) {
    const game = this.getGame(gameId);
    
    // Reset game state but keep teams
    const teams = game.teams.map(team => ({
      ...team,
      position: 0,
      totalScore: 0,
      turnsPlayed: 0
    }));

    Object.assign(game, {
      teams,
      currentTeam: 0,
      gameStarted: false,
      currentScreen: 'home',
      turnScore: 0,
      timeLeft: 60,
      winner: null,
      currentWord: '',
      wordsGuessed: 0,
      wordsSkipped: 0,
      turnHistory: [],
      lastActivity: Date.now()
    });

    return game;
  }

  getGameStats(gameId) {
    const game = this.getGame(gameId);
    
    return {
      gameId,
      duration: Date.now() - game.createdAt,
      totalTurns: game.turnHistory.length,
      teams: game.teams.map(team => ({
        name: team.name,
        position: team.position,
        totalScore: team.totalScore,
        turnsPlayed: team.turnsPlayed,
        averageScore: team.turnsPlayed > 0 ? team.totalScore / team.turnsPlayed : 0
      })),
      winner: game.winner,
      gameStarted: game.gameStarted
    };
  }

  getAllGames() {
    return Array.from(this.games.values()).map(game => ({
      gameId: game.gameId,
      teams: game.teams.length,
      gameStarted: game.gameStarted,
      winner: game.winner,
      createdAt: game.createdAt,
      lastActivity: game.lastActivity
    }));
  }

  getActiveGameCount() {
    return this.games.size;
  }

  // Cleanup old games
  cleanupOldGames() {
    const now = Date.now();
    const expiry = this.GAME_EXPIRY_HOURS * 60 * 60 * 1000;
    let cleaned = 0;

    for (const [gameId, game] of this.games.entries()) {
      if (now - game.lastActivity > expiry) {
        this.games.delete(gameId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} old games`);
    }

    return cleaned;
  }

  startCleanupInterval() {
    // Run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldGames();
    }, 60 * 60 * 1000);

    console.log('Game cleanup interval started');
  }

  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Game cleanup interval stopped');
    }
  }
}

module.exports = new GameStateService();