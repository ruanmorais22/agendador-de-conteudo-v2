// --- MÓDULO DE UI: NOTIFICAÇÕES TOAST ---

const toastContainer = document.getElementById('toast-container');

export const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Remove o toast após a animação terminar (3 segundos)
    setTimeout(() => {
        toast.remove();
    }, 3000);
};
