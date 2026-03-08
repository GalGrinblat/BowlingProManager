import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from '../../common/Icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from '../../../contexts/LanguageContext';

export const BoardHeader: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { t, language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <div className="text-center mb-8 animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 flex justify-start items-center">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors touch-manipulation"
            title="Switch Language / החלף שפה"
          >
            {language === 'en' ? '🌐 עב' : '🌐 EN'}
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Trophy className="text-orange-600 hidden sm:block" size={40} strokeWidth={2.5} />
          <h1 className="bowling-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900">
            BOWLING PRO MANAGER
          </h1>
          <Trophy className="text-orange-600 hidden sm:block" size={40} strokeWidth={2.5} />
        </div>
        <div className="flex-1 flex justify-end items-center">
          {currentUser && isAdmin() ? (
            <Link
              to="/admin"
              className="px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold touch-manipulation"
            >
              {t('board.backToAdmin')}
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs sm:text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-semibold touch-manipulation"
            >
              {t('board.signIn')}
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <p className="text-gray-600 font-semibold text-sm sm:text-base lg:text-lg">
          {t('board.title')}
        </p>
        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
          {t('board.viewerNotice')}
        </span>
      </div>
    </div>
  );
};
