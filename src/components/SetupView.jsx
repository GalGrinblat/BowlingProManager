import { TEAM_OPTIONS } from '../constants/teams';

export function SetupView({ game, onTeamNameChange, onPlayerNameChange, onPlayerAverageChange, onToggleAbsent, onStartMatches, onCancel }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mb-8 pin-pattern animate-slide-in">
      <h2 className="bowling-title text-2xl sm:text-3xl text-gray-900 mb-4 sm:mb-6">GAME SETUP</h2>
      
      {/* Team Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Team 1 Name
          </label>
          <select
            value={game.team1.name}
            onChange={(e) => onTeamNameChange('team1', e.target.value)}
            className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-base sm:text-lg font-semibold transition-colors bg-white touch-manipulation"
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
          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Team 2 Name
          </label>
          <select
            value={game.team2.name}
            onChange={(e) => onTeamNameChange('team2', e.target.value)}
            className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-base sm:text-lg font-semibold transition-colors bg-white touch-manipulation"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Team 1 Players */}
        <div className="border-2 border-orange-300 rounded-lg p-3 sm:p-4 bg-orange-50">
          <h3 className="bowling-title text-lg sm:text-xl text-orange-800 mb-3 sm:mb-4">
            {game.team1.name || 'TEAM 1'} PLAYERS
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {[...game.team1.players].sort((a, b) => {
              if (a.average === '' && b.average === '') return 0;
              if (a.average === '') return 1;
              if (b.average === '') return -1;
              return parseInt(b.average) - parseInt(a.average);
            }).map((player) => (
              <div key={player.rank} className={`bg-white rounded-lg p-2 sm:p-3 shadow-sm ${player.absent ? 'opacity-60 bg-gray-100' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-orange-600 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                    {player.rank}
                  </div>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => onPlayerNameChange('team1', game.team1.players.indexOf(player), e.target.value)}
                    placeholder="Player name"
                    className="flex-1 px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded focus:border-orange-500 focus:outline-none font-semibold text-sm sm:text-base touch-manipulation"
                  />
                  <label className="flex items-center gap-1 cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={player.absent}
                      onChange={() => onToggleAbsent('team1', game.team1.players.indexOf(player))}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 border-gray-300 rounded"
                    />
                    <span className="text-xs font-semibold text-gray-600 hidden sm:inline">Absent</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Average</label>
                    <input
                      type="number"
                      value={player.average}
                      onChange={(e) => onPlayerAverageChange('team1', game.team1.players.indexOf(player), e.target.value)}
                      onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                      placeholder="0-300"
                      min="0"
                      max="300"
                      className="w-full px-2 py-2 sm:py-3 border border-gray-300 rounded focus:border-orange-500 focus:outline-none text-center font-semibold text-sm sm:text-base touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Handicap</label>
                    <div className="px-2 py-2 sm:py-3 bg-yellow-100 text-yellow-800 rounded font-bold text-center border border-yellow-300 text-sm sm:text-base">
                      {game.useHandicap === false ? 'N/A' : player.handicap}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team 2 Players */}
        <div className="border-2 border-blue-300 rounded-lg p-3 sm:p-4 bg-blue-50">
          <h3 className="bowling-title text-lg sm:text-xl text-blue-800 mb-3 sm:mb-4">
            {game.team2.name || 'TEAM 2'} PLAYERS
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {[...game.team2.players].sort((a, b) => {
              if (a.average === '' && b.average === '') return 0;
              if (a.average === '') return 1;
              if (b.average === '') return -1;
              return parseInt(b.average) - parseInt(a.average);
            }).map((player) => (
              <div key={player.rank} className={`bg-white rounded-lg p-2 sm:p-3 shadow-sm ${player.absent ? 'opacity-60 bg-gray-100' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-600 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                    {player.rank}
                  </div>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => onPlayerNameChange('team2', game.team2.players.indexOf(player), e.target.value)}
                    placeholder="Player name"
                    className="flex-1 px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none font-semibold text-sm sm:text-base touch-manipulation"
                  />
                  <label className="flex items-center gap-1 cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={player.absent}
                      onChange={() => onToggleAbsent('team2', game.team2.players.indexOf(player))}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-xs font-semibold text-gray-600 hidden sm:inline">Absent</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Average</label>
                    <input
                      type="number"
                      value={player.average}
                      onChange={(e) => onPlayerAverageChange('team2', game.team2.players.indexOf(player), e.target.value)}
                      onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                      placeholder="0-300"
                      min="0"
                      max="300"
                      className="w-full px-2 py-2 sm:py-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-center font-semibold text-sm sm:text-base touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Handicap</label>
                    <div className="px-2 py-2 sm:py-3 bg-yellow-100 text-yellow-800 rounded font-bold text-center border border-yellow-300 text-sm sm:text-base">
                      {game.useHandicap === false ? 'N/A' : player.handicap}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white py-3 sm:py-4 rounded-lg font-bold uppercase text-xs sm:text-sm hover:bg-gray-600 transition-colors touch-manipulation"
        >
          Cancel
        </button>
        
        <button
          onClick={onStartMatches}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 sm:py-4 rounded-lg font-bold uppercase text-xs sm:text-sm hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg touch-manipulation"
        >
          Start Matches
        </button>
      </div>
    </div>
  );
}
