import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';

interface SeasonProgressBarProps {
  progressPercent: number;
}

export const SeasonProgressBar: React.FC<SeasonProgressBarProps> = ({ progressPercent }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">{t('seasons.seasonProgress')}</h2>
        <span className="text-sm font-semibold">{Math.round(progressPercent)}%</span>
      </div>
      <div className="bg-blue-400 rounded-full h-3">
        <div
          className="bg-white rounded-full h-3 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
