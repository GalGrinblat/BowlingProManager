import { supabase } from '../../lib/supabase';
import { handleError } from './helpers';
import type { Player } from '../../types/index';

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
      const updateData: { first_name?: string; middle_name?: string | null; last_name?: string; active?: boolean } = {};
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
