// utils/errorHandler.js
export function handleSupabaseError(error) {
    console.error('Erro Supabase:', error);
    
    if (error.message.includes('auth is undefined')) {
        console.error('Supabase Auth não inicializado');
        // Recarregar a página ou reinicializar Supabase
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
    
    // Mostra mensagem amigável para o usuário
    showUserMessage('Erro de conexão. Tente novamente.');
}

function showUserMessage(message) {
    // Implemente sua UI de mensagens
    const messageEl = document.createElement('div');
    messageEl.className = 'error-message';
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}