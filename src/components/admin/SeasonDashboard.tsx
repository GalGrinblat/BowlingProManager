import React, { useState, useEffect } from 'react';
import { seasonsApi, teamsApi, gamesApi, leaguesApi } from '../../services/api';
import { calculateTeamStandings, calculatePlayerSeasonStats } from '../../utils/standingsUtils';
import { postponeMatchDay, formatMatchDate } from '../../utils/scheduleUtils';
import { calculateHeadToHead, formatHeadToHead } from '../../utils/headToHeadUtils';
import { calculateSeasonRecords } from '../../utils/recordsUtils';
import { useTranslation } from '../../contexts/LanguageContext';
import { 
  exportStandingsCSV, 
  exportPlayerStatsCSV, 
  exportGamesCSV, 
  exportSeasonJSON, 
  exportAllSeasonData 
} from '../../utils/exportUtils';

import type { SeasonDashboardProps } from '../../types/index.ts';

export const SeasonDashboard: React.FC<SeasonDashboardProps> = ({ seasonId, onBack, onPlayGame, onViewGame, onManageTeams }) => {
  const { t } = useTranslation();
  const [season, setSeason] = useState<any>(null);
  const [league, setLeague] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [view, setView] = useState('schedule'); // schedule, standings, players, h2h, records, records
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedMatchDay, setSelectedMatchDay] = useState<number | null>(null);
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeWeeks, setPostponeWeeks] = useState(1);

  useEffect(() => {
    loadSeasonData();
  }, [seasonId]);

  const loadSeasonData = () => {
    const seasonData = seasonsApi.getById(seasonId);
    setSeason(seasonData);
    
    if (!seasonData) return;
    
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

  const handlePostponeMatchDay = () => {
    if (!league.dayOfWeek) {
      alert('Cannot postpone: League has no day of week configured.');
      return;
    }

    // Check if any games in this match day are already completed
    const matchDayGamesToCheck = games.filter(g => g.matchDay === selectedMatchDay);
    const hasCompletedGames = matchDayGamesToCheck.some(g => g.status === 'completed');
    
    if (hasCompletedGames) {
      alert('Cannot postpone: Some games in this match day are already completed.');
      return;
    }

    if (confirm(`Postpone Match Day ${selectedMatchDay} by ${postponeWeeks} week(s)? All subsequent match days will also shift.`)) {
      const updatedSchedule = postponeMatchDay(
        season.schedule,
        selectedMatchDay!,
        postponeWeeks,
        league.dayOfWeek
      );

      // Update season with new schedule
      seasonsApi.update(seasonId, { schedule: updatedSchedule });

      // Update all games with new dates from schedule
      updatedSchedule.forEach((daySchedule: any) => {
        const gamesToUpdate = games.filter(g => g.matchDay === daySchedule.matchDay);
        gamesToUpdate.forEach(game => {
          gamesApi.update(game.id, { 
            date: daySchedule.date,
            postponed: daySchedule.postponed as boolean | undefined,
            originalDate: daySchedule.originalDate as string | undefined
          } as any);
        });
      });

      setShowPostponeModal(false);
      setPostponeWeeks(1);
      loadSeasonData();
    }
  };

  if (!season || !league) return <div>Loading...</div>;

  const teamStandings = calculateTeamStandings(teams, games);
  const playerStats = calculatePlayerSeasonStats(teams, games);
  const seasonRecords = calculateSeasonRecords(teams, games);
  
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
        <div className="flex justify-between items-start mb-4">
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
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ← {t('seasons.backToLeague')}
          </button>
        </div>
        {(season.status === 'active' && (onManageTeams || completedGames === totalGames)) && (
          <div className="flex gap-2 justify-end">
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
        )}
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
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Export Season Data</h3>
              <p className="text-sm text-gray-600">Download standings, player stats, and game results</p>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button
                onClick={() => exportStandingsCSV(teamStandings, season.name)}
                className="px-3 py-2 sm:px-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap"
              >
                📊 Standings
              </button>
              <button
                onClick={() => exportPlayerStatsCSV(playerStats, season.name)}
                className="px-3 py-2 sm:px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap"
              >
                👥 Players
              </button>
              <button
                onClick={() => exportGamesCSV(games, teams, season.name)}
                className="px-3 py-2 sm:px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap"
              >
                🎳 Games
              </button>
              <button
                onClick={() => exportSeasonJSON(season, teams, games, teamStandings, playerStats, league)}
                className="px-3 py-2 sm:px-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap"
              >
                📦 JSON
              </button>
              <button
                onClick={() => exportAllSeasonData(season, teams, games, teamStandings, playerStats, league)}
                className="col-span-2 sm:col-span-1 px-3 py-2 sm:px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold text-xs sm:text-sm transition-all shadow-md whitespace-nowrap"
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
      <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setView('schedule')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-colors ${
            view === 'schedule'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📅 {isCompleted ? 'Game Results' : 'Schedule'}
        </button>
        <button
          onClick={() => setView('standings')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-colors ${
            view === 'standings'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🏆 {isCompleted ? 'Final Standings' : 'Standings'}
        </button>
        <button
          onClick={() => setView('h2h')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-colors ${
            view === 'h2h'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📊 Head-to-Head
        </button>
        <button
          onClick={() => setView('players')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-colors ${
            view === 'players'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          👥 Player Stats
        </button>
        <button
          onClick={() => setView('records')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-colors ${
            view === 'records'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🏅 Season Records
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
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-600">Select Match Day</h3>
                {season.status === 'active' && selectedMatchDay && (
                  <button
                    onClick={() => setShowPostponeModal(true)}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-semibold text-xs"
                  >
                    📅 Postpone
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {matchDaysInRound.map(matchDay => {
                  const matchDayGamesForDay = roundGames.filter(g => g.matchDay === matchDay);
                  const completedInMatchDay = matchDayGamesForDay.filter(g => g.status === 'completed').length;
                  const scheduleEntry = season.schedule?.find((s: any) => s.matchDay === matchDay);
                  const dateDisplay = scheduleEntry?.date ? formatMatchDate(scheduleEntry.date) : null;
                  const isPostponed = scheduleEntry?.postponed;
                  
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
                      } ${isPostponed ? 'ring-2 ring-orange-400' : ''}`}
                    >
                      <div>Match Day {matchDay}</div>
                      {dateDisplay && (
                        <div className="text-xs mt-1 opacity-90">
                          {isPostponed && '⚠️ '}{dateDisplay}
                        </div>
                      )}
                      <div className="text-xs mt-1">({completedInMatchDay}/{matchDayGamesForDay.length})</div>
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
                  const h2h = calculateHeadToHead(game.team1Id, game.team2Id, games);
                  
                  return (
                    <GameCard
                      key={game.id}
                      game={game}
                      team1={team1}
                      team2={team2}
                      h2h={h2h}
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
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Standings</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr className="text-left">
                      <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-sm">Rank</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-sm">Team</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center text-sm">GP</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center text-sm">W</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center text-sm">L</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center text-sm hidden sm:table-cell">D</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center text-sm">Points</th>
                      <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center text-sm hidden md:table-cell">Pins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamStandings.map((standing, index) => (
                      <tr key={standing.teamId} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-3 sm:px-4 py-3">
                          <span className="font-bold text-gray-800">#{index + 1}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 text-sm">{standing.teamName}</td>
                        <td className="px-3 sm:px-4 py-3 text-center text-gray-600 text-sm">{standing.gamesPlayed}</td>
                        <td className="px-3 sm:px-4 py-3 text-center text-green-600 font-semibold text-sm">{standing.wins}</td>
                        <td className="px-3 sm:px-4 py-3 text-center text-red-600 font-semibold text-sm">{standing.losses}</td>
                        <td className="px-3 sm:px-4 py-3 text-center text-gray-600 text-sm hidden sm:table-cell">{standing.draws}</td>
                        <td className="px-3 sm:px-4 py-3 text-center">
                          <span className="font-bold text-blue-600 text-base sm:text-lg">{standing.points}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-center text-gray-600 text-sm hidden md:table-cell">{standing.totalPinsWithHandicap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Head-to-Head View */}
      {view === 'h2h' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Head-to-Head Records</h2>
          <p className="text-gray-600 mb-6">All team matchup records for this season</p>
          <div className="space-y-6">
            {teams.map(team => {
              // Get all opponents this team has played
              const opponents = teams.filter(t => t.id !== team.id);
              
              return (
                <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{team.name}</h3>
                  <div className="space-y-2">
                    {opponents.map(opponent => {
                      const h2h = calculateHeadToHead(team.id, opponent.id, games);
                      
                      if (h2h.gamesPlayed === 0) {
                        return (
                          <div key={opponent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">vs {opponent.name}</span>
                            <span className="text-sm text-gray-500 italic">No matchups yet</span>
                          </div>
                        );
                      }
                      
                      const teamWins = h2h.team1Wins;
                      const opponentWins = h2h.team2Wins;
                      const isWinning = teamWins > opponentWins;
                      const isLosing = teamWins < opponentWins;
                      
                      return (
                        <div key={opponent.id} className={`flex items-center justify-between p-3 rounded-lg ${
                          isWinning ? 'bg-green-50 border border-green-200' : 
                          isLosing ? 'bg-red-50 border border-red-200' : 
                          'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">vs {opponent.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {formatHeadToHead(h2h, team.name, opponent.name)}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className={`text-2xl font-bold ${
                              isWinning ? 'text-green-600' : 
                              isLosing ? 'text-red-600' : 
                              'text-gray-600'
                            }`}>
                              {teamWins}-{opponentWins}{h2h.ties > 0 ? `-${h2h.ties}` : ''}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Avg: {h2h.team1AvgPoints.toFixed(1)} pts
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Season Records View */}
      {view === 'records' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🏅 {t('records.title')}</h2>
          
          {games.filter(g => g.status === 'completed').length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('records.noCompletedGames')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-gray-300">👤 {t('records.personalRecords')}</h3>
                <h3 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-gray-300">🏆 {t('records.teamRecords')}</h3>
              </div>

              {/* All Records Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Highest Match Score (Individual) */}
                <div className="border-2 border-purple-200 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-white">
                  <h4 className="text-base font-bold text-purple-800 mb-3 flex items-center gap-2">
                    🎯 {t('records.matchScore')}
                  </h4>
                  {seasonRecords.highestMatchScores.length > 0 ? (
                    <div className="space-y-2">
                      {seasonRecords.highestMatchScores.map((record, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm border border-purple-100">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xl font-bold text-purple-600">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-800 text-sm truncate">{record.playerName}</p>
                              <p className="text-xs text-gray-600 truncate">{record.teamName}</p>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xl font-bold text-purple-600">{record.value}</p>
                            <p className="text-xs text-gray-500">{t('records.round')}{record.round}, {t('records.day')}{record.matchDay}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-3 text-sm">{t('records.noRecords')}</p>
                  )}
                </div>

                {/* Highest Series (Individual) */}
                <div className="border-2 border-blue-200 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-white">
                  <h4 className="text-base font-bold text-blue-800 mb-3 flex items-center gap-2">
                    🎳 {t('records.series')}
                  </h4>
                  {seasonRecords.highestSeries.length > 0 ? (
                    <div className="space-y-2">
                      {seasonRecords.highestSeries.map((record, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm border border-blue-100">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xl font-bold text-blue-600">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-800 text-sm truncate">{record.playerName}</p>
                              <p className="text-xs text-gray-600 truncate">{record.teamName}</p>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xl font-bold text-blue-600">{record.value}</p>
                            <p className="text-xs text-gray-500">{t('records.round')}{record.round}, {t('records.day')}{record.matchDay}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-3 text-sm">{t('records.noRecords')}</p>
                  )}
                </div>

                {/* Highest Team Match Score */}
                <div className="border-2 border-green-200 rounded-xl p-4 bg-gradient-to-br from-green-50 to-white">
                  <h4 className="text-base font-bold text-green-800 mb-3 flex items-center gap-2">
                    💪 {t('records.teamMatch')}
                  </h4>
                  {seasonRecords.highestTeamMatchScores.length > 0 ? (
                    <div className="space-y-2">
                      {seasonRecords.highestTeamMatchScores.map((record, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm border border-green-100">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xl font-bold text-green-600">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-800 text-sm truncate">{record.teamName}</p>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xl font-bold text-green-600">{record.value}</p>
                            <p className="text-xs text-gray-500">{t('records.round')}{record.round}, {t('records.day')}{record.matchDay}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-3 text-sm">{t('records.noRecords')}</p>
                  )}
                </div>

                {/* Highest Team Game Total */}
                <div className="border-2 border-orange-200 rounded-xl p-4 bg-gradient-to-br from-orange-50 to-white">
                  <h4 className="text-base font-bold text-orange-800 mb-3 flex items-center gap-2">
                    🔥 {t('records.gameTotal')}
                  </h4>
                  {seasonRecords.highestTeamGameTotals.length > 0 ? (
                    <div className="space-y-2">
                      {seasonRecords.highestTeamGameTotals.map((record, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm border border-orange-100">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xl font-bold text-orange-600">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-800 text-sm truncate">{record.teamName}</p>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xl font-bold text-orange-600">{record.value}</p>
                            <p className="text-xs text-gray-500">{t('records.round')}{record.round}, {t('records.day')}{record.matchDay}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-3 text-sm">{t('records.noRecords')}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Player Stats View */}
      {view === 'players' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Player Statistics ({playerStats.length} players)</h2>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr className="text-left">
                        <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-sm">Rank</th>
                        <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-sm">Player</th>
                        <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-sm hidden lg:table-cell">Team</th>
                        <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center text-sm">GP</th>
                        <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center text-sm">Avg</th>
                        <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center text-sm hidden sm:table-cell">High</th>
                        <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center text-sm hidden md:table-cell">Series</th>
                        <th className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center text-sm hidden lg:table-cell">Pins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats.map((stat, index) => {
                        return (
                          <tr key={`${stat.teamId}-${stat.playerName}`} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-3 sm:px-4 py-3">
                              <span className="font-bold text-gray-800">#{index + 1}</span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 text-sm">{stat.playerName}</td>
                            <td className="px-3 sm:px-4 py-3 text-gray-600 text-sm hidden lg:table-cell">{stat.teamName}</td>
                            <td className="px-3 sm:px-4 py-3 text-center text-gray-600 text-sm">{stat.gamesPlayed}</td>
                            <td className="px-3 sm:px-4 py-3 text-center">
                              <span className="font-bold text-blue-600 text-base sm:text-lg">{stat.average}</span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-center text-purple-600 font-semibold text-sm hidden sm:table-cell">{stat.highGame}</td>
                            <td className="px-3 sm:px-4 py-3 text-center text-green-600 font-semibold text-sm hidden md:table-cell">{stat.highSeries}</td>
                            <td className="px-3 sm:px-4 py-3 text-center text-gray-600 text-sm hidden lg:table-cell">{stat.totalPins}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Postpone Modal */}
      {showPostponeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Postpone Match Day {selectedMatchDay}</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Current date: {season.schedule?.find((s: any) => s.matchDay === selectedMatchDay)?.date
                  ? formatMatchDate(season.schedule.find((s: any) => s.matchDay === selectedMatchDay)!.date)
                  : 'Not scheduled'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                All subsequent match days will also be delayed by the same amount.
              </p>
              
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Postpone by how many weeks?
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={postponeWeeks}
                onChange={(e) => setPostponeWeeks(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              
              {postponeWeeks > 0 && season.schedule?.find((s: any) => s.matchDay === selectedMatchDay)?.date && (
                <p className="text-sm text-gray-500 mt-2">
                  New date: {formatMatchDate(
                    new Date(new Date(season.schedule.find((s: any) => s.matchDay === selectedMatchDay)!.date).getTime() + postponeWeeks * 7 * 24 * 60 * 60 * 1000).toISOString()
                  )}
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handlePostponeMatchDay}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
              >
                Postpone
              </button>
              <button
                onClick={() => {
                  setShowPostponeModal(false);
                  setPostponeWeeks(1);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Game Card Component
const GameCard = ({ game, team1, team2, h2h, onPlayGame, onViewGame }: { game: any, team1: any, team2: any, h2h: any, onPlayGame: () => void, onViewGame: () => void }) => {
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

  const team1TotalPoints = game.matches?.reduce((sum: any, m: any) => sum + (m.team1?.score || 0), 0) + (game.grandTotalScore?.team1 || 0);
  const team2TotalPoints = game.matches?.reduce((sum: any, m: any) => sum + (m.team2?.score || 0), 0) + (game.grandTotalScore?.team2 || 0);

  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      game.status === 'completed' 
        ? 'border-green-300 bg-green-50' 
        : game.status === 'in-progress'
        ? 'border-yellow-300 bg-yellow-50'
        : 'border-gray-300 hover:border-blue-300'
    }`}>
      {/* Head-to-Head Record */}
      {h2h && h2h.gamesPlayed > 0 && (
        <div className="mb-3 pb-3 border-b border-gray-300">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-semibold">📊 Series Record:</span>
            <span>{formatHeadToHead(h2h, team1?.name, team2?.name)}</span>
          </div>
        </div>
      )}
      
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
