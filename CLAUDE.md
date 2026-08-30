# CLAUDE.md — Nova Era Tintas (Web)

> Documento de referência para qualquer agente de IA (Claude, Copilot, Cursor, etc.) que for trabalhar neste projeto. Leia até o fim antes de escrever código.
>
> Veja também [AGENTS.md](AGENTS.md) — arquivo auto-gerado pelo Next.js com avisos sobre a versão 16.

---

## 1. Visão Geral

**Nova Era Tintas** é uma loja virtual de materiais de pintura — tintas, pincéis, rolos e primers.

- **Descrição:** "Tintas, pincéis, rolos e primers para sua obra."
- Este repositório contém **apenas o app web** (Next.js). O app mobile (Expo/React Native) vive em um repositório irmão separado: `Nova Era Tintas - Mobile`.
- **Deploy:** Vercel, apontando **diretamente para a raiz deste repositório** (sem Root Directory customizado — diferente de quando isso era uma subpasta de monorepo).

O diferencial do modelo de negócio: **não há gateway de pagamento automático**. O cliente paga via PIX e **envia o comprovante** pelo app; a loja confere e aprova manualmente. Pedidos também podem entrar em **negociação** (ajuste de itens/frete) via WhatsApp.

---

## 2. Estrutura do Repositório

```
Nova Era Tintas - Web/
├── app/                 # Next.js App Router (rotas)
├── components/
├── lib/                 # serviços Firestore, contexts, tipos
├── public/
├── .claude/             # skills e agents do Claude Code (cópia local)
├── .env.local           # gitignored — chaves Firebase/Cloudinary
├── AGENTS.md            # auto-gerado pelo Next.js, não editar manualmente
└── CLAUDE.md
```

> ⚠️ **Histórico:** este projeto era a pasta `apps/web` dentro de um monorepo (`Nova era tintas app`). Foi separado em `2026-08-14` para ter deploy Vercel independente do mobile. O repositório antigo continua existindo por enquanto, mas este é o repo ativo para o **web**.

---

## 3. Stack Técnica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | `16.3.0` |
| Runtime | React / React DOM | `19.2.8` |
| Linguagem | TypeScript | `^5` |
| Estilo | Tailwind CSS | `^4` (via `@tailwindcss/postcss`) |
| Animação | framer-motion | `^13.0.0` |
| Backend | Firebase (Auth + Firestore) | `^12.17.1` |
| Imagens | Cloudinary (upload de fotos/comprovantes) | — |
| Fontes | Archivo + Manrope (`next/font/google`) | — |

**Comandos:**
```powershell
npm run dev      # Next.js dev server
npm run build    # build de produção
```

---

## 4. Identidade Visual

Os tokens de cor espelham `brand.ts` do app mobile (repositório irmão) via Tailwind/`app/globals.css`.

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#2E9222` | Verde da marca — CTAs, destaques |
| `primaryPressed` | `#24741B` | Estado pressionado |
| `ink` | `#012418` | Texto principal |
| `link` | `#0088B7` | Links |
| `danger` | `#E63946` | Erros, cancelamento |
| `warning` | `#FFB703` | Alertas, pendências |
| `screenBg` | `#F7F8F7` | Fundo de tela |
| `surface` | `#FFFFFF` | Cards |
| `border` | `#E5E5E5` | Bordas |

**Fontes:** `Archivo` (títulos, 500–800) e `Manrope` (corpo, 400–700).

**Moeda:** use `brl(n)` de `lib/store.tsx` → `"R$ " + n.toFixed(2).replace(".", ",")`.

---

## 5. Rotas (`app/`)

| Rota | Função |
|---|---|
| `/` | Home |
| `/produtos`, `/produto/[id]` | Catálogo e detalhe |
| `/categorias` | Categorias |
| `/busca`, `/busca/resultados` | Busca |
| `/carrinho`, `/checkout`, `/pagamento` | Fluxo de compra |
| `/comprovante/enviar` | Cliente envia comprovante do PIX |
| `/comprovante/aguardando` | Aguardando conferência da loja |
| `/comprovante/recusado` | Comprovante recusado |
| `/confirmacao` | Pedido confirmado |
| `/pedidos`, `/pedidos/[id]` | Lista e detalhe de pedidos |
| `/pedidos/negociacao` | Pedido em negociação |
| `/pedidos/atualizado` | Pedido alterado pela loja |
| `/login`, `/cadastro` | Autenticação |
| `/perfil`, `/perfil/editar` | Perfil do cliente |
| `/avaliar` | Avaliação de compra |

O mobile (repositório irmão, `src/app`) espelha essas telas com nomes equivalentes em expo-router.

---

## 6. Modelo de Dados (`lib/types.ts`)

Fonte de verdade dos tipos. **Consulte antes de ler/gravar no Firestore.** Campos em **português**. Este mesmo `types.ts` é mantido em cópia idêntica no repositório mobile — qualquer mudança de campo deve ser replicada nos dois.

### `Produto`
Tem **variações por cor + volume** — essencial para tintas:
```ts
cores: { nome, hex }[]
volumes: string[]                        // ex: "3,6L", "18L"
variacoes: Record<string, ProdutoVariacao>   // { cor, volume, preco, estoque, ativo }
specs: { nome, valor }[]
fotos: { id, url }[]
descontoPct, limiteEstoqueBaixo, ativo
```
> O preço e o estoque vivem **na variação**, não no produto.

