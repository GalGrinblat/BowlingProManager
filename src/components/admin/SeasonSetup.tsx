import React, { useState, useEffect } from 'react';
import { seasonsApi, teamsApi, playersApi, gamesApi, leaguesApi } from '../../services/api';
import { generateRoundRobinSchedule } from '../../utils/scheduleUtils';
import { createEmptyMatch } from '../../utils/matchUtils';

import type { SeasonSetupProps } from '../../types/index.ts';

export const SeasonSetup: React.FC<SeasonSetupProps> = ({ seasonId, onBack }) => {
  const [season, setSeason] = useState<any>(null);
  const [league, setLeague] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  useEffect(() => {
    loadSeasonData();
  }, [seasonId]);

  const loadSeasonData = () => {
    const seasonData = seasonsApi.getById(seasonId);
    setSeason(seasonData);
    
    if (seasonData) {
      const leagueData = leaguesApi.getById(seasonData.leagueId);
      setLeague(leagueData);
    }
    
    const teamsData = teamsApi.getBySeason(seasonId);
    setTeams(teamsData);
    
    const playersData = playersApi.getAll().filter(p => p.active);
    setPlayers(playersData);
  };

  const handleStartSeason = () => {
    // Comprehensive validation
    const validationErrors = [];
    
    // Check team count
    if (teams.length !== season.numberOfTeams) {
      validationErrors.push(`Expected ${season.numberOfTeams} teams, but only ${teams.length} configured.`);
    }
    
    // Validate each team
    teams.forEach((team, index) => {
      if (!team.name || team.name.trim() === '') {
        validationErrors.push(`Team ${index + 1} has no name.`);
      }
      
      if (team.playerIds.length !== season.playersPerTeam) {
        validationErrors.push(`Team "${team.name || index + 1}" needs ${season.playersPerTeam} players but has ${team.playerIds.length}.`);
      }
      
      // Check for duplicate players within a team
      const uniquePlayers = new Set(team.playerIds);
      if (uniquePlayers.size !== team.playerIds.length) {
        validationErrors.push(`Team "${team.name || index + 1}" has duplicate players.`);
      }
      
      // Check that all players exist
      team.playerIds.forEach((playerId: any) => {
        const player = players.find(p => p.id === playerId);
        if (!player) {
          validationErrors.push(`Team "${team.name || index + 1}" has an invalid player.`);
        }
      });
    });
    
    // Check for players on multiple teams
    const allPlayerIds = teams.flatMap(t => t.playerIds);
    const duplicatePlayers = allPlayerIds.filter((id, index) => allPlayerIds.indexOf(id) !== index);
    if (duplicatePlayers.length > 0) {
      const playerNames = [...new Set(duplicatePlayers)].map(id => {
        const player = players.find(p => p.id === id);
        return player?.name || 'Unknown';
      });
      validationErrors.push(`Players cannot be on multiple teams: ${playerNames.join(', ')}`);
    }
    
    if (validationErrors.length > 0) {
      alert('❌ Cannot start season. Please fix these issues:\n\n' + validationErrors.map((e, i) => `${i + 1}. ${e}`).join('\n'));
      return;
    }

    if (confirm('Start this season? Teams and schedule will be locked after starting.')) {
      // Generate schedule with actual team IDs
      const teamIds = teams.map(t => t.id);
      const schedule = generateRoundRobinSchedule(
        teamIds, 
        season.numberOfRounds,
        season.startDate,
        league.dayOfWeek
      );

      seasonsApi.update(seasonId, {
        status: 'active',
        schedule: schedule
      });

      // Create all games from schedule
      schedule.forEach(daySchedule => {
        daySchedule.matches.forEach(match => {
          const team1 = teams.find(t => t.id === match.team1Id);
          const team2 = teams.find(t => t.id === match.team2Id);
          
          if (team1 && team2) {
            const team1Players = team1.playerIds.map((id: any) => {
              const player = players.find(p => p.id === id);
              const playerAvg = player?.startingAverage || 0;
              let handicap = 0;
              
              if (season.useHandicap && playerAvg < season.handicapBasis) {
                const diff = season.handicapBasis - playerAvg;
                handicap = Math.round(diff * (season.handicapPercentage / 100));
              }
              
              return {
                rank: team1.playerIds.indexOf(id) + 1,
                name: player?.name || '',
                average: playerAvg,
                handicap,
                absent: false
              };
            });

            const team2Players = team2.playerIds.map((id: any) => {
              const player = players.find(p => p.id === id);
              const playerAvg = player?.startingAverage || 0;
              let handicap = 0;
              
              if (season.useHandicap && playerAvg < season.handicapBasis) {
                const diff = season.handicapBasis - playerAvg;
                handicap = Math.round(diff * (season.handicapPercentage / 100));
              }
              
              return {
                rank: team2.playerIds.indexOf(id) + 1,
                name: player?.name || '',
                average: playerAvg,
                handicap,
                absent: false
              };
            });

            // Apply lineup rules if strategy is rule-based
            const lineupStrategy = season.lineupStrategy || 'flexible';
            const lineupRule = season.lineupRule || 'standard';
            
            let sortedTeam1 = [...team1Players];
            let sortedTeam2 = [...team2Players];
            
            if (lineupStrategy === 'rule-based') {
              // Sort team1 by average (highest first)
              sortedTeam1 = [...team1Players].sort((a, b) => b.average - a.average);
              
              // Sort team2 based on rule
              if (lineupRule === 'standard') {
                // Standard: highest vs highest
                sortedTeam2 = [...team2Players].sort((a, b) => b.average - a.average);
              } else {
                // Balanced: highest vs lowest
                sortedTeam2 = [...team2Players].sort((a, b) => a.average - b.average);
              }
              
              // Reassign ranks after sorting
              sortedTeam1 = sortedTeam1.map((p, idx) => ({ ...p, rank: idx + 1 }));
              sortedTeam2 = sortedTeam2.map((p, idx) => ({ ...p, rank: idx + 1 }));
            }

            // Create empty matches based on season configuration
            const emptyMatches = Array.from({ length: season.matchesPerGame }, (_, i) => 
              createEmptyMatch(i + 1, season.playersPerTeam)
            );

            gamesApi.create({
              seasonId: season.id,
              round: daySchedule.round,
              matchDay: daySchedule.matchDay,
              team1Id: team1.id,
              team2Id: team2.id,
              matchScores: [],
              team1TotalPoints: 0,
              team2TotalPoints: 0,
              lineupStrategy,
              lineupRule,
              bonusRules: season.bonusRules,
              matchesPerGame: season.matchesPerGame,
              playerWinPoints: season.playerWinPoints || 1,
              teamWinPoints: season.teamWinPoints || 1,
              grandTotalPoints: season.grandTotalPoints || 2,
              team1: {
                name: team1.name,
                players: sortedTeam1
              },
              team2: {
                name: team2.name,
                players: sortedTeam2
              },
              matches: emptyMatches,
              grandTotalScore: { team1: 0, team2: 0 }
            });
          }
        });
      });

      alert('Season started! Games have been created.');
      onBack();
    }
  };

  if (!season || !league) return <div>Loading...</div>;

  const isSetupComplete = teams.length === season.numberOfTeams && 
                         teams.every(t => t.playerIds.length === season.playersPerTeam && t.name.trim());

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{season.name}</h1>
        <p className="text-gray-600">{league.name}</p>
        <div className="flex gap-4 mt-4 text-sm text-gray-600">
          <span>🏆 {season.numberOfTeams} teams</span>
          <span>👥 {season.playersPerTeam} players/team</span>
          <span>🔄 {season.numberOfRounds} round{season.numberOfRounds !== 1 ? 's' : ''}</span>
          <span>📊 Handicap: {season.useHandicap ? `${season.handicapBasis} (${season.handicapPercentage}%)` : 'Disabled'}</span>
        </div>
      </div>

      {/* Setup Progress */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Setup Progress</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-blue-400 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all"
              style={{
                width: `${(teams.filter(t => t.playerIds.length === season.playersPerTeam).length / season.numberOfTeams) * 100}%`
              }}
            />
          </div>
          <span className="text-sm font-semibold">
            {teams.filter(t => t.playerIds.length === season.playersPerTeam).length} / {season.numberOfTeams} teams complete
          </span>
        </div>
        {isSetupComplete && (
          <button
            onClick={handleStartSeason}
            className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
          >
            Start Season →
          </button>
        )}
      </div>

      {/* Teams Setup */}
      <div className="space-y-4">
        {teams.map(team => (
          <TeamSetupCard
            key={team.id}
            team={team}
            season={season}
            players={players}
            allTeams={teams}
            isEditing={editingTeamId === team.id}
            onEdit={() => setEditingTeamId(team.id)}
            onSave={(updatedTeam: any) => {
              teamsApi.update(team.id, updatedTeam);
              setEditingTeamId(null);
              loadSeasonData();
            }}
            onCancel={() => setEditingTeamId(null)}
          />
        ))}
      </div>
    </div>
  );
};

