import React from 'react';
import { Star } from './Icons';

export const GameHistoryView = ({ game, onBack }) => {
  if (!game) return <div>Loading...</div>;

  const totals = {
    team1Total: game.matches.reduce((sum, m) => sum + (m.team1?.score || 0), 0) + (game.grandTotalPoints?.team1 || 0),
    team2Total: game.matches.reduce((sum, m) => sum + (m.team2?.score || 0), 0) + (game.grandTotalPoints?.team2 || 0),
    team1TotalPins: game.matches.reduce((sum, m) => sum + (m.team1?.totalPins || 0), 0),
    team2TotalPins: game.matches.reduce((sum, m) => sum + (m.team2?.totalPins || 0), 0),
    team1TotalWithHandicap: game.matches.reduce((sum, m) => sum + (m.team1?.totalWithHandicap || 0), 0),
    team2TotalWithHandicap: game.matches.reduce((sum, m) => sum + (m.team2?.totalWithHandicap || 0), 0)
  };

  const winner = totals.team1Total > totals.team2Total ? 'team1' : 
                 totals.team2Total > totals.team1Total ? 'team2' : 'tie';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-lg font-semibold"
        >
          <span>←</span> Back
        </button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Game History</h1>
            <p className="text-sm text-gray-500 mt-1">
              Round {game.round} • Match Day {game.matchDay} • Completed {new Date(game.completedAt).toLocaleDateString()}
            </p>
          </div>
          {winner !== 'tie' && (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-lg">
              🏆 {winner === 'team1' ? game.team1.name : game.team2.name} Wins!
            </span>
          )}
        </div>
      </div>

      {/* Final Score Card */}
      <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4 text-center">Final Score</h2>
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${winner === 'team1' ? 'text-yellow-300' : ''}`}>
              {totals.team1Total}
            </div>
            <div className="text-lg font-semibold mt-2">{game.team1.name}</div>
            <div className="text-sm opacity-80 mt-1">
              {totals.team1TotalWithHandicap} pins (w/hdc)
            </div>
          </div>
          
          <div className="text-center text-2xl font-bold">VS</div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold ${winner === 'team2' ? 'text-yellow-300' : ''}`}>
              {totals.team2Total}
            </div>
            <div className="text-lg font-semibold mt-2">{game.team2.name}</div>
            <div className="text-sm opacity-80 mt-1">
              {totals.team2TotalWithHandicap} pins (w/hdc)
            </div>
          </div>
        </div>
      </div>

      {/* Match by Match Breakdown */}
      {game.matches.map((match, matchIdx) => (
        <div key={matchIdx} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Match {matchIdx + 1}</h2>
            <div className="flex gap-4">
              <span className="text-lg font-bold text-orange-600">{game.team1.name}: {match.team1?.score || 0}</span>
              <span className="text-gray-400">-</span>
              <span className="text-lg font-bold text-blue-600">{game.team2.name}: {match.team2?.score || 0}</span>
            </div>
          </div>

          {/* Player Scores */}
          <div className="space-y-3">
            {game.team1.players.map((player, playerIdx) => {
              const team1Player = match.team1?.players[playerIdx];
              const team2Player = match.team2?.players[playerIdx];
              const team1Pins = team1Player?.pins !== '' ? parseInt(team1Player?.pins || 0) : 0;
              const team2Pins = team2Player?.pins !== '' ? parseInt(team2Player?.pins || 0) : 0;
              const gameResult = match.games?.[playerIdx];

              return (
                <div key={playerIdx} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Team 1 Player */}
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {player.rank}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{player.name}</div>
                        <div className="text-xs text-gray-500">
                          {team1Pins} + {player.handicap} hdc = {team1Pins + player.handicap}
                          {team1Player?.bonusPoints > 0 && (
                            <span className="text-yellow-600 font-bold ml-2">
                              +{team1Player.bonusPoints} bonus
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Result */}
                    <div className="text-center">
                      {gameResult?.result === 'team1' && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded font-bold text-sm">
                          Win (1.0)
                        </span>
                      )}
                      {gameResult?.result === 'team2' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-bold text-sm">
                          Loss (0.0)
                        </span>
                      )}
                      {gameResult?.result === 'draw' && (
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded font-bold text-sm">
                          Draw (0.5)
                        </span>
                      )}
                    </div>

                    {/* Team 2 Player */}
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex-1 text-right">
                        <div className="font-semibold text-gray-800">{game.team2.players[playerIdx].name}</div>
                        <div className="text-xs text-gray-500">
                          {team2Pins} + {game.team2.players[playerIdx].handicap} hdc = {team2Pins + game.team2.players[playerIdx].handicap}
                          {team2Player?.bonusPoints > 0 && (
                            <span className="text-yellow-600 font-bold ml-2">
                              +{team2Player.bonusPoints} bonus
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {game.team2.players[playerIdx].rank}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Match Totals */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Total Pins:</span>
                  <span className="font-semibold">{match.team1?.totalPins || 0}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">With Handicap:</span>
                  <span className="font-semibold">{match.team1?.totalWithHandicap || 0}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Bonus Points:</span>
                  <span className="font-semibold text-yellow-600">+{match.team1?.bonusPoints || 0}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-orange-600 pt-2 border-t">
                  <span>Match Score:</span>
                  <span>{match.team1?.score || 0}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Total Pins:</span>
                  <span className="font-semibold">{match.team2?.totalPins || 0}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">With Handicap:</span>
                  <span className="font-semibold">{match.team2?.totalWithHandicap || 0}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Bonus Points:</span>
                  <span className="font-semibold text-yellow-600">+{match.team2?.bonusPoints || 0}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t">
                  <span>Match Score:</span>
                  <span>{match.team2?.score || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Grand Total Points */}
      {(game.grandTotalPoints?.team1 > 0 || game.grandTotalPoints?.team2 > 0) && (
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-sm opacity-90 mb-1">Grand Total Points</div>
              <div className="text-3xl font-bold">+{game.grandTotalPoints.team1}</div>
              <div className="text-sm opacity-90 mt-1">{game.team1.name}</div>
            </div>
            <div className="text-4xl">🏆</div>
            <div className="text-center flex-1">
              <div className="text-sm opacity-90 mb-1">Grand Total Points</div>
              <div className="text-3xl font-bold">+{game.grandTotalPoints.team2}</div>
              <div className="text-sm opacity-90 mt-1">{game.team2.name}</div>
            </div>
          </div>
          <div className="text-center text-sm opacity-90 mt-4">
            2 points awarded to team with highest combined pins across all 3 matches
          </div>
        </div>
      )}
    </div>
  );
};
