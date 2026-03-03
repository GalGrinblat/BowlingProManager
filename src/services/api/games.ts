import { supabase } from '../../lib/supabase';
import type { GameRow } from '../../lib/supabase';
import { handleError } from './helpers';
import type { Game } from '../../types/index';

const mapGameFromDb = (data: GameRow): Game => ({
  id: data.id,
  seasonId: data.season_id,
  round: data.round,
  matchDay: data.match_day,
  team1Id: data.team1_id,
  team2Id: data.team2_id,
  status: data.status,
  completedAt: data.completed_at ?? undefined,
  createdAt: data.created_at,
  matches: data.matches ?? undefined,
  team1: data.team1_data ?? undefined,
  team2: data.team2_data ?? undefined,
  matchesPerGame: data.matches_per_game,
  useHandicap: data.use_handicap,
  lineupStrategy: data.lineup_strategy,
  lineupRule: data.lineup_rule,
  teamAllPresentBonusEnabled: data.team_all_present_bonus_enabled,
  teamAllPresentBonusPoints: data.team_all_present_bonus_points,
  bonusRules: data.bonus_rules,
  playerMatchPointsPerWin: data.player_match_points_per_win,
  teamMatchPointsPerWin: data.team_match_points_per_win,
  teamGamePointsPerWin: data.team_game_points_per_win,
  grandTotalPoints: data.grand_total_points ?? undefined,
  pendingScores: data.pending_scores ?? undefined,
  scheduledDate: data.scheduled_date ?? undefined,
  postponed: data.postponed,
  originalDate: data.original_date ?? undefined,
  updatedAt: data.updated_at ?? undefined
});

const mapGameToDb = (data: Partial<Game>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {};
  if (data.seasonId !== undefined) dbData.season_id = data.seasonId;
  if (data.round !== undefined) dbData.round = data.round;
  if (data.matchDay !== undefined) dbData.match_day = data.matchDay;
  if (data.team1Id !== undefined) dbData.team1_id = data.team1Id;
  if (data.team2Id !== undefined) dbData.team2_id = data.team2Id;
  if (data.status !== undefined) dbData.status = data.status;
  if (data.completedAt !== undefined) dbData.completed_at = data.completedAt;
  if (data.matches !== undefined) dbData.matches = data.matches;
  if (data.team1 !== undefined) dbData.team1_data = data.team1;
  if (data.team2 !== undefined) dbData.team2_data = data.team2;
  if (data.matchesPerGame !== undefined) dbData.matches_per_game = data.matchesPerGame;
  if (data.useHandicap !== undefined) dbData.use_handicap = data.useHandicap;
  if (data.lineupStrategy !== undefined) dbData.lineup_strategy = data.lineupStrategy;
  if (data.lineupRule !== undefined) dbData.lineup_rule = data.lineupRule;
  if (data.teamAllPresentBonusEnabled !== undefined) dbData.team_all_present_bonus_enabled = data.teamAllPresentBonusEnabled;
  if (data.teamAllPresentBonusPoints !== undefined) dbData.team_all_present_bonus_points = data.teamAllPresentBonusPoints;
  if (data.bonusRules !== undefined) dbData.bonus_rules = data.bonusRules;
  if (data.playerMatchPointsPerWin !== undefined) dbData.player_match_points_per_win = data.playerMatchPointsPerWin;
  if (data.teamMatchPointsPerWin !== undefined) dbData.team_match_points_per_win = data.teamMatchPointsPerWin;
  if (data.teamGamePointsPerWin !== undefined) dbData.team_game_points_per_win = data.teamGamePointsPerWin;
  if (data.grandTotalPoints !== undefined) dbData.grand_total_points = data.grandTotalPoints;
  if (data.pendingScores !== undefined) dbData.pending_scores = data.pendingScores;
  if (data.scheduledDate !== undefined) dbData.scheduled_date = data.scheduledDate;
  if (data.postponed !== undefined) dbData.postponed = data.postponed;
  if (data.originalDate !== undefined) dbData.original_date = data.originalDate;
  return dbData;
};

export const gamesApi = {
  getAll: async (): Promise<Game[]> => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('round', { ascending: false });

      if (error) throw error;

      return (data || []).map(mapGameFromDb);
    } catch (error) {
      handleError(error, 'gamesApi.getAll');
      return [];
    }
  },

  getById: async (id: string): Promise<Game | undefined> => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return mapGameFromDb(data);
    } catch (error) {
      handleError(error, 'gamesApi.getById');
      return undefined;
    }
  },

  getBySeason: async (seasonId: string): Promise<Game[]> => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('season_id', seasonId)
        .order('round', { ascending: true })
        .order('match_day', { ascending: true });

      if (error) throw error;

      return (data || []).map(mapGameFromDb);
    } catch (error) {
      handleError(error, 'gamesApi.getBySeason');
      return [];
    }
  },

  getByRound: async (seasonId: string, round: number): Promise<Game[]> => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('season_id', seasonId)
        .eq('round', round)
        .order('match_day', { ascending: true });

      if (error) throw error;

      return (data || []).map(mapGameFromDb);
    } catch (error) {
      handleError(error, 'gamesApi.getByRound');
      return [];
    }
  },

  create: async (gameData: Omit<Game, 'id' | 'createdAt' | 'status'>): Promise<Game> => {
    try {
      const dbData = mapGameToDb(gameData as Game);
      dbData.status = 'pending'; // Default status

      const { data, error } = await supabase
        .from('games')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;

      return mapGameFromDb(data);
    } catch (error) {
      handleError(error, 'gamesApi.create');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Game>): Promise<Game | null> => {
    try {
      const { data, error } = await supabase
        .from('games')
        .update(mapGameToDb(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return mapGameFromDb(data);
    } catch (error) {
      handleError(error, 'gamesApi.update');
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      handleError(error, 'gamesApi.delete');
      return false;
    }
  }
};
