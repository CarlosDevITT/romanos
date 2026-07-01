# 🧵 Fio a Fio Store - MVP PWA & PDV

Este é o MVP da **Fio a Fio Store**, uma solução completa de e-commerce e gestão de balcão para lojas de roupas/varejo. O projeto foi arquitetado em dois sistemas totalmente independentes que compartilham o mesmo banco de dados, garantindo performance no cliente e segurança na administração.

---

## 🛠️ Stack Tecnológica

* **Front-end (Cliente e Admin):** HTML5, CSS3, JavaScript Nativo (ES Modules).
* **Funcionalidades PWA:** Service Workers (Cache Offline) e Web App Manifest.
* **UI/UX Popups:** SweetAlert2.
* **Back-end & Banco de Dados:** Supabase (Autenticação, Banco PostgreSQL e Realtime para Chat e Pedidos).
* **APIs Externas:** ViaCEP (Preenchimento automático de endereço).

---

## 📂 Arquitetura do Projeto

O projeto é dividido em duas pastas principais independentes:

### 1. 📱 Sistema Cliente / Catálogo (`fio-a-fio-client-pwa`)
Aplicativo PWA focado na experiência do usuário final, funcionando como uma Single Page Application (SPA) baseada em abas:
* **Início:** Catálogo completo de produtos com filtros e buscas.
* **Carrinho:** Sacola de compras com cálculo de frete/CEP (ViaCEP) e opção de Delivery ou Retirada. *Bloqueia finalização sem cadastro prévio.*
* **Chat:** Atendimento em tempo real integrado ao Supabase, com suporte a respostas automáticas baseadas em palavras-chave.
* **Perfil:** Alteração de dados cadastrais (nome, telefone, endereço) e histórico de pedidos do cliente.

### 2. 🖥️ Painel Administrativo & Frente de Caixa (`fio-a-fio-admin`)
Painel exclusivo para a gestão do negócio e vendas locais:
* **PDV (Frente de Caixa):** Venda rápida para clientes de balcão (física), seleção de itens com baixa automática e instantânea no estoque.
* **Dashboard:** Painel visual com métricas de faturamento diário (Online vs. Balcão) e novos pedidos recebidos.
* **Pedidos de Vendas:** Gerenciamento do status dos pedidos vindos do PWA (Pendente ➔ Em Preparação ➔ Saiu para Entrega ➔ Concluído).
* **Produtos:** CRUD completo para cadastro de produtos, preços, fotos e controle rígido de estoque.
* **Base de Conhecimento:** Cadastro de perguntas e respostas frequentes para alimentar o bot do Chat do cliente.
* **Configurações:** Dados da loja física, horários de funcionamento e regras de entrega.

---

## 🗄️ Estrutura de Banco de Dados (Supabase)

Para rodar este projeto, o banco de dados está estruturado com as seguintes tabelas:

* `perfis`: Dados de contato e endereço dos clientes.
* `produtos`: Informações sobre o catálogo e saldo de estoque.
* `pedidos`: Registro de vendas (Origem: `online` ou `balcao`), status e forma de pagamento.
* `itens_pedido`: Vínculo dos produtos comprados em cada pedido.
* `base_conhecimento`: Banco de dados de perguntas e respostas automáticas para o chat.
* `mensagens_chat`: Histórico de conversas do suporte em tempo real.

## 📂 Estrutura de Pastas do Repositório

```text
fio-a-fio-store/
│
├── fio-a-fio-client-pwa/            # 📱 SISTEMA 1: Cliente & Catálogo (PWA)
│   ├── css/
│   │   └── style.css                # Estilização da interface (catálogo, carrinho, chat)
│   ├── js/
│   │   ├── supabase.js              # Inicialização do Supabase (Chaves públicas)
│   │   ├── app.js                   # Gerenciador principal (navegação entre abas via SPA)
│   │   └── modules/
│   │       ├── inicio.js            # Lista produtos, filtros por categoria e busca
│   │       ├── carrinho.js          # Controle da sacola, API ViaCEP e checkout
│   │       ├── chat.js              # Realtime do Supabase + respostas automáticas
│   │       └── perfil.js            # Cadastro do cliente e histórico de pedidos
│   ├── icons/                       # Ícones do app para resoluções PWA
│   ├── index.html                   # Página única do app (SPA por abas)
│   ├── manifest.json                # Configurações de instalação do PWA
│   └── sw.js                        # Service Worker (Estratégia de cache offline)
│
├── fio-a-fio-admin/                 # 🖥️ SISTEMA 2: Painel Administrativo & PDV
│   ├── css/
│   │   └── admin.css                # Estilos do painel, tabelas e PDV em 2 colunas
│   ├── js/
│   │   ├── supabase.js              # Inicialização do Supabase
│   │   ├── main.js                  # Controlador de telas e sessão de login
│   │   └── modules/
│   │       ├── pdv.js               # Frente de Caixa (Venda rápida balcão)
│   │       ├── dashboard.js         # Métricas de faturamento (Online vs. Balcão)
│   │       ├── pedidos.js           # Gestão de status de pedidos recebidos online
│   │       ├── produtos.js          # CRUD de produtos e controle de estoque
│   │       ├── conhecimento.js      # FAQ do chat automatizado
│   │       └── configuracoes.js     # Dados da loja e regras de negócio/frete
│   ├── login.html                   # Tela de autenticação dos funcionários
│   └── index.html                   # Menu e visualização principal do painel
│
└── README.md                        # Documentação do projeto
