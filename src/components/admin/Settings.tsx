import React, { useState, useEffect } from 'react';
import { organizationApi, utilApi } from '../../services/api';
import { seedDemoData } from '../../utils/demoDataUtils';
import { useTranslation } from '../../contexts/LanguageContext';

import type { SettingsProps } from '../../types/index.ts';

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { t, language, setLanguage } = useTranslation();
  const [organization, setOrganization] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    language: 'en'
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
    setFormData({ 
      name: org.name,
      language: org.language || 'en'
    });
  };

  const handleSave = () => {
    organizationApi.update({ 
      name: formData.name,
      language: formData.language
    });
    setLanguage(formData.language); // Update context
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
          <span>←</span> {t('common.back')}
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{t('settings.title')}</h1>
        <p className="text-gray-600 mt-2">{t('settings.organizationSettings')}</p>
      </div>

      {/* Organization Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{t('settings.organizationSettings')}</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              {t('common.edit')}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('settings.organizationName')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('settings.organizationName')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('settings.language')}
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">{t('settings.english')}</option>
                <option value="he">{t('settings.hebrew')}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.language === 'he' ? 'השפה תשתנה לעברית' : 'Language will change to English'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ 
                    name: organization.name,
                    language: organization.language || 'en'
                  });
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t('settings.organizationName')}</p>
              <p className="text-lg font-semibold text-gray-800">{organization.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t('settings.language')}</p>
              <p className="text-lg font-semibold text-gray-800">
                {organization.language === 'he' ? t('settings.hebrew') : t('settings.english')}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t('settings.created')}</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(organization.createdAt).toLocaleDateString()}
              </p>
            </div>
            {organization.updatedAt && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('settings.lastUpdated')}</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(organization.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backup & Restore */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('settings.backupRestore')}</h2>
        
        {/* Export Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('settings.exportData')}</h3>
          <p className="text-sm text-gray-600 mb-3">
            {t('settings.exportDescription')}
          </p>
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            📥 {t('settings.exportButton')}
          </button>
        </div>

        {/* Import Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('settings.importData')}</h3>
          <p className="text-sm text-gray-600 mb-3">
            {t('settings.importDescription')}
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
              <h4 className="font-semibold text-blue-900 mb-2">📄 {t('settings.importPreview')}</h4>
              <p className="text-sm text-blue-800 mb-1">{t('settings.file')}: {importFile.name}</p>
              <div className="text-sm text-blue-700 space-y-1 mb-4">
                {importPreview.PLAYERS && <div>• {importPreview.PLAYERS.length || 0} {t('settings.players')}</div>}
                {importPreview.LEAGUES && <div>• {importPreview.LEAGUES.length || 0} {t('settings.leagues')}</div>}
                {importPreview.SEASONS && <div>• {importPreview.SEASONS.length || 0} {t('settings.seasons')}</div>}
                {importPreview.TEAMS && <div>• {importPreview.TEAMS.length || 0} {t('settings.teams')}</div>}
                {importPreview.GAMES && <div>• {importPreview.GAMES.length || 0} {t('settings.games')}</div>}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  ✓ {t('settings.importButton')}
                </button>
                <button
                  onClick={cancelImport}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demo Data Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('settings.demoData')}</h2>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">🎳 {t('settings.seedDemoData')}</h3>
          <p className="text-sm text-purple-800 mb-3">
            {t('settings.demoDescription')}
          </p>
          <ul className="text-sm text-purple-700 mb-4 ml-4 list-disc space-y-1">
            <li>{t('settings.demoItem1')}</li>
            <li>{t('settings.demoItem2')}</li>
            <li>{t('settings.demoItem3')}</li>
            <li>{t('settings.demoItem4')}</li>
            <li>{t('settings.demoItem5')}</li>
            <li>{t('settings.demoItem6')}</li>
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
            {isSeeding ? `🔄 ${t('settings.seeding')}` : `🚀 ${t('settings.seedButton')}`}
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('settings.systemInfo')}</h2>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">{t('settings.storageType')}</p>
            <p className="text-lg font-semibold text-blue-900">{t('settings.localStorage')}</p>
            <p className="text-xs text-blue-600 mt-1">{t('settings.localStorageDesc')}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700 mb-1">⚠️ {t('settings.important')}</p>
            <p className="text-sm text-yellow-900">
              {t('settings.dataWarning')}
            </p>
            <ul className="text-sm text-yellow-900 mt-2 ml-4 list-disc">
              <li>{t('settings.warningItem1')}</li>
              <li>{t('settings.warningItem2')}</li>
              <li>{t('settings.warningItem3')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{t('settings.dangerZone')}</h2>
        <div className="space-y-3">
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700 mb-2 font-semibold">{t('settings.clearDataTitle')}</p>
            <p className="text-sm text-red-600 mb-3">
              {t('settings.clearDataDesc')}
            </p>
            <button
              onClick={() => {
                if (confirm(t('settings.confirmDeleteAll'))) {
                  if (confirm(t('settings.finalWarning'))) {
                    utilApi.clearAll();
                    window.location.reload();
                  }
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              {t('settings.deleteAllButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
