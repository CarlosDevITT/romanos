// js/cart.js
class CartManager {
    constructor() {
        this.cart = this.loadCartFromStorage();
        this.init();
    }

    init() {
        // Espera pelos produtos carregarem antes de atualizar a UI
        if (window.productManager && window.productManager.products.length > 0) {
            this.updateUI();
        } else {
            // Se os produtos ainda não carregaram, espere pelo evento
            window.addEventListener('productsLoaded', () => {
                this.updateUI();
            });
        }
    }

    // Carregar carrinho do localStorage
    loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('romanos-store-cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            return [];
        }
    }

    // Salvar carrinho no localStorage
    saveCartToStorage() {
        try {
            localStorage.setItem('romanos-store-cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Erro ao salvar carrinho:', error);
        }
    }

    // CORREÇÃO: Função melhorada para buscar produto - compatível com UUID
    getProductFromAnySource(productId) {
        console.log(`🔍 Buscando produto ID: ${productId} (UUID)`, { 
            productManager: !!window.productManager,
            filterSystem: !!window.filterSystem 
        });

        // CORREÇÃO: Mantém como string (UUID) sem conversão para número
        
        // Tenta productManager primeiro (Supabase)
        if (window.productManager && window.productManager.getProductById) {
            const product = window.productManager.getProductById(productId);
            console.log('📦 Produto encontrado no productManager:', product);
            if (product) return product;
        }
        
        // Tenta acessar diretamente o array de produtos
        if (window.productManager && window.productManager.products) {
            const product = window.productManager.products.find(p => p.id === productId);
            console.log('🔍 Produto encontrado no array direto:', product);
            if (product) return product;
        }
        
        // Tenta filterSystem como fallback
        if (window.filterSystem && window.filterSystem.getProductById) {
            const product = window.filterSystem.getProductById(productId);
            console.log('🔄 Produto encontrado no filterSystem:', product);
            if (product) return product;
        }
        
        console.warn('❌ Produto não encontrado em nenhuma fonte:', productId);
        return null;
    }

    // Adicionar item ao carrinho
    addToCart(productId, productName, productPrice, availableStock) {
        console.log(`🛒 Tentando adicionar produto: ${productName}`, {
            productId, productPrice, availableStock
        });

        // CORREÇÃO: Busca o produto real para verificar estoque
        const product = this.getProductFromAnySource(productId);
        const realStock = product ? product.stock : availableStock;
        
        // Verificar estoque ANTES de adicionar
        if (realStock <= 0) {
            Swal.fire({
                title: 'Produto esgotado!',
                text: `${productName} está temporariamente fora de estoque.`,
                icon: 'warning',
                confirmButtonText: 'Entendi'
            });
            return false;
        }

        const existingItem = this.cart.find(item => item.id === productId);

        // Verificar estoque para item existente
        if (existingItem) {
            if (existingItem.quantity >= realStock) {
                Swal.fire({
                    title: 'Estoque insuficiente!',
                    text: `Só temos ${realStock} unidades de ${productName} em estoque. Você já tem ${existingItem.quantity} no carrinho.`,
                    icon: 'warning',
                    confirmButtonText: 'Entendi'
                });
                return false;
            }
            existingItem.quantity += 1;
        } else {
            // Verificar se há estoque para novo item
            if (realStock <= 0) {
                Swal.fire({
                    title: 'Produto esgotado!',
                    text: `${productName} está temporariamente fora de estoque.`,
                    icon: 'warning',
                    confirmButtonText: 'Entendi'
                });
                return false;
            }
            
            this.cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }

        this.updateUI();
        this.saveCartToStorage();
        this.showAddToCartAlert(productName);
        return true;
    }

    // Remover item do carrinho
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateUI();
        this.saveCartToStorage();
    }

    // CORREÇÃO: Atualizar quantidade com verificação real do estoque
    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            // Busca informações atualizadas do produto
            const product = this.getProductFromAnySource(productId);
            const availableStock = product ? product.stock : 0;
            
            console.log(`📊 Atualizando quantidade:`, {
                productId, newQuantity, availableStock, product
            });
            
            if (newQuantity > availableStock) {
                Swal.fire({
                    title: 'Estoque insuficiente!',
                    text: `Só temos ${availableStock} unidades deste produto em estoque.`,
                    icon: 'warning',
                    confirmButtonText: 'Entendi'
                });
                return;
            }
            
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.updateUI();
                this.saveCartToStorage();
            }
        }
    }

    // Limpar carrinho
    clearCart() {
        this.cart = [];
        this.updateUI();
        this.saveCartToStorage();
    }

    // CORREÇÃO: Limpar itens sem estoque do carrinho
    clearOutOfStockItems() {
        const initialLength = this.cart.length;
        const removedItems = [];
        
        this.cart = this.cart.filter(item => {
            const product = this.getProductFromAnySource(item.id);
            const availableStock = product ? product.stock : 0;
            const shouldKeep = availableStock > 0;
            
            if (!shouldKeep) {
                removedItems.push(item.name);
            }
            
            return shouldKeep;
        });

        if (this.cart.length < initialLength) {
            this.updateUI();
            this.saveCartToStorage();
            
            if (removedItems.length > 0) {
                Swal.fire({
                    title: 'Carrinho atualizado!',
                    html: `Os seguintes produtos sem estoque foram removidos do seu carrinho:<br><strong>${removedItems.join(', ')}</strong>`,
                    icon: 'info',
                    confirmButtonText: 'Entendi'
                });
            }
        }
        
        return this.cart;
    }

    // Calcular total
    calculateTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Calcular total de itens
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // CORREÇÃO: Verificar se há produtos sem estoque no carrinho
    hasOutOfStockItems() {
        return this.cart.some(item => {
            const product = this.getProductFromAnySource(item.id);
            const availableStock = product ? product.stock : 0;
            console.log(`📦 Verificando estoque: ${item.name}`, {
                quantity: item.quantity,
                availableStock,
                product
            });
            return item.quantity > availableStock;
        });
    }

    // Obter lista de produtos sem estoque
    getOutOfStockItems() {
        return this.cart.filter(item => {
            const product = this.getProductFromAnySource(item.id);
            const availableStock = product ? product.stock : 0;
            return item.quantity > availableStock;
        }).map(item => {
            const product = this.getProductFromAnySource(item.id);
            const availableStock = product ? product.stock : 0;
            return {
                name: item.name,
                requested: item.quantity,
                available: availableStock
            };
        });
    }

    // Atualizar UI
    updateUI() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateCartTotal();
    }

    // Atualizar contador
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.getTotalItems();
            if (totalItems > 0) {
                cartCount.textContent = totalItems;
                cartCount.classList.remove('hidden');
            } else {
                cartCount.classList.add('hidden');
            }
        }
    }

    // CORREÇÃO: Atualizar itens do carrinho com informações reais
    updateCartItems() {
        const container = document.getElementById('cart-items');
        const emptyMessage = document.getElementById('empty-cart-message');
        
        if (!container) return;

        if (this.cart.length === 0) {
            if (emptyMessage) emptyMessage.classList.remove('hidden');
            container.innerHTML = '';
            return;
        }

        if (emptyMessage) emptyMessage.classList.add('hidden');
        
        // CORREÇÃO: Limpa itens sem estoque antes de renderizar
        this.clearOutOfStockItems();
        
        container.innerHTML = this.cart.map(item => this.getCartItemHTML(item)).join('');
        this.attachCartEventListeners();
    }

    // CORREÇÃO: HTML para item do carrinho com informações reais
    getCartItemHTML(item) {
        const product = this.getProductFromAnySource(item.id);
        const itemTotal = item.price * item.quantity;
        
        // CORREÇÃO: Usa o estoque real do produto do banco de dados
        const availableStock = product ? product.stock : 0;
        const isOutOfStock = availableStock === 0 || item.quantity > availableStock;

        console.log(`🛒 Renderizando item: ${item.name}`, {
            product,
            availableStock,
            isOutOfStock,
            quantity: item.quantity
        });

        return `
            <div class="cart-item ${isOutOfStock ? 'opacity-50' : ''}">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800">${item.name}</h4>
                    <p class="text-gray-600 text-sm">R$ ${item.price.toFixed(2)} cada</p>
                    ${isOutOfStock ? `
                        <p class="text-red-600 text-xs mt-1">
                            <i class="fas fa-exclamation-triangle mr-1"></i>
                            Estoque insuficiente (disponível: ${availableStock})
                        </p>
                    ` : ''}
                    ${availableStock > 0 && availableStock < 5 ? `
                        <p class="text-orange-600 text-xs mt-1">
                            <i class="fas fa-exclamation-circle mr-1"></i>
                            Apenas ${availableStock} unidade(s) disponível(is)
                        </p>
                    ` : ''}
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-quantity" data-id="${item.id}">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span class="font-medium">${item.quantity}</span>
                        <button class="quantity-btn increase-quantity" data-id="${item.id}" 
                                ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-gray-800">R$ ${itemTotal.toFixed(2)}</p>
                    <button class="remove-item text-red-600 hover:text-red-800 text-sm mt-1" data-id="${item.id}">
                        <i class="fas fa-trash mr-1"></i>Remover
                    </button>
                </div>
            </div>
        `;
    }

    // Anexar event listeners do carrinho
    attachCartEventListeners() {
        // Aumentar quantidade
        document.querySelectorAll('.increase-quantity:not([disabled])').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('button').getAttribute('data-id');
                const item = this.cart.find(item => item.id === productId);
                
                // CORREÇÃO: Usa a função unificada para buscar produto
                const product = this.getProductFromAnySource(productId);
                
                if (item && product) {
                    const availableStock = product.stock; // Estoque real do banco
                    if (item.quantity < availableStock) {
                        this.updateQuantity(productId, item.quantity + 1);
                    } else {
                        Swal.fire({
                            title: 'Estoque insuficiente!',
                            text: `Só temos ${availableStock} unidades deste produto em estoque.`,
                            icon: 'warning',
                            confirmButtonText: 'Entendi'
                        });
                    }
                }
            });
        });

        // Diminuir quantidade
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('button').getAttribute('data-id');
                const item = this.cart.find(item => item.id === productId);
                
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            });
        });

        // Remover item
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('button').getAttribute('data-id');
                this.removeFromCart(productId);
                
                Swal.fire({
                    title: 'Removido!',
                    text: 'Produto removido do carrinho.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            });
        });
    }

    // Atualizar total
    updateCartTotal() {
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = `R$ ${this.calculateTotal().toFixed(2)}`;
        }
    }

    // Mostrar alerta de adição
    showAddToCartAlert(productName) {
        Swal.fire({
            title: '✓ Adicionado ao carrinho!',
            text: `${productName} foi adicionado ao seu carrinho.`,
            icon: 'success',
            confirmButtonText: 'Continuar comprando',
            confirmButtonColor: '#000',
            showCancelButton: true,
            cancelButtonText: 'Ver carrinho',
            cancelButtonColor: '#6b7280',
            timer: 3000,
            timerProgressBar: true
        }).then((result) => {
            if (result.isDismissed) {
                this.openCart();
            }
        });
    }

    // Abrir carrinho
    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    // Fechar carrinho
    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    }

    // CORREÇÃO: Finalizar compra com verificação robusta e opção WhatsApp otimizada
    async checkout() {
        if (this.cart.length === 0) {
            Swal.fire({
                title: 'Carrinho vazio',
                text: 'Adicione produtos ao carrinho antes de finalizar a compra.',
                icon: 'warning',
                confirmButtonText: 'Entendi'
            });
            return;
        }

        // CORREÇÃO: Verificação completa de estoque
        const stockErrors = [];
        const validItems = [];
        
        this.cart.forEach(item => {
            const product = this.getProductFromAnySource(item.id);
            if (product) {
                const availableStock = product.stock;
                if (item.quantity > availableStock) {
                    stockErrors.push({
                        name: item.name,
                        requested: item.quantity,
                        available: availableStock
                    });
                } else {
                    validItems.push(item);
                }
            } else {
                // Produto não encontrado no manager
                stockErrors.push({
                    name: item.name,
                    requested: item.quantity,
                    available: 0
                });
            }
        });

        // CORREÇÃO: Se houver erros, mostrar detalhes
        if (stockErrors.length > 0) {
            const errorMessage = stockErrors.map(error => 
                `${error.name}: você tem ${error.requested} no carrinho, mas só temos ${error.available} disponível${error.available === 1 ? '' : 's'}`
            ).join('<br>');
            
            Swal.fire({
                title: 'Estoque insuficiente!',
                html: `Não podemos finalizar sua compra porque alguns produtos não têm estoque suficiente:<br><br>${errorMessage}<br><br>Por favor, ajuste as quantidades ou remova os produtos sem estoque.`,
                icon: 'error',
                confirmButtonText: 'Entendi'
            });
            
            // Atualiza o carrinho para refletir a situação real
            this.updateUI();
            return;
        }

        // CORREÇÃO: Processa apenas itens válidos
        const result = await Swal.fire({
            title: 'Finalizar compra',
            html: `
                <div class="text-left">
                    <p class="mb-4">Confirme os dados para finalizar sua compra:</p>
                    <div class="bg-gray-50 p-4 rounded-lg mb-4">
                        <p class="font-semibold">Total: R$ ${this.calculateTotal().toFixed(2)}</p>
                        <p class="text-sm text-gray-600">${this.getTotalItems()} itens no carrinho</p>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p><i class="fas fa-check text-green-500 mr-2"></i>Todos os produtos estão disponíveis em estoque</p>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar pedido',
            confirmButtonColor: '#000',
            cancelButtonText: 'Continuar comprando',
            cancelButtonColor: '#6b7280',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    // Simular processamento
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    return { success: true, orderId: 'ROM' + Date.now().toString().slice(-6) };
                } catch (error) {
                    throw new Error('Erro ao processar pedido');
                }
            }
        });

        if (result.isConfirmed) {
            // MELHORIA: Criar mensagem para WhatsApp ANTES de mostrar o alerta final
            const whatsappUrl = this.generateWhatsAppMessage(result.value.orderId);
            
            // MELHORIA: Alert de confirmação otimizado
            const confirmationResult = await Swal.fire({
                title: '🎉 Pedido confirmado!',
                html: `
                    <div class="text-center">
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <i class="fas fa-check-circle text-4xl text-green-500 mb-3"></i>
                            <p class="font-semibold text-green-800 mb-2">Obrigado pela sua compra!</p>
                            <p class="text-sm text-green-700 mb-1">Número do pedido: <strong>${result.value.orderId}</strong></p>
                            <p class="text-xs text-green-600">Você receberá um e-mail com os detalhes.</p>
                        </div>
                        
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p class="text-sm text-blue-800 font-medium mb-3">
                                <i class="fab fa-whatsapp text-green-500 mr-1"></i>
                                Acompanhe seu pedido via WhatsApp
                            </p>
                            <p class="text-xs text-blue-600 mb-3">
                                Clique abaixo para falar diretamente com nosso atendimento
                            </p>
                            <button id="whatsapp-action-btn" class="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition duration-200 flex items-center justify-center">
                                <i class="fab fa-whatsapp text-lg mr-2"></i>
                                Falar no WhatsApp
                            </button>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Continuar comprando',
                confirmButtonColor: '#000',
                cancelButtonText: 'Fechar',
                cancelButtonColor: '#6b7280',
                allowOutsideClick: false,
                didOpen: () => {
                    // MELHORIA: Event listener otimizado
                    const whatsappBtn = document.getElementById('whatsapp-action-btn');
                    if (whatsappBtn) {
                        whatsappBtn.addEventListener('click', () => {
                            this.contactViaWhatsApp(whatsappUrl);
                        }, { once: true }); // Previne múltiplos cliques
                    }
                }
            });

            // Limpa o carrinho independente da ação do usuário
            this.clearCart();
            this.closeCart();

            // Se o usuário clicou em "Continuar comprando", fecha o alerta
            if (confirmationResult.isConfirmed) {
                Swal.close();
            }
        }
    }

    // MELHORIA: Gerar mensagem para WhatsApp otimizada
    generateWhatsAppMessage(orderId) {
        const itemsList = this.cart.map(item => 
            `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`
        ).join('%0A');
        
        const total = this.calculateTotal().toFixed(2);
        const totalItems = this.getTotalItems();
        
        // MELHORIA: Número configurável (substitua pelo número da empresa)
        const phoneNumber = '5592994201672'; // Formato: 5511999999999
        
        // MELHORIA: Mensagem mais profissional e organizada
        const message = `Olá, Romanos Store! Gostaria de acompanhar meu pedido.%0A%0A*📦 DETALHES DO PEDIDO*%0A*Número:* ${orderId}%0A*Itens:*%0A${itemsList}%0A%0A*💰 VALORES*%0A*Total de Itens:* ${totalItems}%0A*Valor Total:* R$ ${total}%0A%0A*👤 DADOS DO CLIENTE*%0A*Nome:* [Preencher nome]%0A*E-mail:* [Preencher e-mail]%0A%0APor favor, me informe sobre o andamento do meu pedido. Obrigado!`;
        
        return `https://wa.me/${phoneNumber}?text=${message}`;
    }

    // MELHORIA: Abrir WhatsApp com a mensagem otimizada
    contactViaWhatsApp(whatsappUrl) {
        console.log('📱 Abrindo WhatsApp:', whatsappUrl);
        
        // Fechar o SweetAlert atual
        Swal.close();
        
        // MELHORIA: Abrir WhatsApp em nova aba com fallback
        const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        if (!newWindow) {
            // Fallback para dispositivos móveis
            window.location.href = whatsappUrl;
        }
        
        // MELHORIA: Feedback visual otimizado
        setTimeout(() => {
            Swal.fire({
                title: '📱 WhatsApp aberto!',
                text: 'Você será redirecionado para conversar conosco.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true
            });
        }, 500);
    }

    // NOVO: Método para configurar o número do WhatsApp
    setWhatsAppNumber(phoneNumber) {
        if (phoneNumber && phoneNumber.trim() !== '') {
            this.whatsappNumber = phoneNumber.replace(/\D/g, ''); // Remove não-números
            console.log('✅ Número do WhatsApp configurado:', this.whatsappNumber);
        }
    }
}

// Event listeners globais
document.addEventListener('DOMContentLoaded', function() {
    // Botão do carrinho
    const cartButton = document.getElementById('cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.cartManager.openCart();
        });
    }

    // Fechar carrinho
    const closeCart = document.getElementById('close-cart');
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            window.cartManager.closeCart();
        });
    }

    // Finalizar compra
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            window.cartManager.checkout();
        });
    }

    // Fechar carrinho ao clicar fora
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.addEventListener('click', function(e) {
            if (e.target === cartSidebar) {
                window.cartManager.closeCart();
            }
        });
    }
});

// Inicializar gerenciador do carrinho
window.cartManager = new CartManager();

// Funções globais para acesso externo
window.addToCart = function(productId, productName, productPrice, availableStock) {
    return window.cartManager.addToCart(productId, productName, productPrice, availableStock);
};

window.removeFromCart = function(productId) {
    return window.cartManager.removeFromCart(productId);
};

window.updateCartDisplay = function() {
    return window.cartManager.updateUI();
};

// NOVO: Função global para configurar WhatsApp
window.setWhatsAppNumber = function(phoneNumber) {
    return window.cartManager.setWhatsAppNumber(phoneNumber);
};

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}