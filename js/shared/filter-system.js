export function filterByCategory(items, categoryId) {
  if (!categoryId || categoryId === 'all') return items;
  return items.filter((item) => item.category === categoryId);
}

export function searchItems(items, query) {
  const term = (query || '').trim().toLowerCase();
  if (!term) return items;
  return items.filter((item) => item.name.toLowerCase().includes(term));
}
