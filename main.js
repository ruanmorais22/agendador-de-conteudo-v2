// --- PONTO DE ENTRADA PRINCIPAL DA APLICAÇÃO ---
import { onAuthStateChange, testConnection } from './services/supabaseService.js';
import { initAuth } from './ui/auth.js';
import { initModals } from './ui/modals.js';
import { initSidebar } from './ui/sidebar.js';
import { initCalendar, destroyCalendar } from './ui/calendar.js';

console.log('🚀 Inicializando aplicação...');

const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');

// Verificar se os elementos existem
if (!authContainer || !dashboardContainer) {
    console.error('❌ Elementos de container não encontrados no DOM');
    throw new Error('Elementos necessários não encontrados');
}

const showDashboard = () => {
    console.log('📊 Mostrando dashboard');
    authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
};

const showAuth = () => {
    console.log('🔐 Mostrando tela de autenticação');
    dashboardContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
};

// --- INICIALIZAÇÃO GERAL ---
const initializeApp = async () => {
    try {
        console.log('🔧 Inicializando módulos...');
        
        // Testar conexão com Supabase
        const connectionOk = await testConnection();
        if (!connectionOk) {
            throw new Error('Falha na conexão com Supabase');
        }
        
        // Inicializar módulos de UI
        initAuth();
        initModals();
        initSidebar();
        
        console.log('✅ Módulos inicializados com sucesso');
        
        // --- GERENCIAMENTO DE SESSÃO ---
        onAuthStateChange((event, session) => {
            console.log('🔄 Mudança de estado de autenticação:', event);
            
            if (session) {
                console.log('👤 Usuário autenticado:', session.user.email);
                showDashboard();
                initCalendar();
            } else {
                console.log('🚪 Usuário não autenticado');
                showAuth();
                destroyCalendar();
            }
        });
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        
        // Mostrar mensagem de erro para o usuário
        const errorMessage = `
            <div style="
                position: fixed; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                padding: 2rem;
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                text-align: center;
                z-index: 10000;
            ">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
                <h2 style="margin-bottom: 1rem; color: #1a1a1a;">Erro de Inicialização</h2>
                <p style="margin-bottom: 1.5rem; color: #6b7280;">${error.message}</p>
                <button onclick="location.reload()" style="
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorMessage);
    }
};

// Aguardar o DOM estar pronto antes de inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}