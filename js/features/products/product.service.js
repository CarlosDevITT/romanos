import { apiService } from '../../services/api.service.js';
import { logger } from '../../utils/logger.js';

// Fallback local — usado se o Supabase não estiver configurado ou a tabela estiver vazia.
const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Wireless Headphones',
    category: 'electronics',
    price: 120.0,
    rating: 4.8,
    reviews: 320,
    seller: 'Tariqul Isalm',
    emoji: '🎧',
    colors: ['#7B2D2D', '#14141A', '#2E4B8F', '#8A5A2E', '#D9D9D9'],
    description:
      'Fones de ouvido sem fio com cancelamento de ruído, estojo de carregamento compacto e até 24h de bateria total. Ideais para o dia a dia e treinos.',
  },
  {
    id: 'p2',
    name: 'Woman Sweter',
    category: 'women',
    price: 70.0,
    rating: 4.6,
    reviews: 154,
    seller: 'DOM Store',
    emoji: '👚',
    colors: ['#E194A8', '#8A5A2E', '#6B4423', '#2E4B8F'],
    description:
      'Suéter feminino em malha macia, caimento leve e confortável. Combina com looks casuais ou para o trabalho.',
  },
  {
    id: 'p3',
    name: 'Smart Watch',
    category: 'electronics',
    price: 55.0,
    rating: 4.5,
    reviews: 98,
    seller: 'DOM Store',
    emoji: '⌚',
    colors: ['#14141A', '#4A4A55'],
    description:
      'Smartwatch com monitor de frequência cardíaca, notificações do celular e bateria de longa duração.',
  },
  {
    id: 'p4',
    name: 'Running Shoes',
    category: 'shoes',
    price: 145.0,
    rating: 4.7,
    reviews: 210,
    seller: 'DOM Store',
    emoji: '👟',
    colors: ['#D9A441', '#14141A', '#D9D9D9'],
    description: 'Tênis leve para corrida, com amortecimento responsivo e cabedal respirável.',
  },
];

let cache = null;

function normalizeColors(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // string separada por vírgula: "#111,#222"
      return raw.split(',').map((c) => c.trim()).filter(Boolean);
    }
  }
  return ['#14141A'];
}

function normalize(row) {
  return {
    id: String(row.id),
    name: row.name,
    category: row.category,
    price: Number(row.price),
    rating: Number(row.rating ?? 4.5),
    reviews: Number(row.reviews ?? 0),
    seller: row.seller || 'DOM Store',
    emoji: row.emoji || '🛍️',
    colors: normalizeColors(row.colors),
    description: row.description || '',
  };
}

export const productService = {
  /**
   * Busca os produtos no Supabase (tabela "products").
   * Se falhar ou vier vazio, usa MOCK_PRODUCTS para o app nunca ficar sem conteúdo.
   */
  async fetchAll() {
    const { data, error } = await apiService.select('products', {
      order: { column: 'created_at', ascending: false },
    });

    if (error || !data || data.length === 0) {
      if (error) logger.warn('Usando produtos locais (fallback): ' + error.message);
      cache = MOCK_PRODUCTS;
      return cache;
    }

    cache = data.map(normalize);
    return cache;
  },

  getAll() {
    return cache || MOCK_PRODUCTS;
  },

  getById(id) {
    return (cache || MOCK_PRODUCTS).find((p) => p.id === id) || null;
  },

  getFeatured() {
    return (cache || MOCK_PRODUCTS).slice(0, 4);
  },
};
