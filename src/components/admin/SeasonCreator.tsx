import React, { useState, useEffect } from 'react';
import { seasonsApi, teamsApi, gamesApi, playersApi, leaguesApi } from '../../services/api';
import { createSeason, createTeam, validateSeason } from '../../models';
import { generateRoundRobinSchedule } from '../../utils/scheduleUtils';
import { useTranslation } from '../../contexts/LanguageContext';
import { MAX_BOWLING_SCORE } from '../../constants/bowling';

import type { SeasonCreatorProps } from '../../types/index';

export const SeasonCreator: React.FC<SeasonCreatorProps> = ({ leagueId, onBack, onSuccess }) => {
  const { t } = useTranslation();
  const [league, setLeague] = useState<any>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Load league data
  useEffect(() => {
    const leagueData = leaguesApi.getById(leagueId);
    setLeague(leagueData);
  }, [leagueId]);

  // Load league data
  useEffect(() => {
    const leagueData = leaguesApi.getById(leagueId);
    setLeague(leagueData);
  }, [leagueId]);

  const [formData, setFormData] = useState({
    name: '',
    numberOfTeams: 4,
    playersPerTeam: 4,
    numberOfRounds: 1,
    handicapBasis: 160,
    useHandicap: true,
    handicapPercentage: 100,
    matchesPerGame: 3,
    bonusRules: [],
    startDate: new Date().toISOString().split('T')[0]
  });

  // Update form data when league loads
  useEffect(() => {
    if (league) {
      setFormData(prev => ({
        ...prev,
        playersPerTeam: league.defaultPlayersPerTeam,
        handicapBasis: league.defaultHandicapBasis,
        useHandicap: league.useHandicap !== undefined ? league.useHandicap : true,
        handicapPercentage: league.handicapPercentage || 100,
        matchesPerGame: league.defaultMatchesPerGame || 3,
        bonusRules: league.bonusRules || []
      }));
    }
  }, [league]);
  
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
            const playerAvg = 0;  // Default to 0, will be calculated from actual games
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
            const playerAvg = 0;  // Default to 0, will be calculated from actual games
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
    onSuccess(created.id);
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

  // Loading state
  if (!league) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Loading league data...</p>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('seasons.createSeason')}</h1>
              <p className="text-gray-600">{league.name}</p>
            </div>
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              ← {t('leagues.backToLeague')}
            </button>
          </div>
        </div>

        {/* Step 2: Team Configuration */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('seasons.configureTeams')}</h2>
          <p className="text-gray-600 mb-6">{t('seasons.assignPlayersDesc').replace('{{count}}', String(formData.playersPerTeam))}</p>
          
          <div className="space-y-6 max-h-[600px] overflow-y-auto">
            {teams.map((team, teamIndex) => {
              const assignedElsewhere = getAssignedPlayers(teamIndex);
              const availableForThisTeam = availablePlayers.filter(p => !assignedElsewhere.has(p.id));
              
              return (
                <div key={teamIndex} className="border rounded-lg p-4">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('teams.name')} {teamIndex + 1} *
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
                      {t('common.players')} ({team.playerIds.length}/{formData.playersPerTeam})
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded p-2">
                      {availableForThisTeam.length === 0 ? (
                        <p className="col-span-2 text-gray-500 text-sm">{t('seasons.noAvailablePlayers')}</p>
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
              ← {t('common.back')}
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              {t('seasons.createSeason')}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('seasons.createSeason')}</h1>
            <p className="text-gray-600">{league.name}</p>
          </div>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ← {t('leagues.backToLeague')}
          </button>
        </div>
      </div>

      {/* Step 1: Season Configuration */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('seasons.createSeasonStep1')}</h2>
        <form onSubmit={handleStepOneSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('seasons.seasonName')} *
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
                {t('seasons.numberOfTeams')} *
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
                {t('seasons.playersPerTeam')} *
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
                {t('seasons.numberOfRounds')} *
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
                {t('seasons.roundExplanation')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('seasons.matchesPerGame')}
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
                {t('seasons.matchesExplanation')}
              </p>
            </div>
          </div>
          
          {/* Handicap Settings Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">{t('leagues.handicapSettings')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.useHandicap}
                    onChange={(e) => setFormData({ ...formData, useHandicap: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">{t('leagues.useHandicap')}</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">{t('leagues.handicapToggleDesc')}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('leagues.handicapBasis')}
                </label>
                <input
                  type="number"
                  min="0"
                  max={MAX_BOWLING_SCORE}
                  value={formData.handicapBasis}
                  onChange={(e) => setFormData({ ...formData, handicapBasis: parseInt(e.target.value) })}
                  disabled={!formData.useHandicap}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">{t('leagues.handicapBasisDesc')}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('leagues.handicapPercentage')}
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
                  {t('leagues.handicapPercentageDesc')}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('seasons.startDate')}
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
              {t('seasons.nextConfigureTeams')} →
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
