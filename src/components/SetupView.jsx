import React from 'react';
import { TEAM_OPTIONS } from '../constants/teams';

export function SetupView({ game, onTeamNameChange, onPlayerNameChange, onPlayerAverageChange, onToggleAbsent, onStartMatches, onCancel }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8 pin-pattern animate-slide-in">
      <h2 className="bowling-title text-3xl text-gray-900 mb-6">GAME SETUP</h2>
      
      {/* Team Names */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Team 1 Name
          </label>
          <select
            value={game.team1.name}
            onChange={(e) => onTeamNameChange('team1', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-semibold transition-colors bg-white"
          >
            <option value="">Select team name</option>
            {TEAM_OPTIONS.map(team => (
              <option key={team} value={team} disabled={game.team2.name === team}>
                {team}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Team 2 Name
          </label>
          <select
            value={game.team2.name}
            onChange={(e) => onTeamNameChange('team2', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-semibold transition-colors bg-white"
          >
            <option value="">Select team name</option>
            {TEAM_OPTIONS.map(team => (
              <option key={team} value={team} disabled={game.team1.name === team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Players Setup */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Team 1 Players */}
        <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
          <h3 className="bowling-title text-xl text-orange-800 mb-4">
            {game.team1.name || 'TEAM 1'} PLAYERS
          </h3>
          <div className="space-y-3">
            {game.team1.players.map((player, idx) => (
              <div key={idx} className={`bg-white rounded-lg p-3 shadow-sm ${player.absent ? 'opacity-60 bg-gray-100' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {player.rank}
                  </div>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => onPlayerNameChange('team1', idx, e.target.value)}
                    placeholder="Player name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none font-semibold"
                  />
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={player.absent}
                      onChange={() => onToggleAbsent('team1', idx)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded"
                    />
                    <span className="text-xs font-semibold text-gray-600">Absent</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Average</label>
                    <input
                      type="number"
                      value={player.average}
                      onChange={(e) => onPlayerAverageChange('team1', idx, e.target.value)}
                      onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                      placeholder="0-300"
                      min="0"
                      max="300"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:border-orange-500 focus:outline-none text-center font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Handicap</label>
                    <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold text-center border border-yellow-300">
                      {player.handicap}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team 2 Players */}
        <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
          <h3 className="bowling-title text-xl text-blue-800 mb-4">
            {game.team2.name || 'TEAM 2'} PLAYERS
          </h3>
          <div className="space-y-3">
            {game.team2.players.map((player, idx) => (
              <div key={idx} className={`bg-white rounded-lg p-3 shadow-sm ${player.absent ? 'opacity-60 bg-gray-100' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {player.rank}
                  </div>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => onPlayerNameChange('team2', idx, e.target.value)}
                    placeholder="Player name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none font-semibold"
                  />
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={player.absent}
                      onChange={() => onToggleAbsent('team2', idx)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-xs font-semibold text-gray-600">Absent</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Average</label>
                    <input
                      type="number"
                      value={player.average}
                      onChange={(e) => onPlayerAverageChange('team2', idx, e.target.value)}
                      onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                      placeholder="0-300"
                      min="0"
                      max="300"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-center font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Handicap</label>
                    <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold text-center border border-yellow-300">
                      {player.handicap}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white py-3 rounded-lg font-bold uppercase text-sm hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={onStartMatches}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold uppercase text-sm hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
        >
          Start Matches
        </button>
      </div>
    </div>
  );
}
