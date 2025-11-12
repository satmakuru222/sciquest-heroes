import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';
import { supabaseConfig } from '../config.js';

const supabaseUrl = supabaseConfig.url;
const supabaseAnonKey = supabaseConfig.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let currentPanel = 1;
let formData = {
    age: '',
    parentEmail: '',
    firstName: '',
    email: '',
    password: ''
};

const panel1 = document.getElementById('panel1');
const panel2 = document.getElementById('panel2');
const panel1Form = document.getElementById('panel1Form');
const panel2Form = document.getElementById('panel2Form');
const backBtn = document.getElementById('backBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const panelTitle = document.getElementById('panelTitle');
const panelSubtitle = document.getElementById('panelSubtitle');
const step1Indicator = document.getElementById('step1Indicator');
const step2Indicator = document.getElementById('step2Indicator');
const progressLine = document.getElementById('progressLine');

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

function goToPanel(panelNumber) {
    currentPanel = panelNumber;

    if (panelNumber === 1) {
        panel1.classList.add('active');
        panel2.classList.remove('active');
        panelTitle.textContent = "Let's Get Started!";
        panelSubtitle.textContent = "Tell us a bit about yourself";

        step1Indicator.classList.add('active');
        step1Indicator.classList.remove('completed');
        step2Indicator.classList.remove('active');
        progressLine.classList.remove('completed');
    } else if (panelNumber === 2) {
        panel1.classList.remove('active');
        panel2.classList.add('active');
        panelTitle.textContent = "Create Your Account";
        panelSubtitle.textContent = "Choose your username and password";

        step1Indicator.classList.remove('active');
        step1Indicator.classList.add('completed');
        step2Indicator.classList.add('active');
        progressLine.classList.add('completed');
    }

    hideMessages();
}

async function checkEmailAvailability(email) {
    try {
        const { data, error } = await supabase.rpc('check_email_availability', {
            check_email: email
        });

        if (error) {
            console.error('Error checking email availability:', error);
            return false;
        }

        return data === true;
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
}

panel1Form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const age = document.getElementById('studentAge').value;
    const parentEmail = document.getElementById('parentEmail').value.trim();

    if (!age) {
        showError('Please select your age');
        return;
    }

    if (!parentEmail) {
        showError('Please enter your parent\'s email');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
        showError('Please enter a valid email address');
        return;
    }

    formData.age = parseInt(age);
    formData.parentEmail = parentEmail;

    goToPanel(2);
});

backBtn.addEventListener('click', () => {
    goToPanel(1);
});

panel2Form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const firstName = document.getElementById('firstName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const captcha = document.getElementById('captcha').value;

    if (!firstName) {
        showError('Please enter your first name');
        return;
    }

    if (!email) {
        showError('Please enter your email address');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }

    if (!password || password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    if (captcha !== '8') {
        showError('Incorrect answer. Please try again. What is 5 + 3?');
        document.getElementById('captcha').value = '';
        return;
    }

    const signupBtn = document.getElementById('signupBtn');
    const signupBtnText = document.getElementById('signupBtnText');
    signupBtn.disabled = true;
    signupBtnText.innerHTML = '<span class="loading-spinner"></span>Creating Account...';

    try {
        const isEmailAvailable = await checkEmailAvailability(email);
        if (!isEmailAvailable) {
            showError('This email is already registered. Please use a different email or try logging in.');
            signupBtn.disabled = false;
            signupBtnText.textContent = 'Sign Up';
            return;
        }

        let parentId = null;
        const { data: parentProfile, error: parentLookupError } = await supabase
            .from('user_profiles')
            .select('id, account_type')
            .eq('email', formData.parentEmail)
            .eq('account_type', 'parent')
            .maybeSingle();

        if (parentLookupError && parentLookupError.code !== 'PGRST116') {
            console.error('Error looking up parent:', parentLookupError);
        }

        if (parentProfile) {
            parentId = parentProfile.id;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    account_type: 'student',
                    first_name: firstName
                }
            }
        });

        if (authError) {
            if (authError.message && authError.message.toLowerCase().includes('already registered')) {
                throw new Error('This email is already registered. Please use a different email or try logging in.');
            }
            throw authError;
        }

        if (authData.user) {
            const profileData = {
                id: authData.user.id,
                email: email,
                account_type: 'student',
                first_name: firstName,
                age: formData.age,
                parent_email: formData.parentEmail
            };

            if (parentId) {
                profileData.parent_id = parentId;
            }

            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert(profileData);

            if (profileError) {
                console.error('Error creating profile:', profileError);
                throw profileError;
            }

            localStorage.setItem('newStudentSignup', 'true');
            localStorage.setItem('studentEmail', email);

            showSuccess('Account created successfully! Redirecting to avatar selection...');

            setTimeout(() => {
                window.location.href = 'avatar-selection.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Signup error:', error);

        const errorMsg = error.message || '';

        if (errorMsg.toLowerCase().includes('already registered') || errorMsg.toLowerCase().includes('already exists')) {
            showError('This email is already registered. Please use a different email or try logging in at auth/auth.html');
        } else if (errorMsg.includes('duplicate key')) {
            showError('This email is already registered. Please use a different email or try logging in at auth/auth.html');
        } else if (errorMsg.includes('violates check constraint')) {
            showError('Unable to create student account. Please check your information and try again.');
        } else if (errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('invalid')) {
            showError('Please enter a valid email address.');
        } else {
            showError(errorMsg || 'An error occurred during signup. Please try again.');
        }
    } finally {
        signupBtn.disabled = false;
        signupBtnText.textContent = 'Sign Up';
    }
});
