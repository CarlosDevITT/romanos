export function renderCustomerView(customer) {
  const menuItem = (icon, label) => `
    <button class="customer-menu__item">
      <span>${icon}</span><span>${label}</span>
    </button>
  `;

  return `
    <div class="dom-header">
      <span class="dom-header__title" style="font-size:var(--fs-md)">Account</span>
      <span style="width:40px"></span>
    </div>
    <div class="customer-header">
      <div class="customer-avatar">👤</div>
      <h2 style="font-family:var(--font-display); font-size:var(--fs-md);">${customer.name}</h2>
    </div>
    <div class="customer-menu">
      ${menuItem('📦', 'My Orders')}
      ${menuItem('📍', 'Addresses')}
      ${menuItem('💳', 'Payment Methods')}
      ${menuItem('⚙️', 'Settings')}
    </div>
  `;
}
