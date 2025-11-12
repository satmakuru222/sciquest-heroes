# Authentication System Testing Guide

## Overview
The SciQuest Heroes authentication system includes:
- Account type selection (Student, Parent, Teacher)
- Unified login/signup page
- Google OAuth integration
- Email/password authentication
- Password reset functionality
- Supabase database integration with Row Level Security

## Testing the Complete Flow

### 1. Account Type Selection
**URL:** `account-type-selection.html`

**Test Steps:**
1. Open the landing page (`index.html`)
2. Click any "Start Free Trial" button
3. You should be redirected to the account type selection page
4. Verify three account type cards appear: Student, Parent, Teacher
5. Click on each card and verify:
   - Card animates on hover
   - Clicking redirects to `auth.html` with the correct account type

### 2. Sign Up Flow
**URL:** `auth.html?type=student&mode=signup` (or parent/teacher)

**Test Steps:**
1. From account type selection, click any account type
2. Verify the page shows:
   - Heading: "Create a free account"
   - Subtitle with account type (e.g., "Join SciQuest Heroes as a student")
   - Google sign-up button
   - Email and password input fields
   - "Sign Up" button
   - Link to switch to login mode
3. Test Google OAuth:
   - Click "Sign up with Google"
   - Should redirect to Google authentication
4. Test email/password signup:
   - Enter a valid email address
   - Enter a password (minimum 6 characters)
   - Click "Sign Up"
   - Should show success message and redirect to index.html
5. Verify in Supabase:
   - Check `auth.users` table for the new user
   - Check `user_profiles` table for the profile with correct `account_type`

### 3. Login Flow
**URL:** `auth.html` or `auth.html?mode=login`

**Test Steps:**
1. Click "Already have an account? Log In" from account type selection
2. Verify the page shows:
   - Heading: "Welcome Back!"
   - Subtitle: "Sign in to continue your adventure"
   - Google login button
   - Email and password input fields
   - "Log In" button
   - "Forgot Password?" link
   - Link to switch to signup mode
3. Test with invalid credentials:
   - Enter wrong email/password
   - Should show error message
4. Test with valid credentials:
   - Enter correct email/password
   - Should show success message and redirect to index.html

### 4. Forgot Password Flow
**Test Steps:**
1. On the login page, click "Forgot Password?"
2. Verify modal appears with:
   - Heading: "Reset Password"
   - Email input field
   - "Send Reset Link" button
3. Enter email address and submit
4. Should show success message
5. Check email inbox for password reset link
6. Click the link and verify it works

### 5. Mode Toggle
**Test Steps:**
1. On auth page, verify you can toggle between login and signup modes
2. Click "Sign Up" link when in login mode
3. Should switch to signup mode with updated text
4. Click "Log In" link when in signup mode
5. Should switch back to login mode

## Database Verification

### Check User Profile Creation
```sql
SELECT * FROM user_profiles WHERE email = 'test@example.com';
```

Should return:
- `id`: UUID matching auth.users.id
- `email`: The user's email
- `account_type`: student, parent, or teacher
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Verify RLS Policies
1. Users can only read their own profile
2. Users can only update their own profile
3. Users can insert their own profile during signup

## Common Issues and Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Ensure `.env` file exists with:
```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

### Issue: Google OAuth not working
**Solution:**
1. Configure Google OAuth provider in Supabase dashboard
2. Add authorized redirect URIs
3. Set up OAuth client ID and secret

### Issue: User profile not created after signup
**Solution:**
1. Check browser console for errors
2. Verify RLS policies allow insert
3. Check that `auth.js` properly calls `createUserProfile()`

### Issue: Password reset email not received
**Solution:**
1. Check spam folder
2. Verify email templates in Supabase dashboard
3. Ensure SMTP settings are configured

## Design Features

### Responsive Design
- Mobile: Single column layout, full-width cards
- Tablet: Adjusted spacing and font sizes
- Desktop: Multi-column layout with animations

### Animations
- Floating particles background
- Card hover effects with 3D transforms
- Button hover states with shadows
- Smooth page transitions

### Accessibility
- Proper form labels
- Keyboard navigation support
- Focus states on interactive elements
- Clear error messages

## Security Features

### Row Level Security (RLS)
- Enabled on `user_profiles` table
- Users can only access their own data
- Prevents unauthorized data access

### Password Requirements
- Minimum 6 characters
- Validated client-side before submission

### Email Validation
- HTML5 email input type
- Browser-native validation

## Navigation Flow

```
Landing Page (index.html)
    ↓ (Click "Start Free Trial")
Account Type Selection (account-type-selection.html)
    ↓ (Choose account type)
Auth Page (auth.html?type=X&mode=signup)
    ↓ (Sign up or login)
Landing Page (index.html) - Authenticated
```

## Files Created

1. **account-type-selection.html** - Account type selection page
2. **auth.html** - Unified login/signup page
3. **auth.js** - Authentication JavaScript module with Supabase integration
4. **Database Migration** - `user_profiles` table with RLS policies

## Next Steps

After successful authentication testing:
1. Create protected routes that require authentication
2. Add user dashboard for each account type
3. Implement profile editing functionality
4. Add logout functionality
5. Create parent-child account linking for parent accounts
6. Build teacher classroom management features
