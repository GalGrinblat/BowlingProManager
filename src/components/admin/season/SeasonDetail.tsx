import React, { useState, useEffect, useMemo } from 'react';
import { seasonsApi, teamsApi, gamesApi, leaguesApi } from '../../../services/api';
import { calculateTeamStandings, calculatePlayerSeasonStats } from '../../../utils/standingsUtils';
import { postponeMatchDay } from '../../../utils/scheduleUtils';
import { calculateSeasonRecords } from '../../../utils/recordsUtils';
import { useTranslation } from '../../../contexts/LanguageContext';
import { exportSeason, downloadExportFile, readImportFile, importLeagueOrSeason } from '../../../utils/leagueImportExportUtils';
import { PrintMatchDay } from '../print/PrintMatchDay';
import { PrintMatchDayOptions } from '../print/PrintMatchDayOptions';
import { PrintTeamStandings } from '../print/PrintTeamStandings';
import { PrintPlayerStandings } from '../print/PrintPlayerStandings';
import { TeamStandingsTable } from '../shared/TeamStandingsTable';
import { PlayerStandingsTable } from '../shared/PlayerStandingsTable';
import { SeasonHeader } from './SeasonHeader';
import { ChampionBanner } from './ChampionBanner';
import { SeasonProgressBar } from './SeasonProgressBar';
import { ViewTabs } from './ViewTabs';
import { ScheduleView } from './ScheduleView';
import { HeadToHeadView } from './HeadToHeadView';
import { SeasonRecordsView } from './SeasonRecordsView';
import { PostponeModal } from './PostponeModal';

import type { SeasonDetailProps } from '../../../types/index';
import type { Season, League, Team, Game } from '../../../types/index';

