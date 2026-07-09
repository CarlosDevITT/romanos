export function renderDesktopNav(activeRoute, cartCount) {
  const link = (route, svg, label, extra = '') => `
    <button class="desktop-nav__link ${route === activeRoute ? 'is-active' : ''}" onclick="dom.goTo('${route}')" style="position:relative;">
      ${svg}<span>${label}</span>
      ${extra}
    </button>
  `;

  return `
    <nav class="desktop-nav">
      <span class="desktop-nav__brand" onclick="dom.goTo('home')" style="cursor:pointer;">DOM</span>

      <div class="desktop-nav__search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
        </svg>
        <input type="text" placeholder="Search..." oninput="dom.onSearch(this.value)" />
      </div>

      <div class="desktop-nav__links">
        ${link('home', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>`, 'Produtos')}
        ${link('cart', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.6L21 8H6"/></svg>`, 'Carrinho', cartCount > 0 ? `<span class="badge-count">${cartCount}</span>` : '')}
        ${link('customer', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>`, 'Minha conta')}
      </div>
    </nav>
  `;
}

export function renderBottomNav(activeRoute, cartCount) {
  const item = (route, svg, extra = '') => `
    <button class="bottom-nav__item ${route === activeRoute ? 'is-active' : ''}" onclick="dom.goTo('${route}')" style="position:relative;">
      ${svg}
      ${extra}
    </button>
  `;

  return `
    <nav class="bottom-nav">
      ${item(
        'home',
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>`
      )}
      ${item(
        'favorites',
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 6 3.5C14.5 6 16 5 18 5c3.5 0 5.5 3.5 3.5 7.5C19 16.65 12 21 12 21z"/></svg>`
      )}

      <button class="bottom-nav__fab" onclick="dom.goTo('home')" aria-label="Início">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>
      </button>

      ${item(
        'cart',
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.6L21 8H6"/></svg>`,
        cartCount > 0 ? `<span class="badge-count">${cartCount}</span>` : ''
      )}
      ${item(
        'customer',
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>`
      )}
    </nav>
  `;
}
