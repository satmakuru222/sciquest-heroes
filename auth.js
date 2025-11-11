import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';
import { supabaseConfig } from './config.js';

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
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const modeToggleTop = document.getElementById('modeToggleTop');
const modeToggleTopText = document.getElementById('modeToggleTopText');
const modeToggleIcon = document.getElementById('modeToggleIcon');

function updateUI() {
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
                        window.location.href = 'parent-dashboard.html';
                    } else if (userAccountType === 'teacher') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            }
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            if (data.user) {
                showSuccess('Login successful! Redirecting...');

                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('account_type')
                    .eq('id', data.user.id)
                    .maybeSingle();

                setTimeout(() => {
                    if (profile && profile.account_type === 'parent') {
                        window.location.href = 'parent-dashboard.html';
                    } else if (profile && profile.account_type === 'teacher') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            }
        }
    } catch (error) {
        console.error('Auth error:', error);

        if (error.message.includes('Invalid login credentials')) {
            showError('Invalid email or password. Please try again.');
        } else if (error.message.includes('User already registered')) {
            showError('This email is already registered. Please log in instead.');
            setTimeout(() => {
                isSignUpMode = false;
                updateUI();
                hideMessages();
            }, 2000);
        } else if (error.message.includes('Email not confirmed')) {
            showError('Please check your email to confirm your account.');
        } else if (error.message.includes('duplicate key')) {
            showError('This account already exists. Please log in instead.');
        } else {
            showError(error.message || 'An error occurred. Please try again.');
        }
    } finally {
        setLoading(false);
    }
});

googleSignInBtn.addEventListener('click', async () => {
    hideMessages();

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
            redirectTo: window.location.origin + '/auth.html'
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
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

            if (!profile) {
                const storedAccountType = accountType || localStorage.getItem('accountType') || 'student';
                try {
                    await createUserProfile(session.user.id, session.user.email, storedAccountType);
                } catch (error) {
                    console.error('Error creating profile during auth state change:', error);
                }
            }
        }
    })();
});
