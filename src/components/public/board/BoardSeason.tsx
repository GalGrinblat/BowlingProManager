import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { boardApi } from '../../../services/api/boardApi';
import { calculateTeamStandings, calculatePlayerSeasonStats } from '../../../utils/standingsUtils';
import { calculateSeasonRecords } from '../../../utils/recordsUtils';
import { useTranslation } from '../../../contexts/LanguageContext';
import { useDateFormat } from '../../../hooks/useDateFormat';
import { TeamStandingsTable } from '../../admin/config/TeamStandingsTable';
import { PlayerStandingsTable } from '../../admin/config/PlayerStandingsTable';
import { ChampionBanner } from '../../admin/season/ChampionBanner';
import { SeasonProgressBar } from '../../admin/season/SeasonProgressBar';
import { ViewTabs } from '../../admin/season/ViewTabs';
import { ScheduleView } from '../../admin/season/ScheduleView';
import { HeadToHeadView } from '../../admin/season/HeadToHeadView';
import { SeasonRecordsView } from '../../admin/season/SeasonRecordsView';
import type { Season, League, Team, Game, GameMatch } from '../../../types/index';

export const BoardSeason: React.FC = () => {
  const navigate = useNavigate();
  const { seasonId } = useParams<{ seasonId: string }>();
  const { t, direction } = useTranslation();
  const { formatDate } = useDateFormat();

  const [season, setSeason] = useState<Season | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [view, setView] = useState('schedule');
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedMatchDay, setSelectedMatchDay] = useState<number | null>(null);
  const [standingsFilter, setStandingsFilter] = useState<{ round: number; matchDay: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!seasonId) return;
    let cancelled = false;

    const load = async () => {
      const seasonData = await boardApi.getSeasonById(seasonId);
      if (!seasonData || cancelled) return;
      setSeason(seasonData);

      const [leagueData, teamsData, gamesData] = await Promise.all([
        boardApi.getLeagueById(seasonData.leagueId),
        boardApi.getTeamsBySeason(seasonId),
        boardApi.getGamesBySeason(seasonId),
      ]);

      if (cancelled) return;
      setLeague(leagueData);
      setTeams(teamsData);
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

      setIsLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [seasonId]);

  // ── Standings computations (mirrored from SeasonDetail) ──────────────────
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
    if (games.filter(g => !lastIds.has(g.id) && g.status === 'completed').length === 0) return new Map();
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
      const team1Name = teams.find(tt => tt.id === game.team1Id)?.name || game.team1Id;
      const team2Name = teams.find(tt => tt.id === game.team2Id)?.name || game.team2Id;
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
    if (games.filter(g => !lastIds.has(g.id) && g.status === 'completed').length === 0) return new Map();
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
    const result: { round: number; matchDay: number }[] = [];
    games.filter(g => g.status === 'completed').forEach(g => {
      const key = `${g.round}-${g.matchDay}`;
      if (!seen.has(key)) { seen.add(key); result.push({ round: g.round, matchDay: g.matchDay }); }
    });
    return result.sort((a, b) => a.round !== b.round ? a.round - b.round : a.matchDay - b.matchDay);
  }, [games]);

  const standingsGames = useMemo(() => {
    if (!standingsFilter) return games;
    const { round: r, matchDay: md } = standingsFilter;
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

  // ── Derived display values ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!season || !league) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
        {t('common.loading')}
      </div>
    );
  }

  const totalGames = games.length;
  const completedGames = games.filter(g => g.status === 'completed').length;
  const progressPercent = totalGames > 0 ? (completedGames / totalGames) * 100 : 0;
  const isCompleted = season.status === 'completed';
  const champion = isCompleted && teamStandings.length > 0 ? teamStandings[0] : null;

  const hasMultipleRounds = season.seasonConfigurations.numberOfRounds > 1;
  const getMatchDayLabel = (round: number, matchDay: number) =>
    hasMultipleRounds
      ? t('seasons.afterRoundMatchDay').replace('{{round}}', String(round)).replace('{{matchDay}}', String(matchDay))
      : t('seasons.afterMatchDay').replace('{{matchDay}}', String(matchDay));
  const getStandingsTitle = (base: string) =>
    standingsFilter ? `${base} – ${getMatchDayLabel(standingsFilter.round, standingsFilter.matchDay)}` : base;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/board" className="text-blue-600 hover:text-blue-700 font-semibold">
          {t('board.allLeagues')}
        </Link>
        <span className="text-gray-400">›</span>
        <Link to={`/board/leagues/${league.id}`} className="text-blue-600 hover:text-blue-700 font-semibold">
          {league.name}
        </Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-600">{season.name}</span>
      </div>

      {/* Season header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-800">{season.name}</h2>
              {season.status === 'active' && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  {t('board.activeSeason')}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {league.name} · {formatDate(season.startDate)} – {formatDate(season.endDate)}
            </p>
            {season.updatedAt && (
              <p className="text-gray-400 text-xs mt-1">
                {t('board.lastUpdated').replace('{{date}}', formatDate(season.updatedAt))}
              </p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {t('seasons.gamesComplete').replace('{{completed}}', String(completedGames)).replace('{{total}}', String(totalGames))}
          </div>
        </div>
      </div>

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
          onViewGame={(gameId) => navigate(`/board/games/${gameId}`)}
          readOnly
        />
      )}

      {view === 'teamStandings' && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-bold text-gray-800">{getStandingsTitle(t('seasons.teamStandings'))}</h2>
            {completedMatchDayEvents.length > 0 && (
              <select
                value={standingsFilter ? `${standingsFilter.round}-${standingsFilter.matchDay}` : ''}
                onChange={(e) => {
                  if (!e.target.value) {
                    setStandingsFilter(null);
                  } else {
                    const [roundStr, matchDayStr] = e.target.value.split('-');
                    setStandingsFilter({ round: Number(roundStr), matchDay: Number(matchDayStr) });
                  }
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">{t('seasons.currentStandings')}</option>
                {completedMatchDayEvents.map(({ round, matchDay }) => (
                  <option key={`${round}-${matchDay}`} value={`${round}-${matchDay}`}>
                    {getMatchDayLabel(round, matchDay)}
                  </option>
                ))}
              </select>
            )}
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
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-bold text-gray-800">{getStandingsTitle(t('seasons.playerStandings'))}</h2>
              {completedMatchDayEvents.length > 0 && (
                <select
                  value={standingsFilter ? `${standingsFilter.round}-${standingsFilter.matchDay}` : ''}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setStandingsFilter(null);
                    } else {
                      const [roundStr, matchDayStr] = e.target.value.split('-');
                      setStandingsFilter({ round: Number(roundStr), matchDay: Number(matchDayStr) });
                    }
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">{t('seasons.currentStandings')}</option>
                  {completedMatchDayEvents.map(({ round, matchDay }) => (
                    <option key={`${round}-${matchDay}`} value={`${round}-${matchDay}`}>
                      {getMatchDayLabel(round, matchDay)}
                    </option>
                  ))}
                </select>
              )}
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
    </div>
  );
};
