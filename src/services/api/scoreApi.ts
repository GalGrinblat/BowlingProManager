/**
 * Score Submission API — public (anon) access for player score entry.
 *
 * These functions are intentionally kept separate from the authenticated
 * gamesApi so they can be called from the public /score/:gameId route.
 *
 * DATABASE REQUIREMENT:
 *   The `games` table needs a Supabase RLS policy that allows the anon role
 *   to UPDATE the `pending_scores` column when game status is not 'completed':
 *
 *   CREATE POLICY "Allow anon score submission" ON games
 *   FOR UPDATE TO anon
 *   USING  (status != 'completed')
 *   WITH CHECK (true);
 *
 *   Alternatively this can be implemented via a Supabase Edge Function.
 */

import { supabase } from '../../lib/supabase';
import type { Game, ScoreSubmission, GameMatch, GameTeam, BonusRule, GameStatus } from '../../types/index';

const GAME_COLS_PUBLIC = `
  id, season_id, round, match_day, team1_id, team2_id, status,
  matches_per_game, use_handicap, team1_data, team2_data,
  scheduled_date, pending_scores
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapGamePublic = (d: Record<string, any>): Game => ({
  id: d.id,
  seasonId: d.season_id,
  round: d.round,
  matchDay: d.match_day,
  team1Id: d.team1_id,
  team2Id: d.team2_id,
  status: d.status as GameStatus,
  createdAt: '',
  matchesPerGame: d.matches_per_game,
  useHandicap: d.use_handicap,
  lineupStrategy: 'flexible',
  lineupRule: 'standard',
  playerMatchPointsPerWin: 0,
  teamMatchPointsPerWin: 0,
  teamGamePointsPerWin: 0,
  teamAllPresentBonusEnabled: false,
  teamAllPresentBonusPoints: 0,
  bonusRules: (d.bonus_rules as BonusRule[]) || [],
  postponed: false,
  team1: (d.team1_data as GameTeam) ?? undefined,
  team2: (d.team2_data as GameTeam) ?? undefined,
  matches: (d.matches as GameMatch[]) ?? undefined,
  scheduledDate: d.scheduled_date ?? undefined,
  pendingScores: (d.pending_scores as ScoreSubmission[]) ?? undefined,
});

export const scoreApi = {
  /** Load a game by ID for public score entry (read-only, anon-safe columns) */
  getGame: async (gameId: string): Promise<Game | null> => {
    const { data, error } = await supabase
      .from('games')
      .select(GAME_COLS_PUBLIC)
      .eq('id', gameId)
      .single();
    if (error || !data) return null;
    return mapGamePublic(data);
  },

  /**
   * Append a score submission to a game's pending_scores list.
   * Requires the game to be non-completed and the anon RLS policy described above.
   */
  submitScores: async (gameId: string, submission: ScoreSubmission): Promise<boolean> => {
    // Read current pending_scores
    const { data: current, error: readErr } = await supabase
      .from('games')
      .select('pending_scores')
      .eq('id', gameId)
      .single();

    if (readErr) return false;

    const existing: ScoreSubmission[] = (current?.pending_scores as ScoreSubmission[]) ?? [];
    const updated = [...existing, submission];

    const { error: writeErr } = await supabase
      .from('games')
      .update({ pending_scores: updated })
      .eq('id', gameId)
      .neq('status', 'completed');

    return !writeErr;
  },
};
