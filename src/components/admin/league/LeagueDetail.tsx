import React, { useState, useEffect, useRef } from 'react';
import { leaguesApi, seasonsApi, teamsApi, gamesApi } from '../../../services/api';
import { calculateTeamStandings } from '../../../utils/standingsUtils';
import { useTranslation } from '../../../contexts/LanguageContext';
import { useDateFormat } from '../../../hooks/useDateFormat';
import { exportLeague, downloadExportFile, readImportFile, importLeagueOrSeason } from '../../../utils/leagueImportExportUtils';

import type { LeagueDetailProps, League, Season, Team } from '../../../types/index';

export const LeagueDetail: React.FC<LeagueDetailProps> = ({ leagueId, onBack, onViewSeason, onCreateSeason, onRefreshData }) => {
  const { t } = useTranslation();
  const { formatDate } = useDateFormat();
  const [league, setLeague] = useState<League | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonStandings, setSeasonStandings] = useState<Record<string, any[]>>({});
  const [seasonTeams, setSeasonTeams] = useState<Record<string, Team[]>>({});
  const [seasonGames, setSeasonGames] = useState<Record<string, any[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLeagueData();
  }, [leagueId]);

  const loadLeagueData = async () => {
    const leagueData = await leaguesApi.getById(leagueId);
    if (!leagueData) {
      return;
    }
    setLeague(leagueData);
    const seasonsData = await seasonsApi.getByLeague(leagueId);
    setSeasons(seasonsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    // Preload data for completed seasons
    const standingsData: Record<string, any[]> = {};
    const teamsData: Record<string, Team[]> = {};
    const gamesData: Record<string, any[]> = {};

    for (const season of seasonsData.filter(s => s.status === 'completed')) {
      const teams = await teamsApi.getBySeason(season.id);
      const games = await gamesApi.getBySeason(season.id);
      const standings = calculateTeamStandings(teams, games);

      standingsData[season.id] = standings;
      teamsData[season.id] = teams;
      gamesData[season.id] = games;
    }

    setSeasonStandings(standingsData);
    setSeasonTeams(teamsData);
    setSeasonGames(gamesData);
  };

  const activeSeason = seasons.find(s => s.status === 'active');
  const completedSeasons = seasons.filter(s => s.status === 'completed');

  const handleExportLeague = async () => {
    const exportData = await exportLeague(leagueId);
    if (exportData) {
      const filename = `${league?.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      downloadExportFile(exportData, filename);
      alert(t('leagues.exportSuccess'));
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importData = await readImportFile(file);
      const result = await importLeagueOrSeason(importData);

      if (result.success) {
        alert(t('leagues.importSuccess'));
        await onRefreshData?.();
        await loadLeagueData();
      } else {
        alert(`${t('leagues.importError')}: ${result.error}`);
      }
    } catch (error) {
      alert(`${t('leagues.importError')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!league) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            {t('common.leftArrow')} {t('leagues.backToLeagues')}
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">{t('leagues.leagueNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{league.name}</h1>
            {league.description && (
              <p className="text-gray-600">{league.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              {t('common.leftArrow')} {t('leagues.backToLeagues')}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onCreateSeason(leagueId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                + {t('seasons.createSeason')}
              </button>
              <button
                onClick={handleExportLeague}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                title={t('leagues.exportLeagueDesc')}
              >
                📥 {t('leagues.exportLeague')}
              </button>
              <button
                onClick={handleImportClick}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                title={t('leagues.importLeagueDesc')}
              >
                📤 {t('leagues.importLeague')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          {league.dayOfWeek && <span>📅 {t(`days.${league.dayOfWeek.toLowerCase()}Plural`)}</span>}
          <span>👥 <span className="ltr-content">{league.defaultSeasonConfigurations.playersPerTeam}</span> {t('leagues.playersPerTeam')}</span>
          <span>🎳 <span className="ltr-content">{league.defaultSeasonConfigurations.matchesPerGame || 3}</span> {t('leagues.matchesPerGame')}</span>
          {league.defaultSeasonConfigurations.useHandicap && <span>⚖️ {t('leagues.handicapDisplay').replace('{{percentage}}', String(league.defaultSeasonConfigurations.handicapPercentage || 100)).replace('{{basis}}', String(league.defaultSeasonConfigurations.handicapBasis))}</span>}
        </div>
      </div>

      {/* Active Season */}
      {activeSeason && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold mb-1">{t('common.active').toUpperCase()}</div>
              <h2 className="text-2xl font-bold mb-2">{activeSeason.name}</h2>
              <div className="flex gap-4 text-sm">
                <span>🏆 <span className="ltr-content">{activeSeason.seasonConfigurations.numberOfTeams}</span> {t('leagues.teams')}</span>
                <span>🔄 <span className="ltr-content">{activeSeason.seasonConfigurations.numberOfRounds}</span> {activeSeason.seasonConfigurations.numberOfRounds !== 1 ? t('leagues.rounds') : t('common.round')}</span>
                <span>👥 <span className="ltr-content">{activeSeason.seasonConfigurations.playersPerTeam}</span> {t('leagues.playersPerTeam')}</span>
              </div>
            </div>
            <button
              onClick={() => onViewSeason(activeSeason.id)}
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 font-semibold"
            >
              {t('seasons.viewSeason')} {t('common.rightArrow')}
            </button>
          </div>
        </div>
      )}

      {/* Completed Seasons */}
      {completedSeasons.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('seasons.seasonArchives')}</h2>
          <div className="space-y-3">
            {completedSeasons.map(season => {
              // Get preloaded data
              const standings = seasonStandings[season.id] || [];
              const champion = standings[0];
              const teams = seasonTeams[season.id] || [];
              const games = seasonGames[season.id] || [];

              return (
                <div
                  key={season.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer"
                  onClick={() => onViewSeason(season.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{season.name}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          {t('seasons.completed').toUpperCase()}
                        </span>
                      </div>
                      {champion && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-500 text-xl">🏆</span>
                          <span className="font-semibold text-purple-600">{champion.teamName}</span>
                          <span className="text-sm text-gray-500">• {champion.points} points</span>
                        </div>
                      )}
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>👥 <span className="ltr-content">{teams.length}</span> {t('leagues.teams')}</span>
                        <span>🎳 <span className="ltr-content">{games.length}</span> {t('leagues.games')}</span>
                        <span>📅 <span className="ltr-content">{formatDate(season.startDate)}</span></span>
                        {season.updatedAt && (
                          <span>✓ {formatDate(season.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {seasons.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('seasons.noSeasonsYet')}</h3>
          <p className="text-gray-600 mb-6">{t('seasons.createFirstSeason')}</p>
        </div>
      )}
    </div>
  );
};
