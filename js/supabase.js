// js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://zgrevlntkgmonqxyhjww.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmV2bG50a2dtb25xeHloand3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjMxNjksImV4cCI6MjA3NjY5OTE2OX0.9svTC7fzUWgZXOraUcNOifl5XggZfvwwzEWHanN2aP0';

// Cria e exporta o cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportações nomeadas
export { supabase };


// Exportar auth diretamente para facilitar o acesso
export const auth = supabase.auth;


// Funções para produtos
export const productsAPI = {
  // Buscar todos os produtos
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
    
    return data || [];
  },

  // Buscar produtos por categoria
  async getProductsByCategory(category) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      throw error;
    }
    
    return data || [];
  },

  // Buscar categorias disponíveis
  async getCategories() {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
    
    // Remover duplicatas e valores nulos
    const uniqueCategories = [...new Set(data
      .map(item => item.category)
      .filter(category => category && category.trim() !== '')
    )];
    return uniqueCategories;
  },

  // Buscar produto por ID
  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
    
    return data;
  }
};

// Funções para autenticação
export const authAPI = {
  // Obter usuário atual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
    return user;
  },

  // Fazer login
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
    return data;
  },

  // Fazer logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }
};

// Exportação padrão para compatibilidade
export default supabase;

