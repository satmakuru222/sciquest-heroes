import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';
import { supabaseConfig } from './config.js';

const supabaseUrl = supabaseConfig.url;
const supabaseAnonKey = supabaseConfig.anonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const userMenuTrigger = document.getElementById('userMenuTrigger');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatarSmall = document.getElementById('userAvatarSmall');
const userNameNav = document.getElementById('userNameNav');
const profileAvatar = document.getElementById('profileAvatar');
const profileTitle = document.getElementById('profileTitle');
const accountTypeBadge = document.getElementById('accountTypeBadge');
const profileForm = document.getElementById('profileForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const saveBtnText = document.getElementById('saveBtnText');
const studentFieldsRow = document.getElementById('studentFieldsRow');

const firstNameInput = document.getElementById('firstName');
const usernameInput = document.getElementById('username');
const ageInput = document.getElementById('age');
const parentEmailInput = document.getElementById('parentEmail');
const emailInput = document.getElementById('email');
const fullNameInput = document.getElementById('fullName');

let currentProfile = null;

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    successMessage.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.add('show');
    errorMessage.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideMessages() {
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
}

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = 'auth/auth.html';
        return;
    }

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('account_type')
        .eq('id', session.user.id)
        .maybeSingle();

    if (profile && profile.account_type !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    loadUserProfile(session.user.id);
}

async function loadUserProfile(userId) {
    try {
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) throw error;

        if (profile) {
            currentProfile = profile;

            const displayName = profile.first_name || profile.full_name || profile.username || profile.email;
            userNameNav.textContent = displayName;
            profileTitle.textContent = `${displayName}'s Profile`;

            firstNameInput.value = profile.first_name || '';
            usernameInput.value = profile.username || '';
            emailInput.value = profile.email || '';
            fullNameInput.value = profile.full_name || '';

            if (profile.account_type === 'student') {
                studentFieldsRow.style.display = 'grid';
                ageInput.value = profile.age || '';
                parentEmailInput.value = profile.parent_email || '';
                accountTypeBadge.className = 'badge badge-student';
                accountTypeBadge.textContent = 'Student';
            } else if (profile.account_type === 'parent') {
                accountTypeBadge.className = 'badge badge-parent';
                accountTypeBadge.textContent = 'Parent';
            } else if (profile.account_type === 'teacher') {
                accountTypeBadge.className = 'badge badge-teacher';
                accountTypeBadge.textContent = 'Teacher';
            }

            if (profile.avatar_url) {
                userAvatarSmall.innerHTML = `<img src="${profile.avatar_url}" alt="Avatar">`;
                profileAvatar.innerHTML = `<img src="${profile.avatar_url}" alt="Avatar">`;
            } else if (profile.first_name) {
                const initial = profile.first_name.charAt(0).toUpperCase();
                userAvatarSmall.textContent = initial;
                profileAvatar.textContent = initial;
            } else if (profile.username) {
                const initial = profile.username.charAt(0).toUpperCase();
                userAvatarSmall.textContent = initial;
                profileAvatar.textContent = initial;
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile data');
    }
}

userMenuTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (!userMenuTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        localStorage.clear();
        sessionStorage.clear();

        window.location.href = 'auth/auth.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
    }
});

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const firstName = firstNameInput.value.trim();
    const fullName = fullNameInput.value.trim();

    if (!firstName && currentProfile.account_type === 'student') {
        showError('First name is required');
        return;
    }

    const updateData = {
        first_name: firstName || null,
        full_name: fullName || null
    };

    if (currentProfile.account_type === 'student') {
        const age = parseInt(ageInput.value);
        const parentEmail = parentEmailInput.value.trim();

        if (age && (age < 5 || age > 12)) {
            showError('Age must be between 5 and 12');
            return;
        }

        if (parentEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(parentEmail)) {
                showError('Please enter a valid parent email address');
                return;
            }
        }

        updateData.age = age || null;
        updateData.parent_email = parentEmail || null;
    }

    const submitBtn = profileForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    saveBtnText.innerHTML = '<span class="loading-spinner"></span>Saving...';

    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            throw new Error('No active session');
        }

        const { error } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('id', session.user.id);

        if (error) throw error;

        showSuccess('Profile updated successfully!');
        await loadUserProfile(session.user.id);
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Failed to update profile. Please try again.');
    } finally {
        submitBtn.disabled = false;
        saveBtnText.textContent = 'Save Changes';
    }
});

checkAuth();
