import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';

interface PlayerFormProps {
  formData: { firstName: string; middleName: string; lastName: string; active: boolean };
  isEditing: boolean;
  onFormDataChange: (data: { firstName: string; middleName: string; lastName: string; active: boolean }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ formData, isEditing, onFormDataChange, onSubmit, onCancel }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {isEditing ? t('players.editPlayer') : t('players.addNewPlayer')}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('players.firstName')} *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => onFormDataChange({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('players.middleName')}
            </label>
            <input
              type="text"
              value={formData.middleName}
              onChange={(e) => onFormDataChange({ ...formData, middleName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('players.lastName')} *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => onFormDataChange({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
            {isEditing ? t('players.updatePlayer') : t('players.addPlayer')}
          </button>
          <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};
