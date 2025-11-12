-- Immediate fix for parent account RLS issue
-- Run this in Supabase SQL Editor if the migration hasn't been applied yet

-- Step 1: Create a SECURITY DEFINER function to check if user is a parent
-- This avoids recursive RLS checks when querying user_profiles
CREATE OR REPLACE FUNCTION is_parent_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id
    AND account_type = 'parent'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_parent_user(uuid) TO authenticated;

-- Step 2: Ensure "Users can read own profile" policy exists
-- This is the primary policy that allows all users (including parents) to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Step 3: Drop the existing "Parents can read their children profiles" policy if it exists
-- We'll recreate it with a cleaner implementation that avoids recursive RLS
DROP POLICY IF EXISTS "Parents can read their children profiles" ON user_profiles;

-- Step 4: Create a new policy that allows parents to read their children's profiles
-- Uses the SECURITY DEFINER function to avoid recursive RLS issues
CREATE POLICY "Parents can read their children profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Only allow reading children's profiles, not the parent's own profile
    -- The parent's own profile is already accessible via "Users can read own profile" policy
    is_parent_user(auth.uid())
    AND user_profiles.parent_id = auth.uid()
    AND user_profiles.account_type = 'student'
  );

SELECT 'Parent RLS fix applied successfully!' as notice;

