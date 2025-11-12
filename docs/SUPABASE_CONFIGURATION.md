# Supabase Configuration for Student Accounts

## Required Setup

To enable student signups to work without email validation errors, you must configure Supabase authentication settings.

### Step 1: Disable Email Confirmation

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Authentication** → **Providers** → **Email**
4. Find the **"Confirm email"** toggle
5. **Turn OFF** "Confirm email"
6. Click **"Save"** to apply changes

### Step 2: Verify Site URL Configuration

1. Navigate to: **Authentication** → **URL Configuration**
2. Ensure **"Site URL"** is set to your application URL:
   - Local development: `http://localhost:5173`
   - Production: Your production domain
3. Add redirect URLs if needed for avatar selection

## Why This Configuration Is Needed

### Student Authentication Flow

Students sign up with a username (not an email), but Supabase Auth requires an email format:

1. **Signup**: Student enters username (e.g., "Shannu4j")
2. **Email Generation**: System creates: `shannu4j@student.sciquest.app`
3. **Auth Creation**: Supabase creates auth account with this email
4. **Login**: Student can log in with just username (auto-converted)

### Parent Email

- Parent email is **mandatory** during student signup
- Parent email is stored in `user_profiles.parent_email` field
- Parent email is used for notifications, not authentication
- Students authenticate with username/password only

## Email Pattern Details

**Format:** `{username}@student.sciquest.app`

**Examples:**
- Username: `Shannu4j` → Email: `shannu4j@student.sciquest.app`
- Username: `alex_the_explorer` → Email: `alex_the_explorer@student.sciquest.app`

**Key Points:**
- Uses valid TLD (`.app`) to pass email format validation
- Email is for authentication only, not for sending emails
- Parent receives all notifications at their real email address

## Account Type Storage

The `account_type` field is saved to the `user_profiles` table during signup:

```javascript
// From student-signup.js
await supabase
  .from('user_profiles')
  .insert({
    id: authData.user.id,
    email: formData.parentEmail,
    account_type: 'student',  // ← Saved here
    first_name: firstName,
    username: username,
    age: formData.age,
    parent_email: formData.parentEmail
  });
```

This ensures the application can customize experiences based on user type.

## Troubleshooting

### Error: "Email address is invalid"

**Cause:** Email confirmation is still enabled in Supabase
**Solution:** Follow Step 1 above to disable email confirmation

### Error: "User already registered"

**Cause:** Username is already taken
**Solution:** User should choose a different username

### Students Can't Log In

**Cause:** Student might be entering email instead of username
**Solution:** Remind students to enter just their username (e.g., "Shannu4j"), not an email

## Security Notes

- Username/password authentication is still required
- Parent email is validated and mandatory during signup
- Row Level Security (RLS) policies protect all user data
- Username uniqueness is enforced at database level
- Account type is constrained to 'student', 'parent', or 'teacher'

## Files Modified

- `student-signup.js` - Updated email pattern and signup options
- `auth.js` - Added username-to-email conversion for student login
- `auth.html` - Updated label to accept username or email
- Migration created documenting the configuration requirements

## Next Steps

After completing the Supabase configuration:

1. Test student signup with username "Shannu4j"
2. Verify account is created successfully
3. Test student login with just the username
4. Verify parent and teacher signups still work normally
5. Deploy to production with same Supabase settings
