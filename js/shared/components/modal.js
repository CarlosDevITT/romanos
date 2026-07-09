export function openModal({ title, bodyHtml, onClose }) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(20,20,26,.45);
    display: flex; align-items: flex-end; justify-content: center; z-index: 100;
  `;
  overlay.innerHTML = `
    <div style="background:#fff;width:100%;max-width:430px;border-radius:22px 22px 0 0;padding:24px;">
      <h3 style="font-family:var(--font-display);font-size:17px;margin-bottom:12px;">${title}</h3>
      <div>${bodyHtml}</div>
    </div>
  `;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      onClose && onClose();
    }
  });
  document.body.appendChild(overlay);
  return overlay;
}
