import React, { useState, useEffect } from 'react';
import { leaguesApi, seasonsApi, teamsApi, gamesApi, playersApi } from '../../services/api';
import { createSeason, createTeam, validateSeason } from '../../models';
import { generateRoundRobinSchedule } from '../../utils/scheduleUtils';
import { calculateTeamStandings } from '../../utils/standingsUtils';
import { useTranslation } from '../../contexts/LanguageContext';

import type { LeagueDetailProps, League, Season } from '../../types/index';

export const LeagueDetail: React.FC<LeagueDetailProps> = ({ leagueId, onBack, onViewSeason }) => {
  const { t } = useTranslation();
  const [league, setLeague] = useState<League | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isCreatingSeason, setIsCreatingSeason] = useState(false);

  useEffect(() => {
    loadLeagueData();
  }, [leagueId]);

  const loadLeagueData = () => {
    const leagueData = leaguesApi.getById(leagueId);
    if (!leagueData) {
      return;
    }
    setLeague(leagueData);
    const seasonsData = seasonsApi.getByLeague(leagueId);
    setSeasons(seasonsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleCreateSeason = () => {
    setIsCreatingSeason(true);
  };

  const handleDeleteSeason = (seasonId: string) => {
    const season = seasonsApi.getById(seasonId);
    const games = gamesApi.getBySeason(seasonId);
    const teams = teamsApi.getBySeason(seasonId);
    
    if (games.length > 0) {
      const completedGames = games.filter(g => g.status === 'completed').length;
      const pendingGames = games.filter(g => g.status === 'pending').length;
      alert(`❌ Cannot delete season "${season?.name}" because it has ${games.length} recorded game(s):\n• ${completedGames} completed\n• ${pendingGames} pending\n\nPlease delete all games first.`);
      return;
    }
    
    const message = `⚠️ Delete season "${season?.name}"?\n\nThis will also delete:\n• ${teams.length} team(s)\n\nThis action cannot be undone.`;
    if (confirm(message)) {
      // Delete teams first
      teams.forEach(team => teamsApi.delete(team.id));
      
      // Delete season
      seasonsApi.delete(seasonId);
      alert(`✅ Season "${season?.name}" deleted successfully.`);
      loadLeagueData();
    }
  };

  const activeSeason = seasons.find(s => s.status === 'active');
  const completedSeasons = seasons.filter(s => s.status === 'completed');
  const setupSeasons = seasons.filter(s => s.status === 'setup');

  if (!league) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ← {t('leagues.backToLeagues')}
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">League not found. It may have been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{league.name}</h1>
            {league.description && (
              <p className="text-gray-600">{league.description}</p>
            )}
          </div>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ← {t('leagues.backToLeagues')}
          </button>
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          {league.dayOfWeek && <span>📅 {league.dayOfWeek}s</span>}
          <span>📊 Handicap: {league.useHandicap !== false ? `${league.defaultHandicapBasis} (${league.handicapPercentage || 100}%)` : 'Disabled'}</span>
          <span>👥 Default: {league.defaultPlayersPerTeam} players/team</span>
        </div>
      </div>

      {/* Create Season Button */}
      {!isCreatingSeason && (
        <div className="flex justify-end">
          <button
            onClick={handleCreateSeason}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Create New Season
          </button>
        </div>
      )}

      {/* Create Season Form */}
      {isCreatingSeason && (
        <SeasonCreator
          league={league}
          onCancel={() => setIsCreatingSeason(false)}
          onSuccess={() => {
            setIsCreatingSeason(false);
            loadLeagueData();
          }}
        />
      )}

      {/* Active Season */}
      {activeSeason && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold mb-1">ACTIVE SEASON</div>
              <h2 className="text-2xl font-bold mb-2">{activeSeason.name}</h2>
              <div className="flex gap-4 text-sm">
                <span>🏆 {activeSeason.numberOfTeams} teams</span>
                <span>🔄 {activeSeason.numberOfRounds} round{activeSeason.numberOfRounds !== 1 ? 's' : ''}</span>
                <span>👥 {activeSeason.playersPerTeam} players/team</span>
              </div>
            </div>
            <button
              onClick={() => onViewSeason(activeSeason.id)}
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 font-semibold"
            >
              View Season →
            </button>
          </div>
        </div>
      )}

      {/* Setup Seasons */}
      {setupSeasons.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Seasons in Setup</h2>
          <div className="space-y-3">
            {setupSeasons.map(season => {
              const teams = teamsApi.getBySeason(season.id);
              const isComplete = teams.length === season.numberOfTeams && 
                               teams.every(t => t.playerIds.length === season.playersPerTeam);
              
              return (
                <div
                  key={season.id}
                  className="border border-yellow-300 bg-yellow-50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{season.name}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>🏆 {season.numberOfTeams} teams ({teams.length} created)</span>
                        <span>🔄 {season.numberOfRounds} round{season.numberOfRounds !== 1 ? 's' : ''}</span>
                        <span>👥 {season.playersPerTeam} players/team</span>
                      </div>
                      {!isComplete && (
                        <div className="mt-2 text-sm text-orange-600">
                          ⚠️ Setup incomplete - teams need to be configured
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewSeason(season.id)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Continue Setup
                      </button>
                      <button
                        onClick={() => handleDeleteSeason(season.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Seasons */}
      {completedSeasons.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Season Archives</h2>
          <div className="space-y-3">
            {completedSeasons.map(season => {
              const teams = teamsApi.getBySeason(season.id);
              const games = gamesApi.getBySeason(season.id);
              
              // Calculate champion
              const standings = calculateTeamStandings(teams, games);
              const champion = standings[0];
                            
              return (
                <div
                  key={season.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer"
                  onClick={() => onViewSeason(season.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{season.name}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          COMPLETED
                        </span>
                      </div>
                      {champion && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-500 text-xl">🏆</span>
                          <span className="font-semibold text-purple-600">{champion.teamName}</span>
                          <span className="text-sm text-gray-500">• {champion.points} points</span>
                        </div>
                      )}
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>👥 {teams.length} teams</span>
                        <span>🎳 {games.length} games</span>
                        <span>📅 {new Date(season.startDate).toLocaleDateString()}</span>
                        {season.updatedAt && (
                          <span>✓ {new Date(season.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {seasons.length === 0 && !isCreatingSeason && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Seasons Yet</h3>
          <p className="text-gray-600 mb-6">Create your first season to get started</p>
        </div>
      )}
    </div>
  );
};

// Season Creator Component
const SeasonCreator = ({ league, onCancel, onSuccess }: { league: League; onCancel: () => void; onSuccess: () => void }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: '',
    numberOfTeams: 4,
    playersPerTeam: league.defaultPlayersPerTeam,
    numberOfRounds: 1,
    handicapBasis: league.defaultHandicapBasis,
    useHandicap: league.useHandicap !== undefined ? league.useHandicap : true,
    handicapPercentage: league.handicapPercentage || 100,
    matchesPerGame: league.defaultMatchesPerGame || 3,
    bonusRules: league.bonusRules || [],
    startDate: new Date().toISOString().split('T')[0]
  });
  
  const [teams, setTeams] = useState<Array<{ name: string; playerIds: string[] }>>([]);
  const [availablePlayers] = useState(() => playersApi.getAll().filter(p => p.active));

  // Initialize teams when numberOfTeams changes
  React.useEffect(() => {
    const newTeams = Array.from({ length: formData.numberOfTeams }, (_, i) => ({
      name: teams[i]?.name || `Team ${i + 1}`,
      playerIds: teams[i]?.playerIds || []
    }));
    setTeams(newTeams);
  }, [formData.numberOfTeams]);

  const handleStepOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = () => {
    // Validate teams
    const validationErrors = [];
    
    teams.forEach((team, index) => {
      if (!team.name.trim()) {
        validationErrors.push(`Team ${index + 1} needs a name`);
      }
      if (team.playerIds.length !== formData.playersPerTeam) {
        validationErrors.push(`${team.name || `Team ${index + 1}`} needs exactly ${formData.playersPerTeam} players`);
      }
    });
    
    // Check for duplicate players across teams
    const allPlayerIds = teams.flatMap(t => t.playerIds);
    const duplicates = allPlayerIds.filter((id, index) => allPlayerIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      const playerNames = [...new Set(duplicates)].map(id => 
        availablePlayers.find(p => p.id === id)?.name || 'Unknown'
      );
      validationErrors.push(`Players cannot be on multiple teams: ${playerNames.join(', ')}`);
    }
    
    if (validationErrors.length > 0) {
      alert('❌ Please fix these issues:\n\n' + validationErrors.join('\n'));
      return;
    }
    
    const seasonData = createSeason({
      ...formData,
      leagueId: league.id
    });
    
    const validation = validateSeason(seasonData);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const created = seasonsApi.create(seasonData);
    
    console.log('SeasonCreator: Created season', created.id, 'Creating', formData.numberOfTeams, 'teams with players');
    
    // Create teams with players and store them
    const createdTeams = teams.map((team) => {
      const teamData = createTeam({
        seasonId: created.id,
        name: team.name,
        playerIds: team.playerIds
      });
      const createdTeam = teamsApi.create(teamData);
      console.log('SeasonCreator: Created team', createdTeam.id, 'with', team.playerIds.length, 'players');
      return { ...teamData, id: createdTeam.id };
    });

    // Generate schedule with actual team IDs
    const actualTeamIds = createdTeams.map(t => t.id);
    const schedule = generateRoundRobinSchedule(actualTeamIds, formData.numberOfRounds);

    // Start the season and create games
    seasonsApi.update(created.id, {
      status: 'active',
      schedule: schedule
    });

    // Create all games from schedule
    schedule.forEach(daySchedule => {
      daySchedule.matches.forEach(match => {
        const team1 = createdTeams.find(t => t.id === match.team1Id);
        const team2 = createdTeams.find(t => t.id === match.team2Id);
        
        if (team1 && team2) {
          const team1Players = team1.playerIds.map((id: any, index: number) => {
            const player = availablePlayers.find(p => p.id === id);
            const playerAvg = player?.startingAverage || 0;
            let handicap = 0;
            
            if (formData.useHandicap && playerAvg < formData.handicapBasis) {
              const diff = formData.handicapBasis - playerAvg;
              handicap = Math.round(diff * (formData.handicapPercentage / 100));
            }
            
            return {
              playerId: id,
              rank: index + 1,
              name: player?.name || '',
              average: playerAvg,
              handicap,
              absent: false
            };
          });

          const team2Players = team2.playerIds.map((id: any, index: number) => {
            const player = availablePlayers.find(p => p.id === id);
            const playerAvg = player?.startingAverage || 0;
            let handicap = 0;
            
            if (formData.useHandicap && playerAvg < formData.handicapBasis) {
              const diff = formData.handicapBasis - playerAvg;
              handicap = Math.round(diff * (formData.handicapPercentage / 100));
            }
            
            return {
              playerId: id,
              rank: index + 1,
              name: player?.name || '',
              average: playerAvg,
              handicap,
              absent: false
            };
          });

          // Create empty matches based on season configuration
          const emptyMatches = Array.from({ length: formData.matchesPerGame }, (_, i) => {
            const emptyPlayers = Array.from({ length: formData.playersPerTeam }, () => ({ 
              pins: 0, 
              bonusPoints: 0 
            }));
            
            const emptyPlayerMatches = Array.from({ length: formData.playersPerTeam }, (_, idx) => ({ 
              player: idx + 1, 
              result: null as null,
              team1Points: 0,
              team2Points: 0
            }));
            
            return {
              matchNumber: i + 1,
              team1: {
                score: 0,
                totalPins: 0,
                totalWithHandicap: 0,
                bonusPoints: 0,
                players: emptyPlayers
              },
              team2: {
                score: 0,
                totalPins: 0,
                totalWithHandicap: 0,
                bonusPoints: 0,
                players: emptyPlayers.map(p => ({ ...p }))
              },
              playerMatches: emptyPlayerMatches
            };
          });

          gamesApi.create({
            seasonId: created.id,
            round: daySchedule.round,
            matchDay: daySchedule.matchDay,
            team1Id: team1.id,
            team2Id: team2.id,
            lineupStrategy: 'flexible',
            lineupRule: 'standard',
            bonusRules: formData.bonusRules,
            matchesPerGame: formData.matchesPerGame,
            playerMatchPointsPerWin: league.playerMatchPointsPerWin || 1,
            teamMatchPointsPerWin: league.teamMatchPointsPerWin || 1,
            teamGamePointsPerWin: league.teamGamePointsPerWin || 2,
            team1: {
              name: team1.name,
              players: team1Players
            },
            team2: {
              name: team2.name,
              players: team2Players
            },
            matches: emptyMatches,
            grandTotalPoints: { team1: 0, team2: 0 }
          });
        }
      });
    });

    alert('✅ Season created and started successfully! All games have been scheduled.');
    onSuccess();
  };

  const handlePlayerToggle = (teamIndex: number, playerId: string) => {
    const newTeams = [...teams];
    const team = newTeams[teamIndex];
    
    if (!team) return;
    
    if (team.playerIds.includes(playerId)) {
      team.playerIds = team.playerIds.filter(id => id !== playerId);
    } else if (team.playerIds.length < formData.playersPerTeam) {
      team.playerIds = [...team.playerIds, playerId];
    }
    
    setTeams(newTeams);
  };

  const handleTeamNameChange = (teamIndex: number, name: string) => {
    const newTeams = [...teams];
    const team = newTeams[teamIndex];
    if (!team) return;
    team.name = name;
    setTeams(newTeams);
  };

  // Get players assigned to other teams
  const getAssignedPlayers = (excludeTeamIndex: number) => {
    return new Set(
      teams
        .filter((_, i) => i !== excludeTeamIndex)
        .flatMap(t => t.playerIds)
    );
  };

  if (step === 2) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Configure Teams</h2>
        <p className="text-gray-600 mb-6">Assign players to each team ({formData.playersPerTeam} players per team)</p>
        
        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {teams.map((team, teamIndex) => {
            const assignedElsewhere = getAssignedPlayers(teamIndex);
            const availableForThisTeam = availablePlayers.filter(p => !assignedElsewhere.has(p.id));
            
            return (
              <div key={teamIndex} className="border rounded-lg p-4">
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Team {teamIndex + 1} Name *
                  </label>
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => handleTeamNameChange(teamIndex, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Team ${teamIndex + 1}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Players ({team.playerIds.length}/{formData.playersPerTeam})
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded p-2">
                    {availableForThisTeam.length === 0 ? (
                      <p className="col-span-2 text-gray-500 text-sm">No available players</p>
                    ) : (
                      availableForThisTeam.map(player => (
                        <label
                          key={player.id}
                          className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                            team.playerIds.includes(player.id) ? 'bg-blue-50 border border-blue-300' : 'border border-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={team.playerIds.includes(player.id)}
                            onChange={() => handlePlayerToggle(teamIndex, player.id)}
                            disabled={!team.playerIds.includes(player.id) && team.playerIds.length >= formData.playersPerTeam}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm flex-1">
                            {player.name}
                            <span className="text-gray-500 text-xs ml-1">(avg: {player.startingAverage})</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Create Season
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Season - Step 1</h2>
      <form onSubmit={handleStepOneSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Season Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Spring 2026, Fall Season"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Teams *
            </label>
            <input
              type="number"
              min="2"
              max="20"
              value={formData.numberOfTeams}
              onChange={(e) => setFormData({ ...formData, numberOfTeams: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Players per Team *
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.playersPerTeam}
              onChange={(e) => setFormData({ ...formData, playersPerTeam: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Rounds *
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.numberOfRounds}
              onChange={(e) => setFormData({ ...formData, numberOfRounds: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Each team plays all others per round
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Matches per Game
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.matchesPerGame}
              onChange={(e) => setFormData({ ...formData, matchesPerGame: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of matches in each game
            </p>
          </div>
        </div>
        
        {/* Handicap Settings Section */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Handicap Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.useHandicap}
                  onChange={(e) => setFormData({ ...formData, useHandicap: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700">Use Handicap</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">Enable or disable handicap</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Handicap Basis
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={formData.handicapBasis}
                onChange={(e) => setFormData({ ...formData, handicapBasis: parseInt(e.target.value) })}
                disabled={!formData.useHandicap}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Pin basis for calculation</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Handicap Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.handicapPercentage}
                onChange={(e) => setFormData({ ...formData, handicapPercentage: parseInt(e.target.value) })}
                disabled={!formData.useHandicap}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Percentage of difference from basis
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Next: Configure Teams →
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
