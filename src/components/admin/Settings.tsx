import React, { useState, useEffect } from 'react';
import { organizationApi, utilApi } from '../../services/api';
import { useTranslation } from '../../contexts/LanguageContext';

import type { SettingsProps } from '../../types/index.ts';

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { t, setLanguage } = useTranslation();
  const [organization, setOrganization] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    language: 'en' | 'he';
  }>({
    name: '',
    language: 'en'
  });

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

  if (!organization) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('settings.title')}</h1>
            <p className="text-gray-600">{t('settings.organizationSettings')}</p>
          </div>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ← {t('players.backToDashboard')}
          </button>
        </div>
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
                onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'he' })}
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

      {/* Getting Started Guide (for new users) */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 {t('settings.gettingStarted')}</h2>
        <p className="text-gray-700 mb-4">{t('settings.gettingStartedDesc')}</p>
        
        <div className="space-y-4">
          {/* Step 1: Demo Data */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              1️⃣ {t('settings.step1Title')}
            </h3>
            <p className="text-sm text-gray-700 mb-2">{t('settings.step1Desc')}</p>
            <p className="text-xs text-gray-600 italic">{t('settings.step1Tip')}</p>
          </div>

          {/* Step 2: Explore Features */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              2️⃣ {t('settings.step2Title')}
            </h3>
            <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
              <li>{t('settings.step2Item1')}</li>
              <li>{t('settings.step2Item2')}</li>
              <li>{t('settings.step2Item3')}</li>
              <li>{t('settings.step2Item4')}</li>
            </ul>
          </div>

          {/* Step 3: Data Backup */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              3️⃣ {t('settings.step3Title')}
            </h3>
            <p className="text-sm text-gray-700 mb-2">{t('settings.step3Desc')}</p>
            <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
              ⚠️ {t('settings.step3Warning')}
            </p>
          </div>

          {/* Step 4: Manual Setup */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              4️⃣ {t('settings.step4Title')}
            </h3>
            <p className="text-sm text-gray-700 mb-2">{t('settings.step4Desc')}</p>
            <ol className="text-sm text-gray-600 space-y-1 ml-4 list-decimal">
              <li>{t('settings.step4Item1')}</li>
              <li>{t('settings.step4Item2')}</li>
              <li>{t('settings.step4Item3')}</li>
              <li>{t('settings.step4Item4')}</li>
            </ol>
          </div>
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
