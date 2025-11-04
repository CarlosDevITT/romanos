// js/pwa-notifications.js
class PWANotifications {
    constructor() {
        this.isSubscribed = false;
        this.swRegistration = null;
        this.publicVapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-WkGzZOEN-LLjO6U-6jJp8gvRzCchc7k2qVD-LJN4C_ZON2oRk1RA5BE';
        this.init();
    }

    async init() {
        if (!this.supportsNotifications()) {
            console.log('Push notifications não são suportadas neste navegador');
            return;
        }

        try {
            // Registrar Service Worker
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            console.log('✅ Service Worker registrado com sucesso');

            // Aguardar o Service Worker estar ativo
            await this.waitForServiceWorkerActivation();
            
            // Verificar estado atual da inscrição
            await this.checkSubscription();

        } catch (error) {
            console.error('❌ Falha ao registrar Service Worker:', error);
        }
    }

    async waitForServiceWorkerActivation() {
        if (this.swRegistration.active) {
            return this.swRegistration.active;
        }
        
        if (this.swRegistration.installing) {
            return new Promise((resolve) => {
                this.swRegistration.installing.addEventListener('statechange', (e) => {
                    if (e.target.state === 'activated') {
                        resolve(e.target);
                    }
                });
            });
        }
        
        return this.swRegistration.active;
    }

    async checkSubscription() {
        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            this.isSubscribed = !(subscription === null);
            
            if (this.isSubscribed) {
                console.log('✅ Usuário já está inscrito em notificações push');
                await this.saveSubscription(subscription);
            } else {
                console.log('ℹ️ Usuário não está inscrito em notificações push');
            }
            
            return this.isSubscribed;
        } catch (error) {
            console.error('Erro ao verificar inscrição:', error);
            return false;
        }
    }

    async requestNotificationPermission() {
        if (!this.supportsNotifications()) {
            console.log('Este navegador não suporta notificações');
            return 'unsupported';
        }

        try {
            const permission = await Notification.requestPermission();
            console.log('Permissão de notificação:', permission);
            
            if (permission === 'granted') {
                return await this.subscribeToPush();
            } else if (permission === 'denied') {
                console.warn('Permissão para notificações foi negada pelo usuário');
                return 'denied';
            }
            return permission;
        } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            return 'error';
        }
    }

    async subscribeToPush() {
        try {
            // Verificar se já está inscrito
            const existingSubscription = await this.swRegistration.pushManager.getSubscription();
            if (existingSubscription) {
                console.log('Já inscrito, reutilizando subscription existente');
                await this.saveSubscription(existingSubscription);
                return existingSubscription;
            }

            console.log('Tentando inscrever para notificações push...');
            
            // Verificar se a chave VAPID é válida
            let applicationServerKey;
            try {
                applicationServerKey = this.urlBase64ToUint8Array(this.publicVapidKey);
            } catch (keyError) {
                console.error('❌ Chave VAPID inválida:', keyError);
                throw new Error('Chave VAPID inválida');
            }

            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });

            console.log('✅ Inscrito com sucesso para notificações push');
            await this.saveSubscription(subscription);
            this.isSubscribed = true;
            return subscription;

        } catch (error) {
            console.error('❌ Falha ao inscrever para notificações push:', error);
            
            if (error.name === 'NotAllowedError') {
                console.warn('Permissão para notificações foi negada');
                throw error;
            } else if (error.name === 'InvalidStateError') {
                console.warn('Estado inválido - talvez já esteja inscrito');
                throw error;
            } else {
                console.error('Erro desconhecido:', error);
                throw error;
            }
        }
    }

    urlBase64ToUint8Array(base64String) {
        // Remover quaisquer caracteres que não sejam base64
        const base64 = base64String
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Adicionar padding se necessário
        const padding = base64.length % 4;
        const paddedBase64 = padding === 0 ? base64 : base64 + '='.repeat(4 - padding);

        try {
            const rawData = atob(paddedBase64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        } catch (error) {
            console.error('❌ Erro ao converter chave VAPID:', error);
            throw new Error('Chave VAPID inválida: ' + error.message);
        }
    }

    async saveSubscription(subscription) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                const subscriptionData = {
                    customer_id: user.id,
                    endpoint: subscription.endpoint,
                    keys: JSON.stringify(subscription.toJSON().keys),
                    created_at: new Date().toISOString()
                };

                const { error } = await supabase
                    .from('customer_push_subscriptions')
                    .upsert(subscriptionData, {
                        onConflict: 'customer_id'
                    });

                if (error) {
                    console.error('❌ Erro ao salvar subscription:', error);
                } else {
                    console.log('✅ Subscription salva no Supabase');
                }
            } else {
                console.log('⚠️ Usuário não logado, pulando salvamento da subscription');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar subscription:', error);
        }
    }

    // Método para cancelar inscrição
    async unsubscribeFromPush() {
        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            if (subscription) {
                const success = await subscription.unsubscribe();
                if (success) {
                    this.isSubscribed = false;
                    console.log('✅ Inscrição cancelada');
                    
                    // Remover do Supabase
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase
                            .from('customer_push_subscriptions')
                            .delete()
                            .eq('customer_id', user.id);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erro ao cancelar inscrição:', error);
        }
    }

    // Verificar suporte a notificações
    supportsNotifications() {
        return (
            'serviceWorker' in navigator && 
            'PushManager' in window && 
            'Notification' in window
        );
    }

    // Mostrar notificação local
    static async showLocalNotification(title, options = {}) {
        if (!('Notification' in window)) {
            console.warn('Notificações não suportadas');
            return;
        }

        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            return notification;
        }
    }

    // Método para verificar e atualizar subscription
    async updateSubscription() {
        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            if (subscription) {
                await this.saveSubscription(subscription);
            }
        } catch (error) {
            console.error('Erro ao atualizar subscription:', error);
        }
    }
}

