// --- MÓDULO DE UI: MODAIS ---
import { getUser, fetchProfile, updateProfile, uploadFile, getPublicUrl } from '../services/supabaseService.js';
import { showToast } from './notifications.js';

const profileModal = document.getElementById('profile-modal');
const profileForm = document.getElementById('profile-form');
const profileLink = document.getElementById('profile-link');
const closeProfileModalBtn = document.getElementById('close-profile-modal');
const avatarImg = document.getElementById('avatar-img');

const openProfileModal = async () => {
    const { data: { user } } = await getUser();
    if (!user) return;

    const { data: profile, error } = await fetchProfile(user.id);

    if (error) {
        showToast(`Erro ao carregar perfil: ${error.message}`, 'error');
        return;
    }

    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-name').value = profile.full_name || '';
    avatarImg.src = profile.avatar_url || 'https://via.placeholder.com/100';

    profileModal.classList.remove('hidden');
};

const closeProfileModal = () => {
    profileModal.classList.add('hidden');
};

const handleProfileUpdate = async (event) => {
    event.preventDefault();
    const { data: { user } } = await getUser();
    if (!user) return;

    const newName = document.getElementById('profile-name').value;
    const avatarFile = document.getElementById('profile-avatar').files[0];
    let avatarUrl = avatarImg.src;

    if (avatarFile) {
        const filePath = `public/${user.id}-${Date.now()}`;
        const { error: uploadError } = await uploadFile('avatars', filePath, avatarFile);

        if (uploadError) {
            showToast(`Erro no upload do avatar: ${uploadError.message}`, 'error');
            return;
        }

        const { data: urlData } = getPublicUrl('avatars', filePath);
        avatarUrl = urlData.publicUrl;
    }

    const { error: updateError } = await updateProfile(user.id, { full_name: newName, avatar_url: avatarUrl });

    if (updateError) {
        showToast(`Erro ao atualizar perfil: ${updateError.message}`, 'error');
    } else {
        showToast('Perfil atualizado com sucesso!');
        closeProfileModal();
    }
};

export const initModals = () => {
    profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        openProfileModal();
    });
    closeProfileModalBtn.addEventListener('click', closeProfileModal);
    profileForm.addEventListener('submit', handleProfileUpdate);
};
