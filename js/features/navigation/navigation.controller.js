import { navigateTo } from '../../core/router.js';

export function goTo(route) {
  navigateTo(route);
}

export function goToProduct(productId) {
  navigateTo('product', productId);
}
