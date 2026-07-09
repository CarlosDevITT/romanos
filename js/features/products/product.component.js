import { formatPrice } from '../../utils/formatter.js';
import { renderCategoryFilters } from './filters.component.js';

function renderProductCard(product, isFavorite) {
  return `
    <div class="product-card" onclick="dom.goToProduct('${product.id}')">
      <button
        class="product-card__fav ${isFavorite ? 'is-active' : ''}"
        onclick="event.stopPropagation(); dom.toggleFavorite('${product.id}')"
        aria-label="Favoritar"
      >
        <svg viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 6 3.5C14.5 6 16 5 18 5c3.5 0 5.5 3.5 3.5 7.5C19 16.65 12 21 12 21z"/>
        </svg>
      </button>
      <div class="product-card__thumb">${product.emoji}</div>
      <p class="product-card__name">${product.name}</p>
      <div class="product-card__footer">
        <span class="product-card__price">${formatPrice(product.price)}</span>
        <div class="product-card__colors">
          ${product.colors
            .slice(0, 3)
            .map((c) => `<span style="background:${c}"></span>`)
            .join('')}
        </div>
      </div>
    </div>
  `;
}

export function renderHomeView({ products, categories, activeCategory, favorites }) {
  const specialProducts = products;

  return `
    <div class="dom-header dom-header--home">
      <button class="icon-btn" onclick="dom.goTo('customer')" aria-label="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="5" cy="5" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="19" cy="5" r="1.5"/>
          <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
          <circle cx="5" cy="19" r="1.5"/><circle cx="12" cy="19" r="1.5"/><circle cx="19" cy="19" r="1.5"/>
        </svg>
      </button>
      <button class="icon-btn notif-btn" aria-label="Notificações">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </button>
    </div>

    <div class="search-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
      </svg>
      <input type="text" placeholder="Search..." oninput="dom.onSearch(this.value)" />
      <div class="search-bar__divider"></div>
      <button class="search-bar__filter" aria-label="Filtros">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/>
          <line x1="4" y1="18" x2="20" y2="18"/><circle cx="16" cy="18" r="2" fill="currentColor" stroke="none"/>
        </svg>
      </button>
    </div>

    <div class="container">
      <div class="promo-banner">
        <h3>Super Sale<br/>Discount<br/>Up to <strong>50%</strong></h3>
        <span class="promo-banner__emoji">👟</span>
        <button class="promo-cta" onclick="dom.goTo('home')">Shop Now</button>
      </div>
      <div class="promo-dots">
        <span class="is-active"></span><span></span><span></span><span></span><span></span>
      </div>

      ${renderCategoryFilters(categories, activeCategory)}

      <div class="section-title">
        <h2>Special For You</h2>
        <span class="see-all" onclick="dom.goTo('home')">See all</span>
      </div>
      <div class="grid-2">
        ${specialProducts.map((p) => renderProductCard(p, favorites.includes(p.id))).join('')}
      </div>
    </div>
  `;
}

export function renderFavoritesView(products, favorites) {
  const favProducts = products.filter((p) => favorites.includes(p.id));

  return `
    <div class="dom-header">
      <button class="icon-btn" onclick="dom.goTo('home')" aria-label="Voltar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <span class="dom-header__title" style="font-size:var(--fs-md)">Favorites</span>
      <span style="width:40px"></span>
    </div>
    <div class="container">
      ${
        favProducts.length === 0
          ? `<div class="cart-empty"><div class="cart-empty__emoji">💛</div><p>Nenhum favorito ainda.</p></div>`
          : `<div class="grid-2">${favProducts.map((p) => renderProductCard(p, true)).join('')}</div>`
      }
    </div>
  `;
}

export function renderProductDetailView(product, pdp) {
  const { colorIndex, qty, activeTab } = pdp;

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' },
  ];

  const tabContent =
    activeTab === 'description'
      ? product.description
      : activeTab === 'specifications'
      ? 'Cor, tamanho e material variam conforme a seleção acima. Garantia de 12 meses.'
      : `${product.reviews} avaliações de clientes com nota média ${product.rating}.`;

  return `
    <div class="pdp-wrap">
    <div class="pdp-gallery">
      <button class="icon-btn dom-header__back" onclick="dom.goTo('home')" aria-label="Voltar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="dom-header--floating" style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="icon-btn" aria-label="Compartilhar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/>
            <line x1="8.2" y1="10.8" x2="15.8" y2="6.2"/><line x1="8.2" y1="13.2" x2="15.8" y2="17.8"/>
          </svg>
        </button>
        <button class="icon-btn ${pdp.isFavorite ? 'is-active' : ''}" onclick="dom.toggleFavorite('${product.id}')" aria-label="Favoritar">
          <svg viewBox="0 0 24 24" fill="${pdp.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 6 3.5C14.5 6 16 5 18 5c3.5 0 5.5 3.5 3.5 7.5C19 16.65 12 21 12 21z"/>
          </svg>
        </button>
      </div>
      ${product.emoji}
      <div class="pdp-dots">
        <span class="is-active"></span><span></span><span></span><span></span>
      </div>
    </div>

    <div class="pdp-body">
      <h1>${product.name}</h1>
      <p class="pdp-price">${formatPrice(product.price)}</p>

      <div class="pdp-meta">
        <span class="pdp-rating">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.5L21 9.3l-4.9 4.4 1.3 6.8L12 17.5 6.6 20.5l1.3-6.8L3 9.3l6.1-.8z"/></svg>
          ${product.rating} (${product.reviews} Review)
        </span>
        <span class="pdp-seller">Seller: ${product.seller}</span>
      </div>

      <p class="pdp-section-label">Color</p>
      <div class="color-swatches">
        ${product.colors
          .map(
            (c, i) => `
          <button class="color-swatch ${i === colorIndex ? 'is-active' : ''}" style="--sw-color:${c}" onclick="dom.selectPdpColor(${i})" aria-label="Cor"></button>
        `
          )
          .join('')}
      </div>

      <div class="pill-tabs">
        ${tabs
          .map(
            (t) => `
          <button class="${t.id === activeTab ? 'is-active chip-active' : ''}" onclick="dom.setPdpTab('${t.id}')">${t.label}</button>
        `
          )
          .join('')}
      </div>
      <p class="pdp-tab-content">${tabContent}</p>

      <div class="pdp-footer">
        <div class="qty-control">
          <button onclick="dom.changePdpQty(-1)" aria-label="Diminuir">−</button>
          <span>${qty}</span>
          <button onclick="dom.changePdpQty(1)" aria-label="Aumentar">+</button>
        </div>
        <button class="btn-primary" onclick="dom.addCurrentToCart()">Add to Cart</button>
      </div>
    </div>
    </div>
  `;
}
