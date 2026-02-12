import React, { useState, useEffect } from 'react';
import { leaguesApi, seasonsApi } from '../../services/api';
import { createLeague, validateLeague } from '../../models';
import { useTranslation } from '../../contexts/LanguageContext';
import { DEFAULT_HANDICAP_BASIS, DEFAULT_HANDICAP_PERCENTAGE, DEFAULT_NUMBER_OF_TEAMS, DEFAULT_NUMBER_OF_ROUNDS, DEFAULT_PLAYERS_PER_TEAM, DEFAULT_MATCHES_PER_GAME, DEFAULT_PLAYER_MATCH_POINTS, DEFAULT_TEAM_MATCH_POINTS, DEFAULT_TEAM_GAME_POINTS, DEFAULT_USE_HANDICAP } from '../../constants/bowling';
import { HandicapConfigurationForm } from './HandicapConfigurationForm';
import { PlayerMatchupConfiguration } from './PlayerMatchupConfiguration';
import { PointsConfiguration } from '../common/PointsConfiguration';
import GeneralConfiguration from './GeneralConfiguration';
import { BonusRulesConfiguration } from '../common/BonusRulesConfiguration';

import type { LeagueManagementProps, BonusRule, LineupStrategy, LineupRule } from '../../types/index';

export const LeagueManagement: React.FC<LeagueManagementProps> = ({ onBack, onViewLeague }) => {
  const { t } = useTranslation();
  const [leagues, setLeagues] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    defaultHandicapBasis: number;
    useHandicap: boolean;
    handicapPercentage: number;
    defaultPlayersPerTeam: number;
    defaultMatchesPerGame: number;
    defaultNumberOfTeams: number;
    defaultNumberOfRounds: number;
    dayOfWeek: string;
    lineupStrategy: LineupStrategy;
    lineupRule: LineupRule;
    bonusRules: BonusRule[];
    teamAllPresentBonusEnabled: boolean;
    teamAllPresentBonusPoints: number;
    playerMatchPointsPerWin: number;
    teamMatchPointsPerWin: number;
    teamGamePointsPerWin: number;
    active: boolean;
  }>({
    name: '',
    description: '',
    defaultHandicapBasis: DEFAULT_HANDICAP_BASIS,
    useHandicap: DEFAULT_USE_HANDICAP,
    handicapPercentage: DEFAULT_HANDICAP_PERCENTAGE,
    defaultPlayersPerTeam: DEFAULT_PLAYERS_PER_TEAM,
    defaultMatchesPerGame: DEFAULT_MATCHES_PER_GAME,
    defaultNumberOfTeams: DEFAULT_NUMBER_OF_TEAMS,
    defaultNumberOfRounds: DEFAULT_NUMBER_OF_ROUNDS,
    dayOfWeek: '',
    lineupStrategy: 'flexible',
    lineupRule: 'standard',
    bonusRules: [],
    teamAllPresentBonusEnabled: false,
    teamAllPresentBonusPoints: 1,
    playerMatchPointsPerWin: DEFAULT_PLAYER_MATCH_POINTS,
    teamMatchPointsPerWin: DEFAULT_TEAM_MATCH_POINTS,
    teamGamePointsPerWin: DEFAULT_TEAM_GAME_POINTS,
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
      defaultHandicapBasis: DEFAULT_HANDICAP_BASIS,
      useHandicap: DEFAULT_USE_HANDICAP,
      handicapPercentage: DEFAULT_HANDICAP_PERCENTAGE,
      defaultPlayersPerTeam: DEFAULT_PLAYERS_PER_TEAM,
      defaultMatchesPerGame: DEFAULT_MATCHES_PER_GAME,
      defaultNumberOfTeams: DEFAULT_NUMBER_OF_TEAMS,
      defaultNumberOfRounds: DEFAULT_NUMBER_OF_ROUNDS,
      dayOfWeek: '',
      lineupStrategy: 'flexible',
      lineupRule: 'standard',
      bonusRules: [],
      teamAllPresentBonusEnabled: false,
      teamAllPresentBonusPoints: 1,
      playerMatchPointsPerWin: DEFAULT_PLAYER_MATCH_POINTS,
      teamMatchPointsPerWin: DEFAULT_TEAM_MATCH_POINTS,
      teamGamePointsPerWin: DEFAULT_TEAM_GAME_POINTS,
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
      useHandicap: league.useHandicap !== undefined ? league.useHandicap : DEFAULT_USE_HANDICAP,
      handicapPercentage: league.handicapPercentage || DEFAULT_HANDICAP_PERCENTAGE,
      defaultPlayersPerTeam: league.defaultPlayersPerTeam || DEFAULT_PLAYERS_PER_TEAM,
      defaultMatchesPerGame: league.defaultMatchesPerGame || DEFAULT_MATCHES_PER_GAME,
      defaultNumberOfTeams: league.defaultNumberOfTeams || DEFAULT_NUMBER_OF_TEAMS,
      defaultNumberOfRounds: league.defaultNumberOfRounds || DEFAULT_NUMBER_OF_ROUNDS,
      dayOfWeek: league.dayOfWeek || '',
      lineupStrategy: (league.lineupStrategy || 'flexible') as LineupStrategy,
      lineupRule: (league.lineupRule || 'standard') as LineupRule,
      bonusRules: league.bonusRules || [],
      teamAllPresentBonusEnabled: league.teamAllPresentBonusEnabled || false,
      teamAllPresentBonusPoints: league.teamAllPresentBonusPoints || 1,
      playerMatchPointsPerWin: league.playerMatchPointsPerWin || DEFAULT_PLAYER_MATCH_POINTS,
      teamMatchPointsPerWin: league.teamMatchPointsPerWin || DEFAULT_TEAM_MATCH_POINTS,
      teamGamePointsPerWin: league.teamGamePointsPerWin || DEFAULT_TEAM_GAME_POINTS,
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
      
      let message = `${t('leagues.cannotDelete')} "${league?.name}" (${seasons.length}):\n\n`;
      if (activeSeasons.length > 0) {
        message += `• ${activeSeasons.length} ${t('seasons.activeSeasons')}\n`;
      }
      message += `\n${t('leagues.completeOrDelete')}`;
      
      alert(message);
      return;
    }
    
    if (confirm(`${t('leagues.deleteConfirm')} "${league?.name}"?\n\n${t('common.deleteWarning')}`)) {
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
      defaultHandicapBasis: DEFAULT_HANDICAP_BASIS,
      useHandicap: DEFAULT_USE_HANDICAP,
      handicapPercentage: DEFAULT_HANDICAP_PERCENTAGE,
      defaultPlayersPerTeam: DEFAULT_PLAYERS_PER_TEAM,
      defaultMatchesPerGame: DEFAULT_MATCHES_PER_GAME,
      defaultNumberOfTeams: DEFAULT_NUMBER_OF_TEAMS,
      defaultNumberOfRounds: DEFAULT_NUMBER_OF_ROUNDS,
      dayOfWeek: '',
      lineupStrategy: 'flexible',
      lineupRule: 'standard',
      bonusRules: [],
      teamAllPresentBonusEnabled: false,
      teamAllPresentBonusPoints: 1,
      playerMatchPointsPerWin: DEFAULT_PLAYER_MATCH_POINTS,
      teamMatchPointsPerWin: DEFAULT_TEAM_MATCH_POINTS,
      teamGamePointsPerWin: DEFAULT_TEAM_GAME_POINTS,
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
            <p className="text-gray-600">{t('leagues.totalLeagues').replace('{{count}}', String(leagues.length))}</p>
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
            {editingId ? t('leagues.editLeague') : t('leagues.createLeague')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Title & Description */}
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

            {/* General Configurations */}
            <GeneralConfiguration
              numberOfTeams={formData.defaultNumberOfTeams}
              playersPerTeam={formData.defaultPlayersPerTeam}
              numberOfRounds={formData.defaultNumberOfRounds}
              matchesPerGame={formData.defaultMatchesPerGame}
              dayOfWeek={formData.dayOfWeek}
              onNumberOfTeamsChange={value => setFormData({ ...formData, defaultNumberOfTeams: value })}
              onPlayersPerTeamChange={value => setFormData({ ...formData, defaultPlayersPerTeam: value })}
              onNumberOfRoundsChange={value => setFormData({ ...formData, defaultNumberOfRounds: value })}
              onMatchesPerGameChange={value => setFormData({ ...formData, defaultMatchesPerGame: value })}
              onDayOfWeekChange={value => setFormData({ ...formData, dayOfWeek: value })}
            />

            {/* Player Matchup Configuration Section */}
            <PlayerMatchupConfiguration
              lineupStrategy={formData.lineupStrategy}
              lineupRule={formData.lineupRule}
              onLineupStrategyChange={value => setFormData({ ...formData, lineupStrategy: value as LineupStrategy })}
              onLineupRuleChange={value => setFormData({ ...formData, lineupRule: value as LineupRule })}
            />

            {/* Point Configuration Section */}
            <PointsConfiguration
              playerMatchPointsPerWin={formData.playerMatchPointsPerWin}
              teamMatchPointsPerWin={formData.teamMatchPointsPerWin}
              teamGamePointsPerWin={formData.teamGamePointsPerWin}
              onPlayerMatchPointsPerWinChange={value => setFormData({ ...formData, playerMatchPointsPerWin: value })}
              onTeamMatchPointsPerWinChange={value => setFormData({ ...formData, teamMatchPointsPerWin: value })}
              onTeamGamePointsPerWinChange={value => setFormData({ ...formData, teamGamePointsPerWin: value })}
            />

            {/* Handicap Configuration Section */}
            <HandicapConfigurationForm
              useHandicap={formData.useHandicap}
              handicapBasis={formData.defaultHandicapBasis}
              handicapPercentage={formData.handicapPercentage}
              onUseHandicapChange={(value: boolean) => setFormData({ ...formData, useHandicap: value })}
              onHandicapBasisChange={(value: number) => setFormData({ ...formData, defaultHandicapBasis: value })}
              onHandicapPercentageChange={(value: number) => setFormData({ ...formData, handicapPercentage: value })}
              basisFieldName="defaultHandicapBasis"
              showDescription={true}
            />

            {/* Bonus Rules Configuration Section */}
            <div className="border-t pt-4 mt-4">
              <BonusRulesConfiguration
                bonusRules={formData.bonusRules}
                teamAllPresentBonusEnabled={formData.teamAllPresentBonusEnabled}
                teamAllPresentBonusPoints={formData.teamAllPresentBonusPoints}
                onBonusRulesChange={rules => setFormData({ ...formData, bonusRules: rules })}
                onTeamAllPresentBonusEnabledChange={enabled => setFormData({ ...formData, teamAllPresentBonusEnabled: enabled })}
                onTeamAllPresentBonusPointsChange={points => setFormData({ ...formData, teamAllPresentBonusPoints: points })}
                disabled={false}
              />
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
                        {league.dayOfWeek && <span>📅 {t(`days.${league.dayOfWeek.toLowerCase()}Plural`)}</span>}
                        <span>📊 {t('leagues.handicap.use')}: <span className="ltr-content">{league.useHandicap !== false ? `${league.defaultHandicapBasis} (${league.handicapPercentage || 100}%)` : t('leagues.handicap.disabled')}</span></span>
                        <span>👥 <span className="ltr-content">{league.defaultPlayersPerTeam}</span> {t('leagues.playersPerTeam')}</span>
                        <span>🎳 <span className="ltr-content">{seasons.length}</span> {seasons.length === 1 ? t('leagues.season') : t('leagues.seasons')}</span>
                      </div>
                      {activeSeason && (
                        <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {t('common.active')}: {activeSeason.name}
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
                        {league.dayOfWeek && <span>{t(`days.${league.dayOfWeek.toLowerCase()}Plural`)} • </span>}
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
