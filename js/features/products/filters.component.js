export function renderCategoryFilters(categories, activeCategory) {
  return `
    <div class="hscroll" style="margin-top: var(--sp-2);">
      ${categories
        .map(
          (c) => `
        <button class="category-item ${c.id === activeCategory ? 'is-active' : ''}" onclick="dom.selectCategory('${c.id}')">
          <span class="category-item__icon">${c.icon}</span>
          <span>${c.label}</span>
        </button>
      `
        )
        .join('')}
    </div>
  `;
}
