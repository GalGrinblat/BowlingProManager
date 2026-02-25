/**
 * Board API - Read-only, anon-safe data access for the public /board/* scoreboard.
 *
 * Security layers:
 * 1. Supabase RLS: anon SELECT policies allow reading public tables only.
 *    users and allowed_emails have NO anon policies and remain fully private.
 * 2. Explicit column selection: sensitive internal fields are excluded from
 *    queries so they are never transmitted even if RLS allows row access.
 *
 * This file is the ONLY data access surface for board page components.
 */

import { supabase } from '../../lib/supabase';
import type {
  League, Season, Team, Game,
  Player, SeasonStatus, GameStatus,
  ScheduleMatchDay, GameMatch, GameTeam, BonusRule,
} from '../../types/index';

// ---------------------------------------------------------------------------
// Column selects (explicit, no sensitive internals)
// ---------------------------------------------------------------------------

const LEAGUE_COLS = `
  id, name, description, day_of_week, active,
  number_of_teams, players_per_team, number_of_rounds, matches_per_game,
  lineup_strategy, lineup_rule, player_match_points_per_win,
  team_match_points_per_win, team_game_points_per_win,
  use_handicap, handicap_basis, handicap_percentage,
  team_all_present_bonus_enabled, team_all_present_bonus_points, bonus_rules
`;

const SEASON_COLS = `
  id, league_id, name, start_date, end_date, status, schedule, updated_at,
  number_of_teams, players_per_team, number_of_rounds, matches_per_game,
  lineup_strategy, lineup_rule, player_match_points_per_win,
  team_match_points_per_win, team_game_points_per_win,
  use_handicap, handicap_basis, handicap_percentage,
  team_all_present_bonus_enabled, team_all_present_bonus_points, bonus_rules
`;
// Excluded: initial_player_averages (internal scoring baseline)

const TEAM_COLS = `id, season_id, name, player_ids`;
// Excluded: roster_changes (internal substitution audit trail), created_at

const GAME_COLS = `
  id, season_id, round, match_day, team1_id, team2_id, status, completed_at,
  matches, team1_data, team2_data, matches_per_game, use_handicap,
  player_match_points_per_win, team_match_points_per_win, team_game_points_per_win,
  team_all_present_bonus_enabled, team_all_present_bonus_points, bonus_rules,
  grand_total_points, scheduled_date, postponed, original_date
`;
// Excluded: lineup_strategy, lineup_rule (presentation config), created_at, updated_at

