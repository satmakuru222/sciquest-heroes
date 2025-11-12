import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';
import { supabaseConfig } from '../config.js';

const supabaseUrl = supabaseConfig.url;
const supabaseAnonKey = supabaseConfig.anonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthAndUpdateUI() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

        if (profile) {
            if (profile.account_type === 'parent') {
                window.location.href = 'dashboards/parent-dashboard.html';
                return;
            } else if (profile.account_type === 'teacher') {
                window.location.href = 'dashboards/teacher-dashboard.html';
                return;
            } else if (profile.account_type === 'student') {
                window.location.href = 'dashboards/student-dashboard.html';
                return;
            }
        }
    }
}

function addUserMenuToNavbar(profile) {
    const navbarInner = document.querySelector('nav .max-w-7xl');

    if (!navbarInner) return;

    const startButton = navbarInner.querySelector('.btn-3d');
    if (!startButton) return;

    const displayName = profile.first_name || profile.full_name || profile.username || 'User';
    const initial = displayName.charAt(0).toUpperCase();

    const userMenuHTML = `
        <div class="user-menu" style="position: relative;">
            <div class="user-menu-trigger" id="navUserMenuTrigger" style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 20px;
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 50px;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                <div class="user-avatar" style="
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #a855f7, #ec4899);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 800;
                    font-size: 16px;
                    overflow: hidden;
                ">
                    ${profile.avatar_url ? `<img src="${profile.avatar_url}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">` : initial}
                </div>
                <span style="font-weight: 700; color: #1e293b; font-size: 14px;">${displayName}</span>
                <i class="fas fa-chevron-down" style="color: #64748b; font-size: 12px;"></i>
            </div>
            <div class="dropdown-menu" id="navDropdownMenu" style="
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                min-width: 220px;
                display: none;
                overflow: hidden;
                z-index: 1000;
            ">
                <a href="${getDashboardLink(profile.account_type)}" class="dropdown-item" style="
                    padding: 14px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #475569;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                ">
                    <i class="fas fa-th-large" style="width: 20px;"></i>
                    <span>Dashboard</span>
                </a>
                ${profile.account_type === 'student' ? `
                <a href="profile.html" class="dropdown-item" style="
                    padding: 14px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #475569;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                ">
                    <i class="fas fa-user" style="width: 20px;"></i>
                    <span>Profile</span>
                </a>
                <a href="avatar-selection.html" class="dropdown-item" style="
                    padding: 14px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #475569;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                ">
                    <i class="fas fa-user-circle" style="width: 20px;"></i>
                    <span>Change Avatar</span>
                </a>
                ` : ''}
                <div style="height: 1px; background: #e2e8f0; margin: 8px 0;"></div>
                <div class="dropdown-item" id="navLogoutBtn" style="
                    padding: 14px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #475569;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">
                    <i class="fas fa-sign-out-alt" style="width: 20px;"></i>
                    <span>Logout</span>
                </div>
            </div>
        </div>
    `;

    startButton.outerHTML = userMenuHTML;

    const userMenuTrigger = document.getElementById('navUserMenuTrigger');
    const dropdownMenu = document.getElementById('navDropdownMenu');
    const logoutBtn = document.getElementById('navLogoutBtn');

    userMenuTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!userMenuTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.color = '#a855f7';
        });
        item.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#475569';
        });
    });

    userMenuTrigger.addEventListener('mouseenter', (e) => {
        e.currentTarget.style.borderColor = '#a855f7';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.2)';
    });
    userMenuTrigger.addEventListener('mouseleave', (e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            localStorage.clear();
            sessionStorage.clear();

            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to logout. Please try again.');
        }
    });
}

function getDashboardLink(accountType) {
    if (accountType === 'parent') {
        return 'dashboards/parent-dashboard.html';
    } else if (accountType === 'teacher') {
        return 'dashboards/teacher-dashboard.html';
    } else if (accountType === 'student') {
        return 'dashboards/student-dashboard.html';
    }
    return 'index.html#avatars';
}

checkAuthAndUpdateUI();
