import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

interface PointsConfigurationProps {
  playerMatchPointsPerWin: number;
  teamMatchPointsPerWin: number;
  teamGamePointsPerWin: number;
  onPlayerMatchPointsPerWinChange: (value: number) => void;
  onTeamMatchPointsPerWinChange: (value: number) => void;
  onTeamGamePointsPerWinChange: (value: number) => void;
  disabled?: boolean;
}

export const PointsConfiguration: React.FC<PointsConfigurationProps> = ({
  playerMatchPointsPerWin,
  teamMatchPointsPerWin,
  teamGamePointsPerWin,
  onPlayerMatchPointsPerWinChange,
  onTeamMatchPointsPerWinChange,
  onTeamGamePointsPerWinChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-3">{t('leagues.points.config')}</h3>
      <p className="text-sm text-gray-600 mb-3">{t('leagues.points.configDesc')}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('leagues.points.playerMatchPerWin')}</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={playerMatchPointsPerWin}
            onChange={e => onPlayerMatchPointsPerWinChange(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 mt-1">{t('leagues.points.playerMatchPerWinDesc')}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('leagues.points.teamMatchPerWin')}</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={teamMatchPointsPerWin}
            onChange={e => onTeamMatchPointsPerWinChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 mt-1">{t('leagues.points.teamMatchPerWinDesc')}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('leagues.points.teamGamePerWin')}</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={teamGamePointsPerWin}
            onChange={e => onTeamGamePointsPerWinChange(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 mt-1">{t('leagues.points.teamGamePerWinDesc')}</p>
        </div>
      </div>
    </div>
  );
};
