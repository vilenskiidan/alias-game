
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className="fixed top-4 left-4 z-50 bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg hover:bg-opacity-30 transition-all"
    >
      {getTranslation(language, 'languageButton')}
    </motion.button>
  );
};

export default LanguageToggle;