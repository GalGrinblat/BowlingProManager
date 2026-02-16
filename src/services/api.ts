/**
 * API Service Layer - Supabase Backend
 * Maintains same interface as localStorage version for easy migration
 */

import { supabase } from '../lib/supabase';
import type {
  Organization,
  Player,
  League,
  Season,
  Team,
  Game
} from '../types/index';

// ===== HELPER FUNCTIONS =====

const handleError = (error: any, context: string): void => {
  console.error(`Error in ${context}:`, error);
};

// ===== ORGANIZATION =====

export const organizationApi = {
  get: async (): Promise<Organization> => {
    try {
      const { data, error } = await supabase
        .from('organization')
        .select('*')
        .limit(1)
        .single();

      if (error || !data) {
        // Return default if none exists
        return {
          name: 'My Bowling Organization',
          language: 'en',
          createdAt: new Date().toISOString()
        };
      }

      return {
        name: data.name,
        language: data.language as 'en' | 'he',
        createdAt: data.created_at
      };
    } catch (error) {
      handleError(error, 'organizationApi.get');
      return {
        name: 'My Bowling Organization',
        language: 'en',
        createdAt: new Date().toISOString()
      };
    }
  },

  update: async (updates: Partial<Organization>): Promise<Organization> => {
    try {
      // Get the first (and only) organization record
      const { data: existing } = await supabase
        .from('organization')
        .select('id')
        .limit(1)
        .single();

      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.language !== undefined) updateData.language = updates.language;

      const { data, error } = await supabase
        .from('organization')
        .update(updateData)
        .eq('id', existing?.id || '')
        .select()
        .single();

      if (error) throw error;

      return {
        name: data.name,
        language: data.language as 'en' | 'he',
        createdAt: data.created_at
      };
    } catch (error) {
      handleError(error, 'organizationApi.update');
      // Return current state on error
      return await organizationApi.get();
    }
  }
};

// ===== USERS =====

export interface DatabaseUser {
  id: string;
  email: string;
  role: 'admin' | 'player';
  playerId: string | null;
  createdAt: string;
}

export const usersApi = {
  getAll: async (): Promise<DatabaseUser[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(u => ({
        id: u.id,
        email: u.email,
        role: u.role as 'admin' | 'player',
        playerId: u.player_id,
        createdAt: u.created_at
      }));
    } catch (error) {
      handleError(error, 'usersApi.getAll');
      return [];
    }
  },

  updateRole: async (userId: string, role: 'admin' | 'player'): Promise<void> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      handleError(error, 'usersApi.updateRole');
      throw error;
    }
  },

  linkPlayer: async (userId: string, playerId: string | null): Promise<void> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ player_id: playerId })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      handleError(error, 'usersApi.linkPlayer');
      throw error;
    }
  }
};

// ===== ALLOWED EMAILS =====

export interface AllowedEmail {
  email: string;
  addedBy: string | null;
  addedAt: string;
  notes: string | null;
}

export const allowedEmailsApi = {
  getAll: async (): Promise<AllowedEmail[]> => {
    try {
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('*')
        .order('added_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(e => ({
        email: e.email,
        addedBy: e.added_by,
        addedAt: e.added_at,
        notes: e.notes
      }));
    } catch (error) {
      handleError(error, 'allowedEmailsApi.getAll');
      return [];
    }
  },

  add: async (email: string, notes?: string): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('allowed_emails')
        .insert({
          email: email.toLowerCase().trim(),
          added_by: user?.id || null,
          notes: notes || null
        });

      if (error) throw error;
    } catch (error) {
      handleError(error, 'allowedEmailsApi.add');
      throw error;
    }
  },

  remove: async (email: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('allowed_emails')
        .delete()
        .eq('email', email);

      if (error) throw error;
    } catch (error) {
      handleError(error, 'allowedEmailsApi.remove');
      throw error;
    }
  },

  update: async (email: string, notes: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('allowed_emails')
        .update({ notes })
        .eq('email', email);

      if (error) throw error;
    } catch (error) {
      handleError(error, 'allowedEmailsApi.update');
      throw error;
    }
  }
};

// ===== PLAYERS =====

export const playersApi = {
  getAll: async (): Promise<Player[]> => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('last_name')
        .order('first_name');

      if (error) throw error;

      return (data || []).map(p => ({
        id: p.id,
        firstName: p.first_name,
        middleName: p.middle_name || undefined,
        lastName: p.last_name,
        active: p.active,
        createdAt: p.created_at
      }));
    } catch (error) {
      handleError(error, 'playersApi.getAll');
      return [];
    }
  },

  getById: async (id: string): Promise<Player | undefined> => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        firstName: data.first_name,
        middleName: data.middle_name || undefined,
        lastName: data.last_name,
        active: data.active,
        createdAt: data.created_at
      };
    } catch (error) {
      handleError(error, 'playersApi.getById');
      return undefined;
    }
  },

  create: async (playerData: Omit<Player, 'id' | 'createdAt'>): Promise<Player> => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert({
          first_name: playerData.firstName,
          middle_name: playerData.middleName || null,
          last_name: playerData.lastName,
          active: playerData.active
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        firstName: data.first_name,
        middleName: data.middle_name || undefined,
        lastName: data.last_name,
        active: data.active,
        createdAt: data.created_at
      };
    } catch (error) {
      handleError(error, 'playersApi.create');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Player>): Promise<Player | null> => {
    try {
      const updateData: any = {};
      if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
      if (updates.middleName !== undefined) updateData.middle_name = updates.middleName || null;
      if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
      if (updates.active !== undefined) updateData.active = updates.active;

      const { data, error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        firstName: data.first_name,
        middleName: data.middle_name || undefined,
        lastName: data.last_name,
        active: data.active,
        createdAt: data.created_at
      };
    } catch (error) {
      handleError(error, 'playersApi.update');
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      handleError(error, 'playersApi.delete');
      return false;
    }
  }
};

