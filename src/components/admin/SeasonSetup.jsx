import React, { useState, useEffect } from 'react';
import { seasonsApi, teamsApi, playersApi, gamesApi, leaguesApi } from '../../services/api';
import { validateTeam } from '../../models';
import { generateRoundRobinSchedule } from '../../utils/scheduleUtils';

export const SeasonSetup = ({ seasonId, onBack }) => {
  const [season, setSeason] = useState(null);
  const [league, setLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [editingTeamId, setEditingTeamId] = useState(null);

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
    
    const playersData = playersApi.getAll().filter(p => p.active);
    setPlayers(playersData);
  };

  const handleStartSeason = () => {
    // Validate all teams are complete
    const incompleteTeams = teams.filter(t => 
      t.playerIds.length !== season.playersPerTeam || !t.name.trim()
    );
    
    if (incompleteTeams.length > 0) {
      alert(`Please complete setup for all teams. ${incompleteTeams.length} team(s) incomplete.`);
      return;
    }

    if (confirm('Start this season? Teams cannot be changed after starting.')) {
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
            const team1Players = team1.playerIds.map(id => {
              const player = players.find(p => p.id === id);
              return {
                rank: team1.playerIds.indexOf(id) + 1,
                name: player?.name || '',
                average: player?.startingAverage || 0,
                handicap: Math.max(0, season.handicapBasis - (player?.startingAverage || 0)),
                absent: false
              };
            });

            const team2Players = team2.playerIds.map(id => {
              const player = players.find(p => p.id === id);
              return {
                rank: team2.playerIds.indexOf(id) + 1,
                name: player?.name || '',
                average: player?.startingAverage || 0,
                handicap: Math.max(0, season.handicapBasis - (player?.startingAverage || 0)),
                absent: false
              };
            });

            gamesApi.create({
              seasonId: season.id,
              round: daySchedule.round,
              matchDay: daySchedule.matchDay,
              team1Id: team1.id,
              team2Id: team2.id,
              team1: {
                name: team1.name,
                players: team1Players
              },
              team2: {
                name: team2.name,
                players: team2Players
              },
              matches: [],
              grandTotalPoints: { team1: 0, team2: 0 }
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
          <span>📊 Handicap: {season.handicapBasis}</span>
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
            onSave={(updatedTeam) => {
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
const TeamSetupCard = ({ team, season, players, allTeams, isEditing, onEdit, onSave, onCancel }) => {
  const [teamName, setTeamName] = useState(team.name);
  const [selectedPlayers, setSelectedPlayers] = useState(team.playerIds);

  const isComplete = team.playerIds.length === season.playersPerTeam && team.name.trim();

  // Get players already assigned to other teams
  const assignedPlayerIds = new Set(
    allTeams
      .filter(t => t.id !== team.id)
      .flatMap(t => t.playerIds)
  );

  const availablePlayers = players.filter(p => !assignedPlayerIds.has(p.id));

  const handlePlayerToggle = (playerId) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else if (selectedPlayers.length < season.playersPerTeam) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const handleSave = () => {
    if (!teamName.trim()) {
      alert('Team name is required');
      return;
    }
    if (selectedPlayers.length !== season.playersPerTeam) {
      alert(`Please select exactly ${season.playersPerTeam} players`);
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
            team.playerIds.map((playerId, idx) => {
              const player = players.find(p => p.id === playerId);
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
              availablePlayers.map(player => {
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
