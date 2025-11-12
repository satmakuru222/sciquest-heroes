-- Comprehensive fix for RLS policies
-- This will fix both student and parent login issues
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL existing SELECT policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Parents can read their children profiles" ON user_profiles;

-- Step 2: Create the primary policy that allows ALL users to read their own profile
-- This is the most important policy and must work for students, parents, and teachers
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Step 3: Create a policy for parents to read their children's profiles
-- This policy only applies to student profiles where parent_id matches the current user
-- We don't verify the parent account_type here to avoid recursive RLS checks
-- The foreign key constraint ensures parent_id only references valid parent accounts
CREATE POLICY "Parents can read their children profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Only allow reading student profiles where parent_id matches current user
    -- The foreign key constraint ensures parent_id references a valid parent account
    user_profiles.account_type = 'student'
    AND user_profiles.parent_id = auth.uid()
    -- Exclude the parent's own profile (already covered by "Users can read own profile")
    AND user_profiles.id != auth.uid()
  );

-- Step 4: Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
AND cmd = 'SELECT'
ORDER BY policyname;

SELECT 'RLS policies fixed! All users should now be able to read their own profiles.' as notice;

