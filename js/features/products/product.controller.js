import { appStore } from '../../shared/state/store.js';
import { productService } from './product.service.js';
import { storageService } from '../../services/storage.service.js';
import { STORAGE_KEYS } from '../../core/config/constants.js';

export function initPdpState(productId) {
  appStore.setState({
    activeProductId: productId,
    pdp: { colorIndex: 0, qty: 1, activeTab: 'description' },
  });
}

export function selectPdpColor(index) {
  const pdp = appStore.getState().pdp;
  appStore.setState({ pdp: { ...pdp, colorIndex: index } });
}

export function changePdpQty(delta) {
  const pdp = appStore.getState().pdp;
  const nextQty = Math.max(1, pdp.qty + delta);
  appStore.setState({ pdp: { ...pdp, qty: nextQty } });
}

export function setPdpTab(tab) {
  const pdp = appStore.getState().pdp;
  appStore.setState({ pdp: { ...pdp, activeTab: tab } });
}

export function toggleFavorite(productId) {
  const { favorites } = appStore.getState();
  const next = favorites.includes(productId)
    ? favorites.filter((id) => id !== productId)
    : [...favorites, productId];
  storageService.set(STORAGE_KEYS.FAVORITES, next);
  appStore.setState({ favorites: next });
}

export function selectCategory(categoryId) {
  appStore.setState({ activeCategory: categoryId });
}

export function onSearch(query) {
  appStore.setState({ searchQuery: query });
}

export function getActiveProduct() {
  const { activeProductId } = appStore.getState();
  return productService.getById(activeProductId);
}
