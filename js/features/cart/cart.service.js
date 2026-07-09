export const cartService = {
  addItem(cart, product, qty, colorIndex) {
    const lineId = `${product.id}-${colorIndex}`;
    const existing = cart.find((item) => item.lineId === lineId);
    if (existing) {
      return cart.map((item) =>
        item.lineId === lineId ? { ...item, qty: item.qty + qty } : item
      );
    }
    return [
      ...cart,
      {
        lineId,
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        emoji: product.emoji,
        color: product.colors[colorIndex],
        qty,
      },
    ];
  },

  updateQty(cart, lineId, delta) {
    return cart
      .map((item) =>
        item.lineId === lineId ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
      .filter(Boolean);
  },

  removeItem(cart, lineId) {
    return cart.filter((item) => item.lineId !== lineId);
  },

  getSubtotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  getTotal(cart, discountPercent = 0) {
    const subtotal = this.getSubtotal(cart);
    return subtotal - subtotal * (discountPercent / 100);
  },

  getItemCount(cart) {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  },
};
