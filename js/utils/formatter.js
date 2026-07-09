import { storeConfig } from '../../config/store.config.js';

export function formatPrice(value) {
  return `${storeConfig.currency}${Number(value).toFixed(2)}`;
}
