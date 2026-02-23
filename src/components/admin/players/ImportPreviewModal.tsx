import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { getPlayerDisplayName } from '../../../utils/playerUtils';
import type { Player } from '../../../types/index';

interface ImportPreviewModalProps {
  importData: Player[];
  importErrors: string[];
  existingPlayers: Player[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  importData, importErrors, existingPlayers, onConfirm, onCancel
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{t('players.importPreview')}</h2>
          <p className="text-gray-600 mt-1">{t('players.importPreviewDesc')}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {importErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-bold text-red-800 mb-2">⚠️ {t('players.errorsFound')} (<span className="ltr-content">{importErrors.length}</span>)</h3>
              <div className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                {importErrors.map((error, idx) => (
                  <div key={`${idx}-${error}`}>• {error}</div>
                ))}
              </div>
            </div>
          )}

          {importData.length > 0 && (
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 mb-3">
                ✅ {t('players.validPlayers')} (<span className="ltr-content">{importData.length}</span>)
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {importData.map((player) => {
                  const isDuplicate = existingPlayers.some(p =>
                    p.firstName.toLowerCase() === player.firstName.toLowerCase() &&
                    p.lastName.toLowerCase() === player.lastName.toLowerCase()
                  );

                  return (
                    <div
                      key={`${player.firstName}-${player.lastName}`}
                      className={`p-3 border rounded-lg ${
                        isDuplicate ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-800">{getPlayerDisplayName(player)}</span>
                          <span className="text-sm text-gray-600 ml-3">
                            Status: {player.active ? `✅ ${t('players.statusActive')}` : `❌ ${t('players.statusInactive')}`}
                          </span>
                          {Object.entries(player).map(([key, value]) => {
                            if (['firstName', 'middleName', 'lastName', 'active', 'id', 'createdAt'].includes(key)) return null;
                            return (
                              <span key={key} className="text-sm text-gray-600 ml-3">
                                {key}: {String(value)}
                              </span>
                            );
                          })}
                        </div>
                        {isDuplicate && (
                          <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded">
                            {t('players.duplicate')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {importData.length === 0 && importErrors.length === 0 && (
            <div className="text-center text-gray-500 py-8">{t('players.noValidPlayers')}</div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={importData.length === 0}
            className={`px-6 py-2 rounded-lg font-semibold ${
              importData.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {t('players.importPlayers')} <span className="ltr-content">{importData.length}</span> {importData.length !== 1 ? t('common.players') : t('common.player')}
          </button>
        </div>
      </div>
    </div>
  );
};
