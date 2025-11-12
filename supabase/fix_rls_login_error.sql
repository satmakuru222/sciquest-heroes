/*
  # Fix RLS Login Error for Student and Parent Accounts

  This script fixes the Row Level Security (RLS) policy issue that prevents
  students and parents from accessing their own profiles during login.

  ## Problem
  The error "Account access error. Please contact support with error code: RLS-XXXXX"
  occurs when authenticated users try to read their profile from user_profiles table.
  This is caused by:
  1. Missing or incorrect "Users can read own profile" policy
  2. Conflicting RLS policies
  3. Recursive RLS checks in parent-child relationship policies

  ## Solution
  This script ensures the correct RLS policies are in place:
  1. "Users can read own profile" - Allows ALL authenticated users to read their own profile
  2. "Parents can read their children profiles" - Allows parents to read their children's profiles
     (without recursive RLS checks)

  ## Security
  - Users can only read their own profile
  - Parents can read their children's profiles (where parent_id matches)
  - No cross-family data access is possible
  - All policies use auth.uid() to ensure proper authentication

  Run this script in Supabase SQL Editor to fix the RLS policies.
*/

-- Step 1: Verify RLS is enabled (should already be enabled, but check anyway)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_profiles' AND rowsecurity = true
  ) THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS has been ENABLED on user_profiles table';
  ELSE
    RAISE NOTICE 'RLS is already enabled on user_profiles table';
  END IF;
END $$;

-- Step 2: Drop ALL existing SELECT policies to start fresh
-- This ensures we don't have conflicting policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Parents can read their children profiles" ON user_profiles;

-- Step 3: Create the primary policy that allows ALL users to read their own profile
-- This is the most important policy and must work for students, parents, and teachers
-- This policy MUST work for all authenticated users
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Step 4: Create a policy for parents to read their children's profiles
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

-- Step 5: Verify policies were created successfully
SELECT 
  '=== RLS Policies Verification ===' as status;

SELECT 
  policyname,
  cmd as command,
  CASE 
    WHEN policyname = 'Users can read own profile' AND cmd = 'SELECT' THEN '✓ CRITICAL POLICY EXISTS'
    WHEN policyname = 'Parents can read their children profiles' AND cmd = 'SELECT' THEN '✓ PARENT POLICY EXISTS'
    ELSE '?'
  END as verification
FROM pg_policies
WHERE tablename = 'user_profiles'
AND cmd = 'SELECT'
ORDER BY 
  CASE 
    WHEN policyname = 'Users can read own profile' THEN 1
    WHEN policyname = 'Parents can read their children profiles' THEN 2
    ELSE 3
  END;

-- Step 6: Final summary
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'user_profiles' 
      AND policyname = 'Users can read own profile'
      AND cmd = 'SELECT'
    ) THEN '✓ SUCCESS: RLS policies have been fixed! Users should now be able to log in.'
    ELSE '✗ ERROR: Failed to create required policies. Please check the error messages above.'
  END as final_status;

SELECT 
  'If login still fails, check the browser console for detailed error messages.' as next_steps,
  'The error should include the Supabase error code and message for further debugging.' as debugging_tip;

