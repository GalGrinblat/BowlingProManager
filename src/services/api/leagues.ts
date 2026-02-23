import { supabase } from '../../lib/supabase';
import type { LeagueRow } from '../../lib/supabase';
import { handleError } from './helpers';
import { seasonsApi } from './seasons';
import type { League, Season } from '../../types/index';

const mapLeagueFromDb = (data: LeagueRow): League => ({
  id: data.id,
  name: data.name,
  description: data.description || '',
  dayOfWeek: data.day_of_week,
  defaultSeasonConfigurations: {
    numberOfTeams: data.number_of_teams,
    playersPerTeam: data.players_per_team,
    numberOfRounds: data.number_of_rounds,
    matchesPerGame: data.matches_per_game,
    lineupStrategy: data.lineup_strategy,
    lineupRule: data.lineup_rule,
    playerMatchPointsPerWin: data.player_match_points_per_win,
    teamMatchPointsPerWin: data.team_match_points_per_win,
    teamGamePointsPerWin: data.team_game_points_per_win,
    useHandicap: data.use_handicap,
    handicapBasis: data.handicap_basis,
    handicapPercentage: data.handicap_percentage,
    teamAllPresentBonusEnabled: data.team_all_present_bonus_enabled,
    teamAllPresentBonusPoints: data.team_all_present_bonus_points,
    bonusRules: data.bonus_rules || [],
  },
  active: data.active,
  createdAt: data.created_at
});

const mapLeagueToDb = (data: Partial<League>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {};
  if (data.name !== undefined) dbData.name = data.name;
  if (data.description !== undefined) dbData.description = data.description;
  if (data.dayOfWeek !== undefined) dbData.day_of_week = data.dayOfWeek;
  if (data.active !== undefined) dbData.active = data.active;
  if (data.defaultSeasonConfigurations) {
    const cfg = data.defaultSeasonConfigurations;
    if (cfg.numberOfTeams !== undefined) dbData.number_of_teams = cfg.numberOfTeams;
    if (cfg.playersPerTeam !== undefined) dbData.players_per_team = cfg.playersPerTeam;
    if (cfg.numberOfRounds !== undefined) dbData.number_of_rounds = cfg.numberOfRounds;
    if (cfg.matchesPerGame !== undefined) dbData.matches_per_game = cfg.matchesPerGame;
    if (cfg.lineupStrategy !== undefined) dbData.lineup_strategy = cfg.lineupStrategy;
    if (cfg.lineupRule !== undefined) dbData.lineup_rule = cfg.lineupRule;
    if (cfg.playerMatchPointsPerWin !== undefined) dbData.player_match_points_per_win = cfg.playerMatchPointsPerWin;
    if (cfg.teamMatchPointsPerWin !== undefined) dbData.team_match_points_per_win = cfg.teamMatchPointsPerWin;
    if (cfg.teamGamePointsPerWin !== undefined) dbData.team_game_points_per_win = cfg.teamGamePointsPerWin;
    if (cfg.useHandicap !== undefined) dbData.use_handicap = cfg.useHandicap;
    if (cfg.handicapBasis !== undefined) dbData.handicap_basis = cfg.handicapBasis;
    if (cfg.handicapPercentage !== undefined) dbData.handicap_percentage = cfg.handicapPercentage;
    if (cfg.teamAllPresentBonusEnabled !== undefined) dbData.team_all_present_bonus_enabled = cfg.teamAllPresentBonusEnabled;
    if (cfg.teamAllPresentBonusPoints !== undefined) dbData.team_all_present_bonus_points = cfg.teamAllPresentBonusPoints;
    if (cfg.bonusRules !== undefined) dbData.bonus_rules = cfg.bonusRules;
  }
  return dbData;
};

export const leaguesApi = {
  getAll: async (): Promise<League[]> => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .order('name');

      if (error) throw error;

      return (data || []).map(mapLeagueFromDb);
    } catch (error) {
      handleError(error, 'leaguesApi.getAll');
      return [];
    }
  },

  getById: async (id: string): Promise<League | undefined> => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return mapLeagueFromDb(data);
    } catch (error) {
      handleError(error, 'leaguesApi.getById');
      return undefined;
    }
  },

  create: async (leagueData: Omit<League, 'id' | 'createdAt'>): Promise<League> => {
    try {
      const { data, error} = await supabase
        .from('leagues')
        .insert(mapLeagueToDb(leagueData as League))
        .select()
        .single();

      if (error) throw error;

      return mapLeagueFromDb(data);
    } catch (error) {
      handleError(error, 'leaguesApi.create');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<League>): Promise<League | null> => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .update(mapLeagueToDb(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return mapLeagueFromDb(data);
    } catch (error) {
      handleError(error, 'leaguesApi.update');
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('leagues')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      handleError(error, 'leaguesApi.delete');
      return false;
    }
  },

  getSeasons: async (leagueId: string): Promise<Season[]> => {
    return await seasonsApi.getByLeague(leagueId);
  }
};
