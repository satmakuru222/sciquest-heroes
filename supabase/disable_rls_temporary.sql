-- TEMPORARY FIX: Disable RLS on user_profiles table
-- WARNING: This disables Row Level Security, making all profiles accessible to all authenticated users
-- Use this only for debugging or as a temporary measure
-- Re-enable RLS once the policies are fixed

-- Disable RLS on user_profiles table
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'user_profiles';

SELECT 'RLS has been DISABLED on user_profiles table. All authenticated users can now access all profiles.' as warning;
SELECT 'IMPORTANT: Re-enable RLS once policies are fixed for security!' as reminder;

