// frontend/src/services/practiceApi.js
const API_BASE = 'http://ec2-16-170-219-18.eu-north-1.compute.amazonaws.com:3001/api';

export const practiceApi = {
  // Submit a score to the global leaderboard
  async submitScore(playerName, score, metadata = {}) {
    try {
      const response = await fetch(`${API_BASE}/practice/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName,
          score,
          ...metadata
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit score');
      }

      return data;
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  },

  // Get global leaderboard
  async getLeaderboard(limit = 10) {
    try {
      const response = await fetch(`${API_BASE}/practice/leaderboard?limit=${limit}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }

      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  // Get player statistics
  async getPlayerStats(playerName) {
    try {
      const response = await fetch(`${API_BASE}/practice/player/${encodeURIComponent(playerName)}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Player not found' };
        }
        throw new Error(data.error || 'Failed to fetch player stats');
      }

      return data;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  },

  // Get leaderboard statistics
  async getStats() {
    try {
      const response = await fetch(`${API_BASE}/practice/stats`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
};