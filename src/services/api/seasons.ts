import { supabase } from '../../lib/supabase';
import type { SeasonRow } from '../../lib/supabase';
import { handleError } from './helpers';
import type { Season } from '../../types/index';

const mapSeasonFromDb = (data: SeasonRow): Season => ({
  id: data.id,
  leagueId: data.league_id,
  name: data.name,
  startDate: data.start_date,
  endDate: data.end_date,
  seasonConfigurations: {
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
  status: data.status,
  schedule: data.schedule ?? undefined,
  initialPlayerAverages: data.initial_player_averages ?? undefined,
  updatedAt: data.updated_at ?? undefined,
  createdAt: data.created_at
});

const mapSeasonToDb = (data: Partial<Season>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {};
  if (data.leagueId !== undefined) dbData.league_id = data.leagueId;
  if (data.name !== undefined) dbData.name = data.name;
  if (data.startDate !== undefined) dbData.start_date = data.startDate;
  if (data.endDate !== undefined) dbData.end_date = data.endDate;
  if (data.seasonConfigurations) {
    const cfg = data.seasonConfigurations;
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
  if (data.status !== undefined) dbData.status = data.status;
  if (data.schedule !== undefined) dbData.schedule = data.schedule;
  if (data.initialPlayerAverages !== undefined) dbData.initial_player_averages = data.initialPlayerAverages;
  return dbData;
};

export const seasonsApi = {
  getAll: async (): Promise<Season[]> => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(mapSeasonFromDb);
    } catch (error) {
      handleError(error, 'seasonsApi.getAll');
      return [];
    }
  },

  getById: async (id: string): Promise<Season | undefined> => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return mapSeasonFromDb(data);
    } catch (error) {
      handleError(error, 'seasonsApi.getById');
      return undefined;
    }
  },

  getByLeague: async (leagueId: string): Promise<Season[]> => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('league_id', leagueId)
        .order('start_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(mapSeasonFromDb);
    } catch (error) {
      handleError(error, 'seasonsApi.getByLeague');
      return [];
    }
  },

  create: async (seasonData: Omit<Season, 'id' | 'createdAt'>): Promise<Season> => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .insert(mapSeasonToDb(seasonData as Season))
        .select()
        .single();

      if (error) throw error;

      return mapSeasonFromDb(data);
    } catch (error) {
      handleError(error, 'seasonsApi.create');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Season>): Promise<Season | null> => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .update(mapSeasonToDb(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return mapSeasonFromDb(data);
    } catch (error) {
      handleError(error, 'seasonsApi.update');
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('seasons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      handleError(error, 'seasonsApi.delete');
      return false;
    }
  }
};
