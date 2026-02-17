import { useTranslation } from '../../contexts/LanguageContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import type { CompletedGameViewProps, GameMatch, GamePlayer } from '../../types/index';

export const CompletedGameView: React.FC<CompletedGameViewProps> = ({ game, onBack }) => {
  const { t, direction, isRTL } = useTranslation();
  const { formatDate } = useDateFormat();
  if (!game) return <div>{t('common.loading')}</div>;

  const matches = game.matches ?? [];
  const totals = {
    team1Total: matches.reduce((sum: number, m: GameMatch) => sum + (m.team1?.points || 0), 0) + (game.grandTotalPoints?.team1 || 0),
    team2Total: matches.reduce((sum: number, m: GameMatch) => sum + (m.team2?.points || 0), 0) + (game.grandTotalPoints?.team2 || 0),
    team1TotalPins: matches.reduce((sum: number, m: GameMatch) => sum + (m.team1?.totalPins || 0), 0),
    team2TotalPins: matches.reduce((sum: number, m: GameMatch) => sum + (m.team2?.totalPins || 0), 0),
    team1TotalWithHandicap: matches.reduce((sum: number, m: GameMatch) => sum + (m.team1?.totalWithHandicap || 0), 0),
    team2TotalWithHandicap: matches.reduce((sum: number, m: GameMatch) => sum + (m.team2?.totalWithHandicap || 0), 0)
  };

  const winner = totals.team1Total > totals.team2Total ? 'team1' : 
                 totals.team2Total > totals.team1Total ? 'team2' : 'tie';

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-lg font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <span>{isRTL ? t('common.rightArrow') : t('common.leftArrow')}</span> {t('common.back')}
        </button>
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl font-bold text-gray-800">{t('gameHistory.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('common.round')} {game.round} • {t('common.matchDay')} {game.matchDay} • {t('playerDashboard.completedOn')} {formatDate(game.completedAt ?? '')}
            </p>
          </div>
          {winner !== 'tie' && (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-lg">
              🏆 {winner === 'team1' ? game.team1?.name : game.team2?.name} {t('gameHistory.wins')}!
            </span>
          )}
        </div>
      </div>

      {/* Winner Banner */}
      {winner !== 'tie' && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-4">
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900">
              🏆 {t('gameHistory.championBanner')} {winner === 'team1' ? game.team1?.name : game.team2?.name} 🏆
            </span>
          </div>
        </div>
      )}

      {/* Game Summary Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3">
          <h2 className={`text-lg font-bold text-white text-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isRTL ? (
              <>{game.team2?.name} {totals.team2Total} 🆚 {totals.team1Total} {game.team1?.name}</>
            ) : (
              <>{game.team1?.name} {totals.team1Total} 🆚 {totals.team2Total} {game.team2?.name}</>
            )}
          </h2>
        </div>

        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-4" dir={direction}>
            {/* Team 1 Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-2 border-orange-200">
                <thead className="bg-orange-100 border-b-2 border-orange-300">
                  <tr>
                    <th colSpan={matches.length + 3} className={`px-2 py-2 font-bold text-orange-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      🟠 {game.team1?.name}
                    </th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className={`px-2 py-2 text-xs font-bold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('common.player')}
                    </th>
                    {matches.map((_, idx) => (
                      <th key={idx} className="px-2 py-2 text-center text-xs font-bold text-gray-700">
                        M{idx + 1}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-center text-xs font-bold text-gray-700 bg-gray-100">
                      {t('common.total')}
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-bold text-gray-700 bg-gray-100">
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
                      <tr key={playerIdx} className="border-b border-gray-100 hover:bg-orange-50">
                        <td className={`px-2 py-1.5 text-xs font-semibold text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {playerIdx + 1}. {player.name}
                        </td>
                        {matches.map((match, matchIdx) => {
                          const matchPlayer = match.team1?.players[playerIdx];
                          const pins = matchPlayer?.pins !== '' ? parseInt(matchPlayer?.pins || '0') : 0;
                          const playerMatch = match.playerMatches?.[playerIdx];
                          const result = playerMatch?.result;
                          const resultIcon = result === 'team1' ? '✅' : result === 'team2' ? '❌' : result === 'draw' ? '⚖️' : '';
                          const hasBonus = (playerMatch?.team1Points || 0) > (result === 'team1' ? 1 : result === 'draw' ? 0.5 : 0);

                          return (
                            <td key={matchIdx} className="px-1 py-1.5 text-center text-xs">
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

                  {/* Team 1 Totals */}
                  <tr className="bg-orange-100 border-t-2 border-orange-300 font-bold text-xs">
                    <td className={`px-2 py-1.5 text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('gameHistory.teamTotal')}
                    </td>
                    {matches.map((match, idx) => {
                      const teamPins = match.team1?.totalPins || 0;
                      return (
                        <td key={idx} className="px-1 py-1.5 text-center text-orange-700">
                          {teamPins}
                        </td>
                      );
                    })}
                    <td className="px-1 py-1.5 text-center bg-orange-200 text-orange-800">
                      {totals.team1TotalPins}
                    </td>
                    <td className="px-1 py-1.5 text-center bg-orange-200 text-orange-800">
                    </td>
                  </tr>

                  {/* Team 1 With Handicap */}
                  <tr className="bg-orange-50 font-semibold text-xs">
                    <td className={`px-2 py-1.5 text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      🎯 {t('gameHistory.withHandicap')}
                    </td>
                    {matches.map((match, idx) => {
                      const team1Handicap = match.team1?.totalWithHandicap || 0;
                      const team2Handicap = match.team2?.totalWithHandicap || 0;
                      const wonMatch = team1Handicap > team2Handicap;
                      const resultIcon = wonMatch ? '✅' : team1Handicap === team2Handicap ? '⚖️' : '❌';

                      return (
                        <td key={idx} className="px-1 py-1.5 text-center text-orange-600">
                          <div>{team1Handicap}</div>
                          <div className="text-[10px]">{resultIcon}</div>
                        </td>
                      );
                    })}
                    <td className="px-1 py-1.5 text-center bg-orange-100 text-orange-700">
                      <div>{totals.team1TotalWithHandicap}</div>
                      <div className="text-[10px]">{winner === 'team1' ? '✅' : winner === 'team2' ? '❌' : '⚖️'}</div>
                    </td>
                    <td className="px-1 py-1.5 text-center bg-orange-100 text-orange-700 font-bold">{totals.team1Total}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Team 2 Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-2 border-blue-200">
                <thead className="bg-blue-100 border-b-2 border-blue-300">
                  <tr>
                    <th colSpan={matches.length + 3} className={`px-2 py-2 font-bold text-blue-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      🔵 {game.team2?.name}
                    </th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className={`px-2 py-2 text-xs font-bold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('common.player')}
                    </th>
                    {matches.map((_, idx) => (
                      <th key={idx} className="px-2 py-2 text-center text-xs font-bold text-gray-700">
                        M{idx + 1}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-center text-xs font-bold text-gray-700 bg-gray-100">
                      {t('common.total')}
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-bold text-gray-700 bg-gray-100">
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
                      <tr key={playerIdx} className="border-b border-gray-100 hover:bg-blue-50">
                        <td className={`px-2 py-1.5 text-xs font-semibold text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {playerIdx + 1}. {player.name}
                        </td>
                        {matches.map((match, matchIdx) => {
                          const matchPlayer = match.team2?.players[playerIdx];
                          const pins = matchPlayer?.pins !== '' ? parseInt(matchPlayer?.pins || '0') : 0;
                          const playerMatch = match.playerMatches?.[playerIdx];
                          const result = playerMatch?.result;
                          const resultIcon = result === 'team2' ? '✅' : result === 'team1' ? '❌' : result === 'draw' ? '⚖️' : '';
                          const hasBonus = (playerMatch?.team2Points || 0) > (result === 'team2' ? 1 : result === 'draw' ? 0.5 : 0);

                          return (
                            <td key={matchIdx} className="px-1 py-1.5 text-center text-xs">
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

                  {/* Team 2 Totals */}
                  <tr className="bg-blue-100 border-t-2 border-blue-300 font-bold text-xs">
                    <td className={`px-2 py-1.5 text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('gameHistory.teamTotal')}
                    </td>
                    {matches.map((match, idx) => {
                      const teamPins = match.team2?.totalPins || 0;
                      return (
                        <td key={idx} className="px-1 py-1.5 text-center text-blue-700">
                          {teamPins}
                        </td>
                      );
                    })}
                    <td className="px-1 py-1.5 text-center bg-blue-200 text-blue-800">
                      {totals.team2TotalPins}
                    </td>
                    <td className="px-1 py-1.5 text-center bg-blue-200 text-blue-800">
                    </td>
                  </tr>

                  {/* Team 2 With Handicap */}
                  <tr className="bg-blue-50 font-semibold text-xs">
                    <td className={`px-2 py-1.5 text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      🎯 {t('gameHistory.withHandicap')}
                    </td>
                    {matches.map((match, idx) => {
                      const team1Handicap = match.team1?.totalWithHandicap || 0;
                      const team2Handicap = match.team2?.totalWithHandicap || 0;
                      const wonMatch = team2Handicap > team1Handicap;
                      const resultIcon = wonMatch ? '✅' : team2Handicap === team1Handicap ? '⚖️' : '❌';

                      return (
                        <td key={idx} className="px-1 py-1.5 text-center text-blue-600">
                          <div>{team2Handicap}</div>
                          <div className="text-[10px]">{resultIcon}</div>
                        </td>
                      );
                    })}
                    <td className="px-1 py-1.5 text-center bg-blue-100 text-blue-700">
                      <div>{totals.team2TotalWithHandicap}</div>
                      <div className="text-[10px]">{winner === 'team2' ? '✅' : winner === 'team1' ? '❌' : '⚖️'}</div>
                    </td>
                    <td className="px-1 py-1.5 text-center bg-blue-100 text-blue-700 font-bold">{totals.team2Total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      {/* Game Total Points */}
      {(((game.grandTotalPoints?.team1 ?? 0) > 0) || ((game.grandTotalPoints?.team2 ?? 0) > 0)) && (
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`text-center flex-1 ${isRTL ? 'order-3' : 'order-1'}`}>
              <div className="text-sm opacity-90 mb-1">{t('gameHistory.grandTotalPoints')}</div>
              <div className="text-3xl font-bold">+{game.grandTotalPoints?.team1 ?? 0}</div>
              <div className="text-sm opacity-90 mt-1">{game.team1?.name}</div>
            </div>
            <div className="text-4xl order-2">🏆</div>
            <div className={`text-center flex-1 ${isRTL ? 'order-1' : 'order-3'}`}>
              <div className="text-sm opacity-90 mb-1">{t('gameHistory.grandTotalPoints')}</div>
              <div className="text-3xl font-bold">+{game.grandTotalPoints?.team2 ?? 0}</div>
              <div className="text-sm opacity-90 mt-1">{game.team2?.name}</div>
            </div>
          </div>
          <div className="text-center text-sm opacity-90 mt-4">
            {t('gameHistory.grandTotalDesc').replace('{{count}}', matches.length.toString())}
          </div>
        </div>
      )}
    </div>
  );
};
