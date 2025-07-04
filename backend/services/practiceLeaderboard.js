// backend/services/practiceLeaderboard.js
class PracticeLeaderboardService {
  constructor() {
    this.scores = []; // In-memory storage for now
    this.maxScores = 100; // Keep top 100 scores
    this.minQualifyingScore = 4;
  }

  addScore(playerName, score, metadata = {}) {
    // Validate input
    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      throw new Error('Player name is required');
    }
    
    if (typeof score !== 'number' || score < this.minQualifyingScore) {
      throw new Error(`Score must be at least ${this.minQualifyingScore}`);
    }

    // Sanitize player name
    const sanitizedName = playerName.trim().substring(0, 20);
    
    // Create score entry
    const scoreEntry = {
      id: Date.now() + Math.random(), // Simple ID generation
      name: sanitizedName,
      score: score,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('he-IL'),
      metadata: {
        wordsAttempted: metadata.wordsAttempted || 0,
        accuracy: metadata.accuracy || 0,
        ...metadata
      }
    };

    // Add to scores array
    this.scores.push(scoreEntry);
    
    // Sort by score (descending) and keep top scores
    this.scores.sort((a, b) => b.score - a.score);
    this.scores = this.scores.slice(0, this.maxScores);

    console.log(`New practice score: ${sanitizedName} - ${score} points`);
    
    return {
      rank: this.scores.findIndex(s => s.id === scoreEntry.id) + 1,
      total: this.scores.length,
      scoreEntry
    };
  }

  getLeaderboard(limit = 10) {
    return this.scores.slice(0, limit).map((score, index) => ({
      ...score,
      rank: index + 1
    }));
  }

  getPlayerStats(playerName) {
    if (!playerName) return null;
    
    const playerScores = this.scores.filter(s => 
      s.name.toLowerCase() === playerName.toLowerCase()
    );
    
    if (playerScores.length === 0) return null;

    const bestScore = Math.max(...playerScores.map(s => s.score));
    const totalGames = playerScores.length;
    const averageScore = playerScores.reduce((sum, s) => sum + s.score, 0) / totalGames;
    const bestRank = this.scores.findIndex(s => s.score === bestScore && 
                       s.name.toLowerCase() === playerName.toLowerCase()) + 1;

    return {
      playerName,
      bestScore,
      totalGames,
      averageScore: Math.round(averageScore * 10) / 10,
      bestRank: bestRank || null,
      recentScores: playerScores.slice(0, 5)
    };
  }

  getStats() {
    const totalScores = this.scores.length;
    const averageScore = totalScores > 0 ? 
      this.scores.reduce((sum, s) => sum + s.score, 0) / totalScores : 0;
    const topScore = totalScores > 0 ? this.scores[0].score : 0;
    const uniquePlayers = new Set(this.scores.map(s => s.name.toLowerCase())).size;

    return {
      totalScores,
      uniquePlayers,
      averageScore: Math.round(averageScore * 10) / 10,
      topScore,
      qualifyingThreshold: this.minQualifyingScore
    };
  }

  // Admin functions
  clearLeaderboard() {
    const count = this.scores.length;
    this.scores = [];
    console.log(`Cleared ${count} practice scores`);
    return { cleared: count };
  }

  removeScore(scoreId) {
    const initialLength = this.scores.length;
    this.scores = this.scores.filter(s => s.id !== scoreId);
    return { removed: initialLength > this.scores.length };
  }
}

module.exports = new PracticeLeaderboardService();