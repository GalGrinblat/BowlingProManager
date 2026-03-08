import React, { useMemo } from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { GameTeamPanel } from './GameTeamPanel';
import { sortPlayersByAverage } from '../../../utils/lineupUtils';
import type { Game, GamePlayer } from '../../../types/index';

interface PreMatchSetupProps {
  game: Game;
  team1Players: GamePlayer[];
  team2Players: GamePlayer[];
  onToggleAbsent: (team: 'team1' | 'team2', playerIndex: number) => void;
  onMovePlayer: (team: 'team1' | 'team2', index: number, direction: 'up' | 'down') => void;
  onContinue: () => void;
  onBack: () => void;
}

export const PreMatchSetup: React.FC<PreMatchSetupProps> = ({
  game, team1Players, team2Players,
  onToggleAbsent, onMovePlayer, onContinue, onBack
}) => {
  const { t } = useTranslation();
  const lineupStrategy = game.lineupStrategy;
  const lineupRule = game.lineupRule;

  const displayTeam1Players = useMemo(() =>
    lineupStrategy === 'rule-based' ? sortPlayersByAverage(team1Players) : team1Players,
    [lineupStrategy, team1Players]
  );
  const displayTeam2Players = useMemo(() =>
    lineupStrategy === 'rule-based' ? sortPlayersByAverage(team2Players) : team2Players,
    [lineupStrategy, team2Players]
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button onClick={onBack} className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2">
            {t('common.leftArrow')} {t('common.back')}
          </button>
          <h1 className="text-3xl font-bold mb-2">{t('games.preGameSetup')}</h1>
          <p className="text-gray-400">
            {t('common.round')} {game.round}, {t('common.matchDay')} {game.matchDay}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {t('games.reviewPlayers')}
          </p>
          <div className="mt-4 bg-blue-900/30 border border-blue-500 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-semibold">{t('games.lineupStrategyLabel')}</span>
              <span className="text-white">
                {lineupStrategy === 'flexible' && `🔄 ${t('games.lineupFlexible')}`}
                {lineupStrategy === 'fixed' && `🔒 ${t('games.lineupFixed')}`}
                {lineupStrategy === 'rule-based' && `📊 ${t('games.lineupRuleBased')} - ${lineupRule === 'standard' ? t('games.lineupStandard') : t('games.lineupBalanced')}`}
              </span>
            </div>
            {lineupStrategy === 'rule-based' && (
              <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                <span>⚡</span>
                <span>
                  {lineupRule === 'standard'
                    ? t('games.lineupRuleStandardDesc')
                    : t('games.lineupRuleBalancedDesc')}
                </span>
              </p>
            )}
            {lineupStrategy === 'fixed' && (
              <p className="text-xs text-gray-400 mt-1">
                {t('games.lineupLocked')}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GameTeamPanel
            teamName={game.team1?.name || t('games.team1')}
            teamColor="text-blue-400"
            players={displayTeam1Players}
            team="team1"
            lineupStrategy={lineupStrategy}
            toggleAbsent={onToggleAbsent}
            movePlayer={onMovePlayer}
            t={t}
          />
          <GameTeamPanel
            teamName={game.team2?.name || t('games.team2')}
            teamColor="text-green-400"
            players={displayTeam2Players}
            team="team2"
            lineupStrategy={lineupStrategy}
            toggleAbsent={onToggleAbsent}
            movePlayer={onMovePlayer}
            t={t}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={onContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
          >
            {t('games.continueToMatch')} {t('common.rightArrow')}
          </button>
        </div>
      </div>
    </div>
  );
};
