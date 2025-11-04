// js/main.js
class StyleShopApp {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Inicializar componentes
            this.setupEventListeners();
            this.setupNewsletter();
            
            console.log('🛍️ Romanos Store inicializada com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
        }
    }

    setupEventListeners() {
        // Menu mobile
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => window.authManager.showLoginModal());
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => window.authManager.logout());
        }
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Carrinho
        const cartButton = document.getElementById('cart-button');
        const closeCartButton = document.getElementById('close-cart');
        const checkoutButton = document.getElementById('checkout-button');
        
        if (cartButton) {
            cartButton.addEventListener('click', () => window.cartManager.openCart());
        }
        
        if (closeCartButton) {
            closeCartButton.addEventListener('click', () => window.cartManager.closeCart());
        }
        
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => window.cartManager.checkout());
        }

        // Fechar carrinho ao clicar fora
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cart-sidebar');
            const cartBtn = document.getElementById('cart-button');
            
            if (cartSidebar && cartSidebar.classList.contains('open') && 
                !cartSidebar.contains(e.target) && 
                (!cartBtn || !cartBtn.contains(e.target))) {
                window.cartManager.closeCart();
            }
        });

        // Fechar menu mobile ao clicar em links
        const mobileLinks = document.querySelectorAll('#mobile-menu a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            });
        });

        // Navegação por categoria (header)
        document.querySelectorAll('nav a, #mobile-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.textContent.toLowerCase();
                if (window.filterSystem) {
                    window.filterSystem.filterByCategory(category);
                }
                
                // Scroll para a seção de produtos
                const productsSection = document.querySelector('section.py-8');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    setupNewsletter() {
        const newsletterInput = document.querySelector('input[type="email"]');
        const newsletterButton = document.querySelector('.bg-white.text-black.px-6.py-3.rounded-r-lg');
        
        if (newsletterInput && newsletterButton) {
            newsletterButton.addEventListener('click', (e) => {
                e.preventDefault();
                const email = newsletterInput.value.trim();
                
                if (this.isValidEmail(email)) {
                    this.subscribeNewsletter(email);
                    newsletterInput.value = '';
                } else {
                    Swal.fire({
                        title: 'E-mail inválido!',
                        text: 'Por favor, insira um e-mail válido.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            });
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    subscribeNewsletter(email) {
        Swal.fire({
            title: 'Inscrito com sucesso!',
            html: `Obrigado por se inscrever com <strong>${email}</strong>`,
            icon: 'success',
            confirmButtonText: 'OK',
            timer: 3000
        });
        
        console.log('Novo inscrito na newsletter:', email);
    }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new StyleShopApp();
});