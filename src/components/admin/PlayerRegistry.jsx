import React, { useState, useEffect } from 'react';
import { playersApi } from '../../services/api';
import { createPlayer, validatePlayer } from '../../models';

export const PlayerRegistry = ({ onBack }) => {
  const [players, setPlayers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    startingAverage: '',
    active: true
  });
  const [searchTerm, setSearchTerm] = useState('');

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

    if (editingId) {
      playersApi.update(editingId, playerData);
      setEditingId(null);
    } else {
      playersApi.create(playerData);
    }

    setFormData({ name: '', email: '', phone: '', startingAverage: '', active: true });
    setIsAdding(false);
    loadPlayers();
  };

  const handleEdit = (player) => {
    setFormData({
      name: player.name,
      email: player.email || '',
      phone: player.phone || '',
      startingAverage: player.startingAverage || '',
      active: player.active
    });
    setEditingId(player.id);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this player?')) {
      playersApi.delete(id);
      loadPlayers();
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '', startingAverage: '', active: true });
    setIsAdding(false);
    setEditingId(null);
  };

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activePlayers = filteredPlayers.filter(p => p.active);
  const inactivePlayers = filteredPlayers.filter(p => !p.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Player Registry</h1>
            <p className="text-gray-600">{players.length} total players</p>
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
            {editingId ? 'Edit Player' : 'Add New Player'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
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
                  Starting Average
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                Active player
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                {editingId ? 'Update Player' : 'Add Player'}
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
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Add Player
          </button>
        </div>
      )}

      {/* Active Players List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Active Players ({activePlayers.length})
        </h2>
        {activePlayers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No active players</p>
        ) : (
          <div className="space-y-2">
            {activePlayers.map(player => (
              <div
                key={player.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{player.name}</h3>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      {player.email && <div>📧 {player.email}</div>}
                      {player.phone && <div>📱 {player.phone}</div>}
                      <div>📊 Starting Average: {player.startingAverage || 'Not set'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(player)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(player.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inactive Players */}
      {inactivePlayers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Inactive Players ({inactivePlayers.length})
          </h2>
          <div className="space-y-2">
            {inactivePlayers.map(player => (
              <div
                key={player.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-600">{player.name}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      Starting Average: {player.startingAverage || 'Not set'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(player)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
