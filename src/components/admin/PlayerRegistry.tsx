import React, { useState, useEffect } from 'react';
import { playersApi, teamsApi, seasonsApi } from '../../services/api';
import { createPlayer, validatePlayer } from '../../models';
import { Pagination, usePagination } from '../Pagination';
import { useTranslation } from '../../contexts/LanguageContext';

import type { PlayerRegistryProps } from '../../types/index.ts';

export const PlayerRegistry: React.FC<PlayerRegistryProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [players, setPlayers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startingAverage: '',
    active: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const activePagination = usePagination(20); // 20 players per page
  const inactivePagination = usePagination(20);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = () => {
    setPlayers(playersApi.getAll());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const playerData = createPlayer(formData);
    const validation = validatePlayer(playerData);
    
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Check for duplicate player names (case-insensitive, excluding current player if editing)
    const existingPlayer = players.find(p => 
      p.name.toLowerCase() === playerData.name.toLowerCase() && 
      p.id !== editingId
    );
    
    if (existingPlayer) {
      alert(`❌ ${t('players.duplicateName')}`);
      return;
    }

    if (editingId) {
      playersApi.update(editingId, playerData);
      alert(`✅ "${playerData.name}" ${t('players.updated')}`);
      setEditingId(null);
    } else {
      playersApi.create(playerData);
      alert(`✅ "${playerData.name}" ${t('players.created')}`);
    }

    setFormData({ name: '', startingAverage: '', active: true });
    setIsAdding(false);
    loadPlayers();
  };

  const handleEdit = (player) => {
    setFormData({
      name: player.name,
      startingAverage: player.startingAverage || '',
      active: player.active
    });
    setEditingId(player.id);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    const player = playersApi.getById(id);
    
    // Check if player is assigned to any teams
    const allTeams = teamsApi.getAll();
    const teamsWithPlayer = allTeams.filter(team => team.playerIds.includes(id));
    
    if (teamsWithPlayer.length > 0) {
      // Get season names for better context
      const seasonNames = teamsWithPlayer.map(team => {
        const season = seasonsApi.getById(team.seasonId);
        return season ? season.name : 'Unknown Season';
      });
      
      alert(`❌ ${t('players.cannotDeleteAssigned')} "${player?.name}" (${teamsWithPlayer.length} ${t('players.assignedToTeams')}):\n\n${[...new Set(seasonNames)].map(s => `• ${s}`).join('\n')}\n\n${t('players.removeFromTeamsFirst')}`);
      return;
    }
    
    if (confirm(`⚠️ ${t('players.deleteConfirm')} "${player?.name}"?\n\n${t('players.deleteAction')}`)) {
      playersApi.delete(id);
      alert(`✅ "${player?.name}" ${t('players.deleted')}`);
      loadPlayers();
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', startingAverage: '', active: true });
    setIsAdding(false);
    setEditingId(null);
  };

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Reset pagination when search changes
  React.useEffect(() => {
    activePagination.resetPage();
    inactivePagination.resetPage();
  }, [searchTerm]);

  const activePlayers = filteredPlayers.filter(p => p.active);
  const inactivePlayers = filteredPlayers.filter(p => !p.active);
  
  // Paginated lists
  const paginatedActivePlayers = activePagination.paginate(activePlayers);
  const paginatedInactivePlayers = inactivePagination.paginate(inactivePlayers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('players.title')}</h1>
            <p className="text-gray-600"><span className="ltr-content">{players.length}</span> {t('players.totalPlayers')}</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← {t('players.backToDashboard')}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {editingId ? t('players.editPlayer') : t('players.addNewPlayer')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('common.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('players.startingAverage')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={formData.startingAverage}
                  onChange={(e) => setFormData({ ...formData, startingAverage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                {t('players.activePlayer')}
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                {editingId ? t('players.updatePlayer') : t('players.addPlayer')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder={t('players.searchPlayers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            + {t('players.addPlayer')}
          </button>
        </div>
      )}

      {/* Active Players List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 pb-0">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t('players.activePlayers')} (<span className="ltr-content">{activePlayers.length}</span>)
          </h2>
        </div>
        {activePlayers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('players.noActivePlayers')}</p>
        ) : (
          <div className="p-6 space-y-2">
            {paginatedActivePlayers.map(player => (
              <div
                key={player.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{player.name}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>📊 {t('players.startingAverage')}: <span className="ltr-content">{player.startingAverage || t('players.notSet')}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(player)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(player.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <Pagination
              currentPage={activePagination.currentPage}
              totalItems={activePlayers.length}
              itemsPerPage={activePagination.itemsPerPage}
              onPageChange={activePagination.setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Inactive Players */}
      {inactivePlayers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 pb-0">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {t('players.inactivePlayers')} (<span className="ltr-content">{inactivePlayers.length}</span>)
            </h2>
          </div>
          <div className="p-6 space-y-2">
            {paginatedInactivePlayers.map(player => (
              <div
                key={player.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-600">{player.name}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {t('players.startingAverage')}: <span className="ltr-content">{player.startingAverage || t('players.notSet')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(player)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      {t('common.edit')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={inactivePagination.currentPage}
            totalItems={inactivePlayers.length}
            itemsPerPage={inactivePagination.itemsPerPage}
            onPageChange={inactivePagination.setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
