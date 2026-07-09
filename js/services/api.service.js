import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { supabaseConfig } from '../../config/supabase.config.js';
import { logger } from '../utils/logger.js';

let client = null;
let clientChecked = false;

function isConfigValid() {
  return (
    typeof supabaseConfig.url === 'string' &&
    supabaseConfig.url.startsWith('http') &&
    !supabaseConfig.url.includes('SEU_PROJETO') &&
    supabaseConfig.anonKey &&
    supabaseConfig.anonKey !== 'SUA_ANON_KEY'
  );
}

function getClient() {
  if (clientChecked) return client;
  clientChecked = true;

  if (!isConfigValid()) {
    logger.warn('Supabase não configurado (config/supabase.config.js). Usando dados locais.');
    return null;
  }

  try {
    client = createClient(supabaseConfig.url, supabaseConfig.anonKey);
  } catch (err) {
    logger.error('Falha ao criar client do Supabase', err);
    client = null;
  }
  return client;
}

export const apiService = {
  getClient,

  /**
   * Busca registros de uma tabela do Supabase.
   * options: { columns, eq: {coluna: valor}, order: {column, ascending} }
   */
  async select(table, options = {}) {
    const supabase = getClient();
    if (!supabase) {
      return { data: null, error: new Error('Supabase não configurado') };
    }

    try {
      let query = supabase.from(table).select(options.columns || '*');

      if (options.eq) {
        Object.entries(options.eq).forEach(([col, val]) => {
          query = query.eq(col, val);
        });
      }

      if (options.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? true,
        });
      }

      const { data, error } = await query;
      if (error) logger.error(`Erro ao buscar "${table}" no Supabase`, error);
      return { data, error };
    } catch (err) {
      logger.error(`Falha na consulta "${table}"`, err);
      return { data: null, error: err };
    }
  },
};
