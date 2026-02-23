import React from 'react';
import type { PlayerStats } from '../../../types/index';

interface PlayerStandingsTableProps {
  playerStats: PlayerStats[];
  direction?: 'ltr' | 'rtl';
  t: (key: string) => string;
  showHeader?: boolean;
  compact?: boolean;
  className?: string;
}

export const PlayerStandingsTable: React.FC<PlayerStandingsTableProps> = ({
  playerStats,
  direction = 'ltr',
  t,
  showHeader: _showHeader = true,
  compact = false,
  className = ''
}) => {
  const isRTL = direction === 'rtl';

  // Conditional padding based on compact mode
  const cellPadding = compact ? 'px-2 py-2' : 'px-3 sm:px-4 py-3';
  const headerPadding = compact ? 'px-2 py-2' : 'px-3 sm:px-4 py-3';

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
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm`}>
                {t('seasons.avg')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm ${compact ? '' : 'hidden sm:table-cell'}`}>
                {t('seasons.highGame')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm ${compact ? '' : 'hidden md:table-cell'}`}>
                {t('seasons.highSeries')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm ${compact ? '' : 'hidden lg:table-cell'}`}>
                {t('seasons.pins')}
              </th>
            </tr>
          </thead>
          <tbody>
            {playerStats.map((stat, index) => (
              <tr key={`${stat.teamId}-${stat.playerName}`} className="border-b border-gray-200 hover:bg-gray-50">
                <td className={cellPadding}>
                  <span className="font-bold text-gray-800">#{index + 1}</span>
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
                <td className={`${cellPadding} text-center text-gray-600 text-sm ${compact ? '' : 'hidden lg:table-cell'}`}>
                  {stat.totalPins}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
