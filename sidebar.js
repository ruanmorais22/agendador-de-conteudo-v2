// --- MÓDULO DE UI: SIDEBAR (ABAS E ESTATÍSTICAS) ---
import { getUser, fetchUserStats as dbFetchUserStats } from '../services/supabaseService.js';

const tabs = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

const handleTabClick = (event) => {
    const tab = event.currentTarget.dataset.tab;

    tabs.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    event.currentTarget.classList.add('active');
    document.getElementById(tab).classList.add('active');

    if (tab === 'stats') {
        fetchAndRenderStats();
    }
};

const fetchAndRenderStats = async () => {
    const { data: { user } } = await getUser();
    if (!user) return;

    const { data, error } = await dbFetchUserStats(user.id);

    if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return;
    }

    if (data && data[0]) {
        const stats = data[0];
        document.getElementById('stat-total').textContent = stats.total_content || 0;
        document.getElementById('stat-scheduled').textContent = stats.scheduled_content || 0;
        document.getElementById('stat-published').textContent = stats.published_content || 0;
        document.getElementById('stat-draft').textContent = stats.draft_content || 0;

        const byTypeContainer = document.getElementById('stat-by-type');
        byTypeContainer.innerHTML = '';
        if (stats.content_by_type) {
            for (const [type, count] of Object.entries(stats.content_by_type)) {
                const statElement = document.createElement('div');
                statElement.innerHTML = `<div><i class="fas fa-${type === 'text' ? 'font' : type}"></i> ${type.charAt(0).toUpperCase() + type.slice(1)}</div> <span>${count}</span>`;
                byTypeContainer.appendChild(statElement);
            }
        }
    }
};

export const initSidebar = () => {
    tabs.forEach(button => button.addEventListener('click', handleTabClick));
    // Carrega as estatísticas iniciais se a aba já estiver ativa
    if (document.querySelector('.tab-link[data-tab="stats"].active')) {
        fetchAndRenderStats();
    }
};
