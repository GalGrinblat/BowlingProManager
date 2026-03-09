import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { MAX_BOWLING_SCORE } from '../../../constants/bowling';

export interface BonusRule {
  type: 'player' | 'team';
  condition: 'vs_average' | 'pure_score';
  threshold: number;
  points: number;
}

interface BonusRulesConfigurationProps {
  bonusRules: BonusRule[];
  teamAllPresentBonusEnabled: boolean;
  teamAllPresentBonusPoints: number;
  onBonusRulesChange: (rules: BonusRule[]) => void;
  onTeamAllPresentBonusEnabledChange: (enabled: boolean) => void;
  onTeamAllPresentBonusPointsChange: (points: number) => void;
  disabled?: boolean;
}

export const BonusRulesConfiguration: React.FC<BonusRulesConfigurationProps> = ({
  bonusRules,
  teamAllPresentBonusEnabled,
  teamAllPresentBonusPoints,
  onBonusRulesChange,
  onTeamAllPresentBonusEnabledChange,
  onTeamAllPresentBonusPointsChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const handleRuleChange = (idx: number, field: keyof BonusRule, value: string) => {
    const updated = [...bonusRules];
    if (updated[idx]) {
      switch (field) {
        case 'type':
          if (value === 'player' || value === 'team') {
            updated[idx] = {
              ...updated[idx],
              type: value,
              condition: value === 'team' ? 'pure_score' : 'vs_average',
            };
          }
          break;
        case 'condition':
          if (value === 'vs_average' || value === 'pure_score') {
            updated[idx] = {
              ...updated[idx],
              condition: value,
            };
          }
          break;
        case 'threshold':
          {
            const valueNum = parseInt(value) || 0;
            updated[idx] = {
              ...updated[idx],
              threshold: valueNum,
            };
          }
          break;
        case 'points':
          {
            const valueNum = parseInt(value) || 1;
            updated[idx] = {
              ...updated[idx],
              points: valueNum,
            };
          }
          break;
        default:
          break;
      }
    }
    onBonusRulesChange(updated);
  };

  const handleRemoveRule = (idx: number) => {
    const updated = bonusRules.filter((_, i) => i !== idx);
    onBonusRulesChange(updated);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-800">{t('leagues.bonus.bonusPointsConfiguration')}</h3>
        <button
          type="button"
          onClick={() => onBonusRulesChange([...bonusRules, { type: 'player', condition: 'vs_average', threshold: 50, points: 1 }])}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold text-sm"
          disabled={disabled}
        >
          + {t('leagues.bonus.addRule')}
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-3">{t('leagues.bonus.rulesDesc')}</p>
      <div className="space-y-3">
        {/* All Players Present Bonus Option */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="teamAllPresentBonusEnabled"
            checked={teamAllPresentBonusEnabled}
            onChange={e => onTeamAllPresentBonusEnabledChange(e.target.checked)}
            className="mr-2"
            disabled={disabled}
          />
          <label htmlFor="teamAllPresentBonusEnabled" className="text-sm font-semibold text-gray-700">
            {t('leagues.bonus.allPresentLabel')}
          </label>
          {teamAllPresentBonusEnabled && (
            <input
              type="number"
              min="1"
              max="10"
              value={teamAllPresentBonusPoints}
              onChange={e => onTeamAllPresentBonusPointsChange(Number(e.target.value))}
              className="ml-4 w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              disabled={disabled}
            />
          )}
          {teamAllPresentBonusEnabled && (
            <span className="ml-2 text-xs text-gray-500">{t('leagues.bonus.allPresentPoints')}</span>
          )}
        </div>
        {bonusRules.map((rule, idx) => (
          <div key={`${rule.type}-${rule.condition}-${idx}`} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('leagues.bonus.applyTo')}</label>
                <select
                  value={rule.type}
                  onChange={e => handleRuleChange(idx, 'type', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  disabled={disabled}
                >
                  <option value="player">{t('common.player')}</option>
                  <option value="team">{t('common.team')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('leagues.bonus.condition')}</label>
                <select
                  value={rule.condition}
                  onChange={e => handleRuleChange(idx, 'condition', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  disabled={disabled || rule.type === 'team'}
                >
                  {rule.type === 'player' && (
                    <option value="vs_average">{t('leagues.bonus.scoreVsAverage')}</option>
                  )}
                  <option value="pure_score">{t('common.score')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {rule.condition === 'vs_average' ? t('leagues.bonus.aboveAvg') : t('common.score')}
                </label>
                <input
                  type="number"
                  min="0"
                  max={MAX_BOWLING_SCORE}
                  value={rule.threshold}
                  onChange={e => handleRuleChange(idx, 'threshold', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('common.points')}</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rule.points}
                  onChange={e => handleRuleChange(idx, 'points', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  disabled={disabled}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="w-full px-2 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold text-sm"
                  disabled={disabled}
                >
                  {t('leagues.bonus.removeRule')}
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {rule.type === 'player' ? `👤 ${t('common.player')}` : `👥 ${t('common.team')}`} {t('common.points')}: <strong className="ltr-content">+{rule.points}</strong> {rule.condition === 'vs_average' 
                ? `(${rule.threshold}+ ${t('leagues.bonus.aboveAvg')})`
                : `(${rule.threshold}+ ${t('common.score')})`
              }
            </div>
          </div>
        ))}
        {bonusRules.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            {t('leagues.bonus.rulesDesc')}
          </div>
        )}
      </div>
    </div>
  );
};
