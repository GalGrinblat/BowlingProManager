-- ============================================================================
-- Supabase Database Schema for BowlingAppAi
-- Run this SQL in your Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'player');
CREATE TYPE season_status AS ENUM ('setup', 'active', 'completed');
CREATE TYPE game_status AS ENUM ('pending', 'in-progress', 'completed');
CREATE TYPE lineup_strategy AS ENUM ('flexible', 'fixed', 'rule-based');
CREATE TYPE lineup_rule AS ENUM ('standard', 'balanced');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'player',
  player_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization (singleton - only one row)
CREATE TABLE public.organization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'he')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Players
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leagues
CREATE TABLE public.leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  number_of_teams INTEGER NOT NULL,
  players_per_team INTEGER NOT NULL,
  number_of_rounds INTEGER NOT NULL,
  matches_per_game INTEGER NOT NULL,
  day_of_week TEXT NOT NULL,
  lineup_strategy lineup_strategy NOT NULL,
  lineup_rule lineup_rule NOT NULL,
  player_match_points_per_win INTEGER NOT NULL,
  team_match_points_per_win INTEGER NOT NULL,
  team_game_points_per_win INTEGER NOT NULL,
  use_handicap BOOLEAN NOT NULL DEFAULT TRUE,
  handicap_basis INTEGER NOT NULL,
  handicap_percentage INTEGER NOT NULL,
  team_all_present_bonus_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  team_all_present_bonus_points INTEGER NOT NULL,
  bonus_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seasons
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  number_of_teams INTEGER NOT NULL,
  players_per_team INTEGER NOT NULL,
  number_of_rounds INTEGER NOT NULL,
  matches_per_game INTEGER NOT NULL,
  lineup_strategy lineup_strategy NOT NULL,
  lineup_rule lineup_rule NOT NULL,
  player_match_points_per_win INTEGER NOT NULL,
  team_match_points_per_win INTEGER NOT NULL,
  team_game_points_per_win INTEGER NOT NULL,
  use_handicap BOOLEAN NOT NULL DEFAULT TRUE,
  handicap_basis INTEGER NOT NULL,
  handicap_percentage INTEGER NOT NULL,
  team_all_present_bonus_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  team_all_present_bonus_points INTEGER NOT NULL,
  bonus_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  status season_status NOT NULL DEFAULT 'setup',
  schedule JSONB,
  initial_player_averages JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  player_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  roster_changes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Games
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  match_day INTEGER NOT NULL,
  team1_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team2_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  status game_status NOT NULL DEFAULT 'pending',
  matches JSONB,
  team1_data JSONB,
  team2_data JSONB,
  matches_per_game INTEGER NOT NULL,
  use_handicap BOOLEAN NOT NULL,
  lineup_strategy lineup_strategy NOT NULL,
  lineup_rule lineup_rule NOT NULL,
  team_all_present_bonus_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  team_all_present_bonus_points INTEGER NOT NULL,
  bonus_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  player_match_points_per_win INTEGER NOT NULL,
  team_match_points_per_win INTEGER NOT NULL,
  team_game_points_per_win INTEGER NOT NULL,
  grand_total_points JSONB,
  pending_submission JSONB,
  pending_submission_session_id TEXT,
  scheduled_date TIMESTAMPTZ,
  postponed BOOLEAN NOT NULL DEFAULT FALSE,
  original_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allowed Emails (whitelist for who can sign up)
