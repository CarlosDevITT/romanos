// js/shared/filter-system.js
import { productsAPI } from '../supabase.js';

export class UnifiedFilterSystem {
    constructor(config = {}) {
        this.config = {
            containerId: 'products-container',
            countId: 'products-count',
            sortId: 'sort-select',
            ...config
        };
        
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        
        // Filtros unificados (mesmo em ambos os sistemas)
        this.filters = {
            categories: ['all'],
            promotions: ['all'],
            priceRange: { min: null, max: null },
            stock: ['all'],
            sort: 'default',
            search: ''
        };
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.setupEventListeners();
    }
    
    async loadData() {
        try {
            const [products, categories] = await Promise.all([
                productsAPI.getProducts(),
                productsAPI.getCategories()
            ]);
            
            this.products = products.map(product => this.formatProduct(product));
            this.categories = categories;
            
            this.renderCategories();
            this.applyFilters();
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showError('Erro ao carregar produtos.');
        }
    }
    
    formatProduct(product) {
        const isOnSale = product.original_price && product.original_price > product.price;
        
        return {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            originalPrice: product.original_price ? parseFloat(product.original_price) : null,
            category: product.category,
            image: product.image_url || this.getPlaceholderImage(),
            onSale: isOnSale,
            stock: product.stock || 0,
            description: product.description,
            status: product.status || 'active'
        };
    }
    
    getPlaceholderImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+';
    }
    
    // ===== RENDERIZAÇÃO DE CATEGORIAS (IGUAL NOS DOIS) =====
    renderCategories() {
        const categoriesContainer = document.querySelector('.category-filters');
        if (!categoriesContainer) return;
        
        // Limpar e adicionar categorias
        categoriesContainer.innerHTML = `
            <label class="filter-option">
                <input type="checkbox" class="category-filter" value="all" checked>
                <span>Todos os produtos</span>
            </label>
        `;
        
        this.categories.forEach(category => {
            if (category) {
                const label = document.createElement('label');
                label.className = 'filter-option';
                label.innerHTML = `
                    <input type="checkbox" class="category-filter" value="${category}">
                    <span class="capitalize">${category}</span>
                `;
                categoriesContainer.appendChild(label);
            }
        });
        
        this.bindCategoryEvents();
    }
    
    bindCategoryEvents() {
        document.querySelectorAll('.category-filter').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleCategoryFilter(e));
        });
    }
    
    // ===== MANIPULAÇÃO DE FILTROS (IGUAL NOS DOIS) =====
    handleCategoryFilter(e) {
        const value = e.target.value;
        
        if (value === 'all') {
            if (e.target.checked) {
                this.filters.categories = ['all'];
                document.querySelectorAll('.category-filter:not([value="all"])').forEach(cb => {
                    cb.checked = false;
                });
            }
        } else {
            if (e.target.checked) {
                this.filters.categories = this.filters.categories.filter(c => c !== 'all');
                this.filters.categories.push(value);
                document.querySelector('.category-filter[value="all"]').checked = false;
            } else {
                this.filters.categories = this.filters.categories.filter(c => c !== value);
                if (this.filters.categories.length === 0) {
                    this.filters.categories = ['all'];
                    document.querySelector('.category-filter[value="all"]').checked = true;
                }
            }
        }
        
        this.applyFilters();
    }
    
    handlePromotionFilter(e) {
        const value = e.target.value;
        
        if (value === 'all') {
            if (e.target.checked) {
                this.filters.promotions = ['all'];
                document.querySelectorAll('.promotion-filter:not([value="all"])').forEach(cb => {
                    cb.checked = false;
                });
            }
        } else {
            if (e.target.checked) {
                this.filters.promotions = this.filters.promotions.filter(p => p !== 'all');
                this.filters.promotions.push(value);
                document.querySelector('.promotion-filter[value="all"]').checked = false;
            } else {
                this.filters.promotions = this.filters.promotions.filter(p => p !== value);
                if (this.filters.promotions.length === 0) {
                    this.filters.promotions = ['all'];
                    document.querySelector('.promotion-filter[value="all"]').checked = true;
                }
            }
        }
        
        this.applyFilters();
    }
    
    handleStockFilter(e) {
        const value = e.target.value;
        
        if (value === 'all') {
            if (e.target.checked) {
                this.filters.stock = ['all'];
                document.querySelectorAll('.stock-filter:not([value="all"])').forEach(cb => {
                    cb.checked = false;
                });
            }
        } else {
            if (e.target.checked) {
                this.filters.stock = this.filters.stock.filter(s => s !== 'all');
                this.filters.stock.push(value);
                document.querySelector('.stock-filter[value="all"]').checked = false;
            } else {
                this.filters.stock = this.filters.stock.filter(s => s !== value);
                if (this.filters.stock.length === 0) {
                    this.filters.stock = ['all'];
                    document.querySelector('.stock-filter[value="all"]').checked = true;
                }
            }
        }
        
        this.applyFilters();
    }
    
    handlePriceFilter() {
        const minPrice = document.getElementById('min-price')?.value;
        const maxPrice = document.getElementById('max-price')?.value;
        
        this.filters.priceRange = {
            min: minPrice ? parseFloat(minPrice) : null,
            max: maxPrice ? parseFloat(maxPrice) : null
        };
        
        this.applyFilters();
    }
    
    handleSearchFilter() {
        const searchInput = document.getElementById('search-products');
        if (searchInput) {
            this.filters.search = searchInput.value.trim();
            this.applyFilters();
        }
    }
    
    handleSortFilter() {
        const sortSelect = document.getElementById('sort-select') || document.getElementById('sort-products');
        if (sortSelect) {
            this.filters.sort = sortSelect.value;
            this.applyFilters();
        }
    }
    
    // ===== APLICAÇÃO DE FILTROS (IGUAL NOS DOIS) =====
    applyFilters() {
        let filtered = [...this.products];
        
        // Filtro de busca
        if (this.filters.search) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(this.filters.search.toLowerCase()))
            );
        }
        
        // Filtro de categoria
        if (!this.filters.categories.includes('all')) {
            filtered = filtered.filter(product => 
                this.filters.categories.includes(product.category)
            );
        }
        
        // Filtro de promoção
        if (!this.filters.promotions.includes('all')) {
            if (this.filters.promotions.includes('sale')) {
                filtered = filtered.filter(product => product.onSale);
            }
        }
        
        // Filtro de estoque
        if (!this.filters.stock.includes('all')) {
            filtered = filtered.filter(product => {
                if (this.filters.stock.includes('in_stock') && product.stock > 0) return true;
                if (this.filters.stock.includes('low_stock') && product.stock > 0 && product.stock <= 5) return true;
                if (this.filters.stock.includes('out_of_stock') && product.stock === 0) return true;
                return false;
            });
        }
        
        // Filtro de preço
        if (this.filters.priceRange.min !== null) {
            filtered = filtered.filter(product => product.price >= this.filters.priceRange.min);
        }
        if (this.filters.priceRange.max !== null) {
            filtered = filtered.filter(product => product.price <= this.filters.priceRange.max);
        }
        
        // Ordenação
        filtered = this.sortProducts(filtered, this.filters.sort);
        
        this.filteredProducts = filtered;
        this.renderProducts();
        this.updateProductCount();
    }
    
    sortProducts(products, sortType) {
        const sorted = [...products];
        
        switch (sortType) {
            case 'price_asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price_desc':
                return sorted.sort((a, b) => b.price - a.price);
            case 'name_asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'stock_asc':
                return sorted.sort((a, b) => a.stock - b.stock);
            case 'stock_desc':
                return sorted.sort((a, b) => b.stock - a.stock);
            case 'created_at_desc':
                return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case 'created_at_asc':
                return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            default:
                return sorted;
        }
    }
    
    // ===== RENDERIZAÇÃO DE PRODUTOS (ADAPTÁVEL) =====
    renderProducts() {
        const container = document.getElementById(this.config.containerId);
        if (!container) return;
        
        if (this.filteredProducts.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        container.innerHTML = this.filteredProducts.map(product => 
            this.config.isAdmin ? 
            this.getAdminProductHTML(product) : 
            this.getFrontendProductHTML(product)
        ).join('');
        
        this.bindProductEvents();
    }
    
    getEmptyStateHTML() {
        return `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">Nenhum produto encontrado</p>
                <p class="text-gray-400 text-sm mt-2">Tente ajustar os filtros</p>
            </div>
        `;
    }
    
    getFrontendProductHTML(product) {
        return `
            <div class="product-card fade-in" data-product-id="${product.id}">
                <div class="product-image" style="background-image: url('${product.image}')">
                    ${product.onSale ? `
                        <div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            PROMOÇÃO
                        </div>
                    ` : ''}
                    ${product.stock === 0 ? `
                        <div class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                            <span class="bg-gray-800 text-white px-3 py-1 rounded font-semibold">ESGOTADO</span>
                        </div>
                    ` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    ${product.description ? `
                        <p class="text-gray-600 text-sm mb-2 line-clamp-2">${product.description}</p>
                    ` : ''}
                    <div class="product-prices">
                        ${product.originalPrice ? `
                            <span class="product-original-price">R$ ${product.originalPrice.toFixed(2)}</span>
                        ` : ''}
                        <span class="product-price">R$ ${product.price.toFixed(2)}</span>
                        ${product.onSale && product.originalPrice ? `
                            <span class="product-discount">
                                ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </span>
                        ` : ''}
                    </div>
                    ${product.stock > 0 && product.stock < 10 ? `
                        <p class="stock-low mt-2">Últimas ${product.stock} unidades!</p>
                    ` : ''}
                    <button class="add-to-cart-btn w-full mt-3 bg-black text-white py-2 rounded hover:bg-gray-800 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            ${product.stock === 0 ? 'disabled' : ''}
                            data-product-id="${product.id}">
                        ${product.stock === 0 ? 'ESGOTADO' : 'ADICIONAR AO CARRINHO'}
                    </button>
                </div>
            </div>
        `;
    }
    
    getAdminProductHTML(product) {
        const stockStatus = this.getStockStatus(product.stock);
        
        return `
            <div class="product-card fade-in">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-badges">
                        <span class="badge ${stockStatus.class}">${stockStatus.text}</span>
                        ${product.onSale ? `<span class="badge badge-sale">PROMOÇÃO</span>` : ''}
                        <span class="badge ${product.status === 'active' ? 'badge-success' : 'badge-error'}">
                            ${product.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                </div>
                
                <div class="product-content">
                    <h3 class="product-title">${this.escapeHtml(product.name)}</h3>
                    <p class="product-description">${this.escapeHtml(product.description || 'Sem descrição')}</p>
                    
                    <div class="product-meta">
                        <span class="product-category">${this.formatCategoryName(product.category)}</span>
                        <div class="product-pricing">
                            ${product.onSale ? `
                                <span class="product-original-price">R$ ${product.originalPrice.toFixed(2)}</span>
                            ` : ''}
                            <span class="product-price ${product.onSale ? 'sale-price' : ''}">
                                R$ ${product.price.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="product-details">
                        <i class="fas fa-box"></i> Estoque: ${product.stock} unidades
                    </div>
                    
                    <div class="product-actions">
                        <button onclick="window.adminEditProduct('${product.id}')" class="btn btn-secondary">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button onclick="window.adminDeleteProduct('${product.id}')" class="btn btn-danger">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getStockStatus(stock) {
        if (stock > 10) return { class: 'badge-success', text: 'Em Estoque' };
        if (stock > 0) return { class: 'badge-warning', text: `${stock} un` };
        return { class: 'badge-error', text: 'Sem Estoque' };
    }
    
    formatCategoryName(category) {
        const categoryMap = {
            'masculino': '👔 Masculino',
            'feminino': '👗 Feminino',
            'infantil': '👶 Infantil', 
            'acessorios': '👜 Acessórios'
        };
        return categoryMap[category] || category;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ===== EVENT LISTENERS UNIFICADOS =====
    setupEventListeners() {
        // Busca
        const searchInput = document.getElementById('search-products');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.handleSearchFilter();
            }, 500));
        }
        
        // Filtros de promoção
        document.querySelectorAll('.promotion-filter').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handlePromotionFilter(e));
        });
        
        // Filtros de estoque
        document.querySelectorAll('.stock-filter').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleStockFilter(e));
        });
        
        // Filtros de preço
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        if (minPrice && maxPrice) {
            minPrice.addEventListener('input', this.debounce(() => this.handlePriceFilter(), 800));
            maxPrice.addEventListener('input', this.debounce(() => this.handlePriceFilter(), 800));
        }
        
        // Ordenação
        const sortSelect = document.getElementById('sort-select') || document.getElementById('sort-products');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.handleSortFilter());
        }
        
        // Botões de ação
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        }
        
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }
    }
    
    bindProductEvents() {
        // Eventos para produtos do frontend (carrinho)
        if (!this.config.isAdmin) {
            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.dataset.productId;
                    this.addToCart(productId);
                });
            });
        }
    }
    
    addToCart(productId) {
        const product = this.products.find(p => p.id == productId);
        if (product && window.cartManager) {
            window.cartManager.addToCart(
                product.id,
                product.name,
                product.price,
                product.stock
            );
            
            this.showAddToCartFeedback(product.name);
        }
    }
    
    showAddToCartFeedback(productName) {
        // Usar SweetAlert ou feedback visual
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '✓ Adicionado!',
                text: `${productName} foi adicionado ao carrinho.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
    }
    
    // ===== UTILITÁRIOS =====
    updateProductCount() {
        const countElement = document.getElementById(this.config.countId);
        if (countElement) {
            const count = this.filteredProducts.length;
            countElement.textContent = `${count} produto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
        }
    }
    
    clearAllFilters() {
        this.filters = {
            categories: ['all'],
            promotions: ['all'],
            priceRange: { min: null, max: null },
            stock: ['all'],
            sort: 'default',
            search: ''
        };
        
        // Resetar UI
        document.querySelectorAll('.category-filter').forEach(cb => {
            cb.checked = cb.value === 'all';
        });
        
        document.querySelectorAll('.promotion-filter').forEach(cb => {
            cb.checked = cb.value === 'all';
        });
        
        document.querySelectorAll('.stock-filter').forEach(cb => {
            cb.checked = cb.value === 'all';
        });
        
        const searchInput = document.getElementById('search-products');
        if (searchInput) searchInput.value = '';
        
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        if (minPrice) minPrice.value = '';
        if (maxPrice) maxPrice.value = '';
        
        const sortSelect = document.getElementById('sort-select') || document.getElementById('sort-products');
        if (sortSelect) sortSelect.value = 'default';
        
        this.applyFilters();
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    showError(message) {
        console.error('FilterSystem Error:', message);
        // Implementar feedback de erro consistente
    }
}

// Exportação para uso global
window.UnifiedFilterSystem = UnifiedFilterSystem;