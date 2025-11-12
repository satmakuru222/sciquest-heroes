import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';
import { supabaseConfig } from '../config.js';

const supabaseUrl = supabaseConfig.url;
const supabaseAnonKey = supabaseConfig.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let isSignUpMode = false;
let accountType = '';

const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');
const type = urlParams.get('type');

if (mode === 'signup') {
    isSignUpMode = true;
    accountType = type || localStorage.getItem('accountType') || '';
} else {
    // For login mode, also get account type from URL or localStorage
    accountType = type || localStorage.getItem('accountType') || '';
}

const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const submitBtnText = document.getElementById('submitBtnText');
const googleBtnText = document.getElementById('googleBtnText');
const toggleText = document.getElementById('toggleText');
const toggleModeLink = document.getElementById('toggleModeLink');
const forgotPasswordContainer = document.getElementById('forgotPasswordContainer');
const authForm = document.getElementById('authForm');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const divider = document.getElementById('divider');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const modeToggleTop = document.getElementById('modeToggleTop');
const modeToggleTopText = document.getElementById('modeToggleTopText');
const modeToggleIcon = document.getElementById('modeToggleIcon');

function updateUI() {
    // Hide Google sign-in for student accounts
    const isStudentAccount = accountType === 'student';
    if (googleSignInBtn) {
        googleSignInBtn.style.display = isStudentAccount ? 'none' : 'flex';
    }
    if (divider) {
        divider.style.display = isStudentAccount ? 'none' : 'flex';
    }

    if (isSignUpMode) {
        authTitle.textContent = 'Create a free account';
        authSubtitle.textContent = `Join SciQuest Heroes as a ${accountType || 'member'}`;
        submitBtnText.textContent = 'Sign Up';
        googleBtnText.textContent = 'Sign up with Google';
        toggleText.textContent = 'Already have an account?';
        toggleModeLink.textContent = 'Log In';
        modeToggleTopText.textContent = 'Log In';
        modeToggleIcon.className = 'fas fa-sign-in-alt';
        forgotPasswordContainer.style.display = 'none';
    } else {
        authTitle.textContent = 'Welcome Back!';
        authSubtitle.textContent = 'Sign in to continue your adventure';
        submitBtnText.textContent = 'Log In';
        googleBtnText.textContent = 'Continue with Google';
        toggleText.textContent = "Don't have an account?";
        toggleModeLink.textContent = 'Sign Up';
        modeToggleTopText.textContent = 'Sign Up';
        modeToggleIcon.className = 'fas fa-user-plus';
        forgotPasswordContainer.style.display = 'block';
    }
}

updateUI();

function toggleMode(e) {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    updateUI();
    hideMessages();
}

toggleModeLink.addEventListener('click', toggleMode);
modeToggleTop.addEventListener('click', toggleMode);

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    successMessage.classList.remove('show');
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.add('show');
    errorMessage.classList.remove('show');
}

function hideMessages() {
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
}

function setLoading(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    const googleBtn = document.getElementById('googleSignInBtn');

    if (isLoading) {
        submitBtn.disabled = true;
        googleBtn.disabled = true;
        submitBtnText.innerHTML = '<span class="loading-spinner"></span>Processing...';
    } else {
        submitBtn.disabled = false;
        googleBtn.disabled = false;
        submitBtnText.textContent = isSignUpMode ? 'Sign Up' : 'Log In';
    }
}

