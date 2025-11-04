// js/customer-area.js - CORREÇÃO COMPLETA
import { supabase } from './supabase.js';

class CustomerArea {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.maxRetries = 3;
        this.retryCount = 0;
        this.init();
    }

    async init() {
        if (this.isInitialized) return;

        try {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeWithRetry());
            } else {
                this.initializeWithRetry();
            }
        } catch (error) {
            console.error('❌ Erro na inicialização do CustomerArea:', error);
        }
    }

    async initializeWithRetry() {
        try {
            await this.setupCustomerArea();
            this.isInitialized = true;
        } catch (error) {
            this.retryCount++;
            if (this.retryCount < this.maxRetries) {
                console.warn(`🔄 Tentativa ${this.retryCount}/${this.maxRetries}...`);
                setTimeout(() => this.initializeWithRetry(), 1000 * this.retryCount);
            } else {
                console.error('❌ Falha após múltiplas tentativas:', error);
            }
        }
    }

    async setupCustomerArea() {
        // Verificar se os elementos necessários existem
        if (!this.requiredElementsExist()) {
            throw new Error('Elementos necessários não encontrados no DOM');
        }

        await this.setupEventListeners();
        await this.checkAuthState();
        console.log('✅ Área do cliente inicializada com sucesso');
    }

    requiredElementsExist() {
        const elements = {
            userButton: document.querySelector('.fa-user')?.closest('button'),
            customerArea: document.getElementById('customer-area'),
            closeButton: document.querySelector('.close-customer-area'),
            authModal: document.getElementById('auth-modal')
        };

        const missingElements = Object.entries(elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            console.warn('Elementos não encontrados:', missingElements);
            return false;
        }

        return true;
    }

    async setupEventListeners() {
        try {
            // Botão do usuário
            const userButton = document.querySelector('.fa-user').closest('button');
            userButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleCustomerArea();
            });

            // Fechar área do cliente
            const closeButton = document.querySelector('.close-customer-area');
            closeButton.addEventListener('click', () => {
                this.closeCustomerArea();
            });

            // Fechar ao clicar fora
            document.addEventListener('click', (e) => {
                const customerArea = document.getElementById('customer-area');
                if (customerArea && !customerArea.contains(e.target) && 
                    !userButton.contains(e.target) && 
                    !customerArea.classList.contains('hidden')) {
                    this.closeCustomerArea();
                }
            });

            // Trocar entre abas
            document.querySelectorAll('.customer-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    this.switchCustomerTab(e.target.dataset.tab);
                });
            });

            // Formulário de perfil
            const profileForm = document.getElementById('profile-form');
            if (profileForm) {
                profileForm.addEventListener('submit', (e) => {
                    this.updateProfile(e);
                });
            }

            // Logout
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', () => {
                    this.logout();
                });
            }

            // Buscar CEP no perfil
            const profileCep = document.getElementById('profile-cep');
            if (profileCep) {
                profileCep.addEventListener('blur', (e) => {
                    this.searchCEP(e.target.value, 'profile');
                });
            }

            // Marcar todas como lidas
            const markAllRead = document.getElementById('mark-all-read');
            if (markAllRead) {
                markAllRead.addEventListener('click', () => {
                    this.markAllNotificationsAsRead();
                });
            }

            // Tecla ESC para fechar
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeCustomerArea();
                }
            });

        } catch (error) {
            console.error('❌ Erro ao configurar event listeners:', error);
            throw error;
        }
    }

    async toggleCustomerArea() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) throw error;
            
            if (user) {
                this.currentUser = user;
                await this.openCustomerArea();
                await this.loadCustomerData();
            } else {
                // Se não está logado, abre o modal de auth
                const authModal = document.getElementById('auth-modal');
                if (authModal) {
                    authModal.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            this.showError('Erro ao verificar autenticação');
        }
    }

    async openCustomerArea() {
        const customerArea = document.getElementById('customer-area');
        if (customerArea) {
            customerArea.classList.remove('hidden');
            // Focar no primeiro elemento para acessibilidade
            const firstTab = customerArea.querySelector('.customer-tab');
            if (firstTab) firstTab.focus();
            
            this.switchCustomerTab('orders');
        }
    }

    closeCustomerArea() {
        const customerArea = document.getElementById('customer-area');
        if (customerArea) {
            customerArea.classList.add('hidden');
        }
    }

    switchCustomerTab(tab) {
        try {
            // Atualizar abas
            document.querySelectorAll('.customer-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            const activeTab = document.querySelector(`[data-tab="${tab}"]`);
            if (activeTab) {
                activeTab.classList.add('active');
            }

            // Atualizar conteúdo
            document.querySelectorAll('.customer-tab-content').forEach(c => {
                c.classList.remove('active');
            });
            
            const activeContent = document.getElementById(`customer-${tab}`);
            if (activeContent) {
                activeContent.classList.add('active');
            }

            // Carregar dados específicos da aba
            if (tab === 'orders' && this.currentUser) {
                this.loadOrders();
            } else if (tab === 'notifications' && this.currentUser) {
                this.loadNotifications();
            } else if (tab === 'profile' && this.currentUser) {
                this.loadCustomerData();
            }
        } catch (error) {
            console.error(`❌ Erro ao trocar para aba ${tab}:`, error);
        }
    }

    async loadCustomerData() {
        if (!this.currentUser) return;

        try {
            const { data: customer, error } = await supabase
                .from('customers')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;

            this.populateProfileForm(customer);
        } catch (error) {
            console.error('❌ Erro ao carregar dados do cliente:', error);
            this.showError('Erro ao carregar dados do perfil');
        }
    }

    populateProfileForm(customer) {
        const setValue = (selector, value) => {
            const element = document.querySelector(selector);
            if (element) element.value = value || '';
        };

        const setChecked = (selector, checked) => {
            const element = document.querySelector(selector);
            if (element) element.checked = !!checked;
        };

        setValue('#profile-form [name="name"]', customer.name);
        setValue('#profile-form [name="email"]', customer.email);
        setValue('#profile-form [name="phone"]', customer.phone);
        setValue('#profile-form [name="cep"]', customer.cep);
        setValue('#profile-form [name="address"]', customer.address);
        setValue('#profile-form [name="number"]', customer.number);
        setValue('#profile-form [name="complement"]', customer.complement);
        setValue('#profile-form [name="neighborhood"]', customer.neighborhood);
        setValue('#profile-form [name="city"]', customer.city);
        setValue('#profile-form [name="state"]', customer.state);
        setChecked('#profile-form [name="newsletter"]', customer.newsletter);
    }

    async updateProfile(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showError('Usuário não autenticado');
            return;
        }

        const formData = new FormData(e.target);
        
        const profileData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            cep: formData.get('cep'),
            address: formData.get('address'),
            number: formData.get('number'),
            complement: formData.get('complement'),
            neighborhood: formData.get('neighborhood'),
            city: formData.get('city'),
            state: formData.get('state'),
            newsletter: formData.get('newsletter') === 'on',
            updated_at: new Date().toISOString()
        };

        try {
            const { error } = await supabase
                .from('customers')
                .update(profileData)
                .eq('id', this.currentUser.id);

            if (error) throw error;

            this.showSuccess('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error);
            this.showError('Não foi possível atualizar o perfil');
        }
    }

    async loadOrders() {
        if (!this.currentUser) return;

        const loadingElement = document.querySelector('.loading-orders');
        const ordersList = document.getElementById('orders-list');

        if (!loadingElement || !ordersList) return;

        try {
            loadingElement.style.display = 'block';
            ordersList.innerHTML = '';

            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            loadingElement.style.display = 'none';
            this.renderOrders(orders);
        } catch (error) {
            console.error('❌ Erro ao carregar pedidos:', error);
            loadingElement.innerHTML = '<p class="error-message">Erro ao carregar pedidos</p>';
        }
    }

    renderOrders(orders) {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;
        
        if (!orders || orders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Nenhum pedido encontrado</p>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Pedido #${order.id}</span>
                        <div class="order-date">
                            ${new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                    <span class="order-status status-${order.status}">
                        ${this.getStatusText(order.status)}
                    </span>
                </div>
                
                <div class="order-total">
                    Total: R$ ${order.total_amount?.toFixed(2) || '0.00'}
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendente',
            'confirmed': 'Confirmado',
            'shipped': 'Enviado',
            'delivered': 'Entregue',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    async loadNotifications() {
        if (!this.currentUser) return;

        try {
            const { data: notifications, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('customer_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.renderNotifications(notifications);
        } catch (error) {
            console.error('❌ Erro ao carregar notificações:', error);
        }
    }

    renderNotifications(notifications) {
        const notificationsList = document.getElementById('notifications-list');
        if (!notificationsList) return;
        
        if (!notifications || notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell"></i>
                    <p>Nenhuma notificação</p>
                </div>
            `;
            return;
        }

        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                <div class="notification-icon">
                    <i class="fas fa-${notification.icon || 'bell'}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-date">
                        ${new Date(notification.created_at).toLocaleDateString('pt-BR')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    async markAllNotificationsAsRead() {
        if (!this.currentUser) return;

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('customer_id', this.currentUser.id)
                .eq('read', false);

            if (error) throw error;

            await this.loadNotifications(); // Recarregar a lista
            this.showSuccess('Todas as notificações marcadas como lidas.');
        } catch (error) {
            console.error('❌ Erro ao marcar notificações como lidas:', error);
            this.showError('Não foi possível marcar as notificações como lidas.');
        }
    }

    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this.closeCustomerArea();
            this.showSuccess('Até logo! Você saiu da sua conta.');
            
            // Resetar UI
            this.resetUI();
        } catch (error) {
            console.error('❌ Erro ao fazer logout:', error);
            this.showError('Não foi possível fazer logout.');
        }
    }

    resetUI() {
        const userButton = document.querySelector('.fa-user')?.closest('button');
        if (userButton) {
            userButton.innerHTML = `<i class="fas fa-user"></i>`;
            userButton.title = 'Minha conta';
        }
        
        this.currentUser = null;
    }

    async searchCEP(cep, prefix = '') {
        if (!cep || cep.length !== 8) return;

        try {
            const cleanCEP = cep.replace(/\D/g, '');
            const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
            const data = await response.json();

            if (!data.erro) {
                this.setFormValue(`${prefix}-address`, data.logradouro);
                this.setFormValue(`${prefix}-neighborhood`, data.bairro);
                this.setFormValue(`${prefix}-city`, data.localidade);
                this.setFormValue(`${prefix}-state`, data.uf);
            } else {
                this.showWarning('CEP não encontrado');
            }
        } catch (error) {
            console.error('❌ Erro ao buscar CEP:', error);
            this.showError('Erro ao buscar CEP');
        }
    }

    setFormValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element && value) {
            element.value = value;
        }
    }

    async checkAuthState() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            
            if (user) {
                this.currentUser = user;
                this.updateUIForLoggedInUser(user);
            }
        } catch (error) {
            console.error('❌ Erro ao verificar estado de autenticação:', error);
        }
    }

    updateUIForLoggedInUser(user) {
        const userButton = document.querySelector('.fa-user')?.closest('button');
        if (!userButton) return;

        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
        
        userButton.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span class="user-name">${userName}</span>
        `;
        userButton.title = `Minha conta (${user.email})`;
    }

    // Helpers para feedback do usuário
    showSuccess(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Sucesso!', message, 'success');
        } else {
            alert(`✅ ${message}`);
        }
    }

    showError(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erro!', message, 'error');
        } else {
            alert(`❌ ${message}`);
        }
    }

    showWarning(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Aviso!', message, 'warning');
        } else {
            alert(`⚠️ ${message}`);
        }
    }
}

// Inicialização segura
let customerAreaInstance = null;

function initializeCustomerArea() {
    if (!customerAreaInstance) {
        customerAreaInstance = new CustomerArea();
    }
    return customerAreaInstance;
}

// Aguardar o DOM estar pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCustomerArea);
} else {
    initializeCustomerArea();
}

// Exportar para uso global
window.CustomerArea = CustomerArea;
window.customerArea = initializeCustomerArea;
