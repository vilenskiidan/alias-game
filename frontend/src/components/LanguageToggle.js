
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
      className="fixed top-4 left-4 z-50 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-lg transition-all"
      style={{
        backgroundColor: 'rgba(107, 93, 84, 0.5)',
        color: '#FFF8F3',
        border: '1px solid rgba(160, 130, 109, 0.6)'
      }}
    >
      {getTranslation(language, 'languageButton')}
    </motion.button>
  );
};

export default LanguageToggle;