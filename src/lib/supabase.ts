import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'bowling-app-auth',
    storage: window.localStorage,
  },
});

// Database type definitions
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'player';
          player_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      organization: {
        Row: {
          id: string;
          name: string;
          language: 'en' | 'he';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organization']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organization']['Insert']>;
      };
      players: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          middle_name: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['players']['Insert']>;
      };
      leagues: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          number_of_teams: number;
          players_per_team: number;
          number_of_rounds: number;
          matches_per_game: number;
          day_of_week: string;
          lineup_strategy: 'flexible' | 'fixed' | 'rule-based' | null;
          lineup_rule: 'standard' | 'balanced' | null;
          player_match_points_per_win: number;
          team_match_points_per_win: number;
          team_game_points_per_win: number;
          use_handicap: boolean;
          handicap_basis: number;
          handicap_percentage: number;
          team_all_present_bonus_enabled: boolean | null;
          team_all_present_bonus_points: number | null;
          bonus_rules: any;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leagues']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leagues']['Insert']>;
      };
      seasons: {
        Row: {
          id: string;
          league_id: string;
          name: string;
          start_date: string;
          end_date: string;
          number_of_teams: number;
          players_per_team: number;
          number_of_rounds: number;
          matches_per_game: number;
          lineup_strategy: 'flexible' | 'fixed' | 'rule-based' | null;
          lineup_rule: 'standard' | 'balanced' | null;
          player_match_points_per_win: number;
          team_match_points_per_win: number;
          team_game_points_per_win: number;
          use_handicap: boolean;
          handicap_basis: number;
          handicap_percentage: number;
          team_all_present_bonus_enabled: boolean | null;
          team_all_present_bonus_points: number | null;
          bonus_rules: any;
          status: 'setup' | 'active' | 'completed';
          schedule: any;
          player_averages: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['seasons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['seasons']['Insert']>;
      };
      teams: {
        Row: {
          id: string;
          season_id: string;
          name: string;
          player_ids: any;
          roster_changes: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['teams']['Insert']>;
      };
      games: {
        Row: {
          id: string;
          season_id: string;
          round: number;
          match_day: number;
          team1_id: string;
          team2_id: string;
          status: 'pending' | 'in-progress' | 'completed';
          matches: any;
          team1_data: any;
          team2_data: any;
          matches_per_game: number;
          use_handicap: boolean;
          lineup_strategy: 'flexible' | 'fixed' | 'rule-based' | null;
          lineup_rule: 'standard' | 'balanced' | null;
          team_all_present_bonus_enabled: boolean | null;
          team_all_present_bonus_points: number | null;
          bonus_rules: any;
          player_match_points_per_win: number;
          team_match_points_per_win: number;
          team_game_points_per_win: number;
          grand_total_points: any;
          scheduled_date: string | null;
          postponed: boolean;
          original_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['games']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['games']['Insert']>;
      };
    };
  };
};
