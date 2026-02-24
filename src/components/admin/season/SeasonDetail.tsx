import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { seasonsApi, teamsApi, gamesApi, leaguesApi } from '../../../services/api';
import { calculateTeamStandings, calculatePlayerSeasonStats } from '../../../utils/standingsUtils';
import type { GameMatch } from '../../../types/index';
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

import type { Season, League, Team, Game } from '../../../types/index';

export const SeasonDetail: React.FC = () => {
  const navigate = useNavigate();
  const { seasonId } = useParams<{ seasonId: string }>();
  const { t, direction } = useTranslation();
  const [season, setSeason] = useState<Season | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [view, setView] = useState('schedule');
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedMatchDay, setSelectedMatchDay] = useState<number | null>(null);
  const [standingsFilter, setStandingsFilter] = useState<{round: number, matchDay: number} | null>(null);
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
  const [showPrintTeamStandings, setShowPrintTeamStandings] = useState(false);
  const [showPrintPlayerStandings, setShowPrintPlayerStandings] = useState(false);
  const [postponeWeeks, setPostponeWeeks] = useState(1);

  const loadSeasonData = async () => {
    const seasonData = await seasonsApi.getById(seasonId!);
    setSeason(seasonData ?? null);
    if (!seasonData) return;
    const leagueData = await leaguesApi.getById(seasonData.leagueId);
    setLeague(leagueData ?? null);

    const teamsData = await teamsApi.getBySeason(seasonId!);
    setTeams(teamsData);

    const gamesData = await gamesApi.getBySeason(seasonId!);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonId]);

  const handleCompleteSeason = async () => {
    const incompleteGames = games.filter(g => g.status !== 'completed');
    if (incompleteGames.length > 0) {
      alert(t('seasons.cannotCompleteIncomplete').replace('{{count}}', String(incompleteGames.length)));
      return;
    }
    if (confirm(t('seasons.confirmComplete'))) {
      await seasonsApi.update(seasonId!, { status: 'completed' });
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
      await seasonsApi.update(seasonId!, { schedule: updatedSchedule });
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
    const exportData = await exportSeason(seasonId!);
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

  const lastCompletedMatchDayInfo = useMemo(() => {
    const completed = games.filter(g => g.status === 'completed');
    if (completed.length === 0) return null;
    const maxRound = Math.max(...completed.map(g => g.round));
    const maxMatchDay = Math.max(...completed.filter(g => g.round === maxRound).map(g => g.matchDay));
    return { round: maxRound, matchDay: maxMatchDay };
  }, [games]);

  const lastMatchdayGames = useMemo(() => {
    if (!lastCompletedMatchDayInfo) return [];
    return games.filter(g =>
      g.status === 'completed' &&
      g.round === lastCompletedMatchDayInfo.round &&
      g.matchDay === lastCompletedMatchDayInfo.matchDay
    );
  }, [games, lastCompletedMatchDayInfo]);

  const previousTeamRanks = useMemo((): Map<string, number> => {
    const lastIds = new Set(lastMatchdayGames.map(g => g.id));
    const prevCompleted = games.filter(g => !lastIds.has(g.id) && g.status === 'completed');
    if (prevCompleted.length === 0) return new Map();
    const prevStandings = calculateTeamStandings(teams, games.filter(g => !lastIds.has(g.id)));
    const map = new Map<string, number>();
    prevStandings.forEach((s, idx) => map.set(s.teamId, idx + 1));
    return map;
  }, [teams, games, lastMatchdayGames]);

  const lastMatchdayTeamResults = useMemo((): Map<string, { result: 'W' | 'L' | 'D'; ownPoints: number; opponentPoints: number; opponentName: string }> => {
    const map = new Map<string, { result: 'W' | 'L' | 'D'; ownPoints: number; opponentPoints: number; opponentName: string }>();
    lastMatchdayGames.forEach(game => {
      const t1Points = (game.matches?.reduce((sum, m: GameMatch) => sum + (m.team1?.points || 0), 0) || 0) + (game.grandTotalPoints?.team1 || 0);
      const t2Points = (game.matches?.reduce((sum, m: GameMatch) => sum + (m.team2?.points || 0), 0) || 0) + (game.grandTotalPoints?.team2 || 0);
      const team1Name = teams.find(t => t.id === game.team1Id)?.name || game.team1Id;
      const team2Name = teams.find(t => t.id === game.team2Id)?.name || game.team2Id;
      let r1: 'W' | 'L' | 'D', r2: 'W' | 'L' | 'D';
      if (t1Points > t2Points) { r1 = 'W'; r2 = 'L'; }
      else if (t2Points > t1Points) { r1 = 'L'; r2 = 'W'; }
      else { r1 = 'D'; r2 = 'D'; }
      map.set(game.team1Id, { result: r1, ownPoints: t1Points, opponentPoints: t2Points, opponentName: team2Name });
      map.set(game.team2Id, { result: r2, ownPoints: t2Points, opponentPoints: t1Points, opponentName: team1Name });
    });
    return map;
  }, [lastMatchdayGames, teams]);

  const previousPlayerRanks = useMemo((): Map<string, number> => {
    const lastIds = new Set(lastMatchdayGames.map(g => g.id));
    const prevCompleted = games.filter(g => !lastIds.has(g.id) && g.status === 'completed');
    if (prevCompleted.length === 0) return new Map();
    const prevStats = calculatePlayerSeasonStats(teams, games.filter(g => !lastIds.has(g.id)));
    const map = new Map<string, number>();
    prevStats.forEach((ps, idx) => map.set(`${ps.teamId}-${ps.playerName}`, idx + 1));
    return map;
  }, [teams, games, lastMatchdayGames]);

  const lastMatchdayPlayerPins = useMemo((): Map<string, number[]> => {
    const map = new Map<string, number[]>();
    lastMatchdayGames.forEach(game => {
      (['team1', 'team2'] as const).forEach(teamKey => {
        const gameTeam = game[teamKey];
        if (!gameTeam) return;
        const teamId = teamKey === 'team1' ? game.team1Id : game.team2Id;
        gameTeam.players.forEach((player, idx) => {
          if (player.absent) return;
          const matchScores: number[] = (game.matches ?? []).map((m: GameMatch) =>
            parseInt(m[teamKey]?.players[idx]?.pins || '') || 0
          );
          if (matchScores.some(p => p > 0)) map.set(`${teamId}-${player.name}`, matchScores);
        });
      });
    });
    return map;
  }, [lastMatchdayGames]);

  const teamCompletedGameCount = useMemo((): Map<string, number> => {
    const map = new Map<string, number>();
    games.filter(g => g.status === 'completed').forEach(game => {
      map.set(game.team1Id, (map.get(game.team1Id) || 0) + game.matchesPerGame);
      map.set(game.team2Id, (map.get(game.team2Id) || 0) + game.matchesPerGame);
    });
    return map;
  }, [games]);

  const completedMatchDayEvents = useMemo(() => {
    const seen = new Set<string>();
    const result: {round: number, matchDay: number}[] = [];
    games.filter(g => g.status === 'completed').forEach(g => {
      const key = `${g.round}-${g.matchDay}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({round: g.round, matchDay: g.matchDay});
      }
    });
    return result.sort((a, b) => a.round !== b.round ? a.round - b.round : a.matchDay - b.matchDay);
  }, [games]);

  const standingsGames = useMemo(() => {
    if (!standingsFilter) return games;
    const {round: r, matchDay: md} = standingsFilter;
    return games.filter(g =>
      g.status === 'completed' &&
      (g.round < r || (g.round === r && g.matchDay <= md))
    );
  }, [games, standingsFilter]);

  const filteredTeamStandings = useMemo(
    () => standingsFilter ? calculateTeamStandings(teams, standingsGames) : teamStandings,
    [standingsFilter, teamStandings, teams, standingsGames]
  );

  const filteredPlayerStats = useMemo(
    () => standingsFilter ? calculatePlayerSeasonStats(teams, standingsGames) : playerStats,
    [standingsFilter, playerStats, teams, standingsGames]
  );

  const totalGames = games.length;
  const completedGames = games.filter(g => g.status === 'completed').length;
  const progressPercent = totalGames > 0 ? (completedGames / totalGames) * 100 : 0;
  const isCompleted = season?.status === 'completed';
  const champion = isCompleted && teamStandings.length > 0 ? teamStandings[0] : null;

  if (!season || !league) return <div>{t('seasons.loading')}</div>;

  const hasMultipleRounds = season.seasonConfigurations.numberOfRounds > 1;
  const getMatchDayLabel = (round: number, matchDay: number) =>
    hasMultipleRounds
      ? t('seasons.afterRoundMatchDay').replace('{{round}}', String(round)).replace('{{matchDay}}', String(matchDay))
      : t('seasons.afterMatchDay').replace('{{matchDay}}', String(matchDay));
  const getStandingsTitle = (base: string) =>
    standingsFilter ? `${base} – ${getMatchDayLabel(standingsFilter.round, standingsFilter.matchDay)}` : base;

  return (
    <div className="space-y-6">
      <SeasonHeader
        season={season}
        league={league}
        teams={teams}
        completedGames={completedGames}
        totalGames={totalGames}
        selectedRound={selectedRound}
        onBack={() => navigate(`/admin/leagues/${season.leagueId}`)}
        onManageTeams={() => navigate(`/admin/seasons/${seasonId}/teams`)}
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
          onPlayGame={(gameId) => navigate(`/admin/games/${gameId}/play`)}
          onViewGame={(gameId, game) => navigate(`/admin/games/${gameId}`, { state: { game } })}
        />
      )}

      {view === 'teamStandings' && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">{getStandingsTitle(t('seasons.teamStandings'))}</h2>
            <div className="flex items-center gap-2">
              {completedMatchDayEvents.length > 0 && (
                <select
                  value={standingsFilter ? `${standingsFilter.round}-${standingsFilter.matchDay}` : ''}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setStandingsFilter(null);
                    } else {
                      const [roundStr, matchDayStr] = e.target.value.split('-');
                      setStandingsFilter({round: Number(roundStr), matchDay: Number(matchDayStr)});
                    }
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">{t('seasons.currentStandings')}</option>
                  {completedMatchDayEvents.map(({round, matchDay}) => (
                    <option key={`${round}-${matchDay}`} value={`${round}-${matchDay}`}>
                      {getMatchDayLabel(round, matchDay)}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setShowPrintTeamStandings(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
              >
                🖨️ {t('common.print')}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <TeamStandingsTable
              standings={filteredTeamStandings}
              direction={direction}
              t={t}
              previousRanks={standingsFilter ? new Map() : previousTeamRanks}
              lastResults={standingsFilter ? new Map() : lastMatchdayTeamResults}
            />
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
              <h2 className="text-xl font-bold text-gray-800">{getStandingsTitle(t('seasons.playerStandings'))}</h2>
              <div className="flex items-center gap-2">
                {completedMatchDayEvents.length > 0 && (
                  <select
                    value={standingsFilter ? `${standingsFilter.round}-${standingsFilter.matchDay}` : ''}
                    onChange={(e) => {
                      if (!e.target.value) {
                        setStandingsFilter(null);
                      } else {
                        const [roundStr, matchDayStr] = e.target.value.split('-');
                        setStandingsFilter({round: Number(roundStr), matchDay: Number(matchDayStr)});
                      }
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">{t('seasons.currentStandings')}</option>
                    {completedMatchDayEvents.map(({round, matchDay}) => (
                      <option key={`${round}-${matchDay}`} value={`${round}-${matchDay}`}>
                        {getMatchDayLabel(round, matchDay)}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => setShowPrintPlayerStandings(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
                >
                  🖨️ {t('common.print')}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <PlayerStandingsTable
                playerStats={filteredPlayerStats}
                direction={direction}
                t={t}
                previousRanks={standingsFilter ? new Map() : previousPlayerRanks}
                lastMatchdayPins={standingsFilter ? new Map() : lastMatchdayPlayerPins}
                teamCompletedGameCount={teamCompletedGameCount}
              />
            </div>
          </div>
        </div>
      )}

      {showPrintModal && selectedMatchDay && (
        <PrintMatchDay seasonId={seasonId!} matchDay={selectedMatchDay} onClose={() => setShowPrintModal(false)} />
      )}
      {showPrintOptionsModal && selectedMatchDay && (
        <PrintMatchDayOptions seasonId={seasonId!} matchDay={selectedMatchDay} onClose={() => setShowPrintOptionsModal(false)} />
      )}
      {showPrintTeamStandings && (
        <PrintTeamStandings seasonId={seasonId!} onClose={() => setShowPrintTeamStandings(false)} />
      )}
      {showPrintPlayerStandings && (
        <PrintPlayerStandings seasonId={seasonId!} onClose={() => setShowPrintPlayerStandings(false)} />
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
