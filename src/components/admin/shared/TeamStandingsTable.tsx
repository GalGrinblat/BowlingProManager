import React from 'react';
import type { TeamStanding } from '../../../types/index';

interface TeamStandingsTableProps {
  standings: TeamStanding[];
  direction?: 'ltr' | 'rtl';
  t: (key: string) => string;
  getTeamName?: (teamId: string) => string;
  showHeader?: boolean;
  compact?: boolean;
  className?: string;
}

export const TeamStandingsTable: React.FC<TeamStandingsTableProps> = ({
  standings,
  direction = 'ltr',
  t,
  getTeamName,
  showHeader = true,
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
                {t('common.team')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm`}>
                {t('seasons.gamesPlayed')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm`}>
                {t('common.wins')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm`}>
                {t('common.losses')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm ${compact ? '' : 'hidden sm:table-cell'}`}>
                {t('common.draws')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm`}>
                {t('common.points')}
              </th>
              <th className={`${headerPadding} font-semibold text-gray-700 text-center text-sm ${compact ? '' : 'hidden md:table-cell'}`}>
                {t('seasons.pins')}
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr key={standing.teamId} className="border-b border-gray-200 hover:bg-gray-50">
                <td className={cellPadding}>
                  <span className="font-bold text-gray-800">#{index + 1}</span>
                </td>
                <td className={`${cellPadding} font-semibold text-gray-800 text-sm`}>
                  {standing.teamName || (getTeamName ? getTeamName(standing.teamId) : standing.teamId)}
                </td>
                <td className={`${cellPadding} text-center text-gray-600 text-sm`}>
                  {standing.gamesPlayed}
                </td>
                <td className={`${cellPadding} text-center text-green-600 font-semibold text-sm`}>
                  {standing.wins}
                </td>
                <td className={`${cellPadding} text-center text-red-600 font-semibold text-sm`}>
                  {standing.losses}
                </td>
                <td className={`${cellPadding} text-center text-gray-600 text-sm ${compact ? '' : 'hidden sm:table-cell'}`}>
                  {standing.draws}
                </td>
                <td className={`${cellPadding} text-center`}>
                  <span className="font-bold text-blue-600 text-base sm:text-lg">{standing.points}</span>
                </td>
                <td className={`${cellPadding} text-center text-gray-600 text-sm ${compact ? '' : 'hidden md:table-cell'}`}>
                  {standing.totalPinsWithHandicap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
