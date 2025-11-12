# Student Signup Updated to Use Email Address

## Summary of Changes

The student signup flow has been updated to work exactly like parent and teacher signup - using email addresses instead of usernames for authentication.

## What Changed

### 1. Student Signup Form (student-signup.html)

**Before:**
- Panel 2 had a "Choose Username" field
- Username was used to generate a temporary email pattern

**After:**
- Panel 2 now has "Student's Email Address" field
- Students provide their actual email address for authentication
- Works the same way as parent/teacher signup

### 2. Student Signup JavaScript (student-signup.js)

**Changed:**
- Removed username field and validation
- Removed `checkUsernameAvailability()` function
- Added `checkEmailAvailability()` function
- Removed temporary email pattern generation (`@student.sciquest.app`)
- Students now sign up with their real email address
- User profile stores student's email in the `email` field

**Form Data Structure:**
```javascript
let formData = {
    age: '',
    parentEmail: '',
    firstName: '',
    email: '',        // Changed from 'username'
    password: ''
};
```

**Signup Flow:**
```javascript
// Students now sign up with real email
const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email,  // Real student email, not generated
    password: password,
    options: {
        data: {
            account_type: 'student',
            first_name: firstName
        }
    }
});
```

**User Profile Creation:**
```javascript
await supabase
    .from('user_profiles')
    .insert({
        id: authData.user.id,
        email: email,              // Student's email
        account_type: 'student',
        first_name: firstName,
        age: formData.age,
        parent_email: formData.parentEmail  // Parent's email
    });
```

### 3. Authentication (auth.js)

**Removed:**
- Username-to-email conversion logic
- No longer needed since students use real emails

**Before:**
```javascript
// Converted username to email
if (!email.includes('@')) {
    email = `${email}@student.sciquest.app`;
}
```

**After:**
```javascript
// Standard email validation only
const email = document.getElementById('email').value.trim();
```

### 4. Login Form (auth.html)

**Reverted to Standard:**
- Label changed back to "Email Address"
- Input type changed back to `email`
- Removed username-specific help text
- Now identical to parent/teacher login

## How It Works Now

### Student Signup Process

1. **Panel 1:** Enter student age and parent email (mandatory)
2. **Panel 2:** Enter:
   - Student's first name
   - Student's email address (real email)
   - Password
   - Captcha (5 + 3 = 8)
3. System creates Supabase auth account with student's email
4. User profile created with:
   - `email`: Student's email address
   - `account_type`: 'student'
   - `parent_email`: Parent's email (for notifications)
   - `first_name`: Student's name
   - `age`: Student's age

### Student Login Process

1. Student enters their email address (same as parent/teacher)
2. Student enters their password
3. System authenticates with Supabase
4. Retrieves account_type from user_profiles
5. Routes to appropriate page

### Two Email Addresses for Students

Students now have TWO email addresses stored:

1. **Student Email** (`user_profiles.email`)
   - Student's actual email address
   - Used for authentication/login
   - Required field

2. **Parent Email** (`user_profiles.parent_email`)
   - Parent's email address
   - Used for notifications and updates
   - Required field

## Benefits of This Change

1. **Consistency:** All user types (student, parent, teacher) now sign up the same way
2. **Real Authentication:** Students use their actual email addresses
3. **No Special Handling:** No need for username-to-email conversion
4. **Email Confirmation:** Can use standard Supabase email confirmation if needed
5. **Simpler Code:** Removed complex username handling logic
6. **Standard Login:** Login form works the same for all user types

## Files Modified

1. **student-signup.html**
   - Changed "Choose Username" to "Student's Email Address"
   - Updated placeholder and help text
   - Changed input type to email

2. **student-signup.js**
   - Changed username field to email field
   - Updated validation to use email format
   - Removed username checking logic
   - Added email availability checking
   - Removed temporary email generation
   - Updated user profile insert to use real email

3. **auth.js**
   - Removed username-to-email conversion
   - Standard email authentication only

4. **auth.html**
   - Reverted to standard email field
   - Removed username-specific help text

## Migration Notes

### Existing Users with Username-Based Accounts

If there are existing student accounts created with the old username pattern (`username@student.sciquest.app`):

- They can still log in using that generated email
- Consider creating a migration script to update them to real emails
- Or allow them to continue using the generated email until they update their profile

### Database Schema

No database schema changes needed. The existing `user_profiles` table already has:
- `email` field (NOT NULL) - now stores student's real email
- `parent_email` field (nullable) - stores parent's email
- `account_type` field - identifies user as 'student'
- `username` field (nullable) - can be deprecated or repurposed

## Testing Checklist

- [x] Build completes successfully
- [ ] Test student signup with real email address
- [ ] Verify parent email is still captured and stored
- [ ] Test student login with email and password
- [ ] Verify account_type routing works correctly
- [ ] Test parent signup still works normally
- [ ] Test teacher signup still works normally
- [ ] Verify both emails are stored in user_profiles

## Supabase Configuration

Since students now use real email addresses, you should:

1. **Enable Email Confirmation** (optional but recommended)
   - Go to: Supabase Dashboard → Authentication → Providers → Email
   - Turn ON "Confirm email"
   - Students will receive a confirmation email

2. **Or Keep Auto-Confirmation** (for faster signup)
   - Keep "Confirm email" turned OFF
   - Students can log in immediately after signup

## Summary

Student signup now works exactly like parent/teacher signup using real email addresses. This simplifies the codebase, provides consistency across all user types, and enables standard email-based features like password reset and email notifications.
