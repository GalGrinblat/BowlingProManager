import React, { useState, useEffect } from 'react';
import { leaguesApi, seasonsApi, teamsApi, playersApi, gamesApi } from '../../services/api';
import { createSeason, createTeam, validateSeason, validateTeam } from '../../models';
import { generateRoundRobinSchedule } from '../../utils/scheduleUtils';
import { exportSeasonJSON } from '../../utils/exportUtils';

export const LeagueDetail = ({ leagueId, onBack, onViewSeason }) => {
  const [league, setLeague] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [isCreatingSeason, setIsCreatingSeason] = useState(false);

  useEffect(() => {
    loadLeagueData();
  }, [leagueId]);

  const loadLeagueData = () => {
    const leagueData = leaguesApi.getById(leagueId);
    setLeague(leagueData);
    const seasonsData = seasonsApi.getByLeague(leagueId);
    setSeasons(seasonsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const handleCreateSeason = () => {
    setIsCreatingSeason(true);
  };

  const handleDeleteSeason = (seasonId) => {
    const games = gamesApi.getBySeason(seasonId);
    if (games.length > 0) {
      alert('Cannot delete season with recorded games.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this season?')) {
      // Delete teams first
      const teams = teamsApi.getBySeason(seasonId);
      teams.forEach(team => teamsApi.delete(team.id));
      
      // Delete season
      seasonsApi.delete(seasonId);
      loadLeagueData();
    }
  };

  const activeSeason = seasons.find(s => s.status === 'active');
  const completedSeasons = seasons.filter(s => s.status === 'completed');
  const setupSeasons = seasons.filter(s => s.status === 'setup');

  if (!league) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 mb-4"
        >
          ← Back to Leagues
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{league.name}</h1>
        {league.description && (
          <p className="text-gray-600">{league.description}</p>
        )}
        <div className="flex gap-4 mt-4 text-sm text-gray-600">
          {league.dayOfWeek && <span>📅 {league.dayOfWeek}s</span>}
          <span>📊 Handicap Basis: {league.defaultHandicapBasis}</span>
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
                        onClick={() => onViewSeason(season.id, 'setup')}
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
              const { calculateTeamStandings } = require('../../utils/standingsUtils');
              const standings = calculateTeamStandings(teams, games);
              const champion = standings[0];
              
              const handleExport = (e) => {
                e.stopPropagation(); // Prevent navigation when clicking export
                const { calculatePlayerSeasonStats } = require('../../utils/standingsUtils');
                const playerStats = calculatePlayerSeasonStats(teams, games);
                exportSeasonJSON(season, teams, games, standings, playerStats, league);
              };
              
              return (
                <div
                  key={season.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer"
                  onClick={() => onViewSeason(season.id, 'completed')}
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
                    <div className="flex gap-2">
                      <button
                        onClick={handleExport}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold text-sm transition-colors"
                      >
                        📦 Export
                      </button>
                      <button
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                      >
                        View Archive →
                      </button>
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
const SeasonCreator = ({ league, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    numberOfTeams: 4,
    playersPerTeam: league.defaultPlayersPerTeam,
    numberOfRounds: 1,
    handicapBasis: league.defaultHandicapBasis,
    matchesPerGame: league.defaultMatchesPerGame || 3,
    bonusRules: league.bonusRules || [],
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const seasonData = createSeason({
      ...formData,
      leagueId: league.id
    });
    
    const validation = validateSeason(seasonData);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Generate schedule
    const teamIds = Array.from({ length: formData.numberOfTeams }, (_, i) => `temp-team-${i}`);
    const schedule = generateRoundRobinSchedule(teamIds, formData.numberOfRounds);
    seasonData.schedule = schedule;

    const created = seasonsApi.create(seasonData);
    
    // Create empty teams
    for (let i = 0; i < formData.numberOfTeams; i++) {
      const teamData = createTeam({
        seasonId: created.id,
        name: `Team ${i + 1}`,
        playerIds: []
      });
      teamsApi.create(teamData);
    }

    onSuccess();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Season</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
              Handicap Basis
            </label>
            <input
              type="number"
              min="0"
              max="300"
              value={formData.handicapBasis}
              onChange={(e) => setFormData({ ...formData, handicapBasis: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
          <div className="md:col-span-2">
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
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Create Season
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
