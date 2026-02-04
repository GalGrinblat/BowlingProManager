import React, { useState, useEffect } from 'react';
import { playersApi, seasonsApi, teamsApi, gamesApi, leaguesApi } from '../../services/api';
import { calculatePlayerSeasonStats } from '../../utils/standingsUtils';

/**
 * Player Season Comparison Component
 * Shows player performance across multiple seasons and within a single season
 */
import type { PlayerSeasonComparisonProps } from '../../types/index';

export const PlayerSeasonComparison: React.FC<PlayerSeasonComparisonProps> = ({ playerId, onBack }) => {
  const [player, setPlayer] = useState<any>(null);
  const [allSeasons, setAllSeasons] = useState<any[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedSeasonForChart, setSelectedSeasonForChart] = useState<string | null>(null);
  const [gameByGameData, setGameByGameData] = useState<any[]>([]);

  useEffect(() => {
    loadPlayerData();
  }, [playerId]);

  const loadPlayerData = () => {
    const playerData = playersApi.getById(playerId);
    setPlayer(playerData);

    // Find all teams this player is on
    const allTeams = teamsApi.getAll();
    const playerTeams = allTeams.filter((team: any) => team.playerIds.includes(playerId));

    // Get all seasons the player participated in
    const seasonIds = [...new Set(playerTeams.map((t: any) => t.seasonId))];
    const seasons = seasonIds
      .map((id: string) => seasonsApi.getById(id))
      .filter((s): s is any => s !== null && s !== undefined)
      .map((season: any) => {
        const league = leaguesApi.getById(season.leagueId);
        const games = gamesApi.getBySeason(season.id);
        const teams = teamsApi.getBySeason(season.id);
        const playerStats = calculatePlayerSeasonStats(teams, games);
        const stats = playerStats.find((ps: any) => ps.playerName === playerData?.name);
        
        return {
          ...season,
          leagueName: league?.name,
          stats: stats || {
            gamesPlayed: 0,
            average: 0,
            highGame: 0,
            highSeries: 0,
            totalPins: 0
          }
        };
      })
      .filter((s): s is any => s !== null)
      .sort((a, b) => new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()); // Most recent first

    setAllSeasons(seasons);

    // Auto-select most recent season for comparison
    if (seasons.length > 0 && selectedSeasons.length === 0) {
      if (seasons.length > 0 && seasons[0]?.id) {
        setSelectedSeasons([seasons[0].id]);
        setSelectedSeasonForChart(seasons[0].id);
        loadGameByGameData(seasons[0].id);
      }
    }
  };

  const loadGameByGameData = (seasonId: string) => {
    // Load season data for game-by-game analysis
    const games = gamesApi.getBySeason(seasonId);
    const teams = teamsApi.getBySeason(seasonId);
    const playerTeam = teams.find(t => t.playerIds.includes(playerId));

    if (!playerTeam) return;

    const playerIndex = playerTeam.playerIds.indexOf(playerId);
    const completedGames = games.filter(g => g.status === 'completed').sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return a.matchDay - b.matchDay;
    });

    const gameData: any[] = [];
    let runningTotal = 0;
    let gamesCount = 0;

    completedGames.forEach((game: any) => {
      const isTeam1 = game.team1Id === playerTeam.id;
      const playerData = isTeam1 ? game.team1.players[playerIndex] : game.team2.players[playerIndex];

      if (!playerData) return;

      // Get scores from all matches in this game
      game.matches?.forEach((match: any, matchIdx: number) => {
        const matchPlayer = isTeam1 ? match.team1.players[playerIndex] : match.team2.players[playerIndex];
        if (matchPlayer && matchPlayer.pins !== '') {
          const score = playerData.absent ? parseInt(playerData.average) - 10 : parseInt(matchPlayer.pins);
          runningTotal += score;
          gamesCount++;

          gameData.push({
            gameNumber: gamesCount,
            score: score,
            average: Math.round(runningTotal / gamesCount),
            matchDay: game.matchDay,
            round: game.round,
            matchNumber: matchIdx + 1,
            opponent: isTeam1 ? game.team2.name : game.team1.name
          });
        }
      });
    });

    setGameByGameData(gameData);
  };

  const toggleSeason = (seasonId: string) => {
    if (selectedSeasons.includes(seasonId)) {
      setSelectedSeasons(selectedSeasons.filter(id => id !== seasonId));
    } else {
      setSelectedSeasons([...selectedSeasons, seasonId]);
    }
  };

  const handleSeasonChartChange = (seasonId: string) => {
    setSelectedSeasonForChart(seasonId);
    loadGameByGameData(seasonId);
  };

  const selectedSeasonsData = allSeasons.filter(s => selectedSeasons.includes(s.id));

  if (!player) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 mb-4"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Season Comparison</h1>
        <p className="text-gray-600">{player.name} - Performance Analysis</p>
      </div>

      {/* Season Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Select Seasons to Compare</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allSeasons.map(season => (
            <button
              key={season.id}
              onClick={() => toggleSeason(season.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedSeasons.includes(season.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-800">{season.name}</div>
              <div className="text-sm text-gray-600">{season.leagueName}</div>
              <div className="text-sm text-gray-500 mt-2">
                {season.stats.gamesPlayed} games • {season.stats.average} avg
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedSeasonsData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Season Statistics Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Season</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">League</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Games</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Average</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">High Game</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">High Series</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Total Pins</th>
                </tr>
              </thead>
              <tbody>
                {selectedSeasonsData.map(season => (
                  <tr key={season.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{season.name}</td>
                    <td className="px-4 py-3 text-gray-600">{season.leagueName}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{season.stats.gamesPlayed}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-blue-600 text-lg">{season.stats.average}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-purple-600 font-semibold">{season.stats.highGame}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{season.stats.highSeries}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{season.stats.totalPins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Game-by-Game Performance Chart */}
      {allSeasons.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Game-by-Game Performance</h2>
            <p className="text-sm text-gray-600 mb-4">Select a season to view detailed performance</p>
            <select
              value={selectedSeasonForChart || ''}
              onChange={(e) => handleSeasonChartChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {allSeasons.map(season => (
                <option key={season.id} value={season.id}>
                  {season.name} - {season.leagueName}
                </option>
              ))}
            </select>
          </div>

          {gameByGameData.length > 0 ? (
            <>
              {/* Simple Bar Chart */}
              <div className="mb-6">
                <div className="flex items-end justify-between h-64 gap-1">
                  {gameByGameData.map((data, index) => {
                    const maxScore = Math.max(...gameByGameData.map(d => d.score), 300);
                    const height = (data.score / maxScore) * 100;
                    const avgHeight = (data.average / maxScore) * 100;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group relative">
                        <div className="w-full flex flex-col justify-end h-full">
                          {/* Score bar */}
                          <div
                            className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                            style={{ height: `${height}%` }}
                            title={`Game ${data.gameNumber}: ${data.score}`}
                          />
                          {/* Average line overlay */}
                          <div
                            className="w-full border-t-2 border-red-500 absolute"
                            style={{ bottom: `${avgHeight}%` }}
                          />
                        </div>
                        {/* Tooltip */}
                        <div className="hidden group-hover:block absolute bottom-full mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                          <div>Game #{data.gameNumber}</div>
                          <div>Score: {data.score}</div>
                          <div>Avg: {data.average}</div>
                          <div>vs {data.opponent}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Game 1</span>
                  <span>Game {gameByGameData.length}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-6 justify-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">Individual Game Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-red-500"></div>
                  <span className="text-sm text-gray-600">Running Average</span>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Games Played</p>
                  <p className="text-2xl font-bold text-blue-600">{gameByGameData.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Current Average</p>
                  <p className="text-2xl font-bold text-green-600">
                    {gameByGameData[gameByGameData.length - 1]?.average || 0}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">High Game</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.max(...gameByGameData.map(d => d.score))}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Low Game</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.min(...gameByGameData.map(d => d.score))}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No game data available for this season
            </div>
          )}
        </div>
      )}
    </div>
  );
};
