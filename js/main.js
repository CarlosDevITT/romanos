import { initApp } from './core/app.js';

document.addEventListener('DOMContentLoaded', () => {
  initApp();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