export const SeasonDetail: React.FC<SeasonDetailProps> = ({ seasonId, onBack, onPlayGame, onViewGame, onManageTeams }) => {
  const { t, direction } = useTranslation();
  const [season, setSeason] = useState<Season | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [view, setView] = useState('schedule');
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedMatchDay, setSelectedMatchDay] = useState<number | null>(null);
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
  const [showPrintTeamStandings, setShowPrintTeamStandings] = useState(false);
  const [showPrintPlayerStandings, setShowPrintPlayerStandings] = useState(false);
  const [postponeWeeks, setPostponeWeeks] = useState(1);

  const loadSeasonData = async () => {
    const seasonData = await seasonsApi.getById(seasonId);
    setSeason(seasonData ?? null);
    if (!seasonData) return;
    const leagueData = await leaguesApi.getById(seasonData.leagueId);
    setLeague(leagueData ?? null);

    const teamsData = await teamsApi.getBySeason(seasonId);
    setTeams(teamsData);

    const gamesData = await gamesApi.getBySeason(seasonId);
    setGames(gamesData);

    if (gamesData.length > 0) {
      const incompleteGame = gamesData.find(g => g.status !== 'completed');
      if (incompleteGame) {
        setSelectedRound(incompleteGame.round);
        setSelectedMatchDay(incompleteGame.matchDay);
      } else {
        const maxRound = Math.max(...gamesData.map(g => g.round));
        const maxMatchDay = Math.max(...gamesData.filter(g => g.round === maxRound).map(g => g.matchDay));
        setSelectedRound(maxRound);
        setSelectedMatchDay(maxMatchDay);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await loadSeasonData();
      if (cancelled) return;
    };
    load();
    return () => { cancelled = true; };
  }, [seasonId]);

  const handleCompleteSeason = async () => {
    const incompleteGames = games.filter(g => g.status !== 'completed');
    if (incompleteGames.length > 0) {
      alert(t('seasons.cannotCompleteIncomplete').replace('{{count}}', String(incompleteGames.length)));
      return;
    }
    if (confirm(t('seasons.confirmComplete'))) {
      await seasonsApi.update(seasonId, { status: 'completed' });
      await loadSeasonData();
    }
  };

  const handlePostponeMatchDay = async () => {
    if (!league?.dayOfWeek) {
      alert(t('seasons.cannotPostponeNoDay'));
      return;
    }
    const matchDayGamesToCheck = games.filter(g => g.matchDay === selectedMatchDay);
    if (matchDayGamesToCheck.some(g => g.status === 'completed')) {
      alert(t('seasons.cannotPostponeCompleted'));
      return;
    }
    if (confirm(t('seasons.confirmPostpone').replace('{{matchDay}}', String(selectedMatchDay)).replace('{{weeks}}', String(postponeWeeks)))) {
      const updatedSchedule = postponeMatchDay(season?.schedule ?? [], selectedMatchDay ?? 1, postponeWeeks, league?.dayOfWeek ?? '');
      await seasonsApi.update(seasonId, { schedule: updatedSchedule });
      for (const daySchedule of updatedSchedule) {
        const gamesToUpdate = games.filter(g => g.matchDay === daySchedule.matchDay);
        for (const game of gamesToUpdate) {
          await gamesApi.update(game.id, {
            scheduledDate: daySchedule.date,
            postponed: daySchedule.postponed,
            originalDate: daySchedule.originalDate
          });
        }
      }
      setShowPostponeModal(false);
      setPostponeWeeks(1);
      await loadSeasonData();
    }
  };

  const handleExportSeason = async () => {
    const exportData = await exportSeason(seasonId);
    if (exportData && season) {
      const filename = `${season.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      downloadExportFile(exportData, filename);
      alert(t('seasons.exportSuccess'));
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const importData = await readImportFile(file);
      const result = await importLeagueOrSeason(importData);
      if (result.success) {
        alert(t('seasons.importSuccess'));
        window.location.reload();
      } else {
        alert(`${t('seasons.importError')}: ${result.error}`);
      }
    } catch (error) {
      alert(`${t('seasons.importError')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    if (event.target) event.target.value = '';
  };

  const teamStandings = useMemo(() => calculateTeamStandings(teams, games), [teams, games]);
  const playerStats = useMemo(() => calculatePlayerSeasonStats(teams, games), [teams, games]);
  const seasonRecords = useMemo(() => calculateSeasonRecords(teams, games), [teams, games]);

  const totalGames = games.length;
  const completedGames = games.filter(g => g.status === 'completed').length;
  const progressPercent = totalGames > 0 ? (completedGames / totalGames) * 100 : 0;
  const isCompleted = season?.status === 'completed';
  const champion = isCompleted && teamStandings.length > 0 ? teamStandings[0] : null;

  if (!season || !league) return <div>{t('seasons.loading')}</div>;

  return (
    <div className="space-y-6">
      <SeasonHeader
        season={season}
        league={league}
        teams={teams}
        completedGames={completedGames}
        totalGames={totalGames}
        selectedRound={selectedRound}
        onBack={onBack}
        onManageTeams={onManageTeams}
        onExportSeason={handleExportSeason}
        onImportFile={handleImportFile}
        onCompleteSeason={handleCompleteSeason}
      />

      {champion && <ChampionBanner champion={champion} />}

      <SeasonProgressBar progressPercent={progressPercent} />

      {isCompleted && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-semibold text-blue-800">{t('seasons.seasonArchive')}</p>
              <p className="text-sm text-blue-600">{t('seasons.seasonArchiveDesc')}</p>
            </div>
          </div>
        </div>
      )}

      <ViewTabs view={view} isCompleted={isCompleted} onViewChange={setView} />

      {view === 'schedule' && (
        <ScheduleView
          season={season}
          teams={teams}
          games={games}
          selectedRound={selectedRound}
          selectedMatchDay={selectedMatchDay}
          onRoundChange={setSelectedRound}
          onMatchDayChange={setSelectedMatchDay}
          onShowPrintOptions={() => setShowPrintOptionsModal(true)}
          onShowPostpone={() => setShowPostponeModal(true)}
          onPlayGame={onPlayGame}
          onViewGame={onViewGame}
        />
      )}

      {view === 'teamStandings' && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{t('seasons.teamStandings')}</h2>
            <button
              onClick={() => setShowPrintTeamStandings(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
            >
              🖨️ {t('common.print')}
            </button>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <TeamStandingsTable standings={teamStandings} direction={direction} t={t} />
          </div>
        </div>
      )}

      {view === 'h2h' && <HeadToHeadView teams={teams} games={games} />}

      {view === 'records' && (
        <SeasonRecordsView
          seasonRecords={seasonRecords}
          hasCompletedGames={completedGames > 0}
        />
      )}

      {view === 'playerStandings' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{t('seasons.playerStandings')} ({playerStats.length} {t('common.players').toLowerCase()})</h2>
              <button
                onClick={() => setShowPrintPlayerStandings(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
              >
                🖨️ {t('common.print')}
              </button>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <PlayerStandingsTable playerStats={playerStats} direction={direction} t={t} />
            </div>
          </div>
        </div>
      )}

      {showPrintModal && selectedMatchDay && (
        <PrintMatchDay seasonId={seasonId} matchDay={selectedMatchDay} onClose={() => setShowPrintModal(false)} />
      )}
      {showPrintOptionsModal && selectedMatchDay && (
        <PrintMatchDayOptions seasonId={seasonId} matchDay={selectedMatchDay} onClose={() => setShowPrintOptionsModal(false)} />
      )}
      {showPrintTeamStandings && (
        <PrintTeamStandings seasonId={seasonId} onClose={() => setShowPrintTeamStandings(false)} />
      )}
      {showPrintPlayerStandings && (
        <PrintPlayerStandings seasonId={seasonId} onClose={() => setShowPrintPlayerStandings(false)} />
      )}

      {showPostponeModal && (
        <PostponeModal
          selectedMatchDay={selectedMatchDay}
          schedule={season.schedule}
          postponeWeeks={postponeWeeks}
          onPostponeWeeksChange={setPostponeWeeks}
          onConfirm={handlePostponeMatchDay}
          onCancel={() => { setShowPostponeModal(false); setPostponeWeeks(1); }}
        />
      )}
    </div>
  );
};
