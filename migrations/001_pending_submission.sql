-- Migration: Add pending_submission columns and submit_pending_score RPC
-- Apply this to any existing database that was set up before these columns existed.

-- Add columns if not already present
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS pending_submission JSONB,
  ADD COLUMN IF NOT EXISTS pending_submission_session_id TEXT;

-- submit_pending_score: stores a player's pending score submission.
-- SECURITY DEFINER lets anon callers bypass the admin-only UPDATE RLS policy.
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

  UPDATE public.games
  SET
    pending_submission            = p_submission,
    pending_submission_session_id = p_session_id,
    updated_at                    = NOW()
  WHERE id = p_game_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_pending_score(UUID, JSONB, TEXT) TO anon, authenticated;
