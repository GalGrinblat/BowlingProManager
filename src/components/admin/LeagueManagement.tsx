import React, { useState, useEffect } from 'react';
import { leaguesApi, seasonsApi } from '../../services/api';
import { createLeague, validateLeague } from '../../models';
import { useTranslation } from '../../contexts/LanguageContext';
import { MAX_BOWLING_SCORE } from '../../constants/bowling';

import type { LeagueManagementProps, BonusRule } from '../../types/index';

export const LeagueManagement: React.FC<LeagueManagementProps> = ({ onBack, onViewLeague }) => {
  const { t } = useTranslation();
  const [leagues, setLeagues] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultHandicapBasis: 160,
    useHandicap: true,
    handicapPercentage: 100,
    defaultPlayersPerTeam: 4,
    defaultMatchesPerGame: 3,
    dayOfWeek: '',
    lineupStrategy: 'flexible' as 'flexible' | 'rule-based',
    lineupRule: 'standard' as 'standard' | 'high-low' | 'low-high',
    bonusRules: [] as BonusRule[],
    playerMatchPointsPerWin: 1,
    teamMatchPointsPerWin: 1,
    teamGamePointsPerWin: 2,
    active: true
  });

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = () => {
    setLeagues(leaguesApi.getAll());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const leagueData = createLeague(formData);
    const validation = validateLeague(leagueData);
    
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Check for duplicate league names (excluding current league when editing)
    const duplicateName = leagues.find(l => 
      l.name.trim().toLowerCase() === formData.name.trim().toLowerCase() && 
      l.id !== editingId
    );
    
    if (duplicateName) {
      alert(t('leagues.duplicateName'));
      return;
    }

    if (editingId) {
      leaguesApi.update(editingId, leagueData);
      alert(t('leagues.leagueUpdated'));
      setEditingId(null);
    } else {
      leaguesApi.create(leagueData);
      alert(t('leagues.leagueCreated'));
    }

    setFormData({
      name: '',
      description: '',
      defaultHandicapBasis: 160,
      useHandicap: true,
      handicapPercentage: 100,
      defaultPlayersPerTeam: 4,
      defaultMatchesPerGame: 3,
      dayOfWeek: '',
      lineupStrategy: 'flexible',
      lineupRule: 'standard',
      bonusRules: [],
      playerMatchPointsPerWin: 1,
      teamMatchPointsPerWin: 1,
      teamGamePointsPerWin: 2,
      active: true
    });
    setIsAdding(false);
    loadLeagues();
  };

  const handleEdit = (league: any) => {
    setFormData({
      name: league.name,
      description: league.description || '',
      defaultHandicapBasis: league.defaultHandicapBasis,
      useHandicap: league.useHandicap !== undefined ? league.useHandicap : true,
      handicapPercentage: league.handicapPercentage || 100,
      defaultPlayersPerTeam: league.defaultPlayersPerTeam,
      defaultMatchesPerGame: league.defaultMatchesPerGame || 3,
      dayOfWeek: league.dayOfWeek || '',
      lineupStrategy: league.lineupStrategy || 'flexible',
      lineupRule: league.lineupRule || 'standard',
      bonusRules: league.bonusRules || [],
      playerMatchPointsPerWin: league.playerMatchPointsPerWin || 1,
      teamMatchPointsPerWin: league.teamMatchPointsPerWin || 1,
      teamGamePointsPerWin: league.teamGamePointsPerWin || 2,
      active: league.active
    });
    setEditingId(league.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    const league = leagues.find(l => l.id === id);
    const seasons = seasonsApi.getByLeague(id);
    
    if (seasons.length > 0) {
      const activeSeasons = seasons.filter(s => s.status === 'active');
      const setupSeasons = seasons.filter(s => s.status === 'setup');
      
      let message = `${t('leagues.cannotDelete')} "${league?.name}" (${seasons.length}):\n\n`;
      if (activeSeasons.length > 0) {
        message += `• ${activeSeasons.length} ${t('seasons.activeSeasons')}\n`;
      }
      if (setupSeasons.length > 0) {
        message += `• ${setupSeasons.length} ${t('seasons.setupSeasons')}\n`;
      }
      message += `\n${t('leagues.completeOrDelete')}`;
      
      alert(message);
      return;
    }
    
    if (confirm(`${t('leagues.deleteConfirm')} "${league?.name}"?\n\n${t('leagues.deleteAction')}`)) {
      leaguesApi.delete(id);
      loadLeagues();
      alert(t('leagues.leagueDeleted'));
    }
  };

  const toggleActive = (league: any) => {
    if (league.active) {
      // Archiving an active league
      if (confirm(`📦 ${t('leagues.archiveConfirm')} "${league.name}"?\n\n${t('leagues.archiveDesc')}`)) {
        leaguesApi.update(league.id, { active: false });
        alert(`✅ "${league.name}" ${t('leagues.archived')}`);
        loadLeagues();
      }
    } else {
      // Restoring an archived league
      if (confirm(`📤 ${t('leagues.restoreConfirm')} "${league.name}"?\n\n${t('leagues.restoreDesc')}`)) {
        leaguesApi.update(league.id, { active: true });
        alert(`✅ "${league.name}" ${t('leagues.restored')}`);
        loadLeagues();
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      defaultHandicapBasis: 160,
      useHandicap: true,
      handicapPercentage: 100,
      defaultPlayersPerTeam: 4,
      defaultMatchesPerGame: 3,
      dayOfWeek: '',
      lineupStrategy: 'flexible' as 'flexible' | 'rule-based',
      lineupRule: 'standard' as 'standard' | 'high-low' | 'low-high',
      bonusRules: [],
      playerMatchPointsPerWin: 1,
      teamMatchPointsPerWin: 1,
      teamGamePointsPerWin: 2,
      active: true
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const activeLeagues = leagues.filter(l => l.active);
  const archivedLeagues = leagues.filter(l => !l.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('leagues.title')}</h1>
            <p className="text-gray-600"><span className="ltr-content">{leagues.length}</span> {t('leagues.totalLeagues')}</p>
          </div>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ← {t('players.backToDashboard')}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {editingId ? t('leagues.editLeague') : t('leagues.createLeague')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('leagues.leagueName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('leagues.exampleName')}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('leagues.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('leagues.briefDescription')}
                  rows={3}
                />
              </div>
            </div>

            {/* League Settings */}
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('leagues.defaultPlayersPerTeam')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.defaultPlayersPerTeam}
                  onChange={(e) => setFormData({ ...formData, defaultPlayersPerTeam: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{t('leagues.canChangePerSeason')}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('leagues.defaultMatchesPerGame')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.defaultMatchesPerGame}
                  onChange={(e) => setFormData({ ...formData, defaultMatchesPerGame: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{t('leagues.matchesInGame')}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('leagues.leagueDay')}
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('leagues.selectDay')}</option>
                  <option value="Sunday">{t('days.sunday')}</option>
                  <option value="Monday">{t('days.monday')}</option>
                  <option value="Tuesday">{t('days.tuesday')}</option>
                  <option value="Wednesday">{t('days.wednesday')}</option>
                  <option value="Thursday">{t('days.thursday')}</option>
                  <option value="Friday">{t('days.friday')}</option>
                  <option value="Saturday">{t('days.saturday')}</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">{t('leagues.dayPlayed')}</p>
              </div>
              </div>
            </div>

            {/* Player Matchup Strategy Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">{t('leagues.lineupStrategyTitle')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('leagues.lineupStrategyDesc')}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('leagues.lineupStrategyLabel')}
                  </label>
                  <select
                    value={formData.lineupStrategy}
                    onChange={(e) => setFormData({ ...formData, lineupStrategy: e.target.value as 'flexible' | 'rule-based' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="flexible">{t('leagues.lineupFlexible')}</option>
                    <option value="fixed">{t('leagues.lineupFixed')}</option>
                    <option value="rule-based">{t('leagues.lineupRuleBased')}</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.lineupStrategy === 'flexible' && t('leagues.lineupFlexibleDesc')}
                    {formData.lineupStrategy === 'rule-based' && t('leagues.lineupRuleBasedDesc')}
                  </p>
                </div>

                {formData.lineupStrategy === 'rule-based' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('leagues.rankingRuleLabel')}
                    </label>
                    <select
                      value={formData.lineupRule}
                      onChange={(e) => setFormData({ ...formData, lineupRule: e.target.value as 'standard' | 'high-low' | 'low-high' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="standard">{t('leagues.rankingStandard')}</option>
                      <option value="balanced">{t('leagues.rankingBalanced')}</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.lineupRule === 'standard' && t('leagues.rankingStandardDesc')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Point Configuration Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">{t('leagues.pointsConfig')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('leagues.pointsConfigDesc')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('leagues.playerMatchPointsPerWin')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.playerMatchPointsPerWin}
                    onChange={(e) => setFormData({ ...formData, playerMatchPointsPerWin: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('leagues.playerMatchPointsPerWinDesc')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('leagues.teamMatchPointsPerWin')}
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.teamMatchPointsPerWin}
                    onChange={(e) => setFormData({ ...formData, teamMatchPointsPerWin: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('leagues.teamMatchPointsPerWinDesc')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('leagues.teamGamePointsPerWin')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.teamGamePointsPerWin}
                    onChange={(e) => setFormData({ ...formData, teamGamePointsPerWin: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('leagues.teamGamePointsPerWinDesc')}</p>
                </div>
              </div>
            </div>

            {/* Handicap Settings Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">{t('leagues.handicapSettings')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('leagues.handicapSettingsDesc')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useHandicap}
                      onChange={(e) => setFormData({ ...formData, useHandicap: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">{t('leagues.useHandicap')}</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">{t('leagues.enableDisableHandicap')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('leagues.handicapBasis')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={MAX_BOWLING_SCORE}
                    value={formData.defaultHandicapBasis}
                    onChange={(e) => setFormData({ ...formData, defaultHandicapBasis: Number(e.target.value) })}
                    disabled={!formData.useHandicap}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('leagues.pinBasisCalculation')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('leagues.handicapPercentage')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.handicapPercentage}
                    onChange={(e) => setFormData({ ...formData, handicapPercentage: Number(e.target.value) })}
                    disabled={!formData.useHandicap}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('leagues.percentageExplanation')}
                  </p>
                </div>
              </div>
            </div>

            {/* Bonus Rules Section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">{t('leagues.bonusRules')}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      bonusRules: [
                        ...formData.bonusRules,
                        { type: 'player', condition: 'vs_average', threshold: 50, points: 1 }
                      ]
                    });
                  }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold text-sm"
                >
                  + {t('leagues.addRule')}
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {t('leagues.bonusRulesDesc')}
              </p>
              
              <div className="space-y-3">
                {formData.bonusRules.map((rule, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('leagues.applyTo')}</label>
                        <select
                          value={rule.type}
                          onChange={(e) => {
                            const updated = [...formData.bonusRules];
                            if (updated[index]) {
                              updated[index].type = e.target.value as 'player' | 'team';
                              // Reset condition to vs_average if switching to team
                              if (e.target.value === 'team') {
                                updated[index].condition = 'pure_score';
                              }
                            }
                            setFormData({ ...formData, bonusRules: updated });
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        >
                          <option value="player">{t('leagues.player')}</option>
                          <option value="team">{t('leagues.team')}</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('leagues.condition')}</label>
                        <select
                          value={rule.condition}
                          onChange={(e) => {
                            const updated = [...formData.bonusRules];
                            if (updated[index]) {
                              updated[index].condition = e.target.value as 'vs_average' | 'pure_score';
                            }
                            setFormData({ ...formData, bonusRules: updated });
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          disabled={rule.type === 'team'}
                        >
                          {rule.type === 'player' && (
                            <option value="vs_average">{t('leagues.scoreVsAverage')}</option>
                          )}
                          <option value="pure_score">{t('leagues.score')}</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {rule.condition === 'vs_average' ? t('leagues.aboveAvg') : t('leagues.score')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={MAX_BOWLING_SCORE}
                          value={rule.threshold}
                          onChange={(e) => {
                            const updated = [...formData.bonusRules];
                            if (updated[index]) {
                              updated[index].threshold = parseInt(e.target.value) || 0;
                            }
                            setFormData({ ...formData, bonusRules: updated });
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('common.points')}</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={rule.points}
                          onChange={(e) => {
                            const updated = [...formData.bonusRules];
                            if (updated[index]) {
                              updated[index].points = parseInt(e.target.value) || 1;
                            }
                            setFormData({ ...formData, bonusRules: updated });
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.bonusRules.filter((_, i) => i !== index);
                            setFormData({ ...formData, bonusRules: updated });
                          }}
                          className="w-full px-2 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold text-sm"
                        >
                          {t('leagues.removeRule')}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-600">
                      {rule.type === 'player' ? `👤 ${t('leagues.player')}` : `👥 ${t('leagues.team')}`} {t('common.points')}: <strong className="ltr-content">+{rule.points}</strong> {rule.condition === 'vs_average' 
                        ? `(${rule.threshold}+ ${t('leagues.aboveAvg')})`
                        : `(${rule.threshold}+ ${t('leagues.score')})`
                      }
                    </div>
                  </div>
                ))}
                
                {formData.bonusRules.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    {t('leagues.bonusRulesDesc')}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                {editingId ? t('leagues.editLeague') : t('leagues.createLeague')}
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
        <div className="flex justify-end">
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            + {t('leagues.createLeague')}
          </button>
        </div>
      )}

      {/* Active Leagues */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {t('leagues.activeLeagues')} (<span className="ltr-content">{activeLeagues.length}</span>)
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('leagues.currentLeagues')}
          </p>
        </div>
        {activeLeagues.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{t('leagues.noActiveLeagues')}</p>
        ) : (
          <div className="space-y-3">
            {activeLeagues.map(league => {
              const seasons = seasonsApi.getByLeague(league.id);
              const activeSeason = seasons.find(s => s.status === 'active');
              
              return (
                <div
                  key={league.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{league.name}</h3>
                      {league.description && (
                        <p className="text-sm text-gray-600 mt-1">{league.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        {league.dayOfWeek && <span>📅 {t(`days.${league.dayOfWeek.toLowerCase()}`)}s</span>}
                        <span>📊 {t('leagues.useHandicap')}: <span className="ltr-content">{league.useHandicap !== false ? `${league.defaultHandicapBasis} (${league.handicapPercentage || 100}%)` : t('leagues.handicapDisabled')}</span></span>
                        <span>👥 <span className="ltr-content">{league.defaultPlayersPerTeam}</span> {t('leagues.playersPerTeam')}</span>
                        <span>🎳 <span className="ltr-content">{seasons.length}</span> {seasons.length === 1 ? t('leagues.season') : t('leagues.seasons')}</span>
                      </div>
                      {activeSeason && (
                        <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {t('leagues.activeStatus')}: {activeSeason.name}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onViewLeague(league.id)}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        {t('common.view')}
                      </button>
                      <button
                        onClick={() => handleEdit(league)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => toggleActive(league)}
                        className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                        title={t('leagues.archiveLeague')}
                      >
                        📦 {t('leagues.archiveLeague')}
                      </button>
                      {seasons.length === 0 && (
                        <button
                          onClick={() => handleDelete(league.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          {t('common.delete')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archived Leagues */}
      {archivedLeagues.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              📦 {t('leagues.archivedLeagues')} (<span className="ltr-content">{archivedLeagues.length}</span>)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('leagues.completedInactive')}
            </p>
          </div>
          <div className="space-y-3">
            {archivedLeagues.map(league => {
              const seasons = seasonsApi.getByLeague(league.id);
              
              return (
                <div
                  key={league.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-600">{league.name}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {league.dayOfWeek && <span>{t(`days.${league.dayOfWeek.toLowerCase()}`)}s • </span>}
                        <span className="ltr-content">{seasons.length}</span> {seasons.length === 1 ? t('leagues.season') : t('leagues.seasons')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewLeague(league.id)}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        {t('common.view')}
                      </button>
                      <button
                        onClick={() => toggleActive(league)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        title={t('leagues.restoreLeague')}
                      >
                        📤 {t('leagues.restoreLeague')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
