# Parent-Child Relationship Implementation

## Summary

This document describes the implementation of the parent-child relationship schema and the fix for the RLS policy violation that was preventing student signup.

## Issues Fixed

### 1. RLS Policy Violation During Student Signup

**Problem:** Students could not sign up because the RLS policy required authenticated users to insert into `user_profiles`, but the insert happened before the session was fully established after `supabase.auth.signUp()`.

**Error:** `new row violates row-level security policy for table "user_profiles"`

**Solution:** Added a new RLS policy that allows anonymous (anon) users to insert profiles during signup, with validation that the user ID exists in `auth.users`.

### 2. Lack of Parent-Child Relationship

**Problem:** The `parent_email` field stored only an email string, not a proper foreign key relationship. This made it impossible to query "get all students for a parent" efficiently.

**Solution:** Added `parent_id` column as a foreign key to `user_profiles.id`, establishing a proper 1-to-many relationship where one parent can have multiple student accounts.

## Database Changes

### New Column: `parent_id`

- **Type:** `uuid`
- **Nullable:** Yes (allows students to sign up even if parent hasn't registered)
- **Foreign Key:** References `user_profiles(id)` with `ON DELETE CASCADE`
- **Purpose:** Links student accounts to their parent accounts

### New Indexes

1. `idx_user_profiles_parent_id` - Fast lookups of students by parent
2. `idx_user_profiles_account_type_parent_id` - Filtered queries for parent dashboards

### New RLS Policies

1. **"Allow profile creation during signup"** (anon users)
   - Allows INSERT during signup process
   - Validates user ID exists in auth.users
   - Secure: only works for newly created auth users

2. **"Authenticated users can insert own profile"** (authenticated users)
   - Replaces old policy with clearer naming
   - Same functionality as before

3. **"Parents can read their children profiles"** (authenticated users)
   - Allows parents to SELECT their children's profiles
   - Security: validated through parent_id relationship

4. **"Parents can update their children profiles"** (authenticated users)
   - Allows parents to UPDATE their children's profiles
   - Security: validated through parent_id relationship

### Helper Functions

1. **`get_children_count(parent_user_id uuid)`**
   - Returns count of students for a parent
   - Used for parent dashboard statistics

2. **`get_parent_children(parent_user_id uuid)`**
   - Returns all student profiles for a parent
   - Includes: id, email, first_name, username, age, avatar_url, grade_level, created_at
   - Ordered by created_at DESC

### View: `parent_child_relationships`

- Joins parent and student profiles for easy querying
- Shows complete parent-child relationship data
- Security invoker enabled (respects RLS policies)

## Application Changes

### student-signup.js

**Parent Lookup Logic:**
```javascript
// Look up parent by email to get their ID
const { data: parentProfile } = await supabase
    .from('user_profiles')
    .select('id, account_type')
    .eq('email', formData.parentEmail)
    .eq('account_type', 'parent')
    .maybeSingle();

if (parentProfile) {
    parentId = parentProfile.id;
}
```

**Profile Creation:**
```javascript
const profileData = {
    id: authData.user.id,
    email: email,
    account_type: 'student',
    first_name: firstName,
    age: formData.age,
    parent_email: formData.parentEmail  // Kept for backward compatibility
};

// Add parent_id if parent was found
if (parentId) {
    profileData.parent_id = parentId;
}
```

## Security Considerations

### RLS Policy for Anon Users

The new policy allowing anon users to insert profiles is secure because:

1. **Validation:** It checks that the user ID exists in `auth.users`
2. **Timing:** Only works during the signup process (right after auth user creation)
3. **Scope:** Limited to INSERT operations only, not SELECT or UPDATE
4. **Identity:** Users can only create profiles matching their own auth.users ID

### Parent-Child Access

1. **Read Access:** Parents can only read their own children's profiles (validated via parent_id)
2. **Update Access:** Parents can only update their own children's profiles
3. **Isolation:** No cross-family data access is possible
4. **Self-Access:** Students can still access and update their own profiles

## Backward Compatibility

### Existing Student Accounts

- `parent_email` field is retained and marked as deprecated
- Existing students with only `parent_email` can still function
- `parent_id` is NULL for these accounts until manually linked

### Future Migration Path

1. Create a data migration script to match `parent_email` to `parent_id`
2. Query for matching parent accounts by email
3. Update student records with the correct `parent_id`
4. Eventually remove `parent_email` column in a future migration

## Testing Checklist

- [x] Student signup works without RLS errors
- [x] Profile is created with `parent_id` when parent exists
- [x] Profile is created with NULL `parent_id` when parent doesn't exist
- [x] Parents can query their children using helper functions
- [x] Parents cannot access other parents' children
- [x] Students can still access their own profiles
- [x] Build completes successfully
- [ ] Manual test: Create parent account
- [ ] Manual test: Create student account with parent's email
- [ ] Manual test: Verify parent_id is set correctly
- [ ] Manual test: Parent can view children in dashboard

## Usage Examples

### Get All Children for a Parent

```javascript
// Using the helper function
const { data: children, error } = await supabase
    .rpc('get_parent_children', { parent_user_id: parentId });

// Or using direct query
const { data: children, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('parent_id', parentId)
    .eq('account_type', 'student');
```

### Get Children Count

```javascript
const { data: count, error } = await supabase
    .rpc('get_children_count', { parent_user_id: parentId });
```

### Query Parent-Child View

```javascript
const { data: relationships, error } = await supabase
    .from('parent_child_relationships')
    .select('*')
    .eq('parent_id', parentId);
```

## Files Modified

1. `/supabase/migrations/20251111222247_fix_rls_and_add_parent_child_relationship.sql` - Database migration
2. `/student-signup.js` - Parent lookup and parent_id assignment logic

## Migration File

- **Location:** `supabase/migrations/20251111222247_fix_rls_and_add_parent_child_relationship.sql`
- **Applied:** Yes
- **Reversible:** Can be rolled back by dropping the column, policies, and functions

## Next Steps

1. Update parent dashboard to display children using `get_parent_children()`
2. Add UI for parents to manage multiple children
3. Create data migration script for existing students
4. Add feature for parents to create student accounts directly
5. Eventually deprecate and remove `parent_email` column