async function createUserProfile(userId, email, accountType) {
    try {
        const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (existingProfile) {
            console.log('User profile already exists');
            return;
        }

        const { error } = await supabase
            .from('user_profiles')
            .insert({
                id: userId,
                email: email,
                account_type: accountType || 'student'
            });

        if (error) {
            if (error.code === '23505') {
                console.log('User profile already exists (duplicate key)');
                return;
            }
            console.error('Error creating user profile:', error);
            throw error;
        }
    } catch (error) {
        console.error('Failed to create user profile:', error);
        throw error;
    }
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    setLoading(true);

    try {
        if (isSignUpMode) {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) throw error;

            if (data.user) {
                await createUserProfile(data.user.id, email, accountType);
                showSuccess('Account created successfully! Redirecting...');
                const userAccountType = accountType || 'student';
                localStorage.removeItem('accountType');

                setTimeout(() => {
                    if (userAccountType === 'parent') {
                        window.location.href = '../dashboards/parent-dashboard.html';
                    } else if (userAccountType === 'teacher') {
                        window.location.href = '../dashboards/teacher-dashboard.html';
                    } else if (userAccountType === 'student') {
                        window.location.href = '../dashboards/student-dashboard.html';
                    } else {
                        window.location.href = '../index.html';
                    }
                }, 1500);
            }
        } else {
            // Login mode
            console.log('=== Login Attempt ===');
            console.log('Email:', email);
            console.log('Account type from context:', accountType || 'not specified');
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('=== Authentication Error ===');
                console.error('Error:', error);
                console.error('Error message:', error.message);
                throw error;
            }

            if (data.user) {
                console.log('=== Authentication Successful ===');
                console.log('User ID:', data.user.id);
                console.log('User email:', data.user.email);
                console.log('Fetching user profile...');
                
                const { data: profile, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('account_type')
                    .eq('id', data.user.id)
                    .maybeSingle();

                // Check for profile errors first - show immediately
                if (profileError) {
                    // Comprehensive error logging for debugging
                    console.error('=== Profile Fetch Error ===');
                    console.error('Error object:', profileError);
                    console.error('Error details:', {
                        code: profileError.code,
                        message: profileError.message,
                        details: profileError.details,
                        hint: profileError.hint,
                        userId: data.user.id,
                        userEmail: data.user.email,
                        accountTypeFromContext: accountType,
                        timestamp: new Date().toISOString()
                    });
                    
                    // Check if it's an RLS policy error
                    const isRLSError = profileError.code === '42501' || 
                                      profileError.message?.toLowerCase().includes('permission denied') || 
                                      profileError.message?.toLowerCase().includes('policy') ||
                                      profileError.message?.toLowerCase().includes('row-level security');
                    
                    if (isRLSError) {
                        console.error('=== RLS Policy Error Detected ===');
                        console.error('This indicates a Row Level Security (RLS) policy configuration issue.');
                        console.error('The user is authenticated but cannot read their own profile from user_profiles table.');
                        console.error('Possible causes:');
                        console.error('  1. Missing "Users can read own profile" policy');
                        console.error('  2. Conflicting RLS policies');
                        console.error('  3. Recursive RLS checks in parent-child policies');
                        console.error('Solution: Run fix_rls_login_error.sql in Supabase SQL Editor');
                        
                        const errorCode = 'RLS-' + Date.now();
                        console.error('Error code for support:', errorCode);
                        
                        // Provide helpful error message with instructions
                        showError(`Account access error. Please contact support with error code: ${errorCode}. This is a database configuration issue that needs to be fixed by an administrator.`);
                    } else {
                        // For non-RLS errors, use accountType from URL/localStorage as fallback
                        console.warn('Non-RLS profile fetch error, attempting fallback based on account type context');
                        
                        if (accountType === 'student') {
                            console.warn('Profile fetch error, redirecting to student dashboard (fallback)');
                            showSuccess('Login successful! Redirecting...');
                            setTimeout(() => {
                                window.location.href = '../dashboards/student-dashboard.html';
                            }, 1500);
                        } else if (accountType === 'parent') {
                            console.warn('Profile fetch error, redirecting to parent dashboard (fallback)');
                            showSuccess('Login successful! Redirecting...');
                            setTimeout(() => {
                                window.location.href = '../dashboards/parent-dashboard.html';
                            }, 1500);
                        } else if (accountType === 'teacher') {
                            console.warn('Profile fetch error, redirecting to teacher dashboard (fallback)');
                            showSuccess('Login successful! Redirecting...');
                            setTimeout(() => {
                                window.location.href = '../dashboards/teacher-dashboard.html';
                            }, 1500);
                        } else {
                            console.warn('Profile fetch error, showing error message (no fallback available)');
                            showError('Unable to load your account profile. Please try again or contact support.');
                        }
                    }
                    return;
                }

                // Check if profile exists and has account_type
                if (!profile) {
                    console.warn('User profile not found in database, attempting fallback based on account type context');
                    console.warn('Profile lookup details:', {
                        userId: data.user.id,
                        userEmail: data.user.email,
                        accountTypeFromContext: accountType
                    });
                    
                    // Use accountType from URL/localStorage as fallback for all account types
                    if (accountType === 'student') {
                        console.warn('User profile not found, redirecting to student dashboard (fallback)');
                        showSuccess('Login successful! Redirecting...');
                        setTimeout(() => {
                            window.location.href = '../dashboards/student-dashboard.html';
                        }, 1500);
                    } else if (accountType === 'parent') {
                        console.warn('User profile not found, redirecting to parent dashboard (fallback)');
                        showSuccess('Login successful! Redirecting...');
                        setTimeout(() => {
                            window.location.href = '../dashboards/parent-dashboard.html';
                        }, 1500);
                    } else if (accountType === 'teacher') {
                        console.warn('User profile not found, redirecting to teacher dashboard (fallback)');
                        showSuccess('Login successful! Redirecting...');
                        setTimeout(() => {
                            window.location.href = '../dashboards/teacher-dashboard.html';
                        }, 1500);
                    } else {
                        console.warn('User profile not found, showing error message (no fallback available)');
                        showError('User profile not found. Please contact support to set up your account.');
                    }
                    return;
                }

                if (!profile.account_type) {
                    console.warn('Account type missing in profile, attempting fallback based on account type context');
                    console.warn('Profile data:', {
                        userId: data.user.id,
                        userEmail: data.user.email,
                        profileData: profile,
                        accountTypeFromContext: accountType
                    });
                    
                    // Use accountType from URL/localStorage as fallback for all account types
                    if (accountType === 'student') {
                        console.warn('Account type missing in profile, redirecting to student dashboard (fallback)');
                        showSuccess('Login successful! Redirecting...');
                        setTimeout(() => {
                            window.location.href = '../dashboards/student-dashboard.html';
                        }, 1500);
                    } else if (accountType === 'parent') {
                        console.warn('Account type missing in profile, redirecting to parent dashboard (fallback)');
                        showSuccess('Login successful! Redirecting...');
                        setTimeout(() => {
                            window.location.href = '../dashboards/parent-dashboard.html';
                        }, 1500);
                    } else if (accountType === 'teacher') {
                        console.warn('Account type missing in profile, redirecting to teacher dashboard (fallback)');
                        showSuccess('Login successful! Redirecting...');
                        setTimeout(() => {
                            window.location.href = '../dashboards/teacher-dashboard.html';
                        }, 1500);
                    } else {
                        console.warn('Account type missing in profile, showing error message (no fallback available)');
                        showError('Account type is missing from your profile. Please contact support.');
                    }
                    return;
                }

                // Check account type and redirect accordingly
                // Handle parent accounts first to ensure they go to parent dashboard
                const accountTypeFromProfile = profile.account_type.toLowerCase().trim();
                console.log('=== Profile Retrieved Successfully ===');
                console.log('User account type from profile:', accountTypeFromProfile);
                console.log('Account type from context:', accountType);
                
                // All valid account types - show success and redirect after delay
                if (accountTypeFromProfile === 'parent') {
                    showSuccess('Login successful! Redirecting...');
                    setTimeout(() => {
                        window.location.href = '../dashboards/parent-dashboard.html';
                    }, 1500);
                    return;
                } else if (accountTypeFromProfile === 'teacher') {
                    showSuccess('Login successful! Redirecting...');
                    setTimeout(() => {
                        window.location.href = '../dashboards/teacher-dashboard.html';
                    }, 1500);
                    return;
                } else if (accountTypeFromProfile === 'student') {
                    showSuccess('Login successful! Redirecting...');
                    setTimeout(() => {
                        window.location.href = '../dashboards/student-dashboard.html';
                    }, 1500);
                    return;
                } else {
                    // Invalid account type - use accountType from URL/localStorage as fallback for students
                    if (accountType === 'student') {
                        console.warn('Invalid account_type:', accountTypeFromProfile, 'redirecting to student dashboard');
                        showSuccess('Login successful! Redirecting...');
                        setTimeout(() => {
                            window.location.href = '../dashboards/student-dashboard.html';
                        }, 1500);
                    } else {
                        console.warn('Invalid account_type:', accountTypeFromProfile, 'showing error message');
                        showError('Invalid account type detected. Please contact support.');
                    }
                }
            }
        }
    } catch (error) {
        // Comprehensive error logging for all authentication errors
        console.error('=== Authentication Flow Error ===');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Mode:', isSignUpMode ? 'Sign Up' : 'Login');
        console.error('Account type context:', accountType || 'not specified');
        console.error('Timestamp:', new Date().toISOString());

        // Handle specific error types
        if (error.message?.includes('Invalid login credentials')) {
            console.warn('Invalid credentials provided');
            showError('Invalid email or password. Please try again.');
        } else if (error.message?.includes('User already registered')) {
            console.warn('User attempted to sign up with existing email');
            showError('This email is already registered. Please log in instead.');
            setTimeout(() => {
                isSignUpMode = false;
                updateUI();
                hideMessages();
            }, 2000);
        } else if (error.message?.includes('Email not confirmed')) {
            console.warn('User email not confirmed');
            showError('Please check your email to confirm your account.');
        } else if (error.message?.includes('duplicate key')) {
            console.warn('Duplicate key error - user profile may already exist');
            showError('This account already exists. Please log in instead.');
        } else {
            // Generic error handling
            console.error('Unhandled authentication error');
            showError(error.message || 'An error occurred. Please try again.');
        }
    } finally {
        setLoading(false);
    }
});

