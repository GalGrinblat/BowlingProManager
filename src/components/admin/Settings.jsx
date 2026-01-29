import React, { useState, useEffect } from 'react';
import { organizationApi } from '../../services/api';

export const Settings = ({ onBack }) => {
  const [organization, setOrganization] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = () => {
    const org = organizationApi.get();
    setOrganization(org);
    setFormData({ name: org.name });
  };

  const handleSave = () => {
    organizationApi.update({ name: formData.name });
    setIsEditing(false);
    loadOrganization();
  };

  if (!organization) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-lg font-semibold"
        >
          <span>←</span> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Organization Settings</h1>
        <p className="text-gray-600 mt-2">Manage your organization configuration</p>
      </div>

      {/* Organization Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Organization Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter organization name"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ name: organization.name });
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Organization Name</p>
              <p className="text-lg font-semibold text-gray-800">{organization.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Created</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(organization.createdAt).toLocaleDateString()}
              </p>
            </div>
            {organization.updatedAt && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(organization.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">System Information</h2>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">Storage Type</p>
            <p className="text-lg font-semibold text-blue-900">Local Storage</p>
            <p className="text-xs text-blue-600 mt-1">Data is stored in your browser</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700 mb-1">⚠️ Important</p>
            <p className="text-sm text-yellow-900">
              Your data is stored locally in this browser. To prevent data loss:
            </p>
            <ul className="text-sm text-yellow-900 mt-2 ml-4 list-disc">
              <li>Don't clear browser data</li>
              <li>Regularly export your data (feature coming soon)</li>
              <li>Consider migrating to a database for production use</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Danger Zone</h2>
        <div className="space-y-3">
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700 mb-2 font-semibold">Clear All Data</p>
            <p className="text-sm text-red-600 mb-3">
              This will permanently delete all players, leagues, seasons, teams, and games.
              This action cannot be undone.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
                  if (confirm('This is your final warning. Delete everything?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Delete All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