// Inicializador PWA melhorado
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        // Evento para instalação PWA
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Detectar se já está instalado
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA instalado com sucesso');
            this.deferredPrompt = null;
        });

        this.detectPWAInstallation();
    }

    detectPWAInstallation() {
        // Verificar modos de exibição PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
        
        if (isStandalone || isFullscreen) {
            console.log('📱 App PWA instalado e em execução');
        }
    }

    showInstallPrompt() {
        // Só mostrar se não estiver já instalado
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // Criar botão de instalação
        const installButton = document.createElement('button');
        installButton.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Instalar App</span>
        `;
        installButton.className = 'pwa-install-btn fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 hover:bg-blue-700 transition-colors';
        installButton.addEventListener('click', () => this.installApp());
        
        document.body.appendChild(installButton);

        // Auto-remover após 15 segundos
        setTimeout(() => {
            if (installButton.parentNode) {
                installButton.remove();
            }
        }, 15000);

        // Remover ao rolar a página
        window.addEventListener('scroll', () => {
            if (installButton.parentNode) {
                installButton.remove();
            }
        }, { once: true });
    }

    async installApp() {
        if (!this.deferredPrompt) {
            console.log('❌ Prompt de instalação não disponível');
            return;
        }

        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`📱 Usuário ${outcome === 'accepted' ? 'aceitou' : 'rejeitou'} a instalação PWA`);
            
            if (outcome === 'accepted') {
                // Remover botão de instalação
                const installBtn = document.querySelector('.pwa-install-btn');
                if (installBtn) installBtn.remove();
            }
            
            this.deferredPrompt = null;
        } catch (error) {
            console.error('❌ Erro durante a instalação:', error);
        }
    }

    // Verificar se pode ser instalado
    static canInstall() {
        return !window.matchMedia('(display-mode: standalone)').matches;
    }
}

// Inicialização segura dos sistemas PWA
function initializePWA() {
    // Verificar se o Supabase está disponível
    if (typeof supabase === 'undefined') {
        console.warn('⚠️ Supabase não carregado, adiando inicialização das notificações');
        setTimeout(initializePWA, 1000);
        return;
    }

    if (PWANotifications.prototype.supportsNotifications()) {
        window.pwaNotifications = new PWANotifications();
        console.log('✅ Sistema de notificações PWA inicializado');
    } else {
        console.log('⚠️ Notificações push não suportadas neste navegador');
    }

    if (PWAInstaller.canInstall()) {
        window.pwaInstaller = new PWAInstaller();
        console.log('✅ Instalador PWA inicializado');
    }
}

// Aguardar o DOM estar pronto e o Supabase carregado
function waitForSupabase() {
    if (typeof supabase !== 'undefined') {
        initializePWA();
    } else {
        setTimeout(waitForSupabase, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForSupabase);
} else {
    waitForSupabase();
}

// Exportar para uso global
window.PWANotifications = PWANotifications;
window.PWAInstaller = PWAInstaller;

// Função auxiliar para solicitar notificações
window.enablePushNotifications = async function() {
    if (window.pwaNotifications) {
        return await window.pwaNotifications.requestNotificationPermission();
    }
    return 'not_initialized';
};