googleSignInBtn.addEventListener('click', async () => {
    hideMessages();

    // Prevent Google OAuth for student accounts
    if (accountType === 'student') {
        showError('Google sign-in is not available for student accounts. Please use email and password.');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/index.html',
                queryParams: {
                    prompt: 'select_account'
                }
            }
        });

        if (error) throw error;
    } catch (error) {
        console.error('Google sign-in error:', error);
        showError('Failed to sign in with Google. Please try again.');
    }
});

document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();
    openForgotPasswordModal();
});

function openForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.style.display = 'flex';
    document.getElementById('resetEmail').value = document.getElementById('email').value;
}

window.closeForgotPasswordModal = function() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.style.display = 'none';
    document.getElementById('resetErrorMessage').classList.remove('show');
    document.getElementById('resetSuccessMessage').classList.remove('show');
}

document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const resetEmail = document.getElementById('resetEmail').value.trim();
    const resetErrorMessage = document.getElementById('resetErrorMessage');
    const resetSuccessMessage = document.getElementById('resetSuccessMessage');
    const resetSubmitBtn = document.getElementById('resetSubmitBtn');
    const resetBtnText = document.getElementById('resetBtnText');

    if (!resetEmail) {
        resetErrorMessage.textContent = 'Please enter your email address';
        resetErrorMessage.classList.add('show');
        return;
    }

    resetSubmitBtn.disabled = true;
    resetBtnText.innerHTML = '<span class="loading-spinner"></span>Sending...';

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: window.location.origin + '/auth/auth.html'
        });

        if (error) throw error;

        resetSuccessMessage.textContent = 'Password reset email sent! Check your inbox.';
        resetSuccessMessage.classList.add('show');
        resetErrorMessage.classList.remove('show');

        setTimeout(() => {
            closeForgotPasswordModal();
        }, 3000);
    } catch (error) {
        console.error('Password reset error:', error);
        resetErrorMessage.textContent = error.message || 'Failed to send reset email. Please try again.';
        resetErrorMessage.classList.add('show');
        resetSuccessMessage.classList.remove('show');
    } finally {
        resetSubmitBtn.disabled = false;
        resetBtnText.textContent = 'Send Reset Link';
    }
});

