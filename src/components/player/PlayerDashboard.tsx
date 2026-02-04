import React, { useState, useEffect } from 'react';
import { playersApi, leaguesApi, seasonsApi, teamsApi, gamesApi } from '../../services/api';
import { calculateTeamStandings } from '../../utils/standingsUtils';
import { PlayerSeasonComparison } from './PlayerSeasonComparison';

import type { PlayerDashboardProps } from '../../types/index.ts';

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ playerId, onNavigate }) => {
  const [player, setPlayer] = useState<any>(null);
  const [playerLeagues, setPlayerLeagues] = useState<any[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<any[]>([]);
  const [recentCompletedGames, setRecentCompletedGames] = useState<any[]>([]);
  const [completedSeasons, setCompletedSeasons] = useState<any[]>([]);
  const [view, setView] = useState('dashboard'); // dashboard, stats, leagues, history
  const [playerStats, setPlayerStats] = useState<any>(null);

  useEffect(() => {
    loadPlayerData();
  }, [playerId]);

  const loadPlayerData = () => {
    const playerData = playersApi.getById(playerId);
    setPlayer(playerData);

    // Find all teams this player is on
    const allTeams = teamsApi.getAll();
    const playerTeams = allTeams.filter(team => team.playerIds.includes(playerId));

    // Get unique seasons the player is in
    const seasonIds = [...new Set(playerTeams.map(t => t.seasonId))];
    const seasons = seasonIds.map(id => seasonsApi.getById(id)).filter(Boolean);

    // Get leagues for those seasons
    const leagueIds = [...new Set(seasons.filter((s): s is any => s !== undefined).map(s => s.leagueId))];
    const leagues = leagueIds
      .map(id => leaguesApi.getById(id))
      .filter(Boolean)
      .map(league => {
        const leagueSeasons = seasons.filter((s): s is any => s !== undefined && s.leagueId === league?.id);
        const activeSeasons = leagueSeasons.filter((s: any) => s.status === 'active');
        
        return {
          ...league,
          seasons: leagueSeasons,
          activeSeasons: activeSeasons,
          playerTeams: playerTeams.filter(t => 
            leagueSeasons.some((s: any) => s.id === t.seasonId)
          )
        };
      });

    setPlayerLeagues(leagues);

    // Get upcoming games (incomplete games where player is participating)
    const allGames = gamesApi.getAll();
    const playerGames = allGames.filter(game => {
      const team1 = teamsApi.getById(game.team1Id);
      const team2 = teamsApi.getById(game.team2Id);
      return (team1?.playerIds.includes(playerId) || team2?.playerIds.includes(playerId)) &&
             game.status !== 'completed';
    });

    // Sort by match day
    const sortedGames = playerGames.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return (a.matchDay || 0) - (b.matchDay || 0);
    });

    setUpcomingGames(sortedGames.slice(0, 5)); // Show next 5 games

    // Get recent completed games
    const completedPlayerGames = allGames.filter(game => {
      const team1 = teamsApi.getById(game.team1Id);
      const team2 = teamsApi.getById(game.team2Id);
      return (team1?.playerIds.includes(playerId) || team2?.playerIds.includes(playerId)) &&
             game.status === 'completed';
    });

    // Sort by completion date (most recent first)
    const sortedCompletedGames = completedPlayerGames.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.updatedAt || 0);
      const dateB = new Date(b.completedAt || b.updatedAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    setRecentCompletedGames(sortedCompletedGames.slice(0, 5)); // Show last 5 completed games

    // Get completed seasons where player participated
    const completedPlayerSeasons = seasons
      .filter((s): s is any => s !== undefined && s.status === 'completed')
      .map(season => {
        const league = leaguesApi.getById(season.leagueId);
        const playerTeam = playerTeams.find(t => t.seasonId === season.id);
        const seasonGames = gamesApi.getBySeason(season.id);
        const seasonTeams = teamsApi.getBySeason(season.id);
        
        // Calculate standings for this season
        const standings = calculateTeamStandings(seasonTeams, seasonGames);
        const playerTeamStanding = standings.find(s => s.teamId === playerTeam?.id);
        const champion = standings[0];
        
        return {
          ...season,
          league,
          playerTeam,
          playerTeamStanding,
          champion,
          totalGames: seasonGames.length
        };
      })
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    
    setCompletedSeasons(completedPlayerSeasons);

    // Calculate player statistics across all games
    calculatePlayerStats(allGames);
  };

  const calculatePlayerStats = (allGames: any[]) => {
    const stats = {
      totalGames: 0,
      totalPins: 0,
      average: 0,
      highGame: 0,
      highSeries: 0,
      totalPoints: 0,
      byLeague: {} as Record<string, any>
    };

    // Process all completed games
    const completedGames = allGames.filter((g: any) => g.status === 'completed');
    
    completedGames.forEach((game: any) => {
      const team1 = teamsApi.getById(game.team1Id);
      const team2 = teamsApi.getById(game.team2Id);
      
      const isOnTeam1 = team1?.playerIds.includes(playerId);
      const isOnTeam2 = team2?.playerIds.includes(playerId);
      
      if (!isOnTeam1 && !isOnTeam2) return;

      const playerIndex = (isOnTeam1 ? team1 : team2)?.playerIds.indexOf(playerId);
      
      if (playerIndex === undefined || playerIndex === -1) return;

      // Get season/league info
      const season = seasonsApi.getById(game.seasonId);
      const league = season ? leaguesApi.getById(season.leagueId) : null;
      const leagueName = league?.name || 'Unknown League';

      if (!stats.byLeague[leagueName]) {
        stats.byLeague[leagueName] = {
          gamesPlayed: 0,
          totalPins: 0,
          average: 0,
          highGame: 0,
          highSeries: 0,
          points: 0
        };
      }

      let seriesPins = 0;
      let seriesPoints = 0;

      // Process each match
      game.matches.forEach((match: any) => {
        const teamMatch = isOnTeam1 ? match.team1 : match.team2;
        if (teamMatch && teamMatch.players && teamMatch.players[playerIndex]) {
          const playerMatch = teamMatch.players[playerIndex];
          const pins = parseInt(playerMatch.pins) || 0;
          
          if (playerMatch.pins !== '') {
            stats.totalGames++;
            stats.totalPins += pins;
            stats.byLeague[leagueName].gamesPlayed++;
            stats.byLeague[leagueName].totalPins += pins;
            seriesPins += pins;

            if (pins > stats.highGame) {
              stats.highGame = pins;
            }
            if (pins > stats.byLeague[leagueName].highGame) {
              stats.byLeague[leagueName].highGame = pins;
            }
          }

          // Calculate points scored
          if (match.games && match.games[playerIndex]) {
            const points = isOnTeam1 
              ? match.games[playerIndex].team1Points 
              : match.games[playerIndex].team2Points;
            stats.totalPoints += points;
            stats.byLeague[leagueName].points += points;
            seriesPoints += points;
          }
        }
      });

      // Update high series
      if (seriesPins > stats.highSeries) {
        stats.highSeries = seriesPins;
      }
      if (seriesPins > stats.byLeague[leagueName].highSeries) {
        stats.byLeague[leagueName].highSeries = seriesPins;
      }
    });

    // Calculate averages
    if (stats.totalGames > 0) {
      stats.average = Math.round(stats.totalPins / stats.totalGames);
    }

    Object.keys(stats.byLeague).forEach(leagueName => {
      const leagueStats = stats.byLeague[leagueName];
      if (leagueStats.gamesPlayed > 0) {
        leagueStats.average = Math.round(leagueStats.totalPins / leagueStats.gamesPlayed);
      }
    });

    setPlayerStats(stats);
  };

  if (!player) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, {player.name}!</h1>
        <p className="text-purple-100">Player Dashboard</p>
        <div className="flex gap-4 mt-4 text-sm">
          <span>🎳 {playerLeagues.length} Active League{playerLeagues.length !== 1 ? 's' : ''}</span>
          <span>📅 {upcomingGames.length} Upcoming Game{upcomingGames.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Starting Average</p>
              <p className="text-2xl font-bold text-gray-800">{player.startingAverage || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Leagues</p>
              <p className="text-2xl font-bold text-gray-800">{playerLeagues.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teams</p>
              <p className="text-2xl font-bold text-gray-800">
                {playerLeagues.reduce((sum, l) => sum + l.playerTeams.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2 flex gap-1 sm:gap-2 overflow-x-auto">
        <button
          onClick={() => setView('dashboard')}
          className={`flex-1 min-w-[90px] py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold text-xs sm:text-base transition-colors whitespace-nowrap ${
            view === 'dashboard'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🏠 Dashboard
        </button>
        <button
          onClick={() => setView('stats')}
          className={`flex-1 min-w-[90px] py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold text-xs sm:text-base transition-colors whitespace-nowrap ${
            view === 'stats'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📊 My Stats
        </button>
        <button
          onClick={() => setView('comparison')}
          className={`flex-1 min-w-[90px] py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold text-xs sm:text-base transition-colors whitespace-nowrap ${
            view === 'comparison'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📈 Compare
        </button>
        <button
          onClick={() => setView('leagues')}
          className={`flex-1 min-w-[90px] py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold text-xs sm:text-base transition-colors whitespace-nowrap ${
            view === 'leagues'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🏆 My Leagues
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 min-w-[90px] py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold text-xs sm:text-base transition-colors whitespace-nowrap ${
            view === 'history'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📚 History
        </button>
      </div>

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <>
          {/* Upcoming Games */}
          {upcomingGames.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Upcoming Games</h2>
                <p className="text-sm text-gray-600 mt-1">
                  💡 Click on any game to enter scores for your team!
                </p>
              </div>
              <div className="space-y-3">
                {upcomingGames.map(game => {
                  const season = seasonsApi.getById(game.seasonId);
                  const league = season ? leaguesApi.getById(season.leagueId) : null;
                  const team1 = teamsApi.getById(game.team1Id);
                  const team2 = teamsApi.getById(game.team2Id);
                  const isTeam1 = team1?.playerIds.includes(playerId);
                  
                  return (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => onNavigate('player-game', { gameId: game.id })}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                            {league?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            Round {game.round} • Match Day {game.matchDay}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-semibold ${isTeam1 ? 'text-blue-600' : 'text-gray-700'}`}>
                            {game.team1?.name || team1?.name}
                          </span>
                          <span className="text-gray-400 font-bold">vs</span>
                          <span className={`font-semibold ${!isTeam1 ? 'text-blue-600' : 'text-gray-700'}`}>
                            {game.team2?.name || team2?.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {game.status === 'in-progress' && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-semibold">
                            In Progress
                          </span>
                        )}
                        {game.status === 'pending' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                            📝 Ready to Score
                          </span>
                        )}
                        <span className="text-blue-600 font-semibold">Enter Scores →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Upcoming Games Message */}
          {upcomingGames.length === 0 && playerLeagues.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 text-center">
              <p className="text-2xl mb-2">🎳</p>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">
                No upcoming games right now. When your next game is scheduled, you'll see it here and can enter scores yourself!
              </p>
            </div>
          )}

          {/* Recent Completed Games */}
          {recentCompletedGames.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Completed Games</h2>
              <div className="space-y-3">
                {recentCompletedGames.map(game => {
                  const season = seasonsApi.getById(game.seasonId);
                  const league = season ? leaguesApi.getById(season.leagueId) : null;
                  const team1 = teamsApi.getById(game.team1Id);
                  const team2 = teamsApi.getById(game.team2Id);
                  const isTeam1 = team1?.playerIds.includes(playerId);
                  
                  const team1TotalPoints = game.matches?.reduce((sum: any, m: any) => sum + (m.team1?.score || 0), 0) + (game.grandTotalScore?.team1 || 0);
                  const team2TotalPoints = game.matches?.reduce((sum: any, m: any) => sum + (m.team2?.score || 0), 0) + (game.grandTotalScore?.team2 || 0);
                  const playerWon = (isTeam1 && team1TotalPoints > team2TotalPoints) || (!isTeam1 && team2TotalPoints > team1TotalPoints);
                  const playerEntered = game.enteredBy === playerId;
                  
                  return (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => onNavigate('player-game-history', { gameId: game.id, gameData: game })}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                            {league?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            Round {game.round} • Match Day {game.matchDay}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(game.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-semibold ${isTeam1 ? 'text-blue-600' : 'text-gray-700'}`}>
                            {game.team1?.name || team1?.name}
                          </span>
                          <span className="text-gray-400">
                            <span className="font-bold">{team1TotalPoints}</span> - <span className="font-bold">{team2TotalPoints}</span>
                          </span>
                          <span className={`font-semibold ${!isTeam1 ? 'text-blue-600' : 'text-gray-700'}`}>
                            {game.team2?.name || team2?.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {playerEntered && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold" title="You entered this score">
                            📝 Self-Entered
                          </span>
                        )}
                        {playerWon ? (
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded font-semibold">
                            Won
                          </span>
                        ) : team1TotalPoints === team2TotalPoints ? (
                          <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded font-semibold">
                            Tie
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded font-semibold">
                            Lost
                          </span>
                        )}
                        <span className="text-purple-600 font-semibold">View →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Stats View */}
      {view === 'stats' && playerStats && (
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Overall Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Games Played</p>
                <p className="text-3xl font-bold text-blue-600">{playerStats.totalGames}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Average</p>
                <p className="text-3xl font-bold text-green-600">{playerStats.average}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">High Game</p>
                <p className="text-3xl font-bold text-purple-600">{playerStats.highGame}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">High Series</p>
                <p className="text-3xl font-bold text-orange-600">{playerStats.highSeries}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Pins</span>
                <span className="text-2xl font-bold text-gray-800">{playerStats.totalPins.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Total Points Scored</span>
                <span className="text-2xl font-bold text-gray-800">{playerStats.totalPoints}</span>
              </div>
            </div>
          </div>

          {/* Stats by League */}
          {Object.keys(playerStats.byLeague).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistics by League</h2>
              <div className="space-y-4">
                {Object.entries(playerStats.byLeague).map(([leagueName, stats]: [string, any]) => (
                  <div key={leagueName} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">{leagueName}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">Games</p>
                        <p className="text-xl font-bold text-gray-800">{stats.gamesPlayed}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">Average</p>
                        <p className="text-xl font-bold text-gray-800">{stats.average}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">High Game</p>
                        <p className="text-xl font-bold text-gray-800">{stats.highGame}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">High Series</p>
                        <p className="text-xl font-bold text-gray-800">{stats.highSeries}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">Points</p>
                        <p className="text-xl font-bold text-gray-800">{stats.points}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {playerStats.totalGames === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <span className="text-6xl mb-4 block">📊</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Statistics Yet</h3>
              <p className="text-gray-600">Complete some games to see your statistics here.</p>
            </div>
          )}
        </div>
      )}

      {/* Leagues View */}
      {view === 'leagues' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Leagues</h2>
          {playerLeagues.length === 0 ? (
            <p className="text-gray-500 text-center py-8">You are not registered in any leagues yet.</p>
          ) : (
            <div className="space-y-4">
              {playerLeagues.map(league => (
                <div
                  key={league.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => onNavigate('player-league', { leagueId: league.id })}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{league.name}</h3>
                      {league.description && (
                        <p className="text-sm text-gray-600 mt-1">{league.description}</p>
                      )}
                    </div>
                    <span className="text-blue-600 font-semibold">View →</span>
                  </div>
                  
                  <div className="space-y-2">
                    {league.activeSeasons.map((season: any) => {
                      const playerTeam = league.playerTeams.find((t: any) => t.seasonId === season.id);
                      return (
                        <div key={season.id} className="flex items-center gap-3 text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
                            Active
                          </span>
                          <span className="font-semibold text-gray-700">{season.name}</span>
                          {playerTeam && (
                            <span className="text-gray-500">• Team: {playerTeam.name}</span>
                          )}
                        </div>
                      );
                    })}
                    
                    {league.seasons.filter((s: any) => s.status === 'setup').map((season: any) => {
                      const playerTeam = league.playerTeams.find((t: any) => t.seasonId === season.id);
                      return (
                        <div key={season.id} className="flex items-center gap-3 text-sm">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-semibold">
                            Setup
                          </span>
                          <span className="font-semibold text-gray-700">{season.name}</span>
                          {playerTeam && (
                            <span className="text-gray-500">• Team: {playerTeam.name}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History View */}
      {view === 'history' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Season History</h2>
          {completedSeasons.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📚</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Completed Seasons</h3>
              <p className="text-gray-600">You haven't participated in any completed seasons yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedSeasons.map(season => (
                <div
                  key={season.id}
                  className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{season.name}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          COMPLETED
                        </span>
                      </div>
                      <p className="text-sm text-purple-600 font-semibold">{season.league?.name}</p>
                    </div>
                  </div>

                  {/* Season Champion */}
                  {season.champion && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <p className="text-xs text-gray-600">Season Champion</p>
                          <p className="font-bold text-gray-800">{season.champion.teamName}</p>
                          <p className="text-sm text-gray-600">{season.champion.points} points • {season.champion.wins}-{season.champion.losses}-{season.champion.draws}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Player's Team Performance */}
                  {season.playerTeam && season.playerTeamStanding && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">👥</span>
                        <div>
                          <p className="text-xs text-gray-600">Your Team</p>
                          <p className="font-bold text-gray-800">{season.playerTeam.name}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-center">
                        <div>
                          <p className="text-xs text-gray-600">Rank</p>
                          <p className="text-lg font-bold text-blue-600">
                            #{season.playerTeamStanding.teamId === season.champion?.teamId ? '1 🏆' : 
                              completedSeasons.findIndex(s => s.id === season.id) + 1}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Points</p>
                          <p className="text-lg font-bold text-gray-800">{season.playerTeamStanding.points}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Record</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {season.playerTeamStanding.wins}-{season.playerTeamStanding.losses}-{season.playerTeamStanding.draws}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Total Pins</p>
                          <p className="text-lg font-bold text-gray-800">{season.playerTeamStanding.totalPinsWithHandicap.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Season Info */}
                  <div className="flex gap-4 text-sm text-gray-600 mt-3">
                    <span>📅 {new Date(season.startDate).toLocaleDateString()}</span>
                    <span>🎳 {season.totalGames} games</span>
                    {season.updatedAt && (
                      <span>✓ Completed {new Date(season.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Season Comparison View */}
      {view === 'comparison' && (
        <PlayerSeasonComparison 
          playerId={playerId}
          onBack={() => setView('dashboard')}
        />
      )}
    </div>
  );
};
