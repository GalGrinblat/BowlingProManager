import React, { useState, useEffect } from 'react';
import { playersApi, teamsApi, seasonsApi } from '../../services/api';
import { createPlayer, validatePlayer } from '../../models';
import { Pagination, usePagination } from '../common/Pagination';
import { useTranslation } from '../../contexts/LanguageContext';
import {
  exportToCSV,
  exportToJSON,
  parseJSONImport,
  parseCSVImport,
  booleanConverter
} from '../../utils/importExportUtils';
import { getPlayerDisplayName } from '../../utils/playerUtils';
import type { Player, PlayerRegistryProps } from '../../types/index';
import { PLAYER_SORT_OPTIONS } from '../../constants/sortOptions';
import { sortByOption, SortOption } from '../../utils/sortUtils';

export const PlayerRegistry: React.FC<PlayerRegistryProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    active: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<Player[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState(PLAYER_SORT_OPTIONS[0]);
  
  // Pagination state
  const activePagination = usePagination(20); // 20 players per page
  const inactivePagination = usePagination(20);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    const data = await playersApi.getAll();
    setPlayers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const playerData = createPlayer(formData);
    const validation = validatePlayer(playerData);

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Check for duplicate player names (case-insensitive, excluding current player if editing)
    const displayName = getPlayerDisplayName(playerData);
    const existingPlayer = players.find(p =>
      p.firstName.toLowerCase() === playerData.firstName.toLowerCase() &&
      p.lastName.toLowerCase() === playerData.lastName.toLowerCase() &&
      p.id !== editingId
    );

    if (existingPlayer) {
      alert(`❌ ${t('players.duplicateName')}`);
      return;
    }

    if (editingId) {
      await playersApi.update(editingId, playerData);
      alert(`✅ "${displayName}" ${t('players.updated')}`);
      setEditingId(null);
    } else {
      await playersApi.create(playerData);
      alert(`✅ "${displayName}" ${t('players.created')}`);
    }

    setFormData({ firstName: '', middleName: '', lastName: '', active: true });
    setIsAdding(false);
    await loadPlayers();
  };

  const handleEdit = (player: Player) => {
    setFormData({
      firstName: player.firstName,
      middleName: player.middleName || '',
      lastName: player.lastName,
      active: player.active
    });
    setEditingId(player.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    const player = await playersApi.getById(id);

    // Check if player is assigned to any teams
    const allTeams = await teamsApi.getAll();
    const teamsWithPlayer = allTeams.filter(team => team.playerIds.includes(id));

    if (teamsWithPlayer.length > 0) {
      // Get season names for better context
      const seasonNames = await Promise.all(
        teamsWithPlayer.map(async team => {
          const season = await seasonsApi.getById(team.seasonId);
          return season ? season.name : 'Unknown Season';
        })
      );

      const playerDisplayName = player ? getPlayerDisplayName(player) : 'Unknown';
      alert(`❌ ${t('players.cannotDeleteAssigned')} "${playerDisplayName}" (${teamsWithPlayer.length} ${t('players.assignedToTeams')}):\n\n${[...new Set(seasonNames)].map(s => `• ${s}`).join('\n')}\n\n${t('players.removeFromTeamsFirst')}`);
      return;
    }

    const playerDisplayName = player ? getPlayerDisplayName(player) : 'Unknown';
    if (confirm(`⚠️ ${t('players.deleteConfirm')} "${playerDisplayName}"?\n\n${t('common.deleteWarning')}`)) {
      await playersApi.delete(id);
      alert(`✅ "${playerDisplayName}" ${t('players.deleted')}`);
      await loadPlayers();
    }
  };

  const handleCancel = () => {
    setFormData({ firstName: '', middleName: '', lastName: '', active: true });
    setIsAdding(false);
    setEditingId(null);
  };

  // Export functions
  const handleExportCSV = () => {
    exportToCSV(players, 'players');
  };

  const handleExportJSON = () => {
    exportToJSON(players, 'players');
  };

  // Import functions
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        if (file.name.endsWith('.json')) {
          handleParseJSONImport(content);
        } else if (file.name.endsWith('.csv')) {
          handleParseCSVImport(content);
        } else {
          alert('Please upload a CSV or JSON file');
        }
      } catch (error) {
        alert(`Error reading file: ${error}`);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };

  const handleParseJSONImport = (content: string) => {
    try {
      const result = parseJSONImport<Player>(
        content,
        (item) => {
          if (!item.firstName) {
            return { valid: false, error: 'Missing required field \'firstName\'' };
          }
          if (!item.lastName) {
            return { valid: false, error: 'Missing required field \'lastName\'' };
          }
          if (item.active === undefined) {
            item.active = true;
          }
          return validatePlayer(item);
        }
      );

      setImportData(result.validData);
      setImportErrors(result.errors);
      setShowImportModal(true);
    } catch (error) {
      alert(String(error));
    }
  };

  const handleParseCSVImport = (content: string) => {
    try {
      const result = parseCSVImport<Player>(
        content,
        (item) => {
          if (!item.firstName) {
            return { valid: false, error: 'Missing required field \'firstName\'' };
          }
          if (!item.lastName) {
            return { valid: false, error: 'Missing required field \'lastName\'' };
          }
          if (item.active === undefined) {
            item.active = true;
          }
          return validatePlayer(item);
        },
        ['id', 'createdAt'],
        {
          active: booleanConverter // Convert string 'true'/'false' to boolean
        }
      );

      setImportData(result.validData);
      setImportErrors(result.errors);
      setShowImportModal(true);
    } catch (error) {
      alert(String(error));
    }
  };

  const handleConfirmImport = async () => {
    let successCount = 0;
    let duplicateCount = 0;

    for (const playerData of importData) {
      // Check for duplicates
      const existingPlayer = players.find(p =>
        p.firstName.toLowerCase() === playerData.firstName.toLowerCase() &&
        p.lastName.toLowerCase() === playerData.lastName.toLowerCase()
      );

      if (existingPlayer) {
        duplicateCount++;
        continue;
      }

      await playersApi.create(playerData);
      successCount++;
    }

    setShowImportModal(false);
    setImportData([]);
    setImportErrors([]);
    await loadPlayers();

    let message = `✅ ${t('players.importComplete')}\n\n`;
    message += `• ${successCount} ${t('players.playersImported')}\n`;
    if (duplicateCount > 0) {
      message += `• ${duplicateCount} ${t('players.duplicatesSkipped')}\n`;
    }
    if (importErrors.length > 0) {
      message += `• ${importErrors.length} ${t('players.errorsDetails')}`;
    }

    alert(message);
  };

  const handleCancelImport = () => {
    setShowImportModal(false);
    setImportData([]);
    setImportErrors([]);
  };

  // Filtered and sorted players
  const filteredPlayers = players.filter(p => {
    const term = searchTerm.toLowerCase();
    return p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      getPlayerDisplayName(p).toLowerCase().includes(term);
  });

  // Sort players by selected option
  const DEFAULT_SORT_OPTION: SortOption<Player> = { key: 'lastName', labelKey: 'sort.lastNameAsc', direction: 'asc' };
  const sortedPlayers = sortByOption(filteredPlayers, sortOption ?? DEFAULT_SORT_OPTION);
  // Reset pagination when search changes
  React.useEffect(() => {
    activePagination.resetPage();
    inactivePagination.resetPage();
  }, [searchTerm]);

  const activePlayers = sortedPlayers.filter(p => p.active);
  const inactivePlayers = sortedPlayers.filter(p => !p.active);
  
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
            <p className="text-gray-600">{t('players.totalPlayers').replace('{{count}}', String(players.length))}</p>
          </div>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            {t('common.leftArrow')} {t('players.backToDashboard')}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('players.firstName')} *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
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
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <input
              type="text"
              placeholder={t('players.searchPlayers')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                + {t('players.addPlayer')}
              </button>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-4 my-4">
            <label htmlFor="sortPlayers" className="text-sm font-semibold text-gray-700">{t('sort.by')}:</label>
            <select
              id="sortPlayers"
              value={sortOption?.labelKey}
              onChange={e => {
                const selected = PLAYER_SORT_OPTIONS.find(opt => opt.labelKey === e.target.value);
                if (selected) setSortOption(selected);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              {PLAYER_SORT_OPTIONS.map(opt => (
                <option key={opt.labelKey} value={opt.labelKey}>{t(opt.labelKey)}</option>
              ))}
            </select>
          </div>

          {/* Import/Export Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('players.importExport')}</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
                >
                  📥 {t('players.exportCSV')}
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
                >
                  📥 {t('players.exportJSON')}
                </button>
              </div>
              <div>
                <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold cursor-pointer flex items-center gap-2 inline-block">
                  📤 {t('players.importFile')}
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              💡 {t('players.importExportHelp')}
            </p>
          </div>
        </>
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
            {paginatedActivePlayers.map((player: Player) => (
              <div
                key={player.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{getPlayerDisplayName(player)}</h3>
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
            {paginatedInactivePlayers.map((player: Player) => (
              <div
                key={player.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-600">{getPlayerDisplayName(player)}</h3>
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

      {/* Import Preview Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">{t('players.importPreview')}</h2>
              <p className="text-gray-600 mt-1">
                {t('players.importPreviewDesc')}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Errors */}
              {importErrors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-bold text-red-800 mb-2">⚠️ {t('players.errorsFound')} (<span className="ltr-content">{importErrors.length}</span>)</h3>
                  <div className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                    {importErrors.map((error, idx) => (
                      <div key={idx}>• {error}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Valid Players */}
              {importData.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold text-gray-800 mb-3">
                    ✅ {t('players.validPlayers')} (<span className="ltr-content">{importData.length}</span>)
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {importData.map((player, idx) => {
                      const isDuplicate = players.some(p =>
                        p.firstName.toLowerCase() === player.firstName.toLowerCase() &&
                        p.lastName.toLowerCase() === player.lastName.toLowerCase()
                      );
                      
                      return (
                        <div
                          key={idx}
                          className={`p-3 border rounded-lg ${
                            isDuplicate 
                              ? 'bg-yellow-50 border-yellow-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-gray-800">{getPlayerDisplayName(player)}</span>
                              <span className="text-sm text-gray-600 ml-3">
                                Status: {player.active ? `✅ ${t('players.statusActive')}` : `❌ ${t('players.statusInactive')}`}
                              </span>
                              {/* Display any additional fields */}
                              {Object.entries(player).map(([key, value]) => {
                                if (key === 'firstName' || key === 'middleName' || key === 'lastName' || key === 'active' || key === 'id' || key === 'createdAt') return null;
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
                <div className="text-center text-gray-500 py-8">
                  {t('players.noValidPlayers')}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCancelImport}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importData.length === 0}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  importData.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {t('players.importPlayers')} <span className="ltr-content">{importData.length}</span> {importData.length !== 1 ? t('common.players') : t('common.player')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
