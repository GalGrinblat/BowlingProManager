import React, { useMemo } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { ABSENT_PLAYER_PENALTY } from '../../constants/bowling';
import type { Game, GameMatch, GamePlayer } from '../../types/index';

interface GameScoreTableProps {
  game: Game;
}

export const GameScoreTable: React.FC<GameScoreTableProps> = ({ game }) => {
  const { t, direction, isRTL } = useTranslation();

  const matches = useMemo(() => game.matches ?? [], [game.matches]);

  const totals = useMemo(() => ({
    team1TotalPoints: matches.reduce((sum: number, m: GameMatch) => sum + (m.team1?.points || 0), 0) + (game.grandTotalPoints?.team1 || 0),
    team2TotalPoints: matches.reduce((sum: number, m: GameMatch) => sum + (m.team2?.points || 0), 0) + (game.grandTotalPoints?.team2 || 0),
    team1TotalPins: matches.reduce((sum: number, m: GameMatch) => sum + (m.team1?.totalPins || 0), 0),
    team2TotalPins: matches.reduce((sum: number, m: GameMatch) => sum + (m.team2?.totalPins || 0), 0),
    team1TotalWithHandicap: matches.reduce((sum: number, m: GameMatch) => sum + (m.team1?.totalWithHandicap || 0), 0),
    team2TotalWithHandicap: matches.reduce((sum: number, m: GameMatch) => sum + (m.team2?.totalWithHandicap || 0), 0),
    team1MatchWinnerPoints: matches.reduce((sum: number, m: GameMatch) => sum + (m.team1?.points || 0), 0),
    team2MatchWinnerPoints: matches.reduce((sum: number, m: GameMatch) => sum + (m.team2?.points || 0), 0),
    team1AllPlayerPoints: matches.reduce((sum: number, m: GameMatch) =>
      sum + (m.playerMatches || []).reduce((s, pm) => s + (pm.team1Points || 0), 0), 0),
    team2AllPlayerPoints: matches.reduce((sum: number, m: GameMatch) =>
      sum + (m.playerMatches || []).reduce((s, pm) => s + (pm.team2Points || 0), 0), 0),
  }), [matches, game.grandTotalPoints]);

  const winner = useMemo(() =>
    totals.team1TotalPoints > totals.team2TotalPoints ? 'team1' :
    totals.team2TotalPoints > totals.team1TotalPoints ? 'team2' : 'tie'
  , [totals.team1TotalPoints, totals.team2TotalPoints]);

  const formatTotalPoints = (matchWinnerPts: number, grandTotalPts: number) => {
    if (grandTotalPts > 0) {
      return `${matchWinnerPts.toFixed(1)} + ${grandTotalPts.toFixed(1)} = ${(matchWinnerPts + grandTotalPts).toFixed(1)}`;
    }
    return matchWinnerPts.toFixed(1);
  };

  const renderTeamTable = (teamKey: 'team1' | 'team2') => {
    const isTeam1 = teamKey === 'team1';
    const team = game[teamKey];
    const borderColor = isTeam1 ? 'border-orange-200' : 'border-blue-200';
    const headerBg = isTeam1 ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-blue-100 border-blue-300 text-blue-700';
    const subHeaderBg = isTeam1 ? 'bg-orange-50' : 'bg-blue-50';
    const hoverBg = isTeam1 ? 'hover:bg-orange-50' : 'hover:bg-blue-50';
    const totalRowBg = isTeam1 ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-blue-100 border-blue-300 text-blue-700';
    const totalPinsBg = isTeam1 ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800';
    const handicapBg = isTeam1 ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600';
    const withHandicapBg = isTeam1 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700';
    const emoji = isTeam1 ? '🟠' : '🔵';
    const playerPointsColor = isTeam1 ? 'text-orange-600' : 'text-blue-600';
    const grandTotalPts = isTeam1 ? (game.grandTotalPoints?.team1 || 0) : (game.grandTotalPoints?.team2 || 0);
    const matchWinnerPts = isTeam1 ? totals.team1MatchWinnerPoints : totals.team2MatchWinnerPoints;

    return (
      <div className="overflow-x-auto">
        <table className={`w-full text-sm border-2 ${borderColor}`}>
          <thead className={`${headerBg} border-b-2`}>
            {/* Team name row */}
            <tr>
              <th colSpan={matches.length * 2 + 3} className={`px-2 py-1.5 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                {emoji} {team?.name}
              </th>
            </tr>
            {/* Match group headers */}
            <tr className="bg-gray-50">
              <th rowSpan={2} className={`px-1 sm:px-2 py-1.5 text-xs font-bold text-gray-700 align-bottom ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('common.player')}
              </th>
              {matches.map((match) => (
                <th key={`grp-${match.matchNumber}`} colSpan={2} className="px-1 sm:px-2 py-1 text-center text-xs font-bold text-gray-700 border-b border-gray-200">
                  {t('common.match')} {match.matchNumber}
                </th>
              ))}
              <th colSpan={2} className="px-1 sm:px-2 py-1 text-center text-xs font-bold text-gray-700 bg-gray-100 border-b border-gray-200">
                {t('common.total')}
              </th>
            </tr>
            {/* Score / Points sub-headers */}
            <tr className={subHeaderBg}>
              {matches.map((match) => (
                <React.Fragment key={`sub-${match.matchNumber}`}>
                  <th className="px-1 py-1 text-center text-xs font-semibold text-gray-600">{t('common.score')}</th>
                  <th className="px-1 py-1 text-center text-xs font-semibold text-gray-600">{t('common.pts')}</th>
                </React.Fragment>
              ))}
              <th className="px-1 py-1 text-center text-xs font-semibold text-gray-600 bg-gray-100">{t('common.pins')}</th>
              <th className="px-1 py-1 text-center text-xs font-semibold text-gray-600 bg-gray-100">{t('common.pts')}</th>
            </tr>
          </thead>
          <tbody>
            {/* Player rows */}
            {team?.players.map((player: GamePlayer, playerIdx: number) => {
              const isAbsent = player.absent;
              const absentScore = Math.floor(player.average - ABSENT_PLAYER_PENALTY);
              const playerTotalPins = isAbsent
                ? absentScore * matches.length
                : matches.reduce((sum, match) => {
                    const pins = match[teamKey]?.players[playerIdx]?.pins;
                    return sum + (pins !== '' ? parseInt(pins || '0') : 0);
                  }, 0);
              const playerTotalPoints = matches.reduce((sum, match) => {
                const result = match.playerMatches?.[playerIdx];
                return sum + (isTeam1 ? (result?.team1Points || 0) : (result?.team2Points || 0));
              }, 0);

              return (
                <tr key={player.playerId} className={`border-b border-gray-100 ${hoverBg}`}>
                  <td className={`px-1 sm:px-2 py-1.5 text-xs font-semibold text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="max-w-[72px] sm:max-w-none truncate">
                      {playerIdx + 1}. {player.name}
                      {isAbsent && (
                        <span className="ml-1 text-[10px] font-normal text-red-400 italic">({t('games.absent')})</span>
                      )}
                    </div>
                  </td>
                  {matches.map((match) => {
                    const matchPlayer = match[teamKey]?.players[playerIdx];
                    const pins = isAbsent ? absentScore : (matchPlayer?.pins !== '' ? parseInt(matchPlayer?.pins || '0') : 0);
                    const playerMatch = match.playerMatches?.[playerIdx];
                    const result = playerMatch?.result;
                    const resultIcon = isTeam1
                      ? (result === 'team1' ? '✅' : result === 'team2' ? '❌' : result === 'draw' ? '⚖️' : '')
                      : (result === 'team2' ? '✅' : result === 'team1' ? '❌' : result === 'draw' ? '⚖️' : '');
                    const matchPoints = isTeam1 ? (playerMatch?.team1Points || 0) : (playerMatch?.team2Points || 0);
                    const hasBonus = !isAbsent && matchPoints > (result === (isTeam1 ? 'team1' : 'team2') ? 1 : result === 'draw' ? 0.5 : 0);

                    return (
                      <React.Fragment key={`match-${match.matchNumber}`}>
                        <td className="px-1 py-1.5 text-center text-xs">
                          <div className={`font-semibold ${isAbsent ? 'text-gray-400 italic' : ''}`}>
                            {isAbsent ? `(${pins})` : pins} {hasBonus && '⭐'}
                          </div>
                          <div className="text-[10px]">{resultIcon}</div>
                        </td>
                        <td className={`px-1 py-1.5 text-center text-xs font-semibold ${playerPointsColor}`}>
                          {result !== null && result !== undefined ? matchPoints.toFixed(1) : ''}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td className={`px-1 py-1.5 text-center text-xs font-bold bg-gray-50 ${isAbsent ? 'text-gray-400 italic' : ''}`}>
                    {isAbsent ? `(${playerTotalPins})` : playerTotalPins}
                  </td>
                  <td className={`px-1 py-1.5 text-center text-xs font-bold bg-gray-50 ${playerPointsColor}`}>
                    {playerTotalPoints.toFixed(1)}
                  </td>
                </tr>
              );
            })}

            {/* Team Total row */}
            <tr className={`${totalRowBg} border-t-2 font-bold text-xs`}>
              <td className={`px-1 sm:px-2 py-1.5 text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('gameHistory.teamTotal')}
              </td>
              {matches.map((match) => (
                <React.Fragment key={`total-${match.matchNumber}`}>
                  <td className="px-1 py-1.5 text-center">
                    {match[teamKey]?.totalPins || 0}
                  </td>
                  <td className="px-1 py-1.5" />
                </React.Fragment>
              ))}
              <td className={`px-1 py-1.5 text-center ${totalPinsBg}`}>
                {isTeam1 ? totals.team1TotalPins : totals.team2TotalPins}
              </td>
              <td className={`px-1 py-1.5 ${totalPinsBg}`} />
            </tr>

            {/* Handicap row */}
            <tr className={`${subHeaderBg} font-semibold text-xs`}>
              <td className={`px-1 sm:px-2 py-1.5 text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('common.handicap')}
              </td>
              {matches.map((match) => {
                const hdc = (match[teamKey]?.totalWithHandicap || 0) - (match[teamKey]?.totalPins || 0);
                return (
                  <React.Fragment key={`hdc-${match.matchNumber}`}>
                    <td className={`px-1 py-1.5 text-center ${isTeam1 ? 'text-orange-500' : 'text-blue-500'}`}>
                      {hdc}
                    </td>
                    <td className="px-1 py-1.5" />
                  </React.Fragment>
                );
              })}
              <td className={`px-1 py-1.5 text-center ${handicapBg}`}>
                {(isTeam1 ? totals.team1TotalWithHandicap - totals.team1TotalPins : totals.team2TotalWithHandicap - totals.team2TotalPins)}
              </td>
              <td className={`px-1 py-1.5 ${handicapBg}`} />
            </tr>

            {/* Team Total (with handicap) row */}
            <tr className={`${withHandicapBg} border-t font-semibold text-xs`}>
              <td className={`px-1 sm:px-2 py-1.5 text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('gameHistory.withHandicap')}
              </td>
              {matches.map((match) => {
                const team1Total = match.team1?.totalWithHandicap || 0;
                const team2Total = match.team2?.totalWithHandicap || 0;
                const resultIcon = isTeam1
                  ? (team1Total > team2Total ? '✅' : team1Total === team2Total ? '⚖️' : '❌')
                  : (team2Total > team1Total ? '✅' : team2Total === team1Total ? '⚖️' : '❌');
                const matchPts = match[teamKey]?.points || 0;

                return (
                  <React.Fragment key={`whc-${match.matchNumber}`}>
                    <td className={`px-1 py-1.5 text-center ${isTeam1 ? 'text-orange-600' : 'text-blue-600'}`}>
                      <div>{isTeam1 ? team1Total : team2Total}</div>
                      <div className="text-[10px]">{resultIcon}</div>
                    </td>
                    <td className={`px-1 py-1.5 text-center font-bold ${isTeam1 ? 'text-orange-700' : 'text-blue-700'}`}>
                      {matchPts > 0 || match[teamKey]?.points !== undefined ? matchPts.toFixed(1) : ''}
                    </td>
                  </React.Fragment>
                );
              })}
              <td className={`px-1 py-1.5 text-center ${withHandicapBg}`}>
                <div>{isTeam1 ? totals.team1TotalWithHandicap : totals.team2TotalWithHandicap}</div>
                <div className="text-[10px]">{winner === teamKey ? '✅' : winner === (isTeam1 ? 'team2' : 'team1') ? '❌' : '⚖️'}</div>
              </td>
              <td className={`px-1 py-1.5 text-center font-bold ${isTeam1 ? 'text-orange-700' : 'text-blue-700'}`}>
                {formatTotalPoints(matchWinnerPts, grandTotalPts)}
              </td>
            </tr>

            {/* Total Points row */}
            <tr className="bg-gray-800 text-white border-t-2 border-gray-700 font-bold text-xs">
              <td className={`px-1 sm:px-2 py-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('gameHistory.totalPoints')}
              </td>
              {matches.map((match) => {
                const matchPlayerPts = (match.playerMatches || []).reduce((s, pm) =>
                  s + (isTeam1 ? (pm.team1Points || 0) : (pm.team2Points || 0)), 0);
                const matchTeamPts = match[teamKey]?.points || 0;
                return (
                  <React.Fragment key={`tpt-${match.matchNumber}`}>
                    <td className="px-1 py-1.5" />
                    <td className="px-1 py-1.5 text-center">
                      {(matchPlayerPts + matchTeamPts).toFixed(1)}
                    </td>
                  </React.Fragment>
                );
              })}
              <td className="px-1 py-1.5" />
              <td className="px-1 py-1.5 text-center">
                {(isTeam1
                  ? totals.team1AllPlayerPoints + totals.team1TotalPoints
                  : totals.team2AllPlayerPoints + totals.team2TotalPoints
                ).toFixed(1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-0 sm:p-3">
      <div className="grid md:grid-cols-2 gap-3 sm:gap-4" dir={direction}>
        {renderTeamTable('team1')}
        {renderTeamTable('team2')}
      </div>
    </div>
  );
};