CREATE TABLE public.allowed_emails (
  email TEXT PRIMARY KEY,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- Add foreign key constraint for users.player_id after players table is created
ALTER TABLE public.users ADD CONSTRAINT fk_users_player_id FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_players_active ON public.players(active);
CREATE INDEX idx_leagues_active ON public.leagues(active);
CREATE INDEX idx_seasons_league_id ON public.seasons(league_id);
CREATE INDEX idx_seasons_status ON public.seasons(status);
CREATE INDEX idx_teams_season_id ON public.teams(season_id);
CREATE INDEX idx_games_season_id ON public.games(season_id);
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_games_team1_id ON public.games(team1_id);
CREATE INDEX idx_games_team2_id ON public.games(team2_id);
CREATE INDEX idx_games_round_match_day ON public.games(round, match_day);

-- ============================================================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_updated_at BEFORE UPDATE ON public.organization
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON public.seasons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is a player
CREATE OR REPLACE FUNCTION is_player()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'player'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (is_admin());

-- Admins can update user roles
CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (is_admin());

-- Allow authenticated users to insert themselves (needed for first-time login)
CREATE POLICY "Users can insert themselves" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- ORGANIZATION TABLE POLICIES
-- ============================================================================

-- Anyone authenticated can read organization
CREATE POLICY "Authenticated users can read organization" ON public.organization
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can update organization
CREATE POLICY "Admins can update organization" ON public.organization
  FOR UPDATE USING (is_admin());

-- ============================================================================
-- PLAYERS TABLE POLICIES
-- ============================================================================

-- Anyone authenticated can read players
CREATE POLICY "Authenticated users can read players" ON public.players
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can create/update/delete players
CREATE POLICY "Admins can insert players" ON public.players
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update players" ON public.players
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete players" ON public.players
  FOR DELETE USING (is_admin());

-- ============================================================================
-- LEAGUES TABLE POLICIES
-- ============================================================================

-- Anyone authenticated can read leagues
CREATE POLICY "Authenticated users can read leagues" ON public.leagues
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can create/update/delete leagues
CREATE POLICY "Admins can insert leagues" ON public.leagues
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update leagues" ON public.leagues
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete leagues" ON public.leagues
  FOR DELETE USING (is_admin());

-- ============================================================================
-- SEASONS TABLE POLICIES
-- ============================================================================

-- Anyone authenticated can read seasons
CREATE POLICY "Authenticated users can read seasons" ON public.seasons
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can create/update/delete seasons
CREATE POLICY "Admins can insert seasons" ON public.seasons
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update seasons" ON public.seasons
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete seasons" ON public.seasons
  FOR DELETE USING (is_admin());

-- ============================================================================
-- TEAMS TABLE POLICIES
-- ============================================================================

-- Anyone authenticated can read teams
CREATE POLICY "Authenticated users can read teams" ON public.teams
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can create/update/delete teams
CREATE POLICY "Admins can insert teams" ON public.teams
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update teams" ON public.teams
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete teams" ON public.teams
  FOR DELETE USING (is_admin());

-- ============================================================================
-- GAMES TABLE POLICIES
-- ============================================================================

-- Anyone authenticated can read games
CREATE POLICY "Authenticated users can read games" ON public.games
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can do everything with games
CREATE POLICY "Admins can insert games" ON public.games
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update games" ON public.games
  FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete games" ON public.games
  FOR DELETE USING (is_admin());

-- ============================================================================
-- ALLOWED EMAILS TABLE POLICIES
-- ============================================================================

-- Admins can read allowed emails
CREATE POLICY "Admins can read allowed emails" ON public.allowed_emails
  FOR SELECT USING (is_admin());

-- Admins can insert allowed emails
CREATE POLICY "Admins can insert allowed emails" ON public.allowed_emails
  FOR INSERT WITH CHECK (is_admin());

-- Admins can update allowed emails
CREATE POLICY "Admins can update allowed emails" ON public.allowed_emails
  FOR UPDATE USING (is_admin());

-- Admins can delete allowed emails
CREATE POLICY "Admins can delete allowed emails" ON public.allowed_emails
  FOR DELETE USING (is_admin());

-- ============================================================================
-- FIRST USER IS ADMIN LOGIC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM public.users;

  -- If this is the first user, make them admin
  IF user_count = 0 THEN
    NEW.role := 'admin';
  ELSE
    -- Otherwise, default to player role
    NEW.role := 'player';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on user insert
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ORGANIZATION INITIALIZATION
-- ============================================================================

-- Insert default organization
INSERT INTO public.organization (name, language)
VALUES ('My Bowling Organization', 'en')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCOREBOARD: ANON (PUBLIC) READ POLICIES
-- ============================================================================
-- These policies allow unauthenticated visitors to read public data for the
-- /board/* scoreboard routes. users and allowed_emails remain fully private.

CREATE POLICY "Anon read organization" ON public.organization
  FOR SELECT USING (auth.role() = 'anon');

CREATE POLICY "Anon read active leagues" ON public.leagues
  FOR SELECT USING (auth.role() = 'anon' AND active = true);

CREATE POLICY "Anon read seasons" ON public.seasons
  FOR SELECT USING (auth.role() = 'anon');

CREATE POLICY "Anon read teams" ON public.teams
  FOR SELECT USING (auth.role() = 'anon');

CREATE POLICY "Anon read games" ON public.games
  FOR SELECT USING (auth.role() = 'anon');

CREATE POLICY "Anon read players" ON public.players
  FOR SELECT USING (auth.role() = 'anon');

-- ============================================================================
-- PUBLIC SCORE ENTRY: submit_pending_score RPC
-- ============================================================================
-- Called by unauthenticated players on /score/:gameId.
-- Uses SECURITY DEFINER so it can UPDATE games despite the anon role having
-- no UPDATE permission. Validates the game is in-progress before storing.

CREATE OR REPLACE FUNCTION public.submit_pending_score(
  p_game_id UUID,
  p_submission JSONB,
  p_session_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status game_status;
BEGIN
  -- Verify game exists and is in-progress
  SELECT status INTO v_status
  FROM public.games
  WHERE id = p_game_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found';
  END IF;

  IF v_status = 'completed' THEN
    RAISE EXCEPTION 'Game is already completed';
  END IF;

  IF v_status = 'pending' THEN
    RAISE EXCEPTION 'Game has not started yet';
  END IF;

  -- Store the pending submission (overwrites any prior submission from this session)
  UPDATE public.games
  SET
    pending_submission            = p_submission,
    pending_submission_session_id = p_session_id,
    updated_at                    = NOW()
  WHERE id = p_game_id;
END;
$$;

-- Allow anyone (including anon) to call this function
GRANT EXECUTE ON FUNCTION public.submit_pending_score(UUID, JSONB, TEXT) TO anon, authenticated;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Run this entire SQL file in your Supabase SQL Editor
-- After running, your database will be ready for the BowlingAppAi
-- ============================================================================
