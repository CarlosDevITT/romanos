# 

PWA de e-commerce implementando o design (home, detalhe do produto, carrinho) na arquitetura modular do projeto.

## Rodar localmente

```bash
npx serve .
```

Abra `http://localhost:3000` (ou a porta indicada).

## Estrutura

* `index.html` — shell do app
* `css/` — `base` (reset), `layout` (grid/shell), `components` (header, bottom-nav, product-card, cart, customer-area), `pages` (store: detalhe do produto)
* `config/` — `theme.css` (tokens), `store.config.js`, `supabase.config.js`
* `js/core` — `app.js` (render loop + `window.dom`), `router.js` (hash router), `config/constants.js`
* `js/features` — `products`, `cart`, `navigation`, `customer` (cada um com `.service`, `.component`, `.controller`, `index.js`)
* `js/services` — `api.service.js`, `storage.service.js`, `notification.service.js`
* `js/shared` — `state/store.js`, `components/{toast,modal,loader}.js`, `filter-system.js`
* `js/utils` — `formatter`, `helpers`, `logger`, `validators`, `errorHandler`

## Rotas (hash)

* `#/home`
* `#/product/:id`
* `#/cart`
* `#/favorites`
* `#/customer`

## Cupons de desconto (mock)

* `DOM10` → 10% off
* `DOM20` → 20% off

## Conexão com Supabase (produtos dinâmicos)

1. Preencha `config/supabase.config.js` com sua URL e anon key reais:

```js
export const supabaseConfig = {
  url: 'https://SEU\_PROJETO.supabase.co',
  anonKey: 'SUA\_ANON\_KEY',
};
```

2. Crie a tabela `products` no Supabase (SQL Editor):

```sql
create table products (
  id uuid primary key default gen\_random\_uuid(),
  name text not null,
  category text not null,        -- shoes | beauty | women | jewelry | men | electronics
  price numeric not null,
  rating numeric default 4.5,
  reviews integer default 0,
  seller text default 'DOM Store',
  emoji text default '🛍️',
  colors jsonb default '\["#14141A"]',  -- array de hex, ex: \["#7B2D2D", "#14141A"]
  description text,
  created\_at timestamptz default now()
);

alter table products enable row level security;

create policy "Produtos são públicos para leitura"
  on products for select
  using (true);
```

3. Insira alguns produtos de teste e recarregue o app — `product.service.js` busca a tabela automaticamente.

**Fallback:** se o Supabase não estiver configurado (ou a tabela estiver vazia/inacessível), o app usa os produtos mock locais em `product.service.js` (`MOCK\_PRODUCTS`), garantindo que a loja nunca fique sem conteúdo.

## Responsividade

Layout mobile-first com breakpoints em `config/theme.css` (`--bp-tablet: 768px`, `--bp-desktop: 1024px`). **Os ajustes só aparecem em janelas/viewports com 768px de largura ou mais** — testando em um preview fixo em 400px (mobile) o layout não muda, pois é o comportamento esperado abaixo do breakpoint.

* `css/components/desktop-nav.css` — navbar fixa (logo, busca, links) a partir de 768px; `bottom-nav` some nesse ponto
* `css/layout/layout.css` — grid de produtos com 3 colunas (768px) e 4 colunas (1024px)
* `css/pages/store.css` — página de produto em 2 colunas (galeria fixa + informações) a partir de 768px
* `css/components/cart.css` — carrinho em 2 colunas (lista + resumo fixo) a partir de 768px

## Persistência

Carrinho e favoritos salvos em `localStorage` (`dom\_cart\_v1`, `dom\_favorites\_v1`).

