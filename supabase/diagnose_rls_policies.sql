/*
  # Diagnose RLS Policies for user_profiles Table

  This script helps diagnose Row Level Security (RLS) policy issues
  that may prevent users from accessing their own profiles during login.

  Run this in Supabase SQL Editor to check the current state of RLS policies.
*/

-- Step 1: Check if RLS is enabled on user_profiles table
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✓ RLS is ENABLED'
    ELSE '✗ RLS is DISABLED - This is a security risk!'
  END as status
FROM pg_tables
WHERE tablename = 'user_profiles';

-- Step 2: List all RLS policies on user_profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY cmd, policyname;

-- Step 3: Check for the critical "Users can read own profile" policy
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'user_profiles' 
      AND policyname = 'Users can read own profile'
      AND cmd = 'SELECT'
    ) THEN '✓ "Users can read own profile" policy EXISTS'
    ELSE '✗ "Users can read own profile" policy is MISSING - This will cause login failures!'
  END as critical_policy_status;

-- Step 4: Check for recursive RLS issues in "Parents can read their children profiles" policy
SELECT 
  policyname,
  qual as using_expression,
  CASE 
    WHEN qual::text LIKE '%user_profiles%' AND qual::text LIKE '%EXISTS%' THEN 
      '⚠ WARNING: This policy may cause recursive RLS checks!'
    ELSE 
      '✓ Policy looks safe (no recursive checks detected)'
  END as recursive_check_warning
FROM pg_policies
WHERE tablename = 'user_profiles'
AND policyname = 'Parents can read their children profiles'
AND cmd = 'SELECT';

-- Step 5: Count policies by command type
SELECT 
  cmd as command_type,
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ', ' ORDER BY policyname) as policy_names
FROM pg_policies
WHERE tablename = 'user_profiles'
GROUP BY cmd
ORDER BY cmd;

-- Step 6: Summary and recommendations
SELECT 
  '=== RLS Policy Diagnostic Summary ===' as summary;

SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'user_profiles' AND rowsecurity = true
    ) THEN 'CRITICAL: RLS is disabled on user_profiles table!'
    WHEN NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'user_profiles' 
      AND policyname = 'Users can read own profile'
      AND cmd = 'SELECT'
    ) THEN 'CRITICAL: "Users can read own profile" policy is missing!'
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'user_profiles'
      AND policyname = 'Parents can read their children profiles'
      AND qual::text LIKE '%user_profiles%' 
      AND qual::text LIKE '%EXISTS%'
    ) THEN 'WARNING: "Parents can read their children profiles" policy may have recursive RLS issues!'
    ELSE '✓ RLS policies appear to be correctly configured'
  END as recommendation;

