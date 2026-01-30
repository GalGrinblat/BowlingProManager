import { ArrowLeft, CheckCircle } from './Icons';

export function SummaryView({ game, totals, playerStats, onBack, onFinish }) {
  return (
    <div className="scorecard rounded-xl p-6 md:p-8 mb-8 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <div className="bowling-title text-white text-3xl">GAME SUMMARY</div>
        <CheckCircle className="text-green-500" size={36} />
      </div>

      {/* Overall Winner */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 p-6 rounded-lg mb-6 text-center">
        <div className="text-lg font-bold uppercase mb-2">Game Winner</div>
        {totals.team1Total > totals.team2Total ? (
          <div className="bowling-title text-5xl">{game.team1.name}</div>
        ) : totals.team2Total > totals.team1Total ? (
          <div className="bowling-title text-5xl">{game.team2.name}</div>
        ) : (
          <div className="bowling-title text-5xl">TIE GAME</div>
        )}
        <div className="text-3xl font-bold mt-2">
          {totals.team1Total} - {totals.team2Total}
        </div>
      </div>

      {/* Match-by-Match Breakdown */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="bowling-title text-white text-xl mb-4">MATCH BREAKDOWN</div>
        <div className="space-y-2">
          {game.matches.map((match, idx) => (
            <div key={idx} className="bg-gray-700 rounded p-3">
              <div className="grid grid-cols-3 items-center">
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-2xl">{match.team1.totalWithHandicap}</div>
                  <div className="text-gray-400 text-xs">({match.team1.totalPins})</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm mb-1">Match {idx + 1}</div>
                  <div className="text-yellow-400 font-bold text-xl">
                    {match.team1.score} - {match.team2.score}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-bold text-2xl">{match.team2.totalWithHandicap}</div>
                  <div className="text-gray-400 text-xs">({match.team2.totalPins})</div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Total Line */}
          <div className="bg-gray-900 rounded p-3 border-2 border-yellow-500">
            <div className="grid grid-cols-3 items-center">
              <div className="text-center">
                <div className="text-orange-400 font-bold text-2xl">{totals.team1TotalPinsWithHandicap}</div>
                <div className="text-gray-400 text-xs">({totals.team1TotalPinsNoHandicap})</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-sm mb-1">TOTAL</div>
                <div className="text-yellow-400 font-bold text-2xl">
                  {game.grandTotalPoints.team1} - {game.grandTotalPoints.team2}
                </div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-2xl">{totals.team2TotalPinsWithHandicap}</div>
                <div className="text-gray-400 text-xs">({totals.team2TotalPinsNoHandicap})</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Statistics */}
      <div className="bowling-title text-white text-2xl mb-4">GAME STATISTICS</div>

      {/* Player Statistics */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="bowling-title text-orange-500 text-xl mb-4 text-center">
            {game.team1.name}
          </div>
          <div className="space-y-2">
            {playerStats.team1Stats.map((player, idx) => (
              <div key={idx} className={`bg-gray-700 rounded p-3 ${player.isAbsent ? 'opacity-60 bg-red-900' : ''}`}>
                <div className="grid grid-cols-4 gap-3 items-center h-14">
                  <div className="col-span-2">
                    <div className="text-white font-semibold text-lg">{player.name}</div>
                  </div>
                  {player.isAbsent ? (
                    <div className="col-span-2 text-center">
                      <div className="text-red-400 font-bold">ABSENT</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <div className="text-gray-400 text-xs font-semibold">3-Game Avg</div>
                        <div className={`font-bold ${parseInt(player.average) <= player.gameAverage ? 'text-green-400' : 'text-red-400'}`}>{player.gameAverage.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-xs font-semibold">Points Earned</div>
                        <div className="text-green-400 font-bold">{player.pointsScored}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div className="bg-orange-600 rounded p-3 h-14">
              <div className="grid grid-cols-4 gap-3 items-center h-full">
                <div className="col-span-2">
                  <div className="text-white font-semibold text-lg">TEAM TOTAL</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs font-semibold">Team Average</div>
                  <div className="text-white font-bold">{playerStats.team1Average.toFixed(1)}</div>
                </div>
                <div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="bowling-title text-blue-400 text-xl mb-4 text-center">
            {game.team2.name}
          </div>
          <div className="space-y-2">
            {playerStats.team2Stats.map((player, idx) => (
              <div key={idx} className={`bg-gray-700 rounded p-3 ${player.isAbsent ? 'opacity-60 bg-red-900' : ''}`}>
                <div className="grid grid-cols-4 gap-3 items-center h-14">
                  <div className="col-span-2">
                    <div className="text-white font-semibold text-lg">{player.name}</div>
                  </div>
                  {player.isAbsent ? (
                    <div className="col-span-2 text-center">
                      <div className="text-red-400 font-bold">ABSENT</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <div className="text-gray-400 text-xs font-semibold">3-Game Avg</div>
                        <div className={`font-bold ${parseInt(player.average) <= player.gameAverage ? 'text-green-400' : 'text-red-400'}`}>{player.gameAverage.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-xs font-semibold">Points Earned</div>
                        <div className="text-green-400 font-bold">{player.pointsScored}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div className="bg-blue-600 rounded p-3 h-14">
              <div className="grid grid-cols-4 gap-3 items-center h-full">
                <div className="col-span-2">
                  <div className="text-white font-semibold text-lg">TEAM TOTAL</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs font-semibold">Team Average</div>
                  <div className="text-white font-bold">{playerStats.team2Average.toFixed(1)}</div>
                </div>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 bg-gray-700 text-white py-3 rounded-lg font-bold uppercase text-sm hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Match 3
        </button>
        
        <button
          onClick={onFinish}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold uppercase text-sm hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
        >
          Save Game
        </button>
      </div>
    </div>
  );
}
