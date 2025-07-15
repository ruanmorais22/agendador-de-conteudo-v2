// --- MÓDULO DE UI: CALENDÁRIO E CRUD ---
import { 
    getUser, 
    fetchContentItems as dbFetchContentItems,
    upsertContentItem,
    deleteContentItem,
    getContentItemById,
    uploadFile,
    getPublicUrl,
    removeFile,
    fetchUserStats
} from '../services/supabaseService.js';
import { showToast } from './notifications.js';

// --- ELEMENTOS DO DOM ---
const contentForm = document.getElementById('content-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const deleteBtn = document.getElementById('delete-btn');
const duplicateBtn = document.getElementById('duplicate-btn');
const contentTypeSelect = document.getElementById('content-type');
const textFields = document.getElementById('text-fields');
const imageFields = document.getElementById('image-fields');
const videoFields = document.getElementById('video-fields');
const isRecurringCheckbox = document.getElementById('is-recurring');
const recurringFields = document.getElementById('recurring-fields');

// --- VARIÁVEIS GLOBAIS ---
let calendar;
let searchDebounceTimer;

// --- FUNÇÕES DE UI ---
const handleContentTypeChange = () => {
    const selectedType = contentTypeSelect.value;
    const textContent = document.getElementById('content-text');
    const imageContent = document.getElementById('content-image');
    const videoContent = document.getElementById('content-video');

    textFields.classList.add('hidden');
    imageFields.classList.add('hidden');
    videoFields.classList.add('hidden');
    textContent.required = false;
    imageContent.required = false;
    videoContent.required = false;

    if (selectedType === 'text') {
        textFields.classList.remove('hidden');
        textContent.required = true;
    } else if (selectedType === 'image') {
        imageFields.classList.remove('hidden');
        imageContent.required = true;
    } else if (selectedType === 'video') {
        videoFields.classList.remove('hidden');
        videoContent.required = true;
    }
};

const handleRecurringChange = () => {
    const endDateInput = document.getElementById('recurrence-end');
    if (isRecurringCheckbox.checked) {
        recurringFields.classList.remove('hidden');
        endDateInput.required = true;
    } else {
        recurringFields.classList.add('hidden');
        endDateInput.required = false;
    }
};

const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    // O objeto Date já interpreta a string ISO (com 'Z') como UTC e a converte para o fuso horário local do navegador.
    // Precisamos apenas formatá-la para o padrão que o input 'datetime-local' espera.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getNowForInput = () => {
    const now = new Date();
    // Ajusta para o fuso horário local para que o valor mínimo seja correto
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

const populateContentForm = (event) => {
    resetContentForm();
    const item = event.extendedProps;

    document.getElementById('content-id').value = item.id;
    document.getElementById('content-title').value = item.title;
    
    if (item.content_type_id === 1) {
        contentTypeSelect.value = 'text';
        document.getElementById('content-text').value = item.text_content;
    } else if (item.content_type_id === 2) {
        contentTypeSelect.value = 'image';
        document.getElementById('content-caption-image').value = item.caption;
    } else if (item.content_type_id === 3) {
        contentTypeSelect.value = 'video';
        document.getElementById('content-caption-video').value = item.caption;
    }
    
    handleContentTypeChange();

    if (item.is_recurring && item.recurrence_pattern) {
        isRecurringCheckbox.checked = true;
        handleRecurringChange();
        document.getElementById('recurrence-freq').value = item.recurrence_pattern.freq;
        document.getElementById('recurrence-end').value = item.recurrence_pattern.until;
    }

    document.getElementById('content-date').value = formatDateForInput(item.scheduled_for);
    
    cancelEditBtn.classList.remove('hidden');
    deleteBtn.classList.remove('hidden');
    duplicateBtn.classList.remove('hidden');
};

const resetContentForm = () => {
    contentForm.reset();
    document.getElementById('content-id').value = '';
    const dateInput = document.getElementById('content-date');
    dateInput.min = getNowForInput();
    cancelEditBtn.classList.add('hidden');
    deleteBtn.classList.add('hidden');
    duplicateBtn.classList.add('hidden');
    handleContentTypeChange();
    if (isRecurringCheckbox.checked) {
        isRecurringCheckbox.checked = false;
        handleRecurringChange();
    }
};

// --- FUNÇÕES DE DADOS ---
const fetchContentItems = async () => {
    const { data: { user } } = await getUser();
    if (!user) return;

    const selectedTypes = Array.from(document.querySelectorAll('input[name="filter-type"]:checked')).map(cb => cb.value);
    const searchTerm = document.getElementById('search-input').value;

    if (selectedTypes.length === 0 && !searchTerm) {
        calendar.getEvents().forEach(event => event.remove());
        return;
    }

    const { data, error } = await dbFetchContentItems(user.id, selectedTypes, searchTerm);

    if (error) {
        console.error('Erro ao buscar conteúdo:', error);
        return;
    }

    calendar.getEvents().forEach(event => event.remove());

    const events = data.map(item => {
        if (item.is_recurring && item.recurrence_pattern) {
            const { freq, until } = item.recurrence_pattern;
            return {
                id: item.id,
                title: item.title,
                rrule: {
                    freq,
                    dtstart: new Date(item.scheduled_for).toISOString(),
                    until: new Date(until).toISOString(),
                },
                duration: '01:00',
                extendedProps: { ...item }
            };
        }
        const eventData = {
            id: item.id,
            title: item.title,
            start: item.scheduled_for,
            extendedProps: { ...item }
        };
        if (item.content_type_id === 2) {
            eventData.backgroundColor = '#10B981';
            eventData.borderColor = '#059669';
        } else if (item.content_type_id === 3) {
            eventData.backgroundColor = '#8B5CF6';
            eventData.borderColor = '#7C3AED';
        }
        return eventData;
    });
    calendar.addEventSource(events);
};

const handleContentSubmit = async (event) => {
    event.preventDefault();
    console.log('Debug: handleContentSubmit iniciado.');

    const { data: { user } } = await getUser();
    if (!user) {
        console.log('Debug: Usuário não encontrado, encerrando.');
        return;
    }
    console.log('Debug: Usuário verificado:', user.id);

    const contentId = document.getElementById('content-id').value;
    const contentType = contentTypeSelect.value;
    console.log(`Debug: contentId=${contentId}, contentType=${contentType}`);
    
    const localDate = document.getElementById('content-date').value;
    if (!localDate) {
        showToast('Por favor, selecione uma data e hora.', 'error');
        console.log('Debug: Data não selecionada, encerrando.');
        return;
    }
    const scheduledForUTC = new Date(localDate).toISOString();
    console.log('Debug: Data convertida para UTC:', scheduledForUTC);

    let contentData = {
        user_id: user.id,
        title: document.getElementById('content-title').value,
        scheduled_for: scheduledForUTC,
        status_id: 2,
        is_recurring: isRecurringCheckbox.checked,
        recurrence_pattern: null
    };

    if (contentData.is_recurring) {
        contentData.recurrence_pattern = {
            freq: document.getElementById('recurrence-freq').value,
            until: document.getElementById('recurrence-end').value
        };
        console.log('Debug: Conteúdo recorrente configurado.');
    }

    if (contentType === 'text') {
        contentData.content_type_id = 1;
        contentData.text_content = document.getElementById('content-text').value;
        console.log('Debug: Preparando conteúdo de texto.');
    } else {
        console.log('Debug: Preparando conteúdo de imagem/vídeo.');
        const isImage = contentType === 'image';
        contentData.content_type_id = isImage ? 2 : 3;
        contentData.caption = document.getElementById(isImage ? 'content-caption-image' : 'content-caption-video').value;
        
        const fileInput = document.getElementById(isImage ? 'content-image' : 'content-video');
        const file = fileInput.files[0];
        
        if (file) {
            console.log('Debug: Arquivo selecionado:', file.name);
            const filePath = `${user.id}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await uploadFile('content-media', filePath, file);
            if (uploadError) {
                showToast(`Erro no upload: ${uploadError.message}`, 'error');
                console.log('Debug: Erro no upload do arquivo, encerrando.', uploadError);
                return;
            }
            const { data: urlData } = getPublicUrl('content-media', filePath);
            contentData.file_url = urlData.publicUrl;
            console.log('Debug: Upload concluído, URL pública:', contentData.file_url);
        } else if (!contentId) {
            showToast(`Por favor, selecione um arquivo de ${isImage ? 'imagem' : 'vídeo'}.`, 'error');
            console.log('Debug: Arquivo de imagem/vídeo não selecionado para novo item, encerrando.');
            return;
        }
    }

    console.log('Debug: PRESTES A CHAMAR upsertContentItem com os dados:', contentData);
    const { error } = await upsertContentItem(contentData, contentId);
    console.log('Debug: upsertContentItem foi chamado.');

    if (error) {
        showToast(`Erro ao salvar conteúdo: ${error.message}`, 'error');
        console.log('Debug: Erro retornado pelo upsertContentItem:', error);
    } else {
        showToast('Conteúdo salvo com sucesso!');
        console.log('Debug: Conteúdo salvo com sucesso, atualizando calendário.');
        resetContentForm();
        fetchContentItems();
    }
};

const handleDuplicateContent = async () => {
    const contentId = document.getElementById('content-id').value;
    if (!contentId) return;
    if (!confirm('Tem certeza que deseja duplicar este conteúdo?')) return;

    const { data: originalItem, error: fetchError } = await getContentItemById(contentId);
    if (fetchError) {
        showToast(`Erro ao buscar item para duplicar: ${fetchError.message}`, 'error');
        return;
    }

    const newItemData = { ...originalItem };
    delete newItemData.id;
    delete newItemData.created_at;
    newItemData.title = `${originalItem.title} (Cópia)`;
    const newDate = new Date(originalItem.scheduled_for);
    newDate.setDate(newDate.getDate() + 1);
    newItemData.scheduled_for = newDate.toISOString();

    const { error: insertError } = await upsertContentItem(newItemData);
    if (insertError) {
        showToast(`Erro ao duplicar conteúdo: ${insertError.message}`, 'error');
    } else {
        showToast('Conteúdo duplicado com sucesso!');
        resetContentForm();
        fetchContentItems();
    }
};

const handleDeleteContent = async () => {
    const contentId = document.getElementById('content-id').value;
    if (!contentId) return;
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return;

    const { data: item, error: fetchError } = await getContentItemById(contentId);
    if (fetchError) {
        showToast(`Erro ao buscar item para exclusão: ${fetchError.message}`, 'error');
        return;
    }

    const { error: deleteDbError } = await deleteContentItem(contentId);
    if (deleteDbError) {
        showToast(`Erro ao excluir do banco de dados: ${deleteDbError.message}`, 'error');
        return;
    }

    if (item && item.file_url) {
        const filePath = new URL(item.file_url).pathname.split('/content-media/')[1];
        const { error: deleteStorageError } = await removeFile('content-media', filePath);
        if (deleteStorageError) {
            showToast(`Item excluído do banco, mas erro ao remover arquivo do Storage: ${deleteStorageError.message}`, 'error');
        }
    }

    showToast('Conteúdo excluído com sucesso!');
    resetContentForm();
    fetchContentItems();
};

// --- INICIALIZAÇÃO ---
export const initCalendar = () => {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'pt-br',
        buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' },
        eventClick: (info) => populateContentForm(info.event),
        eventDrop: async (info) => {
            const { error } = await upsertContentItem({ scheduled_for: info.event.start.toISOString() }, info.event.id);
            if (error) {
                showToast(`Erro ao reagendar: ${error.message}`, 'error');
                info.revert();
            } else {
                showToast('Conteúdo reagendado com sucesso!');
            }
        },
        dateClick: (info) => {
            resetContentForm();
            const dateInput = document.getElementById('content-date');
            const clickedDate = new Date(info.dateStr + "T00:00:00");
            const now = new Date();
            
            // Zera os segundos e milissegundos para comparação
            now.setSeconds(0, 0);

            // Se a data clicada for hoje, usa a hora atual, senão, usa meio-dia.
            if (clickedDate.toDateString() === now.toDateString()) {
                 dateInput.value = getNowForInput();
            } else {
                 dateInput.value = info.dateStr + "T12:00";
            }
        }
    });
    calendar.render();
    fetchContentItems();
    
    // Adicionar listeners
    contentForm.addEventListener('submit', handleContentSubmit);
    cancelEditBtn.addEventListener('click', resetContentForm);
    deleteBtn.addEventListener('click', handleDeleteContent);
    duplicateBtn.addEventListener('click', handleDuplicateContent);
    contentTypeSelect.addEventListener('change', handleContentTypeChange);
    isRecurringCheckbox.addEventListener('change', handleRecurringChange);
    document.querySelectorAll('input[name="filter-type"]').forEach(cb => cb.addEventListener('change', fetchContentItems));
    document.getElementById('search-input').addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(fetchContentItems, 300);
    });
};

export const destroyCalendar = () => {
    if (calendar) {
        calendar.destroy();
        calendar = null;
    }
};
