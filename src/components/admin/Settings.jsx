import React, { useState, useEffect } from 'react';
import { organizationApi, utilApi } from '../../services/api';
import { seedDemoData } from '../../utils/demoDataUtils';

export const Settings = ({ onBack }) => {
  const [organization, setOrganization] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

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

  const handleExport = () => {
    const data = utilApi.exportData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bowling-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setImportFile(file);
        setImportPreview(data);
      } catch (error) {
        alert('Invalid JSON file. Please select a valid backup file.');
        setImportFile(null);
        setImportPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importPreview) return;

    if (confirm('This will replace all current data with the imported data. Continue?')) {
      try {
        utilApi.importData(importPreview);
        alert('Data imported successfully! Reloading page...');
        window.location.reload();
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    }
  };

  const cancelImport = () => {
    setImportFile(null);
    setImportPreview(null);
  };

  const handleSeedDemoData = () => {
    if (confirm('This will create demo data including 40 players, 2 leagues, 16 teams, and completed first round games. Continue?')) {
      setIsSeeding(true);
      try {
        const result = seedDemoData();
        alert(`Demo data created successfully!\n\n` +
              `- ${result.players} players\n` +
              `- ${result.leagues} leagues\n` +
              `- ${result.seasons} seasons\n` +
              `- ${result.teams} teams\n` +
              `- ${result.completedGames} completed games\n\n` +
              `Reloading page...`);
        window.location.reload();
      } catch (error) {
        alert('Error seeding demo data: ' + error.message);
        setIsSeeding(false);
      }
    }
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Backup & Restore</h2>
        
        {/* Export Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Export Data</h3>
          <p className="text-sm text-gray-600 mb-3">
            Download a backup of all your data (players, leagues, seasons, teams, and games).
          </p>
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            📥 Export All Data
          </button>
        </div>

        {/* Import Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Import Data</h3>
          <p className="text-sm text-gray-600 mb-3">
            Restore data from a previously exported backup file. This will replace all current data.
          </p>
          
          {!importPreview ? (
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          ) : (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📄 Import Preview</h4>
              <p className="text-sm text-blue-800 mb-1">File: {importFile.name}</p>
              <div className="text-sm text-blue-700 space-y-1 mb-4">
                {importPreview.PLAYERS && <div>• {importPreview.PLAYERS.length || 0} players</div>}
                {importPreview.LEAGUES && <div>• {importPreview.LEAGUES.length || 0} leagues</div>}
                {importPreview.SEASONS && <div>• {importPreview.SEASONS.length || 0} seasons</div>}
                {importPreview.TEAMS && <div>• {importPreview.TEAMS.length || 0} teams</div>}
                {importPreview.GAMES && <div>• {importPreview.GAMES.length || 0} games</div>}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  ✓ Import Data
                </button>
                <button
                  onClick={cancelImport}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demo Data Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Demo Data</h2>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">🎳 Seed Demo Data</h3>
          <p className="text-sm text-purple-800 mb-3">
            Quickly populate your system with realistic demo data for testing:
          </p>
          <ul className="text-sm text-purple-700 mb-4 ml-4 list-disc space-y-1">
            <li>40 players with realistic names and averages (120-220)</li>
            <li>2 leagues (Monday & Thursday nights)</li>
            <li>8 teams per league (16 teams total)</li>
            <li>4 players per team</li>
            <li>4 rounds scheduled per season</li>
            <li>First round completed with realistic scores</li>
          </ul>
          <button
            onClick={handleSeedDemoData}
            disabled={isSeeding}
            className={`px-6 py-2 rounded-lg font-semibold ${
              isSeeding 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isSeeding ? '🔄 Creating Demo Data...' : '🚀 Seed Demo Data'}
          </button>
        </div>
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
              <li>Regularly export your data using the backup feature above</li>
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
                    utilApi.clearAll();
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
