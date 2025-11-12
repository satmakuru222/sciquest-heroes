-- Re-enable RLS on user_profiles table
-- Run this after fixing the RLS policies

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate the basic policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Parents can read their children profiles" ON user_profiles;

-- Create the primary policy that allows ALL users to read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for parents to read their children's profiles
CREATE POLICY "Parents can read their children profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_profiles.account_type = 'student'
    AND user_profiles.parent_id = auth.uid()
    AND user_profiles.id != auth.uid()
  );

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'user_profiles';

SELECT 'RLS has been RE-ENABLED on user_profiles table with basic policies.' as notice;

