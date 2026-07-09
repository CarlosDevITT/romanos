export function renderLoader() {
  return `
    <div class="dom-loader" style="display:flex;justify-content:center;padding:40px;">
      <div style="width:28px;height:28px;border:3px solid var(--color-border);border-top-color:var(--color-primary);border-radius:50%;animation:dom-spin .7s linear infinite;"></div>
    </div>
    <style>@keyframes dom-spin{to{transform:rotate(360deg)}}</style>
  `;
}
