import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { playersApi, leaguesApi, seasonsApi, teamsApi, gamesApi } from '../../services/api';
import { logger } from '../../utils/logger';
import { useTranslation } from '../../contexts/LanguageContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import { getPlayerDisplayName } from '../../utils/playerUtils';
import { useAuth } from '../../contexts/AuthContext';

import type { Game, GameMatch, League, Player, PlayerStats, Season, Team } from '../../types/index';

export const PlayerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { playerData } = useAuth();
  const playerId = playerData?.id ?? '';
  const { t } = useTranslation();
  const { formatDate } = useDateFormat();
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerLeagues, setPlayerLeagues] = useState<League[]>([]);
  const [recentCompletedGames, setRecentCompletedGames] = useState<Game[]>([]);
  const [view, setView] = useState('dashboard'); // dashboard, stats, leagues, history
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [gameDetailsMap, setGameDetailsMap] = useState<Record<string, { season: Season | null, league: League | null, team1: Team | undefined, team2: Team | undefined }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const playerData = await playersApi.getById(playerId);
        if (cancelled) return;
        setPlayer(playerData ?? null);

        // Find all teams this player is on
        const allTeams = await teamsApi.getAll();
        if (cancelled) return;
        const playerTeams = allTeams.filter(team => team.playerIds.includes(playerId));

        // Get unique seasons the player is in
        const seasonIds = [...new Set(playerTeams.map(t => t.seasonId))];
        const seasons = await Promise.all(seasonIds.map(id => seasonsApi.getById(id)));
        if (cancelled) return;
        const validSeasons = seasons.filter(Boolean);

        // Get leagues for those seasons
        const leagueIds = [...new Set(validSeasons.filter((s): s is Season => s !== undefined).map(s => s.leagueId))];
        const leaguesData = await Promise.all(leagueIds.map(id => leaguesApi.getById(id)));
        if (cancelled) return;
        const leagues = leaguesData
          .filter((league): league is League => !!league && typeof league.id === 'string')
          .map(league => {
            const leagueSeasons = validSeasons.filter((s): s is Season => s !== undefined && s.leagueId === league.id);
            const activeSeasons = leagueSeasons.filter((s: Season) => s.status === 'active');
            return {
              ...league,
              seasons: leagueSeasons,
              activeSeasons,
              playerTeams: playerTeams.filter(t =>
                leagueSeasons.some((s: Season) => s.id === t.seasonId)
              )
            };
          });
        setPlayerLeagues(leagues);

        // Get recent completed games
        const allGames = await gamesApi.getAll();
        if (cancelled) return;
        const completedPlayerGamesPromises = allGames.map(async game => {
          const team1 = await teamsApi.getById(game.team1Id);
          const team2 = await teamsApi.getById(game.team2Id);
          const isPlayerGame = (team1?.playerIds.includes(playerId) || team2?.playerIds.includes(playerId)) &&
                 game.status === 'completed';
          return isPlayerGame ? game : null;
        });
        const completedPlayerGamesResults = await Promise.all(completedPlayerGamesPromises);
        if (cancelled) return;
        const completedPlayerGames = completedPlayerGamesResults.filter((game): game is Game => game !== null);

        // Sort by completion date (most recent first)
        const sortedCompletedGames = completedPlayerGames.sort((a, b) => {
          const dateA = new Date(a.completedAt || a.updatedAt || 0);
          const dateB = new Date(b.completedAt || b.updatedAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        const topGames = sortedCompletedGames.slice(0, 5);
        setRecentCompletedGames(topGames);

        // Preload game details for rendering
        const detailsMap: Record<string, { season: Season | null, league: League | null, team1: Team | undefined, team2: Team | undefined }> = {};
        for (const game of topGames) {
          const season = await seasonsApi.getById(game.seasonId);
          const league = season ? await leaguesApi.getById(season.leagueId) : null;
          const team1 = await teamsApi.getById(game.team1Id);
          const team2 = await teamsApi.getById(game.team2Id);
          if (cancelled) return;
          detailsMap[game.id] = { season: season ?? null, league: league ?? null, team1, team2 };
        }
        setGameDetailsMap(detailsMap);

        // Calculate player statistics across all games
        const stats = await computePlayerStats(allGames);
        if (cancelled) return;
        setPlayerStats(stats);
      } catch (error) {
        if (!cancelled) {
          logger.error('Failed to load player data:', error);
          setLoadError('Failed to load player data');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  const computePlayerStats = async (allGames: Game[]): Promise<PlayerStats> => {
    const playerData = await playersApi.getById(playerId);
    const stats: PlayerStats = {
      playerId: playerId,
      playerName: playerData ? getPlayerDisplayName(playerData) : '',
      gamesPlayed: 0,
      totalPins: 0,
      average: 0,
      highGame: 0,
      highSeries: 0,
      seriesCount: 0,
      pointsScored: 0,
    };

    const completedGames = allGames.filter((g: Game) => g.status === 'completed');

    for (const game of completedGames) {
      const team1 = await teamsApi.getById(game.team1Id);
      const team2 = await teamsApi.getById(game.team2Id);
      const isOnTeam1 = team1?.playerIds.includes(playerId);
      const isOnTeam2 = team2?.playerIds.includes(playerId);
      if (!isOnTeam1 && !isOnTeam2) continue;
      const playerIndex = (isOnTeam1 ? team1 : team2)?.playerIds.indexOf(playerId);
      if (playerIndex === undefined || playerIndex === -1) continue;

      let seriesPins = 0;
      let playedMatch = false;

      if (game.matches) {
        game.matches.forEach((match: GameMatch) => {
          const teamMatch = isOnTeam1 ? match.team1 : match.team2;
          if (teamMatch && teamMatch.players && teamMatch.players[playerIndex]) {
            const playerMatch = teamMatch.players[playerIndex];
            const pins = parseInt(playerMatch.pins) || 0;
            if (playerMatch.pins !== '') {
              stats.gamesPlayed++;
              stats.totalPins += pins;
              seriesPins += pins;
              playedMatch = true;
              if (pins > stats.highGame) stats.highGame = pins;
            }
            if (match.playerMatches && match.playerMatches[playerIndex]) {
              const points = isOnTeam1
                ? match.playerMatches[playerIndex].team1Points
                : match.playerMatches[playerIndex].team2Points;
              stats.pointsScored += points;
            }
          }
        });
      }
      if (playedMatch) {
        if (seriesPins > stats.highSeries) stats.highSeries = seriesPins;
        stats.seriesCount++;
      }
    }

    if (stats.gamesPlayed > 0) stats.average = stats.totalPins / stats.gamesPlayed;
    return stats;
  };

  const enrichedGames = useMemo(() => recentCompletedGames.map(game => {
    const details = gameDetailsMap[game.id];
    if (!details) return null;
    const { league, team1, team2 } = details;
    const isTeam1 = team1?.playerIds.includes(playerId);
    const team1TotalPoints = game.matches?.reduce((sum: number, m: GameMatch) => sum + (m.team1?.points || 0), 0) + (game.grandTotalPoints?.team1 || 0);
    const team2TotalPoints = game.matches?.reduce((sum: number, m: GameMatch) => sum + (m.team2?.points || 0), 0) + (game.grandTotalPoints?.team2 || 0);
    const playerWon = (isTeam1 && team1TotalPoints > team2TotalPoints) || (!isTeam1 && team2TotalPoints > team1TotalPoints);
    return { game, league, team1, team2, isTeam1, team1TotalPoints, team2TotalPoints, playerWon };
  }), [recentCompletedGames, gameDetailsMap, playerId]);

  if (isLoading) return <div>Loading...</div>;
  if (loadError) return <div>{loadError}</div>;
  if (!player) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t('playerDashboard.welcome')}, {getPlayerDisplayName(player)}!</h1>
        <p className="text-purple-100">{t('playerDashboard.playerDashboard')}</p>
        <div className="flex gap-4 mt-4 text-sm">
          <span>🎳 {playerLeagues.length} {playerLeagues.length === 1 ? t('playerDashboard.activeLeagues') : t('playerDashboard.activeLeaguesPlural')}</span>
          <span>📊 {recentCompletedGames.length} {recentCompletedGames.length === 1 ? t('playerDashboard.recentGame') : t('playerDashboard.recentGamesPlural')}</span>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">{playerLeagues.length === 1 ? t('playerDashboard.activeLeagues') : t('playerDashboard.activeLeaguesPlural')}</p>
              <p className="text-2xl font-bold text-gray-800">{playerLeagues.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2 flex gap-1 sm:gap-2 overflow-x-auto">
        <button
          onClick={() => setView('dashboard')}
          className={`flex-1 min-w-[90px] py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold text-xs sm:text-base transition-colors whitespace-nowrap ${
            view === 'dashboard'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🏠 {t('playerDashboard.dashboard')}
        </button>
        <button
          onClick={() => setView('stats')}
          className={`flex-1 min-w-[90px] py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold text-xs sm:text-base transition-colors whitespace-nowrap ${
            view === 'stats'
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📊 {t('playerDashboard.myStats')}
        </button>
      </div>

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <>
          {/* Recent Completed Games */}
          {recentCompletedGames.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('playerDashboard.recentCompletedGames')}</h2>
              <div className="space-y-3">
                {enrichedGames.map(data => {
                  if (!data) return null;
                  const { game, league, team1, team2, isTeam1, team1TotalPoints, team2TotalPoints, playerWon } = data;
                  return (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/player/games/${game.id}`, { state: { game } })}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                            {league?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {t('common.round')} {game.round} • {t('common.matchDay')} {game.matchDay}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(game.completedAt || '')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-semibold ${isTeam1 ? 'text-blue-600' : 'text-gray-700'}`}>
                            {game.team1?.name || team1?.name}
                          </span>
                          <span className="text-gray-400">
                            <span className="font-bold">{team1TotalPoints}</span> - <span className="font-bold">{team2TotalPoints}</span>
                          </span>
                          <span className={`font-semibold ${!isTeam1 ? 'text-blue-600' : 'text-gray-700'}`}>
                            {game.team2?.name || team2?.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {playerWon ? (
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded font-semibold">
                            {t('playerDashboard.won')}
                          </span>
                        ) : team1TotalPoints === team2TotalPoints ? (
                          <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded font-semibold">
                            {t('playerDashboard.tie')}
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded font-semibold">
                            {t('playerDashboard.lost')}
                          </span>
                        )}
                        <span className="text-purple-600 font-semibold">{t('common.view')} {t('common.rightArrow')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Completed Games Message */}
          {recentCompletedGames.length === 0 && playerLeagues.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 text-center">
              <p className="text-4xl mb-3">🎳</p>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('playerDashboard.noGamesCompletedYet')}</h3>
              <p className="text-gray-600">
                {t('playerDashboard.noGamesCompletedDesc')}
              </p>
            </div>
          )}
        </>
      )}

      {/* Stats View */}
      {view === 'stats' && playerStats && (
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('playerDashboard.overallStatistics')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('playerDashboard.gamesPlayed')}</p>
                <p className="text-3xl font-bold text-blue-600">{playerStats.gamesPlayed}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('common.average')}</p>
                <p className="text-3xl font-bold text-green-600">{playerStats.average.toFixed(1)}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('playerDashboard.highGame')}</p>
                <p className="text-3xl font-bold text-purple-600">{playerStats.highGame}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('playerDashboard.highSeries')}</p>
                <p className="text-3xl font-bold text-orange-600">{playerStats.highSeries}</p>
              </div>
            </div>
          </div>

          {playerStats.gamesPlayed === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <span className="text-6xl mb-4 block">📊</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('playerDashboard.noStatisticsYet')}</h3>
              <p className="text-gray-600">{t('playerDashboard.noStatisticsDesc')}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
