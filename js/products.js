
// ===============================================
// 🛍️ Romanos Store - Product Manager Integrado
// ===============================================

// ✅ Garantir cliente global único

if (!window.supabaseClient) {
  const SUPABASE_URL = 'https://zgrevlntkgmonqxyhjww.supabase.co';
  const SUPABASE_KEY =
    localStorage.getItem('supabase_anon_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmV2bG50a2dtb25xeHloand3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjMxNjksImV4cCI6MjA3NjY5OTE2OX0.9svTC7fzUWgZXOraUcNOifl5XggZfvwwzEWHanN2aP0';
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✅ Supabase Client inicializado em products.js');
}

const supabase = window.supabaseClient;

// ===============================
// ⚙️ Classe de gerenciamento de produtos
// ===============================
class ProductManager {
  constructor() {
    this.productsContainer = document.getElementById('products-container');
    this.productsCount = document.getElementById('products-count');
    this.sortSelect = document.getElementById('sort-select');
    this.categoryFilters = document.querySelectorAll('.category-filter');
    this.promotionFilters = document.querySelectorAll('.promotion-filter');
    this.stockFilters = document.querySelectorAll('.stock-filter');
    this.minPrice = document.getElementById('min-price');
    this.maxPrice = document.getElementById('max-price');
    this.clearFiltersBtn = document.getElementById('clear-filters');

    this.products = [];
    this.filteredProducts = [];

    this.init();
  }

  async init() {
    try {
      console.log('🛒 Inicializando ProductManager...');
      await this.loadProducts();
      this.bindEvents();
      
      // Disparar evento para o carrinho saber que produtos carregaram
      window.dispatchEvent(new Event('productsLoaded'));
    } catch (err) {
      console.error('Erro ao inicializar produtos:', err.message);
      this.showError('Falha ao carregar produtos. Verifique a conexão.');
    }
  }

  // ===============================
  // 📦 Carrega produtos do Supabase
  // ===============================
  async loadProducts() {
    try {
      this.setLoading(true);

      if (!supabase) throw new Error('Supabase não inicializado.');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.products = data;
      this.filteredProducts = data;

      console.log(`✅ ${data.length} produtos carregados com sucesso.`, data);
      this.renderProducts(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err.message);
      this.showError('Erro ao carregar produtos. Tente novamente mais tarde.');
    } finally {
      this.setLoading(false);
    }
  }

  // ===============================
  // 🔍 Método para buscar produto por ID - CORREÇÃO: Aceita UUID
  // ===============================
  getProductById(productId) {
      console.log(`🔍 Buscando produto por ID: ${productId}`, {
          productsCount: this.products.length,
          products: this.products.map(p => ({ id: p.id, name: p.name }))
      });
      
      // CORREÇÃO: Não converte para número, mantém como string (UUID)
      const product = this.products.find(product => product.id === productId);
      console.log('✅ Produto encontrado:', product);
      return product;
  }

  // ===============================
  // 🎨 Renderiza produtos na tela - CORREÇÃO: Layout melhorado
  // ===============================
  renderProducts(products) {
    if (!this.productsContainer) return;

    this.productsContainer.innerHTML = '';

    if (!products || products.length === 0) {
      this.productsContainer.innerHTML =
        '<p class="text-center text-gray-500 col-span-full py-8">Nenhum produto encontrado.</p>';
      this.productsCount.textContent = '0 produtos encontrados';
      return;
    }

    this.productsCount.textContent = `${products.length} produtos encontrados`;

    products.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'product-card fade-in';
      card.innerHTML = `
        <div class="product-image-container">
          <img src="${p.image_url || 'https://via.placeholder.com/300x280/FFFFFF?text=Produto+Sem+Imagem'}" 
               alt="${p.name}" 
               class="product-image"
               onerror="this.src='https://via.placeholder.com/300x280/FFFFFF?text=Imagem+Não+Encontrada'">
        </div>
        <div class="product-info">
          <h3 class="product-title">${p.name}</h3>
          <p class="product-description">${p.description || 'Descrição não disponível'}</p>
          <div class="product-prices">
            <span class="product-price">R$ ${(p.price || 0).toFixed(2)}</span>
          </div>
          <div class="product-stock ${p.stock <= 0 ? 'stock-out' : p.stock < 5 ? 'stock-low' : 'stock-available'}">
            Estoque: ${p.stock || 0}
          </div>
          <div class="product-actions">
            <button class="add-to-cart-btn ${p.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                    onclick="addToCart('${p.id}', '${p.name.replace(/'/g, "\\'")}', ${p.price}, ${p.stock || 0})"
                    ${p.stock <= 0 ? 'disabled' : ''}>
              <i class="fas fa-shopping-cart"></i>
              ${p.stock <= 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
            </button>
          </div>
        </div>
      `;
      this.productsContainer.appendChild(card);
    });
  }

  // ===============================
  // 🔍 Filtros e Ordenação
  // ===============================
  bindEvents() {
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', () => this.sortProducts());
    }

    [...this.categoryFilters, ...this.promotionFilters, ...this.stockFilters].forEach(
      (filter) => {
        filter.addEventListener('change', () => this.applyFilters());
      }
    );

    if (this.clearFiltersBtn) {
      this.clearFiltersBtn.addEventListener('click', () => {
        document.querySelectorAll('input[type=radio], input[type=checkbox]').forEach(
          (input) => (input.checked = false)
        );
        this.minPrice.value = '';
        this.maxPrice.value = '';
        this.filteredProducts = [...this.products];
        this.renderProducts(this.filteredProducts);
      });
    }

    if (this.minPrice || this.maxPrice) {
      this.minPrice.addEventListener('input', () => this.applyFilters());
      this.maxPrice.addEventListener('input', () => this.applyFilters());
    }
  }

  sortProducts() {
    const sort = this.sortSelect.value;
    let sorted = [...this.filteredProducts];

    switch (sort) {
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        sorted = [...this.filteredProducts];
    }

    this.renderProducts(sorted);
  }

  applyFilters() {
    let filtered = [...this.products];

    const selectedCategory = document.querySelector(
      'input[name="category"]:checked'
    )?.value;

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    const promoFilter = document.querySelector(
      '.promotion-filter[value="sale"]:checked'
    );
    if (promoFilter) {
      filtered = filtered.filter((p) => p.is_promotion === true);
    }

    const min = parseFloat(this.minPrice.value) || 0;
    const max = parseFloat(this.maxPrice.value) || Infinity;
    filtered = filtered.filter((p) => p.price >= min && p.price <= max);

    this.filteredProducts = filtered;
    this.sortProducts();
  }

  // ===============================
  // 🧱 Feedback Visual
  // ===============================
  setLoading(isLoading) {
    if (isLoading && this.productsContainer) {
      this.productsContainer.innerHTML =
        '<p class="text-center text-gray-500 col-span-full animate-pulse">Carregando produtos...</p>';
    }
  }

  showError(msg) {
    Swal.fire({
      icon: 'error',
      title: 'Erro ao carregar produtos',
      text: msg,
      confirmButtonText: 'Entendi',
    });
  }
}

// ===============================
// 🚀 Inicialização automática
// ===============================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🛍️ Romanos Store inicializada com sucesso!');
  window.productManager = new ProductManager();
});