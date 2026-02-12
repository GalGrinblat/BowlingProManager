import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

export interface PlayerMatchupConfigurationProps {
  lineupStrategy: string;
  lineupRule: string;
  onLineupStrategyChange: (value: string) => void;
  onLineupRuleChange: (value: string) => void;
  disabled?: boolean;
}

export const PlayerMatchupConfiguration: React.FC<PlayerMatchupConfigurationProps> = ({
  lineupStrategy,
  lineupRule,
  onLineupStrategyChange,
  onLineupRuleChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3">{t('leagues.playerMatchupConfiguration')}</h3>
      <p className="text-sm text-gray-600 mb-3">
        {t('leagues.lineup.strategyDesc')}
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('leagues.lineup.strategyLabel')}
          </label>
          <select
            value={lineupStrategy}
            onChange={e => onLineupStrategyChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          >
            <option value="flexible">{t('leagues.lineup.flexible')}</option>
            <option value="fixed">{t('leagues.lineup.fixed')}</option>
            <option value="rule-based">{t('leagues.lineup.ruleBased')}</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {lineupStrategy === 'flexible' && t('leagues.lineup.flexibleDesc')}
            {lineupStrategy === 'rule-based' && t('leagues.lineup.ruleBasedDesc')}
          </p>
        </div>
        {lineupStrategy === 'rule-based' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('leagues.lineup.rankingRuleLabel')}
            </label>
            <select
              value={lineupRule}
              onChange={e => onLineupRuleChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={disabled}
            >
              <option value="standard">{t('leagues.lineup.standard')}</option>
              <option value="balanced">{t('leagues.lineup.balanced')}</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {lineupRule === 'standard' && t('leagues.lineup.standardDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerMatchupConfiguration;
