import React from 'react';
import { ArrowLeft, ArrowRight, Star } from './Icons';

export function MatchView({ matchNumber, game, onUpdateScore, onNavigate, onCancel, isReadOnly = false }) {
  const matchIndex = matchNumber - 1;
  const match = game.matches[matchIndex];
  
  return (
    <div className="scorecard rounded-xl p-6 md:p-8 mb-8 animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <div className="bowling-title text-white text-3xl">
          MATCH {matchNumber} OF 3
          {isReadOnly && <span className="text-sm ml-3 text-yellow-400">(Read Only)</span>}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(num => (
            <div key={num} className={`w-3 h-3 rounded-full ${num === matchNumber ? 'bg-orange-500' : 'bg-gray-600'}`} />
          ))}
        </div>
      </div>

      {/* Team Headers */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-600 to-red-600 text-white p-4 rounded-lg text-center">
          <div className="bowling-title text-3xl truncate">{game.team1.name}</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-lg text-center">
          <div className="bowling-title text-3xl truncate">{game.team2.name}</div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="space-y-3">
          {game.team1.players.map((player, idx) => (
            <div key={idx} className="player-row bg-gray-700 rounded-lg p-3">
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Team 1 Player */}
                <div className="flex items-center gap-2">
                  <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {player.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{player.name}</div>
                    <div className="text-xs text-gray-400">
                      Avg: {player.average} | HC: {player.handicap}
                      {player.absent && <span className="text-red-400 font-bold ml-1">(ABSENT)</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {player.absent ? (
                      <>
                        <div className="text-center">
                          <label className="text-gray-400 text-sm block">Score</label>
                          <div className="w-16 px-2 py-1 bg-red-700 text-yellow-300 rounded border border-red-600 font-bold text-center text-sm">
                            {parseInt(player.average) - 10}
                          </div>
                        </div>
                        <div className="text-center">
                          <label className="text-gray-400 text-sm block">W/Hdc</label>
                          <div className="w-16 px-2 py-1 text-orange-400 font-bold text-sm text-center">
                            {(parseInt(player.average) - 10) + player.handicap}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0 w-12">
                          {match.team1.players[idx].bonusPoints > 0 && (
                            <>
                              <Star size={12} fill="currentColor" />
                              <span className="text-xs font-bold">+{match.team1.players[idx].bonusPoints}</span>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <label className="text-gray-400 text-sm block">Score</label>
                          <input
                            type="number"
                            value={match.team1.players[idx].pins}
                            onChange={(e) => onUpdateScore(matchIndex, 'team1', idx, e.target.value)}
                            onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                            placeholder="0-300"
                            min="0"
                            max="300"
                            disabled={isReadOnly}
                            className={`w-16 px-2 py-1 rounded border font-bold text-center text-sm ${
                              isReadOnly 
                                ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
                                : 'bg-gray-600 text-white border-gray-500 focus:border-orange-500 focus:outline-none'
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <label className="text-gray-400 text-sm block">W/Hdc</label>
                          <div className="w-16 px-2 py-1 text-orange-400 font-bold text-sm text-center">
                            {match.team1.players[idx].pins !== '' 
                              ? parseInt(match.team1.players[idx].pins) + player.handicap 
                              : 0}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0 w-12">
                          {match.team1.players[idx].bonusPoints > 0 && (
                            <>
                              <Star size={12} fill="currentColor" />
                              <span className="text-xs font-bold">+{match.team1.players[idx].bonusPoints}</span>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Points in Middle */}
                <div className="text-center">
                  <div className="bg-gray-900 rounded-lg p-2 border border-gray-600">
                    <div className="text-xs text-gray-400 mb-1">POINTS</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`font-bold text-lg ${match.games[idx].result === 'team1' ? 'text-green-400' : 'text-gray-500'}`}>
                        {match.games[idx].team1Points}
                      </span>
                      <span className="text-gray-600">-</span>
                      <span className={`font-bold text-lg ${match.games[idx].result === 'team2' ? 'text-green-400' : 'text-gray-500'}`}>
                        {match.games[idx].team2Points}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team 2 Player */}
                <div className="text-right flex items-center justify-end gap-2">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {game.team2.players[idx].absent ? (
                      <>
                        <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0 w-12">
                          {match.team2.players[idx].bonusPoints > 0 && (
                            <>
                              <span className="text-xs font-bold">+{match.team2.players[idx].bonusPoints}</span>
                              <Star size={12} fill="currentColor" />
                            </>
                          )}
                        </div>
                        <div className="text-center">
                          <label className="text-gray-400 text-sm block">W/Hdc</label>
                          <div className="w-16 px-2 py-1 text-blue-400 font-bold text-sm text-center">
                            {(parseInt(game.team2.players[idx].average) - 10) + game.team2.players[idx].handicap}
                          </div>
                        </div>
                        <div className="text-center">
                          <label className="text-gray-400 text-sm block">Score</label>
                          <div className="w-16 px-2 py-1 bg-red-700 text-yellow-300 rounded border border-red-600 font-bold text-center text-sm">
                            {parseInt(game.team2.players[idx].average) - 10}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0 w-12">
                          {match.team2.players[idx].bonusPoints > 0 && (
                            <>
                              <span className="text-xs font-bold">+{match.team2.players[idx].bonusPoints}</span>
                              <Star size={12} fill="currentColor" />
                            </>
                          )}
                        </div>
                        <div className="text-center">
                          <label className="text-gray-400 text-sm block">W/Hdc</label>
                          <div className="w-16 px-2 py-1 text-blue-400 font-bold text-sm text-center">
                            {match.team2.players[idx].pins !== '' 
                              ? parseInt(match.team2.players[idx].pins) + game.team2.players[idx].handicap 
                              : 0}
                          </div>
                        </div>
                        <div className="text-center">
                          <label className="text-gray-400 text-sm block">Score</label>
                          <input
                            type="number"
                            value={match.team2.players[idx].pins}
                            onChange={(e) => onUpdateScore(matchIndex, 'team2', idx, e.target.value)}
                            onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                            placeholder="0-300"
                            min="0"
                            max="300"
                            disabled={isReadOnly}
                            className={`w-16 px-2 py-1 rounded border font-bold text-center text-sm ${
                              isReadOnly 
                                ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
                                : 'bg-gray-600 text-white border-gray-500 focus:border-blue-500 focus:outline-none'
                            }`}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm text-right truncate">{game.team2.players[idx].name}</div>
                    <div className="text-xs text-gray-400 text-right">
                      Avg: {game.team2.players[idx].average} | HC: {game.team2.players[idx].handicap}
                      {game.team2.players[idx].absent && <span className="text-red-400 font-bold ml-1">(ABSENT)</span>}
                    </div>
                  </div>
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {game.team2.players[idx].rank}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Totals */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-600 text-white p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-1">Total Pins</div>
            <div className="text-3xl font-bold mb-2">{match.team1.totalPins}</div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">Total Pins w/ HC</div>
            <div className="text-2xl font-bold mb-3">{match.team1.totalWithHandicap}</div>
            <div className="pt-3 border-t border-orange-400">
              <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-1">Match Points</div>
              <div className="text-4xl font-bold">{match.team1.score}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-600">
            <div className="text-xs text-gray-400 mb-1 text-center">POINTS</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-orange-400 font-bold text-2xl">{match.team1.score}</span>
              <span className="text-gray-600">-</span>
              <span className="text-blue-400 font-bold text-2xl">{match.team2.score}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-1">Total Pins</div>
            <div className="text-3xl font-bold mb-2">{match.team2.totalPins}</div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">Total Pins w/ HC</div>
            <div className="text-2xl font-bold mb-3">{match.team2.totalWithHandicap}</div>
            <div className="pt-3 border-t border-blue-400">
              <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-1">Match Points</div>
              <div className="text-4xl font-bold">{match.team2.score}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('back')}
          className="flex items-center justify-center gap-2 bg-gray-700 text-white py-3 rounded-lg font-bold uppercase text-sm hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        
        <button
          onClick={onCancel}
          className="bg-red-600 text-white py-3 rounded-lg font-bold uppercase text-sm hover:bg-red-700 transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={() => onNavigate('next')}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold uppercase text-sm hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
        >
          {matchNumber === 3 ? 'Summary' : 'Next'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
