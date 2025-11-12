import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';
import { supabaseConfig } from './config.js';

const supabaseUrl = supabaseConfig.url;
const supabaseAnonKey = supabaseConfig.anonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const avatars = [
    { id: 'bolt', name: 'Bolt', image: 'assets/avatars/Bolt.png' },
    { id: 'echo', name: 'Echo', image: 'assets/avatars/Echo.png' },
    { id: 'finn', name: 'Finn', image: 'assets/avatars/Finn.png' },
    { id: 'kira', name: 'Kira', image: 'assets/avatars/Kira.png' },
    { id: 'leo', name: 'Leo', image: 'assets/avatars/Leo.png' },
    { id: 'max', name: 'Max', image: 'assets/avatars/Max.png' },
    { id: 'ruby', name: 'Ruby', image: 'assets/avatars/Ruby.png' },
    { id: 'stella', name: 'Stella', image: 'assets/avatars/Stella_flora.png' },
    { id: 'rex', name: 'Rex', image: 'assets/avatars/Dino_rexexplorer.png' }
];

let selectedAvatar = null;

const avatarGrid = document.getElementById('avatarGrid');
const confirmBtn = document.getElementById('confirmBtn');
const confirmBtnText = document.getElementById('confirmBtnText');
const skipBtn = document.getElementById('skipBtn');
const errorMessage = document.getElementById('errorMessage');

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideError() {
    errorMessage.classList.remove('show');
}

function renderAvatars() {
    avatars.forEach(avatar => {
        const card = document.createElement('div');
        card.className = 'avatar-card';
        card.dataset.avatarId = avatar.id;

        card.innerHTML = `
            <div class="avatar-image-wrapper">
                <img src="${avatar.image}" alt="${avatar.name}" onerror="this.src='assets/avatars/Bolt.png'">
            </div>
            <div class="avatar-name">${avatar.name}</div>
        `;

        card.addEventListener('click', () => selectAvatar(avatar.id));
        avatarGrid.appendChild(card);
    });
}

function selectAvatar(avatarId) {
    hideError();

    document.querySelectorAll('.avatar-card').forEach(card => {
        card.classList.remove('selected');
    });

    const selectedCard = document.querySelector(`[data-avatar-id="${avatarId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        selectedAvatar = avatars.find(a => a.id === avatarId);
        confirmBtn.disabled = false;
    }
}

async function saveAvatar(avatarImage) {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            throw new Error('No active session. Please log in again.');
        }

        const { error } = await supabase
            .from('user_profiles')
            .update({ avatar_url: avatarImage })
            .eq('id', session.user.id);

        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Error saving avatar:', error);
        throw error;
    }
}

confirmBtn.addEventListener('click', async () => {
    if (!selectedAvatar) {
        showError('Please select an avatar');
        return;
    }

    confirmBtn.disabled = true;
    confirmBtnText.innerHTML = '<span class="loading-spinner"></span>Saving...';

    try {
        await saveAvatar(selectedAvatar.image);

        localStorage.removeItem('newStudentSignup');

        setTimeout(() => {
            window.location.href = 'dashboards/student-dashboard.html';
        }, 500);
    } catch (error) {
        showError('Failed to save avatar. Please try again.');
        confirmBtn.disabled = false;
        confirmBtnText.textContent = 'Confirm Selection';
    }
});

skipBtn.addEventListener('click', () => {
    localStorage.removeItem('newStudentSignup');
    window.location.href = 'dashboards/student-dashboard.html';
});

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
}

checkAuth();
renderAvatars();
