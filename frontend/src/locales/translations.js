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
    gameBoard: "לוח המשחק",
    position: "מיקום",
    totalScore: "ניקוד מהסיבוב האחרון",
    currentTurn: "תור נוכחי",
    teamTurn: "תור של", // "תור של קבוצה 1"
    
    // Turn Screen
    score: "ניקוד",
    gotIt: "הבא",
    skip: "דלג",
    
    // End Screen
    congratulations: "מזל טוב!",
    winner: "ניצחה!", // "קבוצה 1 ניצחה!"
    gameSummary: "סיכום המשחק",
    newGame: "משחק חדש",
    
    // Language Toggle
    languageButton: "English",

    // Game Rules
    gameRules: "📖 חוקי המשחק",
    close: "סגור",
    rulesObjectiveTitle: "🎯 מטרת המשחק",
    rulesObjective: "להיות הקבוצה הראשונה שמגיעה ל-30 נקודות על ידי הסבר וניחוש מילים.",
    rulesSetupTitle: "⚙️ הכנה",
    rulesSetup1: "2-4 קבוצות יכולות לשחק",
    rulesSetup2: "כל קבוצה בוחרת שם וצבע",
    rulesSetup3: "לוח המשחק הולך מ-0 עד 30",
    rulesHowToPlayTitle: "🎮 איך משחקים",
    rulesPlay1: "בכל תור, קבוצה אחת תקבל 60 שניות להסביר מילים",
    rulesPlay2: "המסביר רואה מילה על המסך ומסביר אותה מבלי להגיד את המילה עצמה",
    rulesPlay3: "שאר חברי הקבוצה מנחשים",
    rulesPlay4: "לחצו 'הבא' אם ניחשתם נכון, 'דלג' אם רוצים לוותר על המילה",
    rulesPlay5: "כשהזמן נגמר, התור עובר לקבוצה הבאה",
    rulesScoringTitle: "📊 ניקוד",
    rulesScoring1: "מילה שנוחשה = +1 נקודה",
    rulesScoring2: "דילוג על מילה = -1 נקודה",
    rulesScoring3: "הניקוד הסופי של התור מזיז את הקבוצה על הלוח",
    rulesWinningTitle: "🏆 איך מנצחים",
    rulesWinning: "הקבוצה הראשונה שמגיעה ל-30 נקודות מנצחת! אם קבוצה חוצה את ה-30, כל הקבוצות האחרות מקבלות תור אחד נוסף להשוות את התוצאה.",
    rulesTipsTitle: "💡 טיפים",
    rulesTip1: "תארו בצורה יצירתית - השתמשו בדוגמאות, היפוכים, או קטגוריות",
    rulesTip2: "אל תבזבזו זמן על מילים קשות מדי - לפעמים כדאי לדלג",
    rulesTip3: "תקשורת טובה בין חברי הקבוצה היא המפתח!"
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
    gameBoard: "Game Board",
    position: "Position",
    totalScore: "Score From Last Turn",
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
    newGame: "New Game",
    
    // Language Toggle
    languageButton: "עברית",

    // Game Rules
    gameRules: "📖 Game Rules",
    close: "Close",
    rulesObjectiveTitle: "🎯 Objective",
    rulesObjective: "Be the first team to reach 30 points by explaining and guessing words.",
    rulesSetupTitle: "⚙️ Setup",
    rulesSetup1: "2-4 teams can play",
    rulesSetup2: "Each team chooses a name and color",
    rulesSetup3: "The game board goes from 0 to 30",
    rulesHowToPlayTitle: "🎮 How to Play",
    rulesPlay1: "Each turn, one team gets 60 seconds to explain words",
    rulesPlay2: "The explainer sees a word on the screen and explains it without saying the word itself",
    rulesPlay3: "Other team members guess",
    rulesPlay4: "Click 'Got It' if guessed correctly, 'Skip' if you want to pass on the word",
    rulesPlay5: "When time runs out, the turn passes to the next team",
    rulesScoringTitle: "📊 Scoring",
    rulesScoring1: "Guessed word = +1 point",
    rulesScoring2: "Skipped word = -1 point",
    rulesScoring3: "The final turn score moves the team on the board",
    rulesWinningTitle: "🏆 Winning",
    rulesWinning: "The first team to reach 30 points wins! If a team crosses 30, all other teams get one more turn to tie the score.",
    rulesTipsTitle: "💡 Tips",
    rulesTip1: "Describe creatively - use examples, opposites, or categories",
    rulesTip2: "Don't waste time on too-difficult words - sometimes it's better to skip",
    rulesTip3: "Good communication between team members is key!"
  }
};

// Helper function to get translation
export const getTranslation = (language, key) => {
  return translations[language]?.[key] || translations['he'][key] || key;
};
