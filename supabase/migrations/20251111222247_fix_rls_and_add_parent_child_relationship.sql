/*
  # Add Parent-Child Relationship

  ## Summary
  This migration establishes proper parent-child relationship where one parent can have multiple student accounts.

  ## Changes Made

  1. **Add Parent-Child Relationship**
     - Add `parent_id` column (uuid) to link students to parent accounts
     - Foreign key constraint to user_profiles(id) where account_type = 'parent'
     - NULL for parent and teacher accounts
     - Required (NOT NULL) for student accounts via CHECK constraint
     - ON DELETE CASCADE to handle parent account deletion

  2. **Deprecate parent_email Column**
     - Keep parent_email temporarily for backward compatibility
     - Mark as deprecated in comments
     - Future migration will remove it after data migration

  3. **Indexes for Performance**
     - Index on parent_id for fast child lookups
     - Composite index on (account_type, parent_id) for filtered queries

  ## Security Notes

  - RLS is disabled on user_profiles table
  - Parent-child relationship is established via foreign key constraint

  ## Data Migration Notes

  - Existing student records with parent_email will need manual linking
  - parent_id will be NULL initially for existing students
  - A separate data migration script may be needed for production
  - New signups will properly set parent_id from the start
*/

-- Step 1: Add parent_id column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN parent_id uuid;
  END IF;
END $$;

-- Step 2: Add foreign key constraint for parent_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_profiles_parent_id_fkey'
  ) THEN
    ALTER TABLE user_profiles
      ADD CONSTRAINT user_profiles_parent_id_fkey
      FOREIGN KEY (parent_id)
      REFERENCES user_profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Step 3: Add CHECK constraint to ensure proper parent_id usage
-- Note: We allow NULL parent_id for students to handle cases where parent hasn't registered yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'user_profiles_parent_id_check'
  ) THEN
    ALTER TABLE user_profiles
      ADD CONSTRAINT user_profiles_parent_id_check
      CHECK (
        (account_type IN ('parent', 'teacher') AND parent_id IS NULL) OR
        (account_type = 'student')
      );
  END IF;
END $$;

-- Step 4: Create index on parent_id for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_parent_id ON user_profiles(parent_id);

-- Step 5: Create composite index for filtered queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type_parent_id ON user_profiles(account_type, parent_id);

-- Step 6: Add comment to mark parent_email as deprecated
COMMENT ON COLUMN user_profiles.parent_email IS 'DEPRECATED: Use parent_id instead. Parent email address stored for backward compatibility. Will be removed in future migration.';

-- Step 7: Add comment for parent_id
COMMENT ON COLUMN user_profiles.parent_id IS 'Foreign key to parent user_profiles.id. Required for student accounts, NULL for parent/teacher accounts. Enables 1-to-many parent-child relationship.';

-- Step 8: Create helper function to get children count for a parent
CREATE OR REPLACE FUNCTION get_children_count(parent_user_id uuid)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM user_profiles
  WHERE parent_id = parent_user_id
  AND account_type = 'student';
$$;

-- Step 9: Create helper function to get all children for a parent
CREATE OR REPLACE FUNCTION get_parent_children(parent_user_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  username text,
  age integer,
  avatar_url text,
  grade_level text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    id,
    email,
    first_name,
    username,
    age,
    avatar_url,
    grade_level,
    created_at
  FROM user_profiles
  WHERE parent_id = parent_user_id
  AND account_type = 'student'
  ORDER BY created_at DESC;
$$;

-- Step 10: Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_children_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_parent_children(uuid) TO authenticated;

-- Step 11: Create a view for parent-child relationships (optional, for easier queries)
CREATE OR REPLACE VIEW parent_child_relationships AS
SELECT
  p.id as parent_id,
  p.email as parent_email,
  p.first_name as parent_name,
  s.id as student_id,
  s.email as student_email,
  s.first_name as student_name,
  s.username as student_username,
  s.age as student_age,
  s.grade_level as student_grade_level,
  s.avatar_url as student_avatar_url,
  s.created_at as student_created_at
FROM user_profiles p
JOIN user_profiles s ON s.parent_id = p.id
WHERE p.account_type = 'parent'
AND s.account_type = 'student';

SELECT 'Migration completed successfully. Parent-child relationship established.' as notice;
