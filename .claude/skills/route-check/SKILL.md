---
name: route-check
description: Audita todas as rotas do Next.js App Router em busca de 404 pós-refresh, rotas dinâmicas quebradas e problemas de proteção/redirect. Use quando o usuário pedir "/route-check" ou reportar 404 em produção.
---

# /route-check

Audita o roteamento do app web (`apps/web/app`, Next.js App Router file-based) — e do mobile (`apps/mobile/src/app`, expo-router) se solicitado.

## Contexto importante

Este projeto **não usa React Router nem Vite**. É Next.js App Router com SSR/RSC na Vercel — a classe clássica de bug "SPA fallback ausente causa 404 no refresh" normalmente não se aplica aqui. Os riscos reais são outros: rotas dinâmicas mal implementadas, `vercel.json` indevido na raiz, middleware quebrando o Edge Runtime, redirects apontando para rotas inexistentes. Não gaste esforço configurando `_redirects`/`404.html` de SPA — isso seria uma premissa errada para este stack.

## Passos

1. Invoque o subagent **route-auditor** (`.claude/agents/route-auditor.md`).

2. Peça que ele:
   - Mapeie todas as rotas reais em `apps/web/app/` (pastas com `page.tsx`) e compare com a tabela do CLAUDE.md seção 5.
   - Verifique rotas dinâmicas (`[id]`) quanto ao uso correto de `params` como `Promise` (Next 16).
   - Confirme ausência de `vercel.json` na raiz do repo.
   - Verifique se há `middleware.ts` e, se houver, se usa APIs incompatíveis com Edge Runtime (já causou incidente neste projeto).
   - Verifique redirects/rewrites em `next.config.ts` apontando para destinos válidos.

3. Gere a tabela pedida:

```
ROTA | TIPO | PROTEGIDA | TESTADA | RISCO
/ | pública | não | PASS | baixo
/produtos | pública | não | PASS | baixo
/produto/[id] | dinâmica | não | PASS/FAIL | médio/alto
/checkout | pública (client-guard) | sim | PASS | médio
...
```

4. Resumo final:

```
ROUTE CHECK
-----------
Rotas mapeadas:
Rotas divergentes do CLAUDE.md:
vercel.json na raiz: PRESENTE (FAIL) / AUSENTE (OK)
Middleware: presente/ausente + risco

STATUS: PASS | WARNING | FAIL
```

5. Não modifique arquivos de rota nesta skill isoladamente — se houver correção óbvia e segura (ex.: `await params` faltando), reporte a linha exata e pergunte antes de editar, a menos que esteja rodando dentro de `/pre-deploy`, onde correções seguras podem ser aplicadas automaticamente e testadas de novo.
