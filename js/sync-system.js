// ===============================================
// ⚙️ Romanos Store - Sync System (Anti-Quebra)
// ===============================================

const SUPABASE_URL = "https://zgrevlntkgmonqxyhjww.supabase.co";
let SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmV2bG50a2dtb25xeHloand3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjMxNjksImV4cCI6MjA3NjY5OTE2OX0.9svTC7fzUWgZXOraUcNOifl5XggZfvwwzEWHanN2aP0"; // substitua pela nova chave

let supabase = null;

// ===============================
// 🔌 Inicialização com fallback
// ===============================
async function initSupabase() {
  try {
    if (!window.supabase) throw new Error("SDK do Supabase não carregado!");
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✅ Supabase inicializado.");
    const isValid = await validateSupabaseKey();
    if (isValid) {
      console.log("🔐 Chave válida e conexão estabelecida!");
    } else {
      throw new Error("Invalid API key (detected automaticamente)");
    }
  } catch (error) {
    console.error("❌ Falha ao inicializar Supabase:", error.message);
    showConnectionError("Chave API inválida ou expirada.");
    await tryRecoverSupabaseKey();
  }
}

// ===============================
// 🧪 Teste de validade da chave
// ===============================
async function validateSupabaseKey() {
  try {
    const { data, error, status } = await supabase.from("products").select("*").limit(1);
    if (error || status === 401) return false;
    return true;
  } catch {
    return false;
  }
}

// ===============================
// 🧠 Tentativa automática de recuperação
// ===============================
async function tryRecoverSupabaseKey() {
  console.warn("⚠️ Tentando recuperar chave automaticamente...");

  // Tenta buscar de um arquivo de backup local
  try {
    const res = await fetch("/js/config/supabase-backup.json");
    if (res.ok) {
      const config = await res.json();
      SUPABASE_KEY = config.ANON_KEY;
      console.log("🔁 Chave substituída por backup local.");
      await initSupabase();
      return;
    } else {
      console.warn("⚠️ Nenhum backup encontrado. É necessário inserir a nova chave manualmente.");
      showManualKeyInput();
    }
  } catch (err) {
    console.error("🚫 Falha ao recuperar chave automaticamente:", err.message);
    showManualKeyInput();
  }
}

// ===============================
// 🧭 Sistema de sincronização
// ===============================
class SyncSystem {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    try {
      await initSupabase();
      console.log("🏪 Sistema de sincronização da Romanos Store ativo!");
      this.isInitialized = true;
      await this.syncProducts();
    } catch (err) {
      console.error("❌ Erro ao inicializar sistema de sincronização:", err.message);
      showConnectionError("Falha ao inicializar sincronização.");
    }
  }

  async syncProducts() {
    if (!this.isInitialized) {
      console.warn("⚠️ Sistema ainda não inicializado.");
      return;
    }
    try {
      console.log("🔄 Sincronizando produtos...");
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      console.log(`✅ ${data.length} produtos sincronizados.`);
      // renderProducts(data); // conectar com frontend
    } catch (err) {
      console.error("❌ Erro ao sincronizar produtos:", err.message);
    }
  }
}

// ===============================
// 🎯 Funções visuais e UX
// ===============================
function showConnectionError(msg) {
  Swal.fire({
    icon: "error",
    title: "Erro de Conexão",
    text: msg,
    confirmButtonText: "Entendi",
  });
}

function showManualKeyInput() {
  Swal.fire({
    title: "Chave API Inválida",
    input: "text",
    inputLabel: "Cole aqui a nova ANON KEY do Supabase",
    inputPlaceholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    showCancelButton: false,
    confirmButtonText: "Salvar e reconectar",
    preConfirm: (key) => {
      if (!key.startsWith("eyJ")) {
        Swal.showValidationMessage("⚠️ Chave inválida! Copie direto do painel Supabase (anon key).");
        return false;
      }
      SUPABASE_KEY = key;
      saveBackupKey(key);
      initSupabase();
    },
  });
}

function saveBackupKey(key) {
  // Armazena temporariamente no localStorage para recuperar depois
  localStorage.setItem("supabase_anon_key", key);
  console.log("💾 Nova chave salva localmente.");
}

// ===============================
// 🧭 Execução automática
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🛍️ Romanos Store inicializada com sucesso!");
  const backupKey = localStorage.getItem("supabase_anon_key");
  if (backupKey) {
    SUPABASE_KEY = backupKey;
    console.log("🔁 Recuperando chave local salva anteriormente.");
  }

  const syncSystem = new SyncSystem();
  await syncSystem.init();

  // Atualiza produtos periodicamente
  setInterval(() => syncSystem.syncProducts(), 60000);
});
