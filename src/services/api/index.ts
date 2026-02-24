/**
 * API Service Layer - Supabase Backend
 * Maintains same interface as localStorage version for easy migration
 */

import { supabase } from '../../lib/supabase';
import { handleError } from './helpers';
import { logger } from '../../utils/logger';
import type { Organization } from '../../types/index';

// Re-export entity APIs from their modules
export { playersApi } from './players';
export { leaguesApi } from './leagues';
export { seasonsApi } from './seasons';
export { teamsApi } from './teams';
export { gamesApi } from './games';

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

      const updateData: { name?: string; language?: string } = {};
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
    logger.warn('authApi.login is deprecated - use OAuth instead');
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
    logger.warn('utilApi.clearAll is not implemented for Supabase');
  }
};
