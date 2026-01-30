import React, { useState, useEffect } from 'react';
import { leaguesApi, seasonsApi } from '../../services/api';
import { createLeague, validateLeague } from '../../models';

export const LeagueManagement = ({ onBack, onViewLeague }) => {
  const [leagues, setLeagues] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultHandicapBasis: 160,
    useHandicap: true,
    handicapPercentage: 100,
    defaultPlayersPerTeam: 4,
    defaultMatchesPerGame: 3,
    dayOfWeek: '',
    bonusRules: [
      { type: 'player', condition: 'vs_average', threshold: 50, points: 1 },
      { type: 'player', condition: 'vs_average', threshold: 70, points: 2 }
    ],
    active: true
  });

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = () => {
    setLeagues(leaguesApi.getAll());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const leagueData = createLeague(formData);
    const validation = validateLeague(leagueData);
    
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (editingId) {
      leaguesApi.update(editingId, leagueData);
      setEditingId(null);
    } else {
      leaguesApi.create(leagueData);
    }

    setFormData({
      name: '',
      description: '',
      defaultHandicapBasis: 160,
      useHandicap: true,
      handicapPercentage: 100,
      defaultPlayersPerTeam: 4,
      defaultMatchesPerTeam: 3,
      dayOfWeek: '',
      bonusRules: [
        { type: 'player', condition: 'vs_average', threshold: 50, points: 1 },
        { type: 'player', condition: 'vs_average', threshold: 70, points: 2 }
      ],
      active: true
    });
    setIsAdding(false);
    loadLeagues();
  };

  const handleEdit = (league) => {
    setFormData({
      name: league.name,
      description: league.description || '',
      defaultHandicapBasis: league.defaultHandicapBasis,
      useHandicap: league.useHandicap !== undefined ? league.useHandicap : true,
      handicapPercentage: league.handicapPercentage || 100,
      defaultPlayersPerTeam: league.defaultPlayersPerTeam,
      defaultMatchesPerGame: league.defaultMatchesPerGame || 3,
      dayOfWeek: league.dayOfWeek || '',
      bonusRules: league.bonusRules || [
        { type: 'player', condition: 'vs_average', threshold: 50, points: 1 },
        { type: 'player', condition: 'vs_average', threshold: 70, points: 2 }
      ],
      active: league.active
    });
    setEditingId(league.id);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    const seasons = seasonsApi.getByLeague(id);
    if (seasons.length > 0) {
      alert('Cannot delete league with existing seasons. Archive it instead.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this league?')) {
      leaguesApi.delete(id);
      loadLeagues();
    }
  };

  const toggleActive = (league) => {
    leaguesApi.update(league.id, { active: !league.active });
    loadLeagues();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      defaultHandicapBasis: 160,
      useHandicap: true,
      handicapPercentage: 100,
      defaultPlayersPerTeam: 4,
      defaultMatchesPerGame: 3,
      dayOfWeek: '',
      bonusRules: [
        { type: 'player', condition: 'vs_average', threshold: 50, points: 1 },
        { type: 'player', condition: 'vs_average', threshold: 70, points: 2 }
      ],
      active: true
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const activeLeagues = leagues.filter(l => l.active);
  const archivedLeagues = leagues.filter(l => !l.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">League Management</h1>
            <p className="text-gray-600">{leagues.length} total leagues</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {editingId ? 'Edit League' : 'Create New League'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  League Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Monday Night League"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the league"
                  rows="3"
                />
              </div>
            </div>

            {/* League Settings */}
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Players per Team
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.defaultPlayersPerTeam}
                  onChange={(e) => setFormData({ ...formData, defaultPlayersPerTeam: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Can be changed per season</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Matches per Game
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.defaultMatchesPerGame}
                  onChange={(e) => setFormData({ ...formData, defaultMatchesPerGame: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Number of matches in each game</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  League Day
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select day (optional)</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Day of the week games are played</p>
              </div>
              </div>
            </div>

            {/* Handicap Settings Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Handicap Settings</h3>
              <p className="text-sm text-gray-600 mb-3">
                Configure how handicap is calculated for this league
              </p>
              
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
                  <p className="text-xs text-gray-500 mt-1">Enable or disable handicap for this league</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Handicap Basis
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={formData.defaultHandicapBasis}
                    onChange={(e) => setFormData({ ...formData, defaultHandicapBasis: e.target.value })}
                    disabled={!formData.useHandicap}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pin basis for handicap calculation</p>
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
                    onChange={(e) => setFormData({ ...formData, handicapPercentage: e.target.value })}
                    disabled={!formData.useHandicap}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of difference from basis (e.g., 80% = 8 pins if diff is 10)
                  </p>
                </div>
              </div>
            </div>

            {/* Bonus Rules Section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">Bonus Point Rules</h3>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      bonusRules: [
                        ...formData.bonusRules,
                        { type: 'player', condition: 'vs_average', threshold: 50, points: 1 }
                      ]
                    });
                  }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold text-sm"
                >
                  + Add Rule
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Configure bonus points awarded during games. Rules are evaluated in order (highest points first).
              </p>
              
              <div className="space-y-3">
                {formData.bonusRules.map((rule, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Apply To</label>
                        <select
                          value={rule.type}
                          onChange={(e) => {
                            const updated = [...formData.bonusRules];
                            updated[index].type = e.target.value;
                            // Force condition to pure_score when switching to team
                            if (e.target.value === 'team') {
                              updated[index].condition = 'pure_score';
                            }
                            setFormData({ ...formData, bonusRules: updated });
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        >
                          <option value="player">Player</option>
                          <option value="team">Team</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Condition</label>
                        <select
                          value={rule.condition}
                          onChange={(e) => {
                            const updated = [...formData.bonusRules];
                            updated[index].condition = e.target.value;
                            setFormData({ ...formData, bonusRules: updated });
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          disabled={rule.type === 'team'}
                        >
                          {rule.type === 'player' && (
                            <option value="vs_average">Score vs Average</option>
                          )}
                          <option value="pure_score">Score</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {rule.condition === 'vs_average' ? 'Above Avg' : 'Min Score'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="300"
                          value={rule.threshold}
                          onChange={(e) => {
                            const updated = [...formData.bonusRules];
                            updated[index].threshold = parseInt(e.target.value) || 0;
                            setFormData({ ...formData, bonusRules: updated });
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Points</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={rule.points}
                          onChange={(e) => {
                            const updated = [...formData.bonusRules];
                            updated[index].points = parseInt(e.target.value) || 1;
                            setFormData({ ...formData, bonusRules: updated });
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.bonusRules.filter((_, i) => i !== index);
                            setFormData({ ...formData, bonusRules: updated });
                          }}
                          className="w-full px-2 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-600">
                      {rule.type === 'player' ? '👤 Player' : '👥 Team'} gets <strong>+{rule.points} point{rule.points !== 1 ? 's' : ''}</strong> when scoring{' '}
                      {rule.condition === 'vs_average' 
                        ? `${rule.threshold}+ pins above average`
                        : `${rule.threshold}+ pins total`
                      }
                    </div>
                  </div>
                ))}
                
                {formData.bonusRules.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No bonus rules configured. Click "Add Rule" to create one.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                Active league
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                {editingId ? 'Update League' : 'Create League'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Create League
          </button>
        </div>
      )}

      {/* Active Leagues */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Active Leagues ({activeLeagues.length})
        </h2>
        {activeLeagues.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No active leagues</p>
        ) : (
          <div className="space-y-3">
            {activeLeagues.map(league => {
              const seasons = seasonsApi.getByLeague(league.id);
              const activeSeason = seasons.find(s => s.status === 'active');
              
              return (
                <div
                  key={league.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{league.name}</h3>
                      {league.description && (
                        <p className="text-sm text-gray-600 mt-1">{league.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        {league.dayOfWeek && <span>📅 {league.dayOfWeek}s</span>}
                        <span>📊 Handicap: {league.useHandicap !== false ? `${league.defaultHandicapBasis} (${league.handicapPercentage || 100}%)` : 'Disabled'}</span>
                        <span>👥 {league.defaultPlayersPerTeam} players/team</span>
                        <span>🎳 {seasons.length} season{seasons.length !== 1 ? 's' : ''}</span>
                      </div>
                      {activeSeason && (
                        <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          Active: {activeSeason.name}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onViewLeague(league.id)}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(league)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(league)}
                        className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                      >
                        Archive
                      </button>
                      {seasons.length === 0 && (
                        <button
                          onClick={() => handleDelete(league.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archived Leagues */}
      {archivedLeagues.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Archived Leagues ({archivedLeagues.length})
          </h2>
          <div className="space-y-3">
            {archivedLeagues.map(league => {
              const seasons = seasonsApi.getByLeague(league.id);
              
              return (
                <div
                  key={league.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-600">{league.name}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {league.dayOfWeek && <span>{league.dayOfWeek}s • </span>}
                        {seasons.length} season{seasons.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewLeague(league.id)}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => toggleActive(league)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
