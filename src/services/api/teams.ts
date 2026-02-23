import { supabase } from '../../lib/supabase';
import type { TeamRow } from '../../lib/supabase';
import { handleError } from './helpers';
import type { Team } from '../../types/index';

const mapTeamFromDb = (data: TeamRow): Team => ({
  id: data.id,
  seasonId: data.season_id,
  name: data.name,
  playerIds: data.player_ids || [],
  rosterChanges: data.roster_changes || [],
  createdAt: data.created_at
});

const mapTeamToDb = (data: Partial<Team>): Record<string, unknown> => {
  const dbData: Record<string, unknown> = {};
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
