-- ============================================================================
-- FIX: Add missing INSERT policy for users table
-- This allows authenticated users to create their own user record on first login
-- ============================================================================

-- Allow authenticated users to insert themselves into the users table
CREATE POLICY "Users can insert themselves" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verify the policy was created
-- You should see this policy listed in the output
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'users';
