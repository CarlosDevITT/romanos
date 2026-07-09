let toastEl = null;
let hideTimeout = null;

function ensureToast() {
  if (toastEl) return toastEl;
  toastEl = document.createElement('div');
  toastEl.id = 'dom-toast';
  toastEl.style.cssText = `
    position: fixed;
    left: 50%;
    bottom: calc(var(--bottomnav-h, 78px) + 16px);
    transform: translate(-50%, 20px);
    background: var(--color-ink, #14141A);
    color: #fff;
    padding: 12px 20px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    z-index: 999;
    opacity: 0;
    transition: opacity .25s ease, transform .25s ease;
    max-width: 88%;
    text-align: center;
    pointer-events: none;
  `;
  document.body.appendChild(toastEl);
  return toastEl;
}

const COLORS = {
  success: '#14141A',
  error: '#E4483A',
  info: '#14141A',
};

export function showToast(message, type = 'info') {
  const node = ensureToast();
  node.textContent = message;
  node.style.background = COLORS[type] || COLORS.info;
  node.style.opacity = '1';
  node.style.transform = 'translate(-50%, 0)';

  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    node.style.opacity = '0';
    node.style.transform = 'translate(-50%, 20px)';
  }, 2200);
}
