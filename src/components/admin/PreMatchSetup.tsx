import React, { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import type { Game } from '../../types/index.ts';

interface PreMatchSetupProps {
  game: Game;
  onContinue: (updatedGame: Game) => void;
  onBack: () => void;
}

export const PreMatchSetup: React.FC<PreMatchSetupProps> = ({ game, onContinue, onBack }) => {
  const { t } = useTranslation();
  const gameData = game as any; // Cast to bypass strict typing for runtime data structure
  const [team1Players, setTeam1Players] = useState(gameData.team1.players);
  const [team2Players, setTeam2Players] = useState(gameData.team2.players);

  const lineupStrategy = gameData.lineupStrategy || 'flexible';
  const lineupRule = gameData.lineupRule || 'standard';
  const isLineupLocked = lineupStrategy === 'fixed' || lineupStrategy === 'rule-based';

  const toggleAbsent = (team: 'team1' | 'team2', playerIndex: number) => {
    if (team === 'team1') {
      const updated = [...team1Players];
      updated[playerIndex] = {
        ...updated[playerIndex],
        absent: !updated[playerIndex].absent
      };
      setTeam1Players(updated);
    } else {
      const updated = [...team2Players];
      updated[playerIndex] = {
        ...updated[playerIndex],
        absent: !updated[playerIndex].absent
      };
      setTeam2Players(updated);
    }
  };

  const handleContinue = () => {
    const updatedGame = {
      ...gameData,
      team1: {
        ...gameData.team1,
        players: team1Players
      },
      team2: {
        ...gameData.team2,
        players: team2Players
      }
    };
    onContinue(updatedGame);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-3xl font-bold mb-2">{t('games.preMatchSetup')}</h1>
          <p className="text-gray-400">
            {t('games.round')} {game.round}, {t('games.matchDay')} {game.matchDay}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {t('games.reviewPlayers')}
          </p>
          
          {/* Lineup Strategy Info */}
          <div className="mt-4 bg-blue-900/30 border border-blue-500 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-semibold">{t('games.lineupStrategyLabel')}</span>
              <span className="text-white">
                {lineupStrategy === 'flexible' && `🔄 ${t('games.lineupFlexible')}`}
                {lineupStrategy === 'fixed' && `🔒 ${t('games.lineupFixed')}`}
                {lineupStrategy === 'rule-based' && `📊 ${t('games.lineupRuleBased')} - ${lineupRule === 'standard' ? t('games.lineupStandard') : t('games.lineupBalanced')}`}
              </span>
            </div>
            {isLineupLocked && (
              <p className="text-xs text-gray-400 mt-1">
                {t('games.lineupLocked')}
              </p>
            )}
          </div>
        </div>

        {/* Teams Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Team 1 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">
              {gameData.team1.name}
            </h2>
            <div className="space-y-3">
              {team1Players.map((player: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    player.absent
                      ? 'bg-red-900/20 border-red-500'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {player.rank}. {player.name}
                        </span>
                        {player.absent && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                            {t('games.absent').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {t('common.average')}: <span className="text-white font-medium">{player.average}</span>
                        {' • '}
                        {t('games.handicap')}: <span className="text-white font-medium">{player.handicap}</span>
                      </div>
                      {player.absent && (
                        <div className="text-xs text-red-400 mt-1">
                          {t('games.willUse')}: {parseInt(player.average) - 10} {t('games.pinsPerGame')}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleAbsent('team1', idx)}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        player.absent
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {player.absent ? t('games.markPresent') : t('games.markAbsent')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-green-400">
              {gameData.team2.name}
            </h2>
            <div className="space-y-3">
              {team2Players.map((player: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    player.absent
                      ? 'bg-red-900/20 border-red-500'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {player.rank}. {player.name}
                        </span>
                        {player.absent && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                            {t('games.absent').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {t('common.average')}: <span className="text-white font-medium">{player.average}</span>
                        {' • '}
                        {t('games.handicap')}: <span className="text-white font-medium">{player.handicap}</span>
                      </div>
                      {player.absent && (
                        <div className="text-xs text-red-400 mt-1">
                          {t('games.willUse')}: {parseInt(player.average) - 10} {t('games.pinsPerGame')}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleAbsent('team2', idx)}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        player.absent
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {player.absent ? t('games.markPresent') : t('games.markAbsent')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
          >
            {t('games.continueToMatch')} →
          </button>
        </div>
      </div>
    </div>
  );
};
