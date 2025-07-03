export const translations = {
  he: {
    // App Title
    gameTitle: "🎯 אליאס",
    
    // Home Screen
    teamName: "שם הקבוצה",
    teamNamePlaceholder: "תבחרו שם לקבוצה",
    teamColor: "צבע הקבוצה",
    addTeam: "הוסף קבוצה",
    registeredTeams: "קבוצות רשומות:",
    startGame: "🚀 התחל משחק!",
    
    // Game Board
    gameBoard: "🏁 לוח המשחק",
    position: "מיקום",
    totalScore: "ניקוד כולל",
    currentTurn: "תור נוכחי",
    teamTurn: "תור של", // "תור של קבוצה 1"
    
    // Turn Screen
    score: "ניקוד",
    gotIt: "הבא",
    skip: "דלג",
    
    // End Screen
    congratulations: "🎉 מזל טוב!",
    winner: "ניצחה!", // "קבוצה 1 ניצחה!"
    gameSummary: "סיכום המשחק",
    newGame: "🔄 משחק חדש",
    
    // Language Toggle
    languageButton: "English"
  },
  
  en: {
    // App Title
    gameTitle: "🎯 Alias",
    
    // Home Screen
    teamName: "Team Name",
    teamNamePlaceholder: "Choose a team name",
    teamColor: "Team Color",
    addTeam: "Add Team",
    registeredTeams: "Registered Teams:",
    startGame: "🚀 Start Game!",
    
    // Game Board
    gameBoard: "🏁 Game Board",
    position: "Position",
    totalScore: "Total Score",
    currentTurn: "Current Turn",
    teamTurn: "Turn for", // "Turn for Team 1"
    
    // Turn Screen
    score: "Score",
    gotIt: "Got It",
    skip: "Skip",
    
    // End Screen
    congratulations: "🎉 Congratulations!",
    winner: "Wins!", // "Team 1 Wins!"
    gameSummary: "Game Summary",
    newGame: "🔄 New Game",
    
    // Language Toggle
    languageButton: "עברית"
  }
};

// Helper function to get translation
export const getTranslation = (language, key) => {
  return translations[language]?.[key] || translations['he'][key] || key;
};