supabase.auth.onAuthStateChange((event, session) => {
    (async () => {
        if (event === 'SIGNED_IN' && session) {
            console.log('=== Auth State Change: SIGNED_IN ===');
            console.log('User ID:', session.user.id);
            console.log('User email:', session.user.email);
            
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

            if (profileError) {
                console.error('=== Profile Fetch Error in Auth State Change ===');
                console.error('Error:', profileError);
                console.error('Error code:', profileError.code);
                console.error('Error message:', profileError.message);
                
                // Check if it's an RLS error
                const isRLSError = profileError.code === '42501' || 
                                  profileError.message?.toLowerCase().includes('permission denied') || 
                                  profileError.message?.toLowerCase().includes('policy') ||
                                  profileError.message?.toLowerCase().includes('row-level security');
                
                if (isRLSError) {
                    console.error('RLS policy error detected in auth state change handler');
                    console.error('This may prevent profile creation. Check RLS policies.');
                }
            }

            if (!profile) {
                console.warn('Profile not found during auth state change, attempting to create');
                const storedAccountType = accountType || localStorage.getItem('accountType') || 'student';
                console.log('Creating profile with account type:', storedAccountType);
                
                try {
                    await createUserProfile(session.user.id, session.user.email, storedAccountType);
                    console.log('Profile created successfully during auth state change');
                } catch (error) {
                    console.error('=== Error creating profile during auth state change ===');
                    console.error('Error:', error);
                    console.error('Error code:', error.code);
                    console.error('Error message:', error.message);
                    console.error('This may indicate an RLS policy issue for INSERT operations');
                }
            } else {
                console.log('Profile found during auth state change:', {
                    accountType: profile.account_type,
                    email: profile.email
                });
            }
        }
    })();
});
