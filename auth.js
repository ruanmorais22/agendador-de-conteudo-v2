// --- MÓDULO DE UI: AUTENTICAÇÃO ---
import { signIn, signUp, signOut } from '../services/supabaseService.js';
import { showToast } from './notifications.js';

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');

const showLoginView = () => {
    signupView.classList.add('hidden');
    loginView.classList.remove('hidden');
}

const showSignupView = () => {
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
}

const handleLogin = async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { error } = await signIn(email, password);

    if (error) {
        showToast(`Erro no login: ${error.message}`, 'error');
    } else {
        loginForm.reset();
        // O onAuthStateChange cuidará do resto
    }
};

const handleSignup = async (event) => {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const { error } = await signUp(email, password);

    if (error) {
        showToast(`Erro no cadastro: ${error.message}`, 'error');
    } else {
        showToast('Cadastro realizado! Verifique seu email para confirmação.');
        signupForm.reset();
        showLoginView();
    }
};

const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
        showToast(`Erro ao sair: ${error.message}`, 'error');
    }
    // O onAuthStateChange cuidará do resto
};

export const initAuth = () => {
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSignupView();
    });
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginView();
    });
};
