import React from 'react';
import type { PlayerStats } from '../../../types/index';

interface PlayerStandingsTableProps {
  playerStats: PlayerStats[];
  direction?: 'ltr' | 'rtl';
  t: (key: string) => string;
  showHeader?: boolean;
  compact?: boolean;
  className?: string;
  previousRanks?: Map<string, number>;
  lastMatchdayPins?: Map<string, number[]>;
  teamCompletedGameCount?: Map<string, number>;
}

export const PlayerStandingsTable: React.FC<PlayerStandingsTableProps> = ({
  playerStats,
  direction = 'ltr',
  t,
  showHeader: _showHeader = true,
  compact = false,
  className = '',
  previousRanks,
  lastMatchdayPins,
  teamCompletedGameCount,
}) => {
  const isRTL = direction === 'rtl';

  const cellPadding = compact ? 'px-2 py-2' : 'px-3 sm:px-4 py-3';
  const headerPadding = compact ? 'px-2 py-2' : 'px-3 sm:px-4 py-3';

  const getRankArrow = (teamId: string, playerName: string, currentRank: number) => {
    if (!previousRanks || compact) return null;
    const prev = previousRanks.get(`${teamId}-${playerName}`);
    if (prev === undefined) return null;
    if (prev > currentRank) return <span className="text-green-500 text-xs font-bold">▲</span>;
    if (prev < currentRank) return <span className="text-red-500 text-xs font-bold">▼</span>;
    return <span className="text-gray-400 text-xs">—</span>;
  };

  return (
    <div className={`inline-block min-w-full align-middle ${className}`}>
      <div className="overflow-hidden">
        <table className="min-w-full" dir={direction}>
          <thead className="bg-gray-100">
            <tr>
              <th className={`${headerPadding} font-semibold text-gray-700 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('seasons.rank')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('common.player')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-sm ${compact ? '' : 'hidden lg:table-cell'} ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('common.team')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm`}>
                {t('seasons.gamesPlayed')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm ${compact ? '' : 'hidden lg:table-cell'}`}>
                {t('seasons.pins')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm`}>
                {t('seasons.avg')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm ${compact ? '' : 'hidden sm:table-cell'}`}>
                {t('seasons.highGame')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm ${compact ? '' : 'hidden md:table-cell'}`}>
                {t('seasons.highSeries')}
              </th>
              {!compact && (
                <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm hidden sm:table-cell`}>
                  {t('seasons.lastMD')}
                </th>
              )}
              {!compact && (
                <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm hidden md:table-cell`}>
                  {t('seasons.participation')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {playerStats.map((stat, index) => {
              const playerKey = `${stat.teamId}-${stat.playerName}`;
              const lastScores = lastMatchdayPins?.get(playerKey);
              const possibleGames = stat.teamId ? teamCompletedGameCount?.get(stat.teamId) : undefined;
              const participationPct = possibleGames && possibleGames > 0
                ? Math.round((stat.gamesPlayed / possibleGames) * 100)
                : null;
              return (
                <tr key={playerKey} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className={cellPadding}>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-800">{index + 1}</span>
                      {getRankArrow(stat.teamId ?? '', stat.playerName, index + 1)}
                    </div>
                  </td>
                  <td className={`${cellPadding} font-semibold text-gray-800 text-sm`}>
                    {stat.playerName}
                  </td>
                  <td className={`${cellPadding} text-gray-600 text-sm ${compact ? '' : 'hidden lg:table-cell'}`}>
                    {stat.teamName}
                  </td>
                  <td className={`${cellPadding} text-center text-gray-600 text-sm`}>
                    {stat.gamesPlayed}
                  </td>
                  <td className={`${cellPadding} text-center text-gray-600 text-sm ${compact ? '' : 'hidden lg:table-cell'}`}>
                    {stat.totalPins}
                  </td>
                  <td className={`${cellPadding} text-center`}>
                    <span className="font-bold text-blue-600 text-base sm:text-lg">
                      {stat.average.toFixed(2)}
                    </span>
                  </td>
                  <td className={`${cellPadding} text-center text-purple-600 font-semibold text-sm ${compact ? '' : 'hidden sm:table-cell'}`}>
                    {stat.highGame}
                  </td>
                  <td className={`${cellPadding} text-center text-green-600 font-semibold text-sm ${compact ? '' : 'hidden md:table-cell'}`}>
                    {stat.highSeries}
                  </td>
                  {!compact && (
                    <td className={`${cellPadding} text-center text-gray-600 text-sm hidden sm:table-cell whitespace-nowrap`}>
                      {lastScores ? lastScores.join(' / ') : '-'}
                    </td>
                  )}
                  {!compact && (
                    <td className={`${cellPadding} text-center text-gray-600 text-sm hidden md:table-cell`}>
                      {participationPct !== null ? `${participationPct}%` : '-'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
