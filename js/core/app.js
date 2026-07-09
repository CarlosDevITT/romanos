import { appStore } from '../shared/state/store.js';
import { initRouter, onRouteChange, getCurrentRoute } from './router.js';
import { CATEGORIES, STORAGE_KEYS } from './config/constants.js';
import { storageService } from '../services/storage.service.js';

import {
  productService,
  renderHomeView,
  renderProductDetailView,
  renderFavoritesView,
  initPdpState,
  selectPdpColor,
  changePdpQty,
  setPdpTab,
  toggleFavorite,
  selectCategory,
  onSearch,
  getActiveProduct,
} from '../features/products/index.js';

import {
  renderCartView,
  addToCart,
  changeCartQty,
  removeCartItem,
  applyDiscountCode,
  checkout,
  cartService,
} from '../features/cart/index.js';

import { renderBottomNav, renderDesktopNav, goTo, goToProduct } from '../features/navigation/index.js';
import { renderCustomerView, getCurrentCustomer } from '../features/customer/index.js';
import { renderLoader } from '../shared/components/loader.js';

const appEl = document.getElementById('dom-app');

function renderCurrentView() {
  const state = appStore.getState();
  const { route } = getCurrentRoute();
  const products = productService.getAll();
  const cartCount = cartService.getItemCount(state.cart);

  let contentHtml = '';

  if (route === 'product' && state.activeProductId) {
    const product = productService.getById(state.activeProductId);
    contentHtml = renderProductDetailView(product, {
      ...state.pdp,
      isFavorite: state.favorites.includes(product.id),
    });
  } else if (route === 'cart') {
    contentHtml = renderCartView(state.cart, state.discountPercent);
  } else if (route === 'favorites') {
    contentHtml = renderFavoritesView(products, state.favorites);
  } else if (route === 'customer') {
    contentHtml = renderCustomerView(getCurrentCustomer());
  } else {
    contentHtml = renderHomeView({
      products,
      categories: CATEGORIES,
      activeCategory: state.activeCategory,
      favorites: state.favorites,
    });
  }

  const navRoute = route === 'product' ? 'home' : route;

  appEl.innerHTML = `
    ${renderDesktopNav(navRoute, cartCount)}
    <div class="view">${contentHtml}</div>
    ${renderBottomNav(navRoute, cartCount)}
  `;
}

function handleRouteChange(route, param) {
  if (route === 'product' && param) {
    initPdpState(param);
  }
  appStore.setState({ route });
  renderCurrentView();
}

function bindGlobalApi() {
  window.dom = {
    goTo,
    goToProduct,
    selectCategory,
    onSearch,
    toggleFavorite,
    selectPdpColor,
    changePdpQty,
    setPdpTab,
    addCurrentToCart: () => {
      const product = getActiveProduct();
      const { pdp } = appStore.getState();
      if (!product) return;
      addToCart(product, pdp.qty, pdp.colorIndex);
      goTo('cart');
    },
    changeCartQty,
    removeCartItem,
    applyDiscountCode,
    checkout,
  };
}

export async function initApp() {
  const savedCart = storageService.get(STORAGE_KEYS.CART, []);
  const savedFavorites = storageService.get(STORAGE_KEYS.FAVORITES, []);

  appStore.setState({
    cart: savedCart,
    favorites: savedFavorites,
    discountPercent: 0,
    pdp: { colorIndex: 0, qty: 1, activeTab: 'description' },
  });

  appEl.innerHTML = renderLoader();
  await productService.fetchAll();

  bindGlobalApi();
  initRouter();
  onRouteChange(handleRouteChange);
  appStore.subscribe(renderCurrentView);

  const { route, param } = getCurrentRoute();
  handleRouteChange(route, param);
}
