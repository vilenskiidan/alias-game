import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;

  if (measurementId) {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        anonymizeIp: true,
      }
    });
    console.log('Google Analytics initialized');
  } else {
    console.warn('Google Analytics Measurement ID not found. Set REACT_APP_GA_MEASUREMENT_ID in .env');
  }
};

// Check if GA is initialized
export const isGAInitialized = () => {
  return !!process.env.REACT_APP_GA_MEASUREMENT_ID;
};

// ==================== SCREEN TRACKING ====================

export const trackScreenView = (screenName, additionalData = {}) => {
  if (!isGAInitialized()) return;

  ReactGA.send({
    hitType: "pageview",
    page: `/${screenName}`,
    title: screenName,
    ...additionalData
  });

  console.log('📊 Screen View:', screenName, additionalData);
};

// ==================== GAME LIFECYCLE EVENTS ====================

export const trackGameCreated = (teamCount) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Game',
    action: 'game_created',
    label: `${teamCount} teams`,
    value: teamCount
  });

  console.log('📊 Game Created:', teamCount, 'teams');
};

export const trackTeamAdded = (teamNumber, teamColor) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Game',
    action: 'team_added',
    label: `Team ${teamNumber}`,
    value: teamNumber
  });

  console.log('📊 Team Added:', teamNumber);
};

export const trackGameStarted = (teamCount, language) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Game',
    action: 'game_started',
    label: language,
    value: teamCount
  });

  console.log('📊 Game Started:', teamCount, 'teams, language:', language);
};

export const trackTurnStarted = (teamName, turnNumber) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Gameplay',
    action: 'turn_started',
    label: teamName,
    value: turnNumber
  });

  console.log('📊 Turn Started:', teamName, 'turn', turnNumber);
};

export const trackTurnCompleted = (teamName, wordsGuessed, wordsSkipped, finalScore) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Gameplay',
    action: 'turn_completed',
    label: teamName,
    value: finalScore
  });

  // Additional detailed event
  ReactGA.event({
    category: 'Gameplay',
    action: 'turn_stats',
    label: `Guessed: ${wordsGuessed}, Skipped: ${wordsSkipped}`,
    value: wordsGuessed
  });

  console.log('📊 Turn Completed:', { teamName, wordsGuessed, wordsSkipped, finalScore });
};

export const trackGameCompleted = (winnerName, totalTurns, gameDuration) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Game',
    action: 'game_completed',
    label: winnerName,
    value: totalTurns
  });

  console.log('📊 Game Completed:', { winnerName, totalTurns, gameDuration });
};

export const trackGameReset = () => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Game',
    action: 'game_reset'
  });

  console.log('📊 Game Reset');
};

// ==================== USER INTERACTION EVENTS ====================

export const trackWordGuessed = (timeRemaining) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Interaction',
    action: 'word_guessed',
    value: Math.floor(timeRemaining)
  });
};

export const trackWordSkipped = (timeRemaining) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Interaction',
    action: 'word_skipped',
    value: Math.floor(timeRemaining)
  });
};

export const trackLanguageChanged = (fromLanguage, toLanguage) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'User Preference',
    action: 'language_changed',
    label: `${fromLanguage} → ${toLanguage}`
  });

  console.log('📊 Language Changed:', fromLanguage, '→', toLanguage);
};

export const trackGameRulesViewed = (language) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'User Interaction',
    action: 'game_rules_viewed',
    label: language
  });

  console.log('📊 Game Rules Viewed:', language);
};

// ==================== SESSION TRACKING ====================

export const trackSessionStart = (language, userLocation = null) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Session',
    action: 'session_start',
    label: language
  });

  // Set user properties
  ReactGA.set({
    language: language,
    user_location: userLocation
  });

  console.log('📊 Session Start:', { language, userLocation });
};

// ==================== ERROR TRACKING ====================

export const trackError = (errorMessage, errorLocation) => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Error',
    action: 'error_occurred',
    label: `${errorLocation}: ${errorMessage}`
  });

  console.log('📊 Error Tracked:', errorLocation, errorMessage);
};

// ==================== TIMING EVENTS ====================

export const trackTiming = (category, variable, value, label = '') => {
  if (!isGAInitialized()) return;

  ReactGA.event({
    category: 'Timing',
    action: `${category}_${variable}`,
    label: label,
    value: Math.floor(value)
  });
};
