/*
  # Create User Profiles Table for SciQuest Heroes

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - References auth.users
      - `email` (text, not null) - User email address
      - `account_type` (text, not null) - Either 'student', 'parent', or 'teacher'
      - `full_name` (text) - User's full name
      - `child_name` (text) - For parent accounts, name of the child
      - `grade_level` (text) - Student's grade level
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - RLS is disabled on `user_profiles` table

  3. Indexes
    - Add index on `id` for fast lookups
    - Add index on `email` for user searches
    - Add index on `account_type` for filtering

  4. Notes
    - This table extends Supabase's built-in auth.users table
    - The `id` field references the auth.users.id to maintain relationship
    - All user-specific data should be stored here, not in auth.users
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('student', 'parent', 'teacher')),
  full_name text,
  child_name text,
  grade_level text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- RLS is disabled on user_profiles table
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON user_profiles(account_type);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
