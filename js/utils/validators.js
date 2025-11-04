// Validadores

function validateProductData(product) {
    const errors = [];
    
    if (!product.name || product.name.trim().length < 2) {
        errors.push('Nome do produto deve ter pelo menos 2 caracteres');
    }
    
    if (!product.price || product.price <= 0) {
        errors.push('Preço deve ser maior que zero');
    }
    
    if (!product.category) {
        errors.push('Categoria é obrigatória');
    }
    
    if (product.stock < 0) {
        errors.push('Estoque não pode ser negativo');
    }
    
    return errors;
}

function validateCartItem(item, availableStock) {
    if (item.quantity > availableStock) {
        return `Estoque insuficiente. Disponível: ${availableStock}`;
    }
    return null;
}

window.validators = {
    validateProductData,
    validateCartItem
};