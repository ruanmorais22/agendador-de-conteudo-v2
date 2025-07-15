// JavaScript de apoio para a interface - carrega antes dos módulos principais
document.addEventListener('DOMContentLoaded', function() {
    console.log('UI Support carregado - configurando interface básica');
    
    // Configurar data mínima para hoje
    const today = new Date().toISOString().slice(0, 16);
    const contentDateInput = document.getElementById('content-date');
    if (contentDateInput) {
        contentDateInput.min = today;
    }

    // Toggle entre login e signup
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    const loginView = document.getElementById('login-view');
    const signupView = document.getElementById('signup-view');
    
    if (showSignupBtn && showLoginBtn && loginView && signupView) {
        showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.classList.add('hidden');
            signupView.classList.remove('hidden');
        });
        
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signupView.classList.add('hidden');
            loginView.classList.remove('hidden');
        });
    }

    // Tabs do sidebar
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetTab = link.dataset.tab;
            
            tabLinks.forEach(tl => tl.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            link.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Tipo de conteúdo
    const contentType = document.getElementById('content-type');
    const textFields = document.getElementById('text-fields');
    const imageFields = document.getElementById('image-fields');
    const videoFields = document.getElementById('video-fields');

    if (contentType && textFields && imageFields && videoFields) {
        contentType.addEventListener('change', (e) => {
            textFields.classList.add('hidden');
            imageFields.classList.add('hidden');
            videoFields.classList.add('hidden');

            switch(e.target.value) {
                case 'text':
                    textFields.classList.remove('hidden');
                    break;
                case 'image':
                    imageFields.classList.remove('hidden');
                    break;
                case 'video':
                    videoFields.classList.remove('hidden');
                    break;
            }
        });
    }

    // Agendamento recorrente
    const isRecurring = document.getElementById('is-recurring');
    const recurringFields = document.getElementById('recurring-fields');

    if (isRecurring && recurringFields) {
        isRecurring.addEventListener('change', (e) => {
            if (e.target.checked) {
                recurringFields.classList.remove('hidden');
            } else {
                recurringFields.classList.add('hidden');
            }
        });
    }

    // Modal de perfil
    const profileLink = document.getElementById('profile-link');
    const profileModal = document.getElementById('profile-modal');
    const closeProfileModal = document.getElementById('close-profile-modal');

    if (profileLink && profileModal && closeProfileModal) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            profileModal.classList.remove('hidden');
        });

        closeProfileModal.addEventListener('click', () => {
            profileModal.classList.add('hidden');
        });

        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                profileModal.classList.add('hidden');
            }
        });
    }

    // Avatar preview
    const profileAvatar = document.getElementById('profile-avatar');
    const avatarImg = document.getElementById('avatar-img');

    if (profileAvatar && avatarImg) {
        profileAvatar.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatarImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    console.log('UI Support configurado com sucesso');
});

// Função de utilidade para toast (fallback se o módulo principal não carregar)
window.showToastFallback = function(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease-out, fadeOut 0.5s ease-in 4s forwards;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 300px;
        margin-bottom: 1rem;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'};
        z-index: 10000;
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `
        <i class="fas ${icon}" style="font-size: 1.25rem;"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
};

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 10000;
        display: flex;
        flex-direction: column;
    `;
    document.body.appendChild(container);
    return container;
}

// Animações CSS inline para toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);