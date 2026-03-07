import React, { useMemo } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
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
  }), [matches, game.grandTotalPoints]);

  const winner = useMemo(() =>
    totals.team1TotalPoints > totals.team2TotalPoints ? 'team1' :
    totals.team2TotalPoints > totals.team1TotalPoints ? 'team2' : 'tie'
  , [totals.team1TotalPoints, totals.team2TotalPoints]);

  return (
    <div className="p-0 sm:p-3">
      <div className="grid md:grid-cols-2 gap-3 sm:gap-4" dir={direction}>
        {/* Team 1 Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-2 border-orange-200">
            <thead className="bg-orange-100 border-b-2 border-orange-300">
              <tr>
                <th colSpan={matches.length + 3} className={`px-2 py-1.5 font-bold text-orange-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                  🟠 {game.team1?.name}
                </th>
              </tr>
              <tr className="bg-gray-50">
                <th className={`px-1 sm:px-2 py-1.5 text-xs font-bold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('common.player')}
                </th>
                {matches.map((match, idx) => (
                  <th key={`match-${match.matchNumber}`} className="px-1 sm:px-2 py-1.5 text-center text-xs font-bold text-gray-700">
                    <span className="hidden sm:inline">{t('gameHistory.match')} </span>{idx + 1}
                  </th>
                ))}
                <th className="px-1 sm:px-2 py-1.5 text-center text-xs font-bold text-gray-700 bg-gray-100">
                  {t('common.total')}
                </th>
                <th className="px-1 sm:px-2 py-1.5 text-center text-xs font-bold text-gray-700 bg-gray-100">
                  {t('common.pts')}
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Team 1 Players */}
              {game.team1?.players.map((player: GamePlayer, playerIdx: number) => {
                const playerTotalPins = matches.reduce((sum, match) => {
                  const pins = match.team1?.players[playerIdx]?.pins;
                  return sum + (pins !== '' ? parseInt(pins || '0') : 0);
                }, 0);
                const playerTotalPoints = matches.reduce((sum, match) => {
                  const result = match.playerMatches?.[playerIdx];
                  return sum + (result?.team1Points || 0);
                }, 0);

                return (
                  <tr key={player.playerId} className="border-b border-gray-100 hover:bg-orange-50">
                    <td className={`px-1 sm:px-2 py-1.5 text-xs font-semibold text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="max-w-[72px] sm:max-w-none truncate">{playerIdx + 1}. {player.name}</div>
                    </td>
                    {matches.map((match) => {
                      const matchPlayer = match.team1?.players[playerIdx];
                      const pins = matchPlayer?.pins !== '' ? parseInt(matchPlayer?.pins || '0') : 0;
                      const playerMatch = match.playerMatches?.[playerIdx];
                      const result = playerMatch?.result;
                      const resultIcon = result === 'team1' ? '✅' : result === 'team2' ? '❌' : result === 'draw' ? '⚖️' : '';
                      const hasBonus = (playerMatch?.team1Points || 0) > (result === 'team1' ? 1 : result === 'draw' ? 0.5 : 0);

                      return (
                        <td key={`match-${match.matchNumber}`} className="px-1 py-1.5 text-center text-xs">
                          <div className="font-semibold">
                            {pins} {hasBonus && '⭐'}
                          </div>
                          <div className="text-[10px]">{resultIcon}</div>
                        </td>
                      );
                    })}
                    <td className="px-1 py-1.5 text-center text-xs font-bold bg-gray-50">{playerTotalPins}</td>
                    <td className="px-1 py-1.5 text-center text-xs font-bold text-orange-600 bg-gray-50">{playerTotalPoints.toFixed(1)}</td>
                  </tr>
                );
              })}

              {/* Team 1 Pins */}
              <tr className="bg-orange-100 border-t-2 border-orange-300 font-bold text-xs">
                <td className={`px-1 sm:px-2 py-1.5 text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('gameHistory.teamTotal')}
                </td>
                {matches.map((match) => (
                  <td key={`match-${match.matchNumber}`} className="px-1 py-1.5 text-center text-orange-700">
                    {match.team1?.totalPins || 0}
                  </td>
                ))}
                <td className="px-1 py-1.5 text-center bg-orange-200 text-orange-800">
                  {totals.team1TotalPins}
                </td>
                <td className="px-1 py-1.5 text-center bg-orange-200 text-orange-800"></td>
              </tr>

              {/* Team 1 Handicap */}
              <tr className="bg-orange-50 font-semibold text-xs">
                <td className={`px-1 sm:px-2 py-1.5 text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('gameHistory.hdc')}
                </td>
                {matches.map((match) => {
                  const hdc = (match.team1?.totalWithHandicap || 0) - (match.team1?.totalPins || 0);
                  return (
                    <td key={`match-${match.matchNumber}`} className="px-1 py-1.5 text-center text-orange-500">
                      {hdc > 0 ? `+${hdc}` : hdc}
                    </td>
                  );
                })}
                <td className="px-1 py-1.5 text-center bg-orange-50 text-orange-600">
                  {totals.team1TotalWithHandicap - totals.team1TotalPins > 0
                    ? `+${totals.team1TotalWithHandicap - totals.team1TotalPins}`
                    : totals.team1TotalWithHandicap - totals.team1TotalPins}
                </td>
                <td className="px-1 py-1.5 bg-orange-50"></td>
              </tr>

              {/* Team 1 Team Totals */}
              <tr className="bg-orange-100 border-t border-orange-200 font-semibold text-xs">
                <td className={`px-1 sm:px-2 py-1.5 text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('gameHistory.withHandicap')}
                </td>
                {matches.map((match) => {
                  const team1Total = match.team1?.totalWithHandicap || 0;
                  const team2Total = match.team2?.totalWithHandicap || 0;
                  const resultIcon = team1Total > team2Total ? '✅' : team1Total === team2Total ? '⚖️' : '❌';
                  return (
                    <td key={`match-${match.matchNumber}`} className="px-1 py-1.5 text-center text-orange-600">
                      <div>{team1Total}</div>
                      <div className="text-[10px]">{resultIcon}</div>
                    </td>
                  );
                })}
                <td className="px-1 py-1.5 text-center bg-orange-100 text-orange-700">
                  <div>{totals.team1TotalWithHandicap}</div>
                  <div className="text-[10px]">{winner === 'team1' ? '✅' : winner === 'team2' ? '❌' : '⚖️'}</div>
                </td>
                <td className="px-1 py-1.5 text-center bg-orange-100 text-orange-700 font-bold">{totals.team1TotalPoints}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Team 2 Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-2 border-blue-200">
            <thead className="bg-blue-100 border-b-2 border-blue-300">
              <tr>
                <th colSpan={matches.length + 3} className={`px-2 py-1.5 font-bold text-blue-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                  🔵 {game.team2?.name}
                </th>
              </tr>
              <tr className="bg-gray-50">
                <th className={`px-1 sm:px-2 py-1.5 text-xs font-bold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('common.player')}
                </th>
                {matches.map((match, idx) => (
                  <th key={`match-${match.matchNumber}`} className="px-1 sm:px-2 py-1.5 text-center text-xs font-bold text-gray-700">
                    <span className="hidden sm:inline">{t('gameHistory.match')} </span>{idx + 1}
                  </th>
                ))}
                <th className="px-1 sm:px-2 py-1.5 text-center text-xs font-bold text-gray-700 bg-gray-100">
                  {t('common.total')}
                </th>
                <th className="px-1 sm:px-2 py-1.5 text-center text-xs font-bold text-gray-700 bg-gray-100">
                  {t('common.pts')}
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Team 2 Players */}
              {game.team2?.players.map((player: GamePlayer, playerIdx: number) => {
                const playerTotalPins = matches.reduce((sum, match) => {
                  const pins = match.team2?.players[playerIdx]?.pins;
                  return sum + (pins !== '' ? parseInt(pins || '0') : 0);
                }, 0);
                const playerTotalPoints = matches.reduce((sum, match) => {
                  const result = match.playerMatches?.[playerIdx];
                  return sum + (result?.team2Points || 0);
                }, 0);

                return (
                  <tr key={player.playerId} className="border-b border-gray-100 hover:bg-blue-50">
                    <td className={`px-1 sm:px-2 py-1.5 text-xs font-semibold text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="max-w-[72px] sm:max-w-none truncate">{playerIdx + 1}. {player.name}</div>
                    </td>
                    {matches.map((match) => {
                      const matchPlayer = match.team2?.players[playerIdx];
                      const pins = matchPlayer?.pins !== '' ? parseInt(matchPlayer?.pins || '0') : 0;
                      const playerMatch = match.playerMatches?.[playerIdx];
                      const result = playerMatch?.result;
                      const resultIcon = result === 'team2' ? '✅' : result === 'team1' ? '❌' : result === 'draw' ? '⚖️' : '';
                      const hasBonus = (playerMatch?.team2Points || 0) > (result === 'team2' ? 1 : result === 'draw' ? 0.5 : 0);

                      return (
                        <td key={`match-${match.matchNumber}`} className="px-1 py-1.5 text-center text-xs">
                          <div className="font-semibold">
                            {pins} {hasBonus && '⭐'}
                          </div>
                          <div className="text-[10px]">{resultIcon}</div>
                        </td>
                      );
                    })}
                    <td className="px-1 py-1.5 text-center text-xs font-bold bg-gray-50">{playerTotalPins}</td>
                    <td className="px-1 py-1.5 text-center text-xs font-bold text-blue-600 bg-gray-50">{playerTotalPoints.toFixed(1)}</td>
                  </tr>
                );
              })}

              {/* Team 2 Pins */}
              <tr className="bg-blue-100 border-t-2 border-blue-300 font-bold text-xs">
                <td className={`px-1 sm:px-2 py-1.5 text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('gameHistory.teamTotal')}
                </td>
                {matches.map((match) => (
                  <td key={`match-${match.matchNumber}`} className="px-1 py-1.5 text-center text-blue-700">
                    {match.team2?.totalPins || 0}
                  </td>
                ))}
                <td className="px-1 py-1.5 text-center bg-blue-200 text-blue-800">
                  {totals.team2TotalPins}
                </td>
                <td className="px-1 py-1.5 text-center bg-blue-200 text-blue-800"></td>
              </tr>

              {/* Team 2 Handicap */}
              <tr className="bg-blue-50 font-semibold text-xs">
                <td className={`px-1 sm:px-2 py-1.5 text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('gameHistory.hdc')}
                </td>
                {matches.map((match) => {
                  const hdc = (match.team2?.totalWithHandicap || 0) - (match.team2?.totalPins || 0);
                  return (
                    <td key={`match-${match.matchNumber}`} className="px-1 py-1.5 text-center text-blue-500">
                      {hdc > 0 ? `+${hdc}` : hdc}
                    </td>
                  );
                })}
                <td className="px-1 py-1.5 text-center bg-blue-50 text-blue-600">
                  {totals.team2TotalWithHandicap - totals.team2TotalPins > 0
                    ? `+${totals.team2TotalWithHandicap - totals.team2TotalPins}`
                    : totals.team2TotalWithHandicap - totals.team2TotalPins}
                </td>
                <td className="px-1 py-1.5 bg-blue-50"></td>
              </tr>

              {/* Team 2 Team Totals */}
              <tr className="bg-blue-100 border-t border-blue-200 font-semibold text-xs">
                <td className={`px-1 sm:px-2 py-1.5 text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('gameHistory.withHandicap')}
                </td>
                {matches.map((match) => {
                  const team1Total = match.team1?.totalWithHandicap || 0;
                  const team2Total = match.team2?.totalWithHandicap || 0;
                  const resultIcon = team2Total > team1Total ? '✅' : team2Total === team1Total ? '⚖️' : '❌';
                  return (
                    <td key={`match-${match.matchNumber}`} className="px-1 py-1.5 text-center text-blue-600">
                      <div>{team2Total}</div>
                      <div className="text-[10px]">{resultIcon}</div>
                    </td>
                  );
                })}
                <td className="px-1 py-1.5 text-center bg-blue-100 text-blue-700">
                  <div>{totals.team2TotalWithHandicap}</div>
                  <div className="text-[10px]">{winner === 'team2' ? '✅' : winner === 'team1' ? '❌' : '⚖️'}</div>
                </td>
                <td className="px-1 py-1.5 text-center bg-blue-100 text-blue-700 font-bold">{totals.team2TotalPoints}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
