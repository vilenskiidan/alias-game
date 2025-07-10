const API_BASE = 'https://play.getalias.xyz/api';

export const gameAPI = {
  // Create a new game
  async createGame(initialData = {}) {
    const response = await fetch(`${API_BASE}/game/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialData)
    });
    return response.json();
  },

  // Get game state
  async getGame(gameId) {
    const response = await fetch(`${API_BASE}/game/${gameId}`);
    return response.json();
  },

  // Add team to game
  async addTeam(gameId, teamData) {
    const response = await fetch(`${API_BASE}/game/${gameId}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData)
    });
    return response.json();
  },

  // Start game
  async startGame(gameId) {
    const response = await fetch(`${API_BASE}/game/${gameId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  // Start turn
  async startTurn(gameId, teamId) {
    const response = await fetch(`${API_BASE}/game/${gameId}/turn/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId })
    });
    return response.json();
  },

  // Submit turn result
  async submitTurnResult(gameId, turnData) {
    const response = await fetch(`${API_BASE}/game/${gameId}/turn/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turnData)
    });
    return response.json();
  },

  // Get next word
  async getNextWord() {
    const response = await fetch(`${API_BASE}/words/next`);
    return response.json();
  },

  // Get batch of words
  async getBatchWords(count = 20) {
    const response = await fetch(`${API_BASE}/words/batch/${count}`);
    return response.json();
  }
};