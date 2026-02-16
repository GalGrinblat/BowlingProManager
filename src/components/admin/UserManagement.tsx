import React, { useState, useEffect } from 'react';
import { usersApi, playersApi, allowedEmailsApi, type DatabaseUser, type AllowedEmail } from '../../services/api';
import type { Player } from '../../types/index';
import { useTranslation } from '../../contexts/LanguageContext';
import { getPlayerDisplayName } from '../../utils/playerUtils';

interface UserManagementProps {
  onBack: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const { t: _t } = useTranslation();
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'player'>('player');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmailNotes, setNewEmailNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, playersData, allowedEmailsData] = await Promise.all([
        usersApi.getAll(),
        playersApi.getAll(),
        allowedEmailsApi.getAll()
      ]);
      setUsers(usersData);
      setPlayers(playersData.filter(p => p.active));
      setAllowedEmails(allowedEmailsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: DatabaseUser) => {
    setEditingUser(user.id);
    setSelectedRole(user.role);
    setSelectedPlayer(user.playerId || '');
  };

  const handleSaveUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Update role if changed
      if (selectedRole !== user.role) {
        await usersApi.updateRole(userId, selectedRole);
      }

      // Update player link if changed
      const newPlayerId = selectedPlayer || null;
      if (newPlayerId !== user.playerId) {
        await usersApi.linkPlayer(userId, newPlayerId);
      }

      alert('✅ User updated successfully');
      setEditingUser(null);
      await loadData();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('❌ Failed to update user');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setSelectedRole('player');
    setSelectedPlayer('');
  };

  const getPlayerName = (playerId: string | null): string => {
    if (!playerId) return 'Not linked';
    const player = players.find(p => p.id === playerId);
    return player ? getPlayerDisplayName(player) : 'Unknown Player';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      alert('❌ Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      alert('❌ Please enter a valid email address');
      return;
    }

    try {
      await allowedEmailsApi.add(newEmail.trim(), newEmailNotes.trim() || undefined);
      alert('✅ Email added to whitelist');
      setNewEmail('');
      setNewEmailNotes('');
      await loadData();
    } catch (error) {
      console.error('Error adding email:', error);
      alert('❌ Failed to add email. It may already exist.');
    }
  };

  const handleRemoveEmail = async (email: string) => {
    if (!confirm(`Remove ${email} from whitelist?\n\nUsers with this email will no longer be able to sign in.`)) {
      return;
    }

    try {
      await allowedEmailsApi.remove(email);
      alert('✅ Email removed from whitelist');
      await loadData();
    } catch (error) {
      console.error('Error removing email:', error);
      alert('❌ Failed to remove email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
            <p className="text-gray-600">Manage user roles and player account links</p>
          </div>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">📌 User Management Guide</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Email Whitelist</strong> - Only emails in the whitelist can sign in with Google</li>
          <li>• <strong>Admin</strong> - Can manage all data, players, leagues, seasons, and users</li>
          <li>• <strong>Player</strong> - Can view data and enter scores (must be linked to a player account)</li>
          <li>• New users who sign in with Google will appear here with the "player" role by default</li>
          <li>• Link player role users to their bowling player accounts</li>
        </ul>
      </div>

      {/* Email Whitelist */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🔒 Email Whitelist ({allowedEmails.length})
          </h2>
          <p className="text-sm text-gray-600">
            Only emails in this list can sign in with Google
          </p>
        </div>

        {/* Add Email Form */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Email to Whitelist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={newEmailNotes}
                onChange={(e) => setNewEmailNotes(e.target.value)}
                placeholder="e.g., John Smith - Team Captain"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleAddEmail}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Add to Whitelist
          </button>
        </div>

        {/* Email List */}
        <div className="divide-y divide-gray-200">
          {allowedEmails.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p className="mb-2">No emails in whitelist</p>
              <p className="text-sm">⚠️ Warning: No one can sign in until you add emails to the whitelist</p>
            </div>
          ) : (
            allowedEmails.map((email) => (
              <div key={email.email} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{email.email}</h3>
                      {users.some(u => u.email === email.email) && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Registered
                        </span>
                      )}
                    </div>
                    {email.notes && (
                      <p className="text-sm text-gray-600">{email.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Added {formatDate(email.addedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveEmail(email.email)}
                    className="ml-4 px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            All Users ({users.length})
          </h2>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No users found</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                {editingUser === user.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Role *
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'player')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="player">Player</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {selectedRole === 'player' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Link to Player Account (Optional)
                        </label>
                        <select
                          value={selectedPlayer}
                          onChange={(e) => setSelectedPlayer(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Not linked</option>
                          {players.map((player) => (
                            <option key={player.id} value={player.id}>
                              {getPlayerDisplayName(player)}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Link this user to their bowling player account
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleSaveUser(user.id)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{user.email}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Player Account:</span>{' '}
                          <span className={user.playerId ? 'text-green-600' : 'text-gray-400'}>
                            {getPlayerName(user.playerId)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Joined:</span>{' '}
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEditUser(user)}
                      className="ml-4 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
