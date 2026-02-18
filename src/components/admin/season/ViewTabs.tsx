import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';

interface ViewTabsProps {
  view: string;
  isCompleted: boolean;
  onViewChange: (view: string) => void;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({ view, isCompleted, onViewChange }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'schedule', icon: '📅', label: isCompleted ? t('seasons.gameResults') : t('seasons.schedule') },
    { id: 'teamStandings', icon: '🏆', label: isCompleted ? t('seasons.finalTeamStandings') : t('seasons.teamStandings') },
    { id: 'h2h', icon: '📊', label: t('seasons.headToHead') },
    { id: 'playerStandings', icon: '👥', label: t('seasons.playerStandings') },
    { id: 'records', icon: '🏅', label: t('seasons.seasonRecords') },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id)}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-colors ${
            view === tab.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
};
