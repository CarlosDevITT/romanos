import { formatPrice } from '../../utils/formatter.js';
import { cartService } from './cart.service.js';

function renderCartItem(item) {
  return `
    <div class="cart-item">
      <button class="cart-item__remove" onclick="dom.removeCartItem('${item.lineId}')" aria-label="Remover">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>
        </svg>
      </button>
      <div class="cart-item__thumb">${item.emoji}</div>
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__category">${item.category}</p>
        <div class="cart-item__footer">
          <span class="cart-item__price">${formatPrice(item.price)}</span>
          <div class="cart-item__qty">
            <button onclick="dom.changeCartQty('${item.lineId}', -1)" aria-label="Diminuir">−</button>
            <span>${item.qty}</span>
            <button onclick="dom.changeCartQty('${item.lineId}', 1)" aria-label="Aumentar">+</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderCartView(cart, discountPercent) {
  if (cart.length === 0) {
    return `
      <div class="dom-header">
        <button class="icon-btn" onclick="dom.goTo('home')" aria-label="Voltar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span class="dom-header__title" style="font-size:var(--fs-md)">My Cart</span>
        <span style="width:40px"></span>
      </div>
      <div class="cart-empty">
        <div class="cart-empty__emoji">🛒</div>
        <p>Seu carrinho está vazio.</p>
      </div>
    `;
  }

  const subtotal = cartService.getSubtotal(cart);
  const total = cartService.getTotal(cart, discountPercent);
  const discountValue = subtotal - total;

  return `
    <div class="dom-header">
      <button class="icon-btn" onclick="dom.goTo('home')" aria-label="Voltar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <span class="dom-header__title" style="font-size:var(--fs-md)">My Cart</span>
      <span style="width:40px"></span>
    </div>

    <div class="cart-wrap">
      <div class="cart-list">
        ${cart.map(renderCartItem).join('')}
      </div>

      <aside class="cart-summary">
        <div class="discount-box">
          <div class="discount-input">
            <input type="text" id="discount-code" placeholder="Enter Discount Code" />
            <button onclick="dom.applyDiscountCode()">Apply</button>
          </div>

          <div class="summary-row">
            <span>Subtotal</span>
            <span>${formatPrice(subtotal)}</span>
          </div>
          ${
            discountPercent > 0
              ? `<div class="summary-row"><span>Discount (${discountPercent}%)</span><span>-${formatPrice(discountValue)}</span></div>`
              : ''
          }
          <div class="summary-row is-total">
            <span>Total</span>
            <span>${formatPrice(total)}</span>
          </div>
        </div>

        <button class="checkout-btn" onclick="dom.checkout()">Checkout</button>
      </aside>
    </div>
  `;
}
