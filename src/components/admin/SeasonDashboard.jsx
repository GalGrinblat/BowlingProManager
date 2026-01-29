import React, { useState, useEffect } from 'react';
import { seasonsApi, teamsApi, gamesApi, leaguesApi } from '../../services/api';
import { calculateTeamStandings, calculatePlayerSeasonStats } from '../../utils/standingsUtils';
import { createEmptyMatch } from '../../utils/matchUtils';
import { 
  exportStandingsCSV, 
  exportPlayerStatsCSV, 
  exportGamesCSV, 
  exportSeasonJSON, 
  exportAllSeasonData 
} from '../../utils/exportUtils';

export const SeasonDashboard = ({ seasonId, onBack, onPlayGame, onViewGame, onManageTeams }) => {
  const [season, setSeason] = useState(null);
  const [league, setLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [view, setView] = useState('schedule'); // schedule, standings, players
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedMatchDay, setSelectedMatchDay] = useState(null);

  useEffect(() => {
    loadSeasonData();
  }, [seasonId]);

  const loadSeasonData = () => {
    const seasonData = seasonsApi.getById(seasonId);
    setSeason(seasonData);
    
    const leagueData = leaguesApi.getById(seasonData.leagueId);
    setLeague(leagueData);
    
    const teamsData = teamsApi.getBySeason(seasonId);
    setTeams(teamsData);
    
    const gamesData = gamesApi.getBySeason(seasonId);
    setGames(gamesData);

    // Set default to current match day (first incomplete, or latest if all complete)
    if (gamesData.length > 0) {
      const incompleteGame = gamesData.find(g => g.status !== 'completed');
      if (incompleteGame) {
        setSelectedRound(incompleteGame.round);
        setSelectedMatchDay(incompleteGame.matchDay);
      } else {
        const maxRound = Math.max(...gamesData.map(g => g.round));
        const maxMatchDay = Math.max(...gamesData.filter(g => g.round === maxRound).map(g => g.matchDay));
        setSelectedRound(maxRound);
        setSelectedMatchDay(maxMatchDay);
      }
    }
  };

  const handleCompleteSeason = () => {
    const incompleteGames = games.filter(g => g.status !== 'completed');
    
    if (incompleteGames.length > 0) {
      alert(`Cannot complete season. ${incompleteGames.length} game(s) are not completed.`);
      return;
    }

    if (confirm('Complete this season? This will finalize all results and standings.')) {
      seasonsApi.update(seasonId, { status: 'completed' });
      loadSeasonData();
    }
  };

  if (!season || !league) return <div>Loading...</div>;

  const teamStandings = calculateTeamStandings(teams, games);
  const playerStats = calculatePlayerSeasonStats(teams, games);
  
  const roundGames = games.filter(g => g.round === selectedRound);
  const matchDayGames = selectedMatchDay ? roundGames.filter(g => g.matchDay === selectedMatchDay) : [];
  const matchDaysInRound = Array.from(new Set(roundGames.map(g => g.matchDay))).sort((a, b) => a - b);
  
  const totalGames = games.length;
  const completedGames = games.filter(g => g.status === 'completed').length;
  const progressPercent = totalGames > 0 ? (completedGames / totalGames) * 100 : 0;
  const isCompleted = season.status === 'completed';
  const champion = isCompleted && teamStandings.length > 0 ? teamStandings[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 mb-4"
        >
          ← Back to League
        </button>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-800">{season.name}</h1>
              {isCompleted && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                  COMPLETED
                </span>
              )}
            </div>
            <p className="text-gray-600">{league.name}</p>
            <div className="flex gap-4 mt-4 text-sm text-gray-600">
              <span>🏆 {teams.length} teams</span>
              <span>🎳 {completedGames}/{totalGames} games complete</span>
              <span>🔄 Round {selectedRound} of {season.numberOfRounds}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {season.status === 'active' && (
              <button
                onClick={onManageTeams}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-semibold"
              >
                👥 Manage Teams
              </button>
            )}
            {season.status === 'active' && completedGames === totalGames && (
              <button
                onClick={handleCompleteSeason}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Complete Season
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Champion Banner */}
      {champion && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl shadow-lg p-8 text-white">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-bold mb-2">Season Champion</h2>
            <h3 className="text-3xl font-bold mb-4">{champion.teamName}</h3>
            <div className="flex justify-center gap-8 text-lg">
              <div>
                <div className="text-2xl font-bold">{champion.points}</div>
                <div className="text-sm opacity-90">Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{champion.wins}-{champion.losses}-{champion.draws}</div>
                <div className="text-sm opacity-90">W-L-D</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{champion.totalPinsWithHandicap.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Pins</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Season Progress</h2>
          <span className="text-sm font-semibold">{Math.round(progressPercent)}%</span>
        </div>
        <div className="bg-blue-400 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Export Section */}
      {completedGames > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Export Season Data</h3>
              <p className="text-sm text-gray-600">Download standings, player stats, and game results</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => exportStandingsCSV(teamStandings, season.name)}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold text-sm transition-colors"
              >
                📊 Standings CSV
              </button>
              <button
                onClick={() => exportPlayerStatsCSV(playerStats, season.name)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-sm transition-colors"
              >
                👥 Player Stats CSV
              </button>
              <button
                onClick={() => exportGamesCSV(games, teams, season.name)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-semibold text-sm transition-colors"
              >
                🎳 Games CSV
              </button>
              <button
                onClick={() => exportSeasonJSON(season, teams, games, teamStandings, playerStats, league)}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-semibold text-sm transition-colors"
              >
                📦 Complete JSON
              </button>
              <button
                onClick={() => exportAllSeasonData(season, teams, games, teamStandings, playerStats, league)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold text-sm transition-all shadow-md"
              >
                ⬇️ Download All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Notice for Completed Seasons */}
      {isCompleted && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-semibold text-blue-800">Season Archive</p>
              <p className="text-sm text-blue-600">This season has been completed. You can view all results and statistics below.</p>
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setView('schedule')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
            view === 'schedule'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📅 {isCompleted ? 'Game Results' : 'Schedule'}
        </button>
        <button
          onClick={() => setView('standings')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
            view === 'standings'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🏆 {isCompleted ? 'Final Standings' : 'Team Standings'}
        </button>
        <button
          onClick={() => setView('players')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
            view === 'players'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          👥 Player Stats
        </button>
      </div>

      {/* Schedule View */}
      {view === 'schedule' && (
        <div className="space-y-4">
          {/* Round Selector */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Select Round</h3>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: season.numberOfRounds }, (_, i) => i + 1).map(round => {
                const roundGamesForRound = games.filter(g => g.round === round);
                const completedInRound = roundGamesForRound.filter(g => g.status === 'completed').length;
                
                return (
                  <button
                    key={round}
                    onClick={() => {
                      setSelectedRound(round);
                      const matchDays = Array.from(new Set(roundGamesForRound.map(g => g.matchDay))).sort((a, b) => a - b);
                      if (matchDays.length > 0) {
                        const incompleteMatchDay = matchDays.find(md => 
                          roundGamesForRound.filter(g => g.matchDay === md && g.status !== 'completed').length > 0
                        );
                        setSelectedMatchDay(incompleteMatchDay || matchDays[matchDays.length - 1]);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedRound === round
                        ? 'bg-blue-600 text-white'
                        : completedInRound === roundGamesForRound.length
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Round {round} ({completedInRound}/{roundGamesForRound.length})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match Day Selector */}
          {matchDaysInRound.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Select Match Day</h3>
              <div className="flex gap-2 flex-wrap">
                {matchDaysInRound.map(matchDay => {
                  const matchDayGamesForDay = roundGames.filter(g => g.matchDay === matchDay);
                  const completedInMatchDay = matchDayGamesForDay.filter(g => g.status === 'completed').length;
                  
                  return (
                    <button
                      key={matchDay}
                      onClick={() => setSelectedMatchDay(matchDay)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        selectedMatchDay === matchDay
                          ? 'bg-purple-600 text-white'
                          : completedInMatchDay === matchDayGamesForDay.length
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Match Day {matchDay} ({completedInMatchDay}/{matchDayGamesForDay.length})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Games List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Round {selectedRound} - Match Day {selectedMatchDay}
            </h2>
            {matchDayGames.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No games in this match day</p>
            ) : (
              <div className="space-y-3">
                {matchDayGames.map(game => {
                  const team1 = teams.find(t => t.id === game.team1Id);
                  const team2 = teams.find(t => t.id === game.team2Id);
                  
                  return (
                    <GameCard
                      key={game.id}
                      game={game}
                      team1={team1}
                      team2={team2}
                      onPlayGame={() => onPlayGame(game.id)}
                      onViewGame={() => onViewGame(game.id, game)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Standings View */}
      {view === 'standings' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Standings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700">Rank</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Team</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">GP</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">W</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">L</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">D</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">Points</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">Pins</th>
                </tr>
              </thead>
              <tbody>
                {teamStandings.map((standing, index) => (
                  <tr key={standing.teamId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-800">#{index + 1}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{standing.teamName}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{standing.gamesPlayed}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{standing.wins}</td>
                    <td className="px-4 py-3 text-center text-red-600 font-semibold">{standing.losses}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{standing.draws}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-blue-600 text-lg">{standing.points}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{standing.totalPinsWithHandicap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Player Stats View */}
      {view === 'players' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Player Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700">Rank</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Player</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Team</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">Games</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">Average</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">High Game</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">High Series</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">Total Pins</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((stat, index) => (
                  <tr key={`${stat.teamId}-${stat.playerName}`} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-800">#{index + 1}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{stat.playerName}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{stat.teamName}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{stat.gamesPlayed}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-blue-600 text-lg">{stat.average}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-purple-600 font-semibold">{stat.highGame}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{stat.highSeries}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{stat.totalPins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Game Card Component
const GameCard = ({ game, team1, team2, onPlayGame, onViewGame }) => {
  const getStatusBadge = () => {
    switch (game.status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Completed</span>;
      case 'in-progress':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">In Progress</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">Pending</span>;
    }
  };

  const team1TotalPoints = game.matches?.reduce((sum, m) => sum + (m.team1?.score || 0), 0) + (game.grandTotalPoints?.team1 || 0);
  const team2TotalPoints = game.matches?.reduce((sum, m) => sum + (m.team2?.score || 0), 0) + (game.grandTotalPoints?.team2 || 0);

  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      game.status === 'completed' 
        ? 'border-green-300 bg-green-50' 
        : game.status === 'in-progress'
        ? 'border-yellow-300 bg-yellow-50'
        : 'border-gray-300 hover:border-blue-300'
    }`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800 text-lg">{team1?.name || 'Team 1'}</span>
                {game.status === 'completed' && (
                  <span className="text-2xl font-bold text-blue-600">{team1TotalPoints}</span>
                )}
              </div>
            </div>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-800 text-lg">{team2?.name || 'Team 2'}</span>
            {game.status === 'completed' && (
              <span className="text-2xl font-bold text-blue-600">{team2TotalPoints}</span>
            )}
          </div>
        </div>
        <div className="ml-4">
          {game.status === 'completed' ? (
            <button
              onClick={onViewGame}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-semibold"
            >
              View Results
            </button>
          ) : (
            <button
              onClick={onPlayGame}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              {game.status === 'in-progress' ? 'Continue' : 'Start Game'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
