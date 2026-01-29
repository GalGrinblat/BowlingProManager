import React, { useState, useEffect } from 'react';
import { organizationApi, leaguesApi, seasonsApi } from '../../services/api';

export const AdminDashboard = ({ onNavigate }) => {
  const [org, setOrg] = useState(null);
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    setOrg(organizationApi.get());
    setLeagues(leaguesApi.getAll());
  }, []);

  const activeLeagues = leagues.filter(l => l.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">{org?.name || 'My Bowling Organization'}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('players')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <div className="text-4xl mb-2">👥</div>
          <h3 className="text-xl font-bold mb-1">Manage Players</h3>
          <p className="text-sm text-blue-100">Add, edit, or remove players</p>
        </button>

        <button
          onClick={() => onNavigate('leagues')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="text-xl font-bold mb-1">Manage Leagues</h3>
          <p className="text-sm text-purple-100">Create and configure leagues</p>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <div className="text-4xl mb-2">⚙️</div>
          <h3 className="text-xl font-bold mb-1">Settings</h3>
          <p className="text-sm text-green-100">Organization settings</p>
        </button>
      </div>

      {/* Active Leagues */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Leagues</h2>
        {activeLeagues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No active leagues yet</p>
            <button
              onClick={() => onNavigate('leagues')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Create your first league →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeLeagues.map(league => {
              const seasons = seasonsApi.getByLeague(league.id);
              const activeSeason = seasons.find(s => s.status === 'active');
              
              return (
                <div
                  key={league.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => onNavigate('league-detail', league.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{league.name}</h3>
                      {league.description && (
                        <p className="text-sm text-gray-600 mt-1">{league.description}</p>
                      )}
                      {activeSeason && (
                        <p className="text-sm text-green-600 mt-2">
                          Active Season: {activeSeason.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{seasons.length} season{seasons.length !== 1 ? 's' : ''}</div>
                      <div className="text-xs mt-1">
                        {league.defaultPlayersPerTeam} players/team
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
