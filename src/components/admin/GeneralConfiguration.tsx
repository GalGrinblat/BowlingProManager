import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

export interface GeneralConfigurationProps {
  numberOfTeams: number;
  playersPerTeam: number;
  numberOfRounds: number;
  matchesPerGame: number;
  dayOfWeek: string;
  onNumberOfTeamsChange: (value: number) => void;
  onPlayersPerTeamChange: (value: number) => void;
  onNumberOfRoundsChange: (value: number) => void;
  onMatchesPerGameChange: (value: number) => void;
  onDayOfWeekChange: (value: string) => void;
  disabled?: boolean;
}

const GeneralConfiguration: React.FC<GeneralConfigurationProps> = ({
  numberOfTeams,
  playersPerTeam,
  numberOfRounds,
  matchesPerGame,
  dayOfWeek,
  onNumberOfTeamsChange,
  onPlayersPerTeamChange,
  onNumberOfRoundsChange,
  onMatchesPerGameChange,
  onDayOfWeekChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3">{t('leagues.generalConfiguration')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('leagues.defaultNumberOfTeams')}
          </label>
          <input
            type="number"
            min="2"
            max="24"
            value={numberOfTeams}
            onChange={e => onNumberOfTeamsChange(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 mt-1">{t('leagues.defaultNumberOfTeamsDesc')}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('leagues.defaultPlayersPerTeam')}
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={playersPerTeam}
            onChange={e => onPlayersPerTeamChange(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 mt-1">{t('leagues.canChangePerSeason')}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('leagues.defaultNumberOfRounds')}
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={numberOfRounds}
            onChange={e => onNumberOfRoundsChange(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 mt-1">{t('leagues.defaultNumberOfRoundsDesc')}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('leagues.defaultMatchesPerGame')}
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={matchesPerGame}
            onChange={e => onMatchesPerGameChange(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 mt-1">{t('leagues.matchesInGame')}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('leagues.leagueDay')}
          </label>
          <select
            value={dayOfWeek}
            onChange={e => onDayOfWeekChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          >
            <option value="">{t('leagues.selectDay')}</option>
            <option value="Sunday">{t('days.sunday')}</option>
            <option value="Monday">{t('days.monday')}</option>
            <option value="Tuesday">{t('days.tuesday')}</option>
            <option value="Wednesday">{t('days.wednesday')}</option>
            <option value="Thursday">{t('days.thursday')}</option>
            <option value="Friday">{t('days.friday')}</option>
            <option value="Saturday">{t('days.saturday')}</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">{t('leagues.dayPlayed')}</p>
        </div>
      </div>
    </div>
  );
};

export default GeneralConfiguration;
