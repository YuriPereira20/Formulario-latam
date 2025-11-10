// Inicializar dataLayer se não existir
window.dataLayer = window.dataLayer || [];

// Configurações e constantes
const FORM_ID = 'trafficManagerForm';
const LOCALSTORAGE_KEY = 'gestor_trafego_form_data';

// Elementos do DOM
const form = document.getElementById(FORM_ID);
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoading = submitBtn.querySelector('.btn-loading');

// Validadores
const validators = {
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    whatsapp: (value) => {
        // Validar formato: +XX seguido de números (permite espaços e hífens)
        const whatsappRegex = /^\+\d{1,4}\s?\d{6,14}$/;
        // Remove espaços e hífens para validação
        const cleanValue = value.replace(/[\s-]/g, '');
        return /^\+\d{1,4}\d{6,14}$/.test(cleanValue);
    },

    required: (value) => {
        return value && value.trim().length > 0;
    },

    checkbox: (name) => {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        return checkboxes.length > 0;
    },

    radio: (name) => {
        const radio = document.querySelector(`input[name="${name}"]:checked`);
        return radio !== null;
    }
};

// Mensagens de erro
const errorMessages = {
    required: 'Este campo es obligatorio',
    email: 'Por favor, introduce un correo electrónico válido',
    whatsapp: 'Por favor, introduce un WhatsApp válido con código de país (ej: +57 300 123 4567)',
    checkbox: 'Por favor, selecciona al menos una opción',
    radio: 'Por favor, selecciona una opción'
};

// Função para mostrar erro
function showError(fieldName, message) {
    const errorElement = document.getElementById(`error_${fieldName}`);
    const field = document.getElementById(fieldName) || document.querySelector(`input[name="${fieldName}"]`);

    if (errorElement) {
        errorElement.textContent = message;
    }

    if (field) {
        field.classList.add('error');
        // Se for input de texto, adiciona classe de erro
        if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
            field.classList.add('error');
        }
    }
}

// Função para limpar erro
function clearError(fieldName) {
    const errorElement = document.getElementById(`error_${fieldName}`);
    const field = document.getElementById(fieldName) || document.querySelector(`input[name="${fieldName}"]`);

    if (errorElement) {
        errorElement.textContent = '';
    }

    if (field) {
        field.classList.remove('error');
    }
}

// Validar campo individual
function validateField(fieldName, fieldType = 'text') {
    clearError(fieldName);

    let isValid = true;
    let errorMsg = '';

    if (fieldType === 'email') {
        const field = document.getElementById(fieldName);
        if (!validators.required(field.value)) {
            isValid = false;
            errorMsg = errorMessages.required;
        } else if (!validators.email(field.value)) {
            isValid = false;
            errorMsg = errorMessages.email;
        }
    }
    else if (fieldType === 'whatsapp') {
        const field = document.getElementById(fieldName);
        if (!validators.required(field.value)) {
            isValid = false;
            errorMsg = errorMessages.required;
        } else if (!validators.whatsapp(field.value)) {
            isValid = false;
            errorMsg = errorMessages.whatsapp;
        }
    }
    else if (fieldType === 'text' || fieldType === 'textarea') {
        const field = document.getElementById(fieldName);
        if (!validators.required(field.value)) {
            isValid = false;
            errorMsg = errorMessages.required;
        }
    }
    else if (fieldType === 'checkbox') {
        if (!validators.checkbox(fieldName)) {
            isValid = false;
            errorMsg = errorMessages.checkbox;
        }
    }
    else if (fieldType === 'radio') {
        if (!validators.radio(fieldName)) {
            isValid = false;
            errorMsg = errorMessages.radio;
        }
    }

    if (!isValid) {
        showError(fieldName, errorMsg);
    }

    return isValid;
}