// Team Setup Card Component
const TeamSetupCard = ({ team, season, players, allTeams, isEditing, onEdit, onSave, onCancel }: any) => {
  const [teamName, setTeamName] = useState(team.name);
  const [selectedPlayers, setSelectedPlayers] = useState(team.playerIds);

  const isComplete = team.playerIds.length === season.playersPerTeam && team.name.trim();

  // Get players already assigned to other teams
  const assignedPlayerIds = new Set(
    allTeams
      .filter((t: any) => t.id !== team.id)
      .flatMap((t: any) => t.playerIds)
  );

  const availablePlayers = players.filter((p: any) => !assignedPlayerIds.has(p.id));

  const handlePlayerToggle = (playerId: any) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id: any) => id !== playerId));
    } else if (selectedPlayers.length < season.playersPerTeam) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const handleSave = () => {
    if (!teamName.trim()) {
      alert('❌ Team name is required');
      return;
    }
    
    // Check for duplicate team names (case-insensitive)
    const duplicateName = allTeams.find((t: any) => 
      t.id !== team.id && 
      t.name.toLowerCase() === teamName.trim().toLowerCase()
    );
    
    if (duplicateName) {
      alert(`❌ A team named "${duplicateName.name}" already exists. Please use a different name.`);
      return;
    }
    
    if (selectedPlayers.length !== season.playersPerTeam) {
      alert(`❌ Please select exactly ${season.playersPerTeam} players`);
      return;
    }
    onSave({ name: teamName, playerIds: selectedPlayers });
  };

  if (!isEditing) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${!isComplete ? 'border-2 border-yellow-400' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {team.name || `Team ${allTeams.indexOf(team) + 1}`}
            </h3>
            {!isComplete && (
              <span className="text-sm text-orange-600">⚠️ Setup incomplete</span>
            )}
          </div>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
          >
            Edit Team
          </button>
        </div>
        <div className="space-y-2">
          {team.playerIds.length === 0 ? (
            <p className="text-gray-500">No players assigned</p>
          ) : (
            team.playerIds.map((playerId: any, idx: any) => {
              const player = players.find((p: any) => p.id === playerId);
              return (
                <div key={playerId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-600">#{idx + 1}</span>
                  <span className="font-semibold text-gray-800">{player?.name || 'Unknown'}</span>
                  <span className="text-sm text-gray-500">Avg: {player?.startingAverage || 0}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-400">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Edit Team
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter team name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select {season.playersPerTeam} Players ({selectedPlayers.length} selected)
          </label>
          <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
            {availablePlayers.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No available players</p>
            ) : (
              availablePlayers.map((player: any) => {
                const isSelected = selectedPlayers.includes(player.id);
                const canSelect = isSelected || selectedPlayers.length < season.playersPerTeam;
                
                return (
                  <div
                    key={player.id}
                    onClick={() => canSelect && handlePlayerToggle(player.id)}
                    className={`p-3 border-b border-gray-200 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-100 hover:bg-blue-200'
                        : canSelect
                        ? 'hover:bg-gray-50'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-5 h-5"
                        disabled={!canSelect}
                      />
                      <div>
                        <span className="font-semibold text-gray-800">{player.name}</span>
                        <span className="text-sm text-gray-500 ml-3">
                          Avg: {player.startingAverage || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Save Team
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