const PLAYER_COLS = `id, first_name, middle_name, last_name, active`;
// Excluded: created_at

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapLeague = (d: Record<string, any>): League => ({
  id: d.id,
  name: d.name,
  description: d.description || '',
  dayOfWeek: d.day_of_week,
  active: d.active,
  createdAt: '',
  defaultSeasonConfigurations: {
    numberOfTeams: d.number_of_teams,
    playersPerTeam: d.players_per_team,
    numberOfRounds: d.number_of_rounds,
    matchesPerGame: d.matches_per_game,
    lineupStrategy: d.lineup_strategy,
    lineupRule: d.lineup_rule,
    playerMatchPointsPerWin: d.player_match_points_per_win,
    teamMatchPointsPerWin: d.team_match_points_per_win,
    teamGamePointsPerWin: d.team_game_points_per_win,
    useHandicap: d.use_handicap,
    handicapBasis: d.handicap_basis,
    handicapPercentage: d.handicap_percentage,
    teamAllPresentBonusEnabled: d.team_all_present_bonus_enabled,
    teamAllPresentBonusPoints: d.team_all_present_bonus_points,
    bonusRules: (d.bonus_rules as BonusRule[]) || [],
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapSeason = (d: Record<string, any>): Season => ({
  id: d.id,
  leagueId: d.league_id,
  name: d.name,
  startDate: d.start_date,
  endDate: d.end_date,
  status: d.status as SeasonStatus,
  schedule: (d.schedule as ScheduleMatchDay[]) ?? undefined,
  updatedAt: d.updated_at ?? undefined,
  createdAt: '',
  // initial_player_averages excluded — not needed for public display
  seasonConfigurations: {
    numberOfTeams: d.number_of_teams,
    playersPerTeam: d.players_per_team,
    numberOfRounds: d.number_of_rounds,
    matchesPerGame: d.matches_per_game,
    lineupStrategy: d.lineup_strategy,
    lineupRule: d.lineup_rule,
    playerMatchPointsPerWin: d.player_match_points_per_win,
    teamMatchPointsPerWin: d.team_match_points_per_win,
    teamGamePointsPerWin: d.team_game_points_per_win,
    useHandicap: d.use_handicap,
    handicapBasis: d.handicap_basis,
    handicapPercentage: d.handicap_percentage,
    teamAllPresentBonusEnabled: d.team_all_present_bonus_enabled,
    teamAllPresentBonusPoints: d.team_all_present_bonus_points,
    bonusRules: (d.bonus_rules as BonusRule[]) || [],
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTeam = (d: Record<string, any>): Team => ({
  id: d.id,
  seasonId: d.season_id,
  name: d.name,
  playerIds: (d.player_ids as string[]) || [],
  rosterChanges: [], // excluded from public select
  createdAt: '',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapGame = (d: Record<string, any>): Game => ({
  id: d.id,
  seasonId: d.season_id,
  round: d.round,
  matchDay: d.match_day,
  team1Id: d.team1_id,
  team2Id: d.team2_id,
  status: d.status as GameStatus,
  completedAt: d.completed_at ?? undefined,
  createdAt: '',
  matches: (d.matches as GameMatch[]) ?? undefined,
  team1: (d.team1_data as GameTeam) ?? undefined,
  team2: (d.team2_data as GameTeam) ?? undefined,
  matchesPerGame: d.matches_per_game,
  useHandicap: d.use_handicap,
  lineupStrategy: 'flexible', // excluded — not needed for display
  lineupRule: 'standard',     // excluded — not needed for display
  playerMatchPointsPerWin: d.player_match_points_per_win,
  teamMatchPointsPerWin: d.team_match_points_per_win,
  teamGamePointsPerWin: d.team_game_points_per_win,
  teamAllPresentBonusEnabled: d.team_all_present_bonus_enabled,
  teamAllPresentBonusPoints: d.team_all_present_bonus_points,
  bonusRules: (d.bonus_rules as BonusRule[]) || [],
  grandTotalPoints: d.grand_total_points ?? undefined,
  scheduledDate: d.scheduled_date ?? undefined,
  postponed: d.postponed ?? false,
  originalDate: d.original_date ?? undefined,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPlayer = (d: Record<string, any>): Player => ({
  id: d.id,
  firstName: d.first_name,
  middleName: d.middle_name ?? undefined,
  lastName: d.last_name,
  active: d.active,
  createdAt: '',
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const boardApi = {
  /** Organization name for the public header */
  getOrgName: async (): Promise<{ name: string; language: 'en' | 'he' } | null> => {
    const { data } = await supabase
      .from('organization')
      .select('name, language')
      .limit(1)
      .single();
    if (!data) return null;
    return { name: data.name as string, language: data.language as 'en' | 'he' };
  },

  /** Active leagues for the public board home */
  getActiveLeagues: async (): Promise<League[]> => {
    const { data } = await supabase
      .from('leagues')
      .select(LEAGUE_COLS)
      .eq('active', true)
      .order('name');
    return (data || []).map(mapLeague);
  },

  getLeagueById: async (id: string): Promise<League | null> => {
    const { data } = await supabase
      .from('leagues')
      .select(LEAGUE_COLS)
      .eq('id', id)
      .eq('active', true)
      .single();
    return data ? mapLeague(data) : null;
  },

  getSeasonsByLeague: async (leagueId: string): Promise<Season[]> => {
    const { data } = await supabase
      .from('seasons')
      .select(SEASON_COLS)
      .eq('league_id', leagueId)
      .order('start_date', { ascending: false });
    return (data || []).map(mapSeason);
  },

  getSeasonById: async (seasonId: string): Promise<Season | null> => {
    const { data } = await supabase
      .from('seasons')
      .select(SEASON_COLS)
      .eq('id', seasonId)
      .single();
    return data ? mapSeason(data) : null;
  },

  getTeamsBySeason: async (seasonId: string): Promise<Team[]> => {
    const { data } = await supabase
      .from('teams')
      .select(TEAM_COLS)
      .eq('season_id', seasonId)
      .order('name');
    return (data || []).map(mapTeam);
  },

  getGamesBySeason: async (seasonId: string): Promise<Game[]> => {
    const { data } = await supabase
      .from('games')
      .select(GAME_COLS)
      .eq('season_id', seasonId)
      .order('round', { ascending: true })
      .order('match_day', { ascending: true });
    return (data || []).map(mapGame);
  },

  getGameById: async (gameId: string): Promise<Game | null> => {
    const { data } = await supabase
      .from('games')
      .select(GAME_COLS)
      .eq('id', gameId)
      .single();
    return data ? mapGame(data) : null;
  },

  getPlayersByIds: async (playerIds: string[]): Promise<Player[]> => {
    if (playerIds.length === 0) return [];
    const { data } = await supabase
      .from('players')
      .select(PLAYER_COLS)
      .in('id', playerIds);
    return (data || []).map(mapPlayer);
  },

  /** Up to `limit` most recently completed games across the given season IDs */
  getRecentCompletedGames: async (seasonIds: string[], limit = 5): Promise<Game[]> => {
    if (seasonIds.length === 0) return [];
    const { data } = await supabase
      .from('games')
      .select(GAME_COLS)
      .in('season_id', seasonIds)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(limit);
    return (data || []).map(mapGame);
  },
};