### `Pedido`
```ts
estado: "em_negociacao" | "aguardando_pagamento" | "aguardando_confirmacao"
      | "pago" | "separacao" | "enviado" | "entregue" | "cancelado" | "expirado"
itens: { produtoId, nome, variacao, qtd, preco }[]
historico: { estado, quando, quem, observacao? }[]
comprovanteUrl?, comprovanteEnviadoEm?, valorComprovante?
```
O `historico` é append-only: registre cada transição de estado.

### Outros
`Categoria`, `Cliente` (com `enderecos[]` e `historicoEnderecos`), `Cupom` (`tipo: "%" | "R$"`), e configs da loja: `BrandingConfig`, `PagamentoConfig` (chave PIX, prazo, motivos de recusa), `WhatsappConfig`, `FreteConfig`, `BuscasConfig`, `LojaConfig`.

**Serviços Firestore:** `lib/` — `produtos.ts`, `categorias.ts`, `pedidos.ts`, `clientes.ts`, `cupons.ts`, `configuracoes.ts`, `cloudinary.ts` (upload de imagens/comprovantes), `mappers.ts`.

---

## 7. Estado Global

`StoreProvider` / `useStore()` em `lib/store.tsx`; `AuthProvider` / `useAuth()` em `lib/auth.tsx`. Montados em `app/layout.tsx`.

Nunca duplique em estado local o que já está nesses contextos.

### Login social (Google + Apple)

`useAuth()` expõe `loginComGoogle()` e `loginComApple()`, além de `login`/`cadastrar`/`logout`. Ambos usam `signInWithPopup` do Firebase (`GoogleAuthProvider` / `OAuthProvider("apple.com")`) e, no primeiro acesso, criam o doc em `clientes` automaticamente (via `garantirCliente` em `lib/auth.tsx`, usando `getCliente` de `lib/clientes.ts`) — sem passar por `/cadastro`.

Os botões ficam em `components/AuthShell.tsx`: `SocialAuthButtons` (Google + Apple lado a lado) e `AuthDivider` ("ou continue com"), usados em `/login` e `/cadastro` acima do formulário de email/senha, espelhando o padrão visual do app mobile.

> ⚠️ **Apple Sign-In exige configuração extra no Firebase Console** (Authentication → Sign-in method → Apple) e conta Apple Developer com "Sign in with Apple" habilitado. Sem isso, o botão Apple mostra erro ao clicar. Google normalmente já vem habilitado por padrão no Firebase.

---

## 8. Variáveis de Ambiente

O app **não funciona sem elas**. Ficam em `.env.local` (gitignored) e precisam estar cadastradas no Vercel (Production + Preview + Development). São **as mesmas chaves usadas pelo app mobile** — mesmo projeto Firebase e mesma conta Cloudinary, para que os dois apps leiam/gravem os mesmos dados:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
```

`NEXT_PUBLIC_MOBILE_APP_URL` é **opcional**: se definida, o `middleware.ts` redireciona visitantes mobile para o app. Deixe vazia para manter todo mundo no site.

---

## 9. Deploy (Vercel)

Este repositório é dedicado ao web, então o projeto Vercel aponta para a **raiz do repositório** (sem Root Directory customizado). Framework, build e output são auto-detectados pelo Vercel.

> Antes (no monorepo antigo), era necessário configurar Root Directory = `apps/web`. Isso não é mais necessário aqui, pois este repo já contém só o web.

---

## 10. Regras para Agentes de IA

> **LEIA ANTES DE ESCREVER QUALQUER CÓDIGO.**

### 🚨 Regra #1 — Next.js 16 mudou muito
Não confie em memória de versões anteriores. Leia `node_modules/next/dist/docs/` (ver [AGENTS.md](AGENTS.md)).

### 📋 Regra #2 — Não invente campos no Firestore
Os tipos em `lib/types.ts` são a fonte de verdade, e os campos são **em português**. Confirme antes de ler ou gravar. **Esses tipos são compartilhados com o app mobile** (repositório irmão) — mudança de schema precisa ser replicada lá também.

### 🎨 Regra #3 — Use os tokens da marca
Cores via Tailwind (espelhando `brand.ts` do mobile), fontes Archivo + Manrope, moeda via `brl()`. Não hardcode hex nem `"R$ "`.

### 💳 Regra #4 — Pagamento é manual, por comprovante
Não existe gateway automático. O fluxo é: PIX → cliente envia comprovante → loja confere → aprova ou recusa. Respeite os estados de `PedidoEstado` e registre cada transição no `historico`.

### 🔑 Regra #5 — Contextos são a fonte de verdade
`useStore()` e `useAuth()`.

### 🌐 Regra #6 — Web e mobile são repositórios separados
Desde `2026-08-14`, web e mobile são dois repositórios Git independentes (`Nova Era Tintas - Web` e `Nova Era Tintas - Mobile`), cada um com seu próprio deploy. Uma mudança de produto normalmente precisa ser feita **nos dois repositórios**. Código Next.js não roda no Expo e vice-versa. Ambos compartilham o mesmo backend Firebase/Cloudinary.

### 🪟 Regra #7 — Ambiente Windows
Comandos shell devem funcionar em PowerShell.

### 🔒 Regra #8 — Nunca commite segredos
`.env*` já está no `.gitignore`. As chaves `NEXT_PUBLIC_*` do Firebase são públicas por natureza (client-side) — isso é normal.

### 🇧🇷 Regra #9 — Idioma
UI em **português brasileiro**. Nomes de campo de dados também em português (siga `types.ts`).

### 🔄 Regra #10 — Atualize este arquivo ao fim de cada sessão
Documente o que mudou: novas telas, novos campos, novas configs de deploy. Um CLAUDE.md desatualizado é pior que nenhum — induz o próximo agente a premissas erradas.
