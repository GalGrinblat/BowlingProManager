import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { playersApi } from '../services/api';
import type { AuthContextType, User } from '../types/index';
import type { Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [playerData, setPlayerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await loadUserProfile(session.user.id);
        } else {
          setCurrentUser(null);
          setPlayerData(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // First, check if user exists in users table
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // If user doesn't exist, create them
      if (userError && userError.code === 'PGRST116') {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUser.user.id,
              email: authUser.user.email || '',
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user:', insertError);
            setIsLoading(false);
            return;
          }
          userData = newUser;
        }
      } else if (userError) {
        throw userError;
      }

      if (userData) {
        const user: User = {
          userId: userData.id,
          role: userData.role as 'admin' | 'player',
        };

        setCurrentUser(user);

        // Load player data if user is a player and has a linked player
        if (userData.role === 'player' && userData.player_id) {
          const player = await playersApi.getById(userData.player_id);
          setPlayerData(player);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
      setPlayerData(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const isPlayer = () => {
    return currentUser?.role === 'player';
  };

  // Legacy login function for backward compatibility (deprecated)
  const login = async (userId: string, role: 'admin' | 'player' = 'player') => {
    console.warn('Legacy login function called - OAuth should be used instead');
    return null;
  };

  const value = {
    currentUser,
    playerData,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    isAdmin,
    isPlayer,
    session,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