// Adicionar validação em tempo real (on blur)
function setupRealtimeValidation() {
    // Campos de texto
    const textFields = [
        { id: 'nombre_completo', type: 'text' },
        { id: 'email', type: 'email' },
        { id: 'whatsapp', type: 'whatsapp' },
        { id: 'referentes', type: 'textarea' }
    ];

    textFields.forEach(({ id, type }) => {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener('blur', () => validateField(id, type));
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    validateField(id, type);
                }
            });
        }
    });

    // Radio buttons
    const radioFields = ['nivel_trafico', 'experiencia_clientes', 'presupuesto', 'formacion', 'disponibilidad'];
    radioFields.forEach(name => {
        const radios = document.querySelectorAll(`input[name="${name}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', () => clearError(name));
        });
    });

    // Checkboxes
    const checkboxFields = ['plataformas', 'intereses'];
    checkboxFields.forEach(name => {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => clearError(name));
        });
    });
}

// Coletar dados do formulário
function collectFormData() {
    const formData = {
        timestamp: new Date().toISOString(),
        nombre_completo: document.getElementById('nombre_completo').value.trim(),
        email: document.getElementById('email').value.trim(),
        whatsapp: document.getElementById('whatsapp').value.trim(),
        instagram: document.getElementById('instagram').value.trim() || '',
        nivel_trafico: document.querySelector('input[name="nivel_trafico"]:checked')?.value || '',
        experiencia_clientes: document.querySelector('input[name="experiencia_clientes"]:checked')?.value || '',
        plataformas: Array.from(document.querySelectorAll('input[name="plataformas"]:checked')).map(cb => cb.value),
        presupuesto: document.querySelector('input[name="presupuesto"]:checked')?.value || '',
        formacion: document.querySelector('input[name="formacion"]:checked')?.value || '',
        referentes: document.getElementById('referentes').value.trim(),
        intereses: Array.from(document.querySelectorAll('input[name="intereses"]:checked')).map(cb => cb.value),
        disponibilidad: document.querySelector('input[name="disponibilidad"]:checked')?.value || '',
        desafio_principal: document.getElementById('desafio_principal').value.trim(),
        medicion_resultados: document.getElementById('medicion_resultados').value.trim() || ''
    };

    return formData;
}

// Validar formulário completo
function validateForm() {
    let isValid = true;

    // Validar campos de texto obrigatórios
    if (!validateField('nombre_completo', 'text')) isValid = false;
    if (!validateField('email', 'email')) isValid = false;
    if (!validateField('whatsapp', 'whatsapp')) isValid = false;
    if (!validateField('referentes', 'textarea')) isValid = false;

    // Validar radio buttons obrigatórios
    if (!validateField('nivel_trafico', 'radio')) isValid = false;
    if (!validateField('experiencia_clientes', 'radio')) isValid = false;
    if (!validateField('presupuesto', 'radio')) isValid = false;
    if (!validateField('formacion', 'radio')) isValid = false;
    if (!validateField('disponibilidad', 'radio')) isValid = false;

    // Validar checkboxes obrigatórios
    if (!validateField('plataformas', 'checkbox')) isValid = false;
    if (!validateField('intereses', 'checkbox')) isValid = false;

    return isValid;
}

// Salvar no localStorage
function saveToLocalStorage(data) {
    try {
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
        console.log('Dados salvos no localStorage:', data);
        return true;
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        return false;
    }
}

// Enviar evento para dataLayer
function sendToDataLayer(data) {
    try {
        window.dataLayer.push({
            event: 'form_submit',
            form_name: 'gestor_trafego_latam',
            form_data: data
        });
        console.log('Evento enviado para dataLayer:', {
            event: 'form_submit',
            form_name: 'gestor_trafego_latam',
            form_data: data
        });
        return true;
    } catch (error) {
        console.error('Erro ao enviar para dataLayer:', error);
        return false;
    }
}

// Mostrar loading no botão
function setButtonLoading(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        btnText.style.display = 'inline-block';
        btnLoading.style.display = 'none';
    }
}

// Mostrar mensagem de sucesso
function showSuccessMessage() {
    successMessage.style.display = 'block';
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Scroll para o primeiro erro
function scrollToFirstError() {
    const firstError = document.querySelector('.error-message:not(:empty)');
    if (firstError) {
        const fieldGroup = firstError.closest('.form-group');
        if (fieldGroup) {
            fieldGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Handler do submit
async function handleSubmit(event) {
    event.preventDefault();

    // Esconder mensagem de sucesso se estiver visível
    successMessage.style.display = 'none';

    // Validar formulário
    const isValid = validateForm();

    if (!isValid) {
        scrollToFirstError();
        return;
    }

    // Mostrar loading
    setButtonLoading(true);

    // Simular delay de envio (para melhor UX)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Coletar dados
    const formData = collectFormData();

    // Salvar no localStorage
    const savedToStorage = saveToLocalStorage(formData);

    // Enviar para dataLayer
    const sentToDataLayer = sendToDataLayer(formData);

    // Remover loading
    setButtonLoading(false);

    if (savedToStorage && sentToDataLayer) {
        // Mostrar mensagem de sucesso
        showSuccessMessage();

        // Resetar formulário (opcional - você pode comentar esta linha se quiser manter os dados)
        // form.reset();

        // Limpar erros
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    } else {
        alert('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.');
    }
}

// Carregar dados salvos (opcional - para recuperar dados em caso de refresh)
function loadSavedData() {
    try {
        const savedData = localStorage.getItem(LOCALSTORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            console.log('Dados encontrados no localStorage:', data);
            // Você pode implementar aqui a lógica para preencher o formulário
            // com os dados salvos, se desejar
        }
    } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
    }
}

// Inicializar
function init() {
    // Setup validação em tempo real
    setupRealtimeValidation();

    // Add submit handler
    form.addEventListener('submit', handleSubmit);

    // Carregar dados salvos (opcional)
    loadSavedData();

    console.log('Formulário inicializado com sucesso!');
}

// Executar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Prevenir perda de dados ao fechar página (opcional)
window.addEventListener('beforeunload', (event) => {
    const formData = collectFormData();
    // Verificar se há dados preenchidos (exceto timestamp)
    const hasData = Object.entries(formData).some(([key, value]) => {
        if (key === 'timestamp') return false;
        if (Array.isArray(value)) return value.length > 0;
        return value && value.trim().length > 0;
    });

    // Se houver dados e o formulário não foi enviado com sucesso
    if (hasData && successMessage.style.display === 'none') {
        // Salvar rascunho no localStorage
        saveToLocalStorage({ ...formData, draft: true });
    }
});