// ===== LEAGUES =====

const mapLeagueFromDb = (data: any): League => ({
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

const mapLeagueToDb = (data: Partial<League>): any => {
  const dbData: any = {};
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

// ===== SEASONS =====

const mapSeasonFromDb = (data: any): Season => ({
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
  schedule: data.schedule,
  playerAverages: data.player_averages,
  updatedAt: data.updated_at,
  createdAt: data.created_at
});

const mapSeasonToDb = (data: Partial<Season>): any => {
  const dbData: any = {};
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
  if (data.playerAverages !== undefined) dbData.player_averages = data.playerAverages;
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

// ===== TEAMS =====

const mapTeamFromDb = (data: any): Team => ({
  id: data.id,
  seasonId: data.season_id,
  name: data.name,
  playerIds: data.player_ids || [],
  rosterChanges: data.roster_changes || [],
  createdAt: data.created_at
});

const mapTeamToDb = (data: Partial<Team>): any => {
  const dbData: any = {};
  if (data.seasonId !== undefined) dbData.season_id = data.seasonId;
  if (data.name !== undefined) dbData.name = data.name;
  if (data.playerIds !== undefined) dbData.player_ids = data.playerIds;
  if (data.rosterChanges !== undefined) dbData.roster_changes = data.rosterChanges;
  return dbData;
};

export const teamsApi = {
  getAll: async (): Promise<Team[]> => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;

      return (data || []).map(mapTeamFromDb);
    } catch (error) {
      handleError(error, 'teamsApi.getAll');
      return [];
    }
  },

  getById: async (id: string): Promise<Team | undefined> => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return mapTeamFromDb(data);
    } catch (error) {
      handleError(error, 'teamsApi.getById');
      return undefined;
    }
  },

  getBySeason: async (seasonId: string): Promise<Team[]> => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('season_id', seasonId)
        .order('name');

      if (error) throw error;

      return (data || []).map(mapTeamFromDb);
    } catch (error) {
      handleError(error, 'teamsApi.getBySeason');
      return [];
    }
  },

  create: async (teamData: Omit<Team, 'id' | 'createdAt'>): Promise<Team> => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert(mapTeamToDb(teamData as Team))
        .select()
        .single();

      if (error) throw error;

      return mapTeamFromDb(data);
    } catch (error) {
      handleError(error, 'teamsApi.create');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Team>): Promise<Team | null> => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(mapTeamToDb(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return mapTeamFromDb(data);
    } catch (error) {
      handleError(error, 'teamsApi.update');
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      handleError(error, 'teamsApi.delete');
      return false;
    }
  }
};

// ===== GAMES =====

const mapGameFromDb = (data: any): Game => ({
  id: data.id,
  seasonId: data.season_id,
  round: data.round,
  matchDay: data.match_day,
  team1Id: data.team1_id,
  team2Id: data.team2_id,
  status: data.status,
  completedAt: data.completed_at,
  createdAt: data.created_at,
  matches: data.matches,
  team1: data.team1_data,
  team2: data.team2_data,
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
  grandTotalPoints: data.grand_total_points,
  scheduledDate: data.scheduled_date,
  postponed: data.postponed,
  originalDate: data.original_date,
  updatedAt: data.updated_at
});

const mapGameToDb = (data: Partial<Game>): any => {
  const dbData: any = {};
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

// ===== AUTH (OAuth-based) =====

interface AuthUser {
  userId: string;
  role: 'admin' | 'player';
}

export const authApi = {
  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) return null;

      return {
        userId: user.id,
        role: data.role as 'admin' | 'player'
      };
    } catch (error) {
      return null;
    }
  },

  login: async (userId: string, role: 'admin' | 'player' = 'player'): Promise<AuthUser> => {
    // OAuth-based, this method is deprecated
    console.warn('authApi.login is deprecated - use OAuth instead');
    return { userId, role };
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  isAdmin: async (): Promise<boolean> => {
    const user = await authApi.getCurrentUser();
    return user !== null && user.role === 'admin';
  }
};

// ===== UTILITY =====

export const utilApi = {
  clearAll: async (): Promise<void> => {
    // This would require admin privileges to delete all data
    // Not implementing for safety reasons
    console.warn('utilApi.clearAll is not implemented for Supabase');
  }
};
