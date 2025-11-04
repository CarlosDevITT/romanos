// js/filters.js - VERSÃO SIMPLIFICADA
import { UnifiedFilterSystem } from './shared/filter-system.js';

class FrontendFilterSystem extends UnifiedFilterSystem {
    constructor() {
        super({
            containerId: 'products-container',
            countId: 'products-count',
            sortId: 'sort-select',
            isAdmin: false
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.filterSystem = new FrontendFilterSystem();
});