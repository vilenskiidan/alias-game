import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';
import { trackGameRulesViewed } from '../analytics';

const GameRules = ({ isOpen, onClose }) => {
  const { language } = useLanguage();

  // Track when game rules are viewed
  useEffect(() => {
    if (isOpen) {
      trackGameRulesViewed(language);
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: '#F5E6D3' }}
        >
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onClose}
              className="text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              style={{ color: '#6B5D54', backgroundColor: '#FFF8F3' }}
            >
              ×
            </button>
            <h2
              className="text-3xl font-bold"
              style={{ color: '#6B5D54' }}
              dir={language === 'he' ? 'rtl' : 'ltr'}
            >
              {getTranslation(language, 'gameRules')}
            </h2>
            <div className="w-10"></div>
          </div>

          <div
            className="space-y-6 text-lg"
            style={{ color: '#6B5D54' }}
            dir={language === 'he' ? 'rtl' : 'ltr'}
          >
            {/* Objective */}
            <div>
              <h3 className="font-bold text-xl mb-2" style={{ color: '#8B6F47' }}>
                {getTranslation(language, 'rulesObjectiveTitle')}
              </h3>
              <p>{getTranslation(language, 'rulesObjective')}</p>
            </div>

            {/* Setup */}
            <div>
              <h3 className="font-bold text-xl mb-2" style={{ color: '#8B6F47' }}>
                {getTranslation(language, 'rulesSetupTitle')}
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>{getTranslation(language, 'rulesSetup1')}</li>
                <li>{getTranslation(language, 'rulesSetup2')}</li>
                <li>{getTranslation(language, 'rulesSetup3')}</li>
              </ul>
            </div>

            {/* How to Play */}
            <div>
              <h3 className="font-bold text-xl mb-2" style={{ color: '#8B6F47' }}>
                {getTranslation(language, 'rulesHowToPlayTitle')}
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>{getTranslation(language, 'rulesPlay1')}</li>
                <li>{getTranslation(language, 'rulesPlay2')}</li>
                <li>{getTranslation(language, 'rulesPlay3')}</li>
                <li>{getTranslation(language, 'rulesPlay4')}</li>
                <li>{getTranslation(language, 'rulesPlay5')}</li>
              </ul>
            </div>

            {/* Scoring */}
            <div>
              <h3 className="font-bold text-xl mb-2" style={{ color: '#8B6F47' }}>
                {getTranslation(language, 'rulesScoringTitle')}
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>{getTranslation(language, 'rulesScoring1')}</li>
                <li>{getTranslation(language, 'rulesScoring2')}</li>
                <li>{getTranslation(language, 'rulesScoring3')}</li>
              </ul>
            </div>

            {/* Winning */}
            <div>
              <h3 className="font-bold text-xl mb-2" style={{ color: '#8B6F47' }}>
                {getTranslation(language, 'rulesWinningTitle')}
              </h3>
              <p>{getTranslation(language, 'rulesWinning')}</p>
            </div>

            {/* Tips */}
            <div className="rounded-lg p-4" style={{ backgroundColor: '#FFF8F3' }}>
              <h3 className="font-bold text-xl mb-2" style={{ color: '#8B6F47' }}>
                {getTranslation(language, 'rulesTipsTitle')}
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>{getTranslation(language, 'rulesTip1')}</li>
                <li>{getTranslation(language, 'rulesTip2')}</li>
                <li>{getTranslation(language, 'rulesTip3')}</li>
              </ul>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full mt-6 text-white py-3 rounded-lg font-bold text-xl transition-colors shadow-lg"
            style={{ backgroundColor: '#8B6F47' }}
          >
            {getTranslation(language, 'close')}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GameRules;
