// js/auth.js
import { supabase } from './supabase.js';

class AuthSystem {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            await this.setupEventListeners();
            await this.checkExistingAuth();
            this.isInitialized = true;
        } catch (error) {
            console.error('Erro na inicialização do AuthSystem:', error);
        }
    }

    async setupEventListeners() {
        // Aguardar o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListenersAfterDOM();
            });
        } else {
            this.setupEventListenersAfterDOM();
        }
    }

    setupEventListenersAfterDOM() {
        try {
            // Botão do usuário - com fallback
            const userIcon = document.querySelector('.fa-user');
            if (userIcon) {
                const userButton = userIcon.closest('button');
                if (userButton) {
                    userButton.addEventListener('click', () => {
                        this.openAuthModal();
                    });
                }
            }

            // Fechar modal
            const closeButton = document.querySelector('.close-auth-modal');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.closeAuthModal();
                });
            }

            // Trocar entre abas
            document.querySelectorAll('.auth-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    this.switchTab(e.target.dataset.tab);
                });
            });

            // Links de troca entre login/signup
            const switchToSignup = document.querySelector('.switch-to-signup');
            if (switchToSignup) {
                switchToSignup.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab('signup');
                });
            }

            const switchToLogin = document.querySelector('.switch-to-login');
            if (switchToLogin) {
                switchToLogin.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab('login');
                });
            }

            // Formulários
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    this.handleLogin(e);
                });
            }

            const signupForm = document.getElementById('signup-form');
            if (signupForm) {
                signupForm.addEventListener('submit', (e) => {
                    this.handleSignup(e);
                });
            }

            // Buscar CEP
            const cepInput = document.getElementById('cep');
            if (cepInput) {
                cepInput.addEventListener('blur', (e) => {
                    this.searchCEP(e.target.value);
                });
            }

            // Fechar modal clicando fora
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                authModal.addEventListener('click', (e) => {
                    if (e.target.id === 'auth-modal') {
                        this.closeAuthModal();
                    }
                });
            }

        } catch (error) {
            console.error('Erro ao configurar event listeners:', error);
        }
    }

    openAuthModal() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.remove('hidden');
            // Resetar formulários ao abrir
            document.querySelectorAll('.auth-form').forEach(form => {
                if (form.reset) form.reset();
            });
        }
    }

    closeAuthModal() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.add('hidden');
        }
    }

    switchTab(tab) {
        try {
            // Atualizar abas
            document.querySelectorAll('.auth-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            const activeTab = document.querySelector(`[data-tab="${tab}"]`);
            if (activeTab) {
                activeTab.classList.add('active');
            }

            // Atualizar formulários
            document.querySelectorAll('.auth-form').forEach(f => {
                f.classList.remove('active');
            });
            
            const activeForm = document.getElementById(`${tab}-form`);
            if (activeForm) {
                activeForm.classList.add('active');
            }
        } catch (error) {
            console.error('Erro ao trocar de aba:', error);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        // Validação básica
        if (!email || !password) {
            this.showError('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) throw error;

            this.showSuccess('Login realizado com sucesso!');
            this.closeAuthModal();
            this.updateUIForLoggedInUser(data.user);

        } catch (error) {
            console.error('Erro no login:', error);
            this.showError(this.getErrorMessage(error));
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone'),
            cep: formData.get('cep'),
            address: formData.get('address'),
            number: formData.get('number'),
            complement: formData.get('complement'),
            neighborhood: formData.get('neighborhood'),
            city: formData.get('city'),
            state: formData.get('state'),
            newsletter: formData.get('newsletter') === 'on'
        };

        // Validação básica
        if (!this.validateSignupData(userData)) {
            return;
        }

        try {
            // 1. Criar usuário no Auth do Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email.trim(),
                password: userData.password,
                options: {
                    data: {
                        name: userData.name,
                        phone: userData.phone
                    }
                }
            });

            if (authError) throw authError;

            // 2. Salvar dados adicionais na tabela 'customers' se o usuário foi criado
            if (authData.user) {
                try {
                    const { error: profileError } = await supabase
                        .from('customers')
                        .insert([
                            {
                                id: authData.user.id,
                                name: userData.name,
                                email: userData.email,
                                phone: userData.phone,
                                cep: userData.cep,
                                address: userData.address,
                                number: userData.number,
                                complement: userData.complement,
                                neighborhood: userData.neighborhood,
                                city: userData.city,
                                state: userData.state,
                                newsletter: userData.newsletter,
                                created_at: new Date().toISOString()
                            }
                        ]);

                    if (profileError) {
                        console.warn('Erro ao salvar perfil (pode ser normal):', profileError);
                    }
                } catch (profileError) {
                    console.warn('Erro ao salvar perfil do usuário:', profileError);
                }
            }

            if (authData.session) {
                this.showSuccess('Cadastro realizado com sucesso! Você já está logado.');
                this.closeAuthModal();
                this.updateUIForLoggedInUser(authData.user);
            } else {
                this.showSuccess('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
                this.closeAuthModal();
            }

        } catch (error) {
            console.error('Erro no cadastro:', error);
            this.showError(this.getErrorMessage(error));
        }
    }

    validateSignupData(userData) {
        if (!userData.name || !userData.email || !userData.password) {
            this.showError('Por favor, preencha todos os campos obrigatórios.');
            return false;
        }

        if (userData.password.length < 6) {
            this.showError('A senha deve ter pelo menos 6 caracteres.');
            return false;
        }

        if (!userData.email.includes('@')) {
            this.showError('Por favor, insira um e-mail válido.');
            return false;
        }

        return true;
    }

    getErrorMessage(error) {
        const errorMessages = {
            'Invalid login credentials': 'E-mail ou senha incorretos.',
            'Email not confirmed': 'Por favor, confirme seu e-mail antes de fazer login.',
            'User already registered': 'Este e-mail já está cadastrado.',
            'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
            'Unable to validate email address: invalid format': 'Formato de e-mail inválido.',
            'For security purposes, you can only request this after': 'Aguarde um momento antes de tentar novamente.'
        };

        return errorMessages[error.message] || error.message || 'Ocorreu um erro. Tente novamente.';
    }

    async searchCEP(cep) {
        if (!cep) return;
        
        const cleanCEP = cep.replace(/\D/g, '');
        
        if (cleanCEP.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
            const data = await response.json();

            if (!data.erro) {
                this.setElementValue('address', data.logradouro);
                this.setElementValue('neighborhood', data.bairro);
                this.setElementValue('city', data.localidade);
                this.setElementValue('state', data.uf);
                
                // Focar no campo número após preencher CEP
                const numberInput = document.getElementById('number');
                if (numberInput) numberInput.focus();
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    }

    setElementValue(id, value) {
        const element = document.getElementById(id);
        if (element && value) {
            element.value = value;
        }
    }

    async checkExistingAuth() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            
            if (user) {
                this.updateUIForLoggedInUser(user);
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
        }
    }

    updateUIForLoggedInUser(user) {
        const userButton = document.querySelector('.fa-user')?.closest('button');
        if (!userButton) return;

        const userName = user.user_metadata?.name || user.email.split('@')[0];
        
        userButton.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span class="user-name">${userName}</span>
        `;
        
        // Remover evento anterior e adicionar novo
        userButton.replaceWith(userButton.cloneNode(true));
        const newUserButton = document.querySelector('.fa-user-circle')?.closest('button');
        if (newUserButton) {
            newUserButton.addEventListener('click', () => this.showUserMenu(user));
        }
    }

    async showUserMenu(user) {
        // Implementação simplificada do menu do usuário
        const { value: action } = await Swal.fire({
            title: `Olá, ${user.user_metadata?.name || 'Usuário'}!`,
            showCancelButton: true,
            confirmButtonText: 'Sair',
            cancelButtonText: 'Fechar',
            showDenyButton: true,
            denyButtonText: 'Meus Dados'
        });

        if (action === 'confirm') {
            this.handleLogout();
        } else if (action === 'deny') {
            this.showUserProfile(user);
        }
    }

    async handleLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Resetar UI
            const userButton = document.querySelector('.fa-user-circle')?.closest('button');
            if (userButton) {
                userButton.innerHTML = `<i class="fas fa-user"></i>`;
                userButton.onclick = () => this.openAuthModal();
            }

            this.showSuccess('Logout realizado com sucesso!');

        } catch (error) {
            this.showError('Erro ao fazer logout. Tente novamente.');
        }
    }

    showUserProfile(user) {
        Swal.fire({
            title: 'Meus Dados',
            html: `
                <div style="text-align: left;">
                    <p><strong>Nome:</strong> ${user.user_metadata?.name || 'Não informado'}</p>
                    <p><strong>E-mail:</strong> ${user.email}</p>
                    <p><strong>Telefone:</strong> ${user.user_metadata?.phone || 'Não informado'}</p>
                </div>
            `,
            confirmButtonText: 'Fechar'
        });
    }

    showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: message,
            timer: 3000,
            showConfirmButton: false
        });
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: message,
            confirmButtonText: 'Entendi'
        });
    }
}

// Inicialização segura
let authSystem = null;

document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
});

// Export para uso global
window.AuthSystem = AuthSystem;