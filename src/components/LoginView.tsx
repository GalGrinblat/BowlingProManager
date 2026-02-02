import React, { useState, useEffect } from 'react';
import { playersApi } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';

import type { LoginViewProps } from '../types/index.ts';

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedRole === 'player') {
      const allPlayers = playersApi.getAll().filter(p => p.active);
      setPlayers(allPlayers);
    }
  }, [selectedRole]);

  const handleAdminLogin = () => {
    onLogin('admin-user', 'admin');
  };

  const handlePlayerLogin = () => {
    if (selectedPlayer) {
      onLogin(selectedPlayer, 'player');
    }
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('auth.welcome')}</h2>
        <p className="text-gray-600">{t('auth.selectRole')}</p>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedRole('admin')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
            selectedRole === 'admin'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('auth.admin')}
        </button>
        <button
          onClick={() => setSelectedRole('player')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
            selectedRole === 'player'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('auth.player')}
        </button>
      </div>

      <div className="space-y-4">
        {selectedRole === 'admin' ? (
          <button
            onClick={handleAdminLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            {t('auth.loginAs')} {t('auth.admin')}
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('players.playerName')}
              </label>
              <input
                type="text"
                placeholder={t('players.searchPlayers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
              />
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
                {filteredPlayers.length === 0 ? (
                  <p className="p-4 text-gray-500 text-center">
                    {searchTerm ? t('players.noPlayers') : t('players.noPlayers')}
                  </p>
                ) : (
                  filteredPlayers.map(player => (
                    <div
                      key={player.id}
                      onClick={() => setSelectedPlayer(player.id)}
                      className={`p-3 border-b border-gray-200 cursor-pointer transition-colors ${
                        selectedPlayer === player.id
                          ? 'bg-purple-100 hover:bg-purple-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-800">{player.name}</span>
                          <span className="text-sm text-gray-500 ml-3">
                            Avg: {player.startingAverage || 0}
                          </span>
                        </div>
                        {selectedPlayer === player.id && (
                          <span className="text-purple-600">✓</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={handlePlayerLogin}
              disabled={!selectedPlayer}
              className={`w-full py-4 px-6 rounded-lg font-semibold transition-all shadow-md ${
                selectedPlayer
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue as Player
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Admin:</strong> Manage players, leagues, seasons, and view all data
        </p>
        <p className="text-sm text-blue-800 mt-2">
          <strong>Player:</strong> View standings and enter scores for your matches
        </p>
      </div>
    </div>
  );
};
