import { appStore } from '../../shared/state/store.js';
import { cartService } from './cart.service.js';
import { storageService } from '../../services/storage.service.js';
import { notificationService } from '../../services/notification.service.js';
import { STORAGE_KEYS } from '../../core/config/constants.js';

const DISCOUNT_CODES = {
  DOM10: 10,
  DOM20: 20,
};

function persistCart(cart) {
  storageService.set(STORAGE_KEYS.CART, cart);
}

export function addToCart(product, qty, colorIndex) {
  const { cart } = appStore.getState();
  const nextCart = cartService.addItem(cart, product, qty, colorIndex);
  persistCart(nextCart);
  appStore.setState({ cart: nextCart });
  notificationService.success(`${product.name} adicionado ao carrinho`);
}

export function changeCartQty(lineId, delta) {
  const { cart } = appStore.getState();
  const nextCart = cartService.updateQty(cart, lineId, delta);
  persistCart(nextCart);
  appStore.setState({ cart: nextCart });
}

export function removeCartItem(lineId) {
  const { cart } = appStore.getState();
  const nextCart = cartService.removeItem(cart, lineId);
  persistCart(nextCart);
  appStore.setState({ cart: nextCart });
  notificationService.info('Item removido do carrinho');
}

export function applyDiscountCode() {
  const input = document.getElementById('discount-code');
  const code = (input?.value || '').trim().toUpperCase();
  const percent = DISCOUNT_CODES[code];

  if (percent) {
    appStore.setState({ discountPercent: percent });
    notificationService.success(`Cupom aplicado: ${percent}% off`);
  } else {
    notificationService.error('Cupom inválido');
  }
}

export function checkout() {
  const { cart } = appStore.getState();
  if (cart.length === 0) return;
  notificationService.success('Pedido enviado com sucesso!');
  persistCart([]);
  appStore.setState({ cart: [], discountPercent: 0 });
}
