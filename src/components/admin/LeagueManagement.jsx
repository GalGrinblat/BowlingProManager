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
    defaultPlayersPerTeam: 4,
    dayOfWeek: '',
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
      defaultPlayersPerTeam: 4,
      dayOfWeek: '',
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
      defaultPlayersPerTeam: league.defaultPlayersPerTeam,
      dayOfWeek: league.dayOfWeek || '',
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
      defaultPlayersPerTeam: 4,
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Handicap Basis
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={formData.defaultHandicapBasis}
                  onChange={(e) => setFormData({ ...formData, defaultHandicapBasis: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Pin basis for handicap calculation</p>
              </div>
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
                        <span>📊 Handicap: {league.defaultHandicapBasis}</span>
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
