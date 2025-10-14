import { createContext, useContext, useState, useEffect } from 'react';
import { trackLanguageChanged, trackSessionStart } from '../analytics';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Detect user's country and return appropriate default language
const detectDefaultLanguage = async () => {
  let countryCode = null;

  try {
    // Check if language is already stored in localStorage
    const storedLanguage = localStorage.getItem('aliasGameLanguage');
    if (storedLanguage) {
      return { language: storedLanguage, countryCode: null };
    }

    // Try to detect location using a free geolocation API
    const response = await fetch('https://ipapi.co/json/', {
      timeout: 3000
    });

    if (response.ok) {
      const data = await response.json();
      countryCode = data.country_code;

      // If user is from Israel, default to Hebrew, otherwise English
      const language = countryCode === 'IL' ? 'he' : 'en';
      return { language, countryCode };
    }
  } catch (error) {
    console.log('Location detection failed, using Hebrew as default:', error);
  }

  // Default to Hebrew if detection fails
  return { language: 'he', countryCode: null };
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('he'); // Initial default
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect and set the default language on mount
    detectDefaultLanguage().then(({ language: detectedLang, countryCode }) => {
      setLanguage(detectedLang);
      setIsLoading(false);

      // Track session start with language and location
      trackSessionStart(detectedLang, countryCode);
    });
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'he' ? 'en' : 'he';
      // Store the user's choice in localStorage
      localStorage.setItem('aliasGameLanguage', newLang);

      // Track language change
      trackLanguageChanged(prev, newLang);

      return newLang;
    });
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};