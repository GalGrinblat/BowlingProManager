import { Trophy } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';

import type { HeaderProps } from '../types/index';

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const { playerData } = useAuth();
  const { t, language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <div className="text-center mb-8 animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 flex justify-start items-center">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors touch-manipulation"
            title="Switch Language / החלף שפה"
          >
            {language === 'en' ? '🌐 EN' : '🌐 עב'}
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Trophy className="text-orange-600 hidden sm:block" size={40} strokeWidth={2.5} />
          <h1 className="bowling-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900">
            BOWLING LEAGUE
          </h1>
          <Trophy className="text-orange-600 hidden sm:block" size={40} strokeWidth={2.5} />
        </div>
        <div className="flex-1 flex justify-end items-center">
          {currentUser && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                {currentUser.role === 'admin' ? (
                  <span className="text-sm text-gray-600">👤 {t('auth.admin')}</span>
                ) : playerData ? (
                  <>
                    <div className="text-sm font-semibold text-gray-800">{playerData.name}</div>
                    <div className="text-xs text-gray-500">{t('auth.player')}</div>
                  </>
                ) : (
                  <span className="text-sm text-gray-600">👤 {t('auth.player')}</span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-semibold touch-manipulation"
              >
                {t('auth.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="text-gray-600 font-semibold text-sm sm:text-base lg:text-lg">League Management System</p>
    </div>
  );
}
