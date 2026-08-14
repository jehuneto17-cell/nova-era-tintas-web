---
name: pre-deploy
description: Auditoria completa de pré-publicação — orquestra git/build/route/deployment auditors, aplica correções seguras, roda o GAUNTLET DEPLOYMENT GATE com pontuação, e gera o relatório final READY TO SHIP ou BLOCKED. Use quando o usuário pedir "/pre-deploy" ou "posso publicar?".
---

# /pre-deploy

Orquestra a auditoria completa de pré-deploy do Nova Era Tintas: identifica a stack, roda os 4 subagents auditores, corrige o que for seguro corrigir, testa de novo, e produz o relatório final com nota GAUNTLET.

## Fluxo

### 1. Identificação de stack (não assuma nada)

- Framework web: leia `apps/web/package.json` → confirme Next.js (versão real instalada), React, Tailwind.
- Sistema de build: confirme o script real de `build` (hoje `next build --webpack`).
- Gerenciador de pacotes: pelo lockfile presente (`package-lock.json` → npm).
- Plataforma de deploy: confirme Vercel (ausência de `netlify.toml`, presença implícita via CLAUDE.md seção 9 — mas verifique, não assuma).
- Sistema de rotas: Next.js App Router file-based (não React Router, não Vite).
- Se qualquer uma dessas premissas divergir do que está documentado no CLAUDE.md, avise o usuário explicitamente antes de prosseguir — pode ser uma mudança de stack não documentada.

### 2. Executar os 4 auditores

Rode, preferencialmente em paralelo (são independentes e somente-leitura):

1. **git-auditor** → GIT HEALTH
2. **build-auditor** → BUILD CHECK
3. **route-auditor** → ROUTE CHECK
4. **deployment-auditor** → DEPLOYMENT AUDIT

Cada um retorna seu bloco de status (PASS/WARNING/FAIL) conforme definido no respectivo arquivo em `.claude/agents/`.

### 3. Consolidar resultados

Junte os 4 relatórios. Liste todos os "Problemas" reportados por qualquer auditor em uma lista única.

### 4. Corrigir automaticamente o que for seguro

Um problema é elegível para correção automática SOMENTE SE:
- A causa raiz é mecânica e inequívoca (ex.: import com case errado batendo com um arquivo real existente; `params` tratado como síncrono em vez de `Promise` numa rota dinâmica Next 16; env var referenciada mas ausente do `.env.local` quando o valor correto é óbvio a partir de outro lugar do projeto).
- A correção não é destrutiva (não apaga dados, não faz `git reset`/`clean`, não remove arquivos do usuário).
- É possível testar de novo depois (rodar build/lint) para confirmar que resolveu.

**NÃO corrija automaticamente:**
- Nada relacionado a secrets encontrados no Git (isso é uma decisão do usuário — pode envolver reescrever histórico).
- Mudanças em `next.config.ts`, `middleware.ts`, ou config de deploy — dado o histórico de incidentes deste projeto, qualquer mudança aqui exige confirmação explícita antes de aplicar, mesmo que pareça segura.
- Lógica de negócio ou decisões de UX.
- Qualquer coisa que exija apagar/mover arquivos do usuário.

Para cada correção segura aplicada: registre o arquivo, o que mudou e por quê.

### 5. Testar novamente

Depois de aplicar correções, rode de novo os auditores relevantes (tipicamente build-auditor e route-auditor) para confirmar que o problema foi resolvido e que nada quebrou.

### 6. GAUNTLET DEPLOYMENT GATE — pontuação

Calcule a nota:

| Categoria | Peso |
|---|---|
| Build | 20 |
| Git | 15 |
| Routes | 20 |
| Deploy | 20 |
| Security | 15 |
| Tests | 10 |

Regras de pontuação por categoria:
- PASS do auditor correspondente → pontuação cheia da categoria.
- WARNING → metade da pontuação da categoria.
- FAIL → zero na categoria.
- **Security** deriva do bloco "Secrets encontrados" do git-auditor e do bloco de risco Edge Runtime do deployment-auditor: qualquer secret encontrado ou risco crítico de Edge Runtime → 0 em Security, independente do resto.
- **Tests**: não existe suíte de testes automatizados neste projeto hoje (sem script `test`) — pontue Tests como 10/10 se lint+typecheck passarem (única verificação de correção estática disponível), documentando que não há testes automatizados reais. Não invente testes que não existem.

Some para o total (0-100) e classifique:
- 90-100 = EXCELLENT
- 80-89 = GOOD
- 70-79 = WARNING
- 0-69 = FAIL

**Regra de override**: mesmo com nota ≥ 90, se houver:
- secret exposto,
- build FAIL,
- ou deploy FAIL crítico (ex.: gitlink indevido, `vercel.json` conflitante na raiz),

então **STATUS FINAL = FAIL**, sobrepondo a nota numérica.

### 7. Loop de correção limitado a 3 ciclos

Se depois da primeira rodada de correções ainda houver FAIL:
- Repita o ciclo correção → novo teste → nova avaliação, no máximo **3 vezes no total**.
- Se após 3 ciclos ainda houver FAIL não resolvido, **pare** e apresente:
  - problema
  - causa provável
  - arquivos envolvidos
  - tentativas realizadas
  - erro atual (texto completo relevante)
  - recomendação para o usuário decidir manualmente

### 8. Relatório final

Sempre termine com este formato exato:

```
=================================
PRE-DEPLOY REPORT
=================================

Projeto: Nova Era Tintas (apps/web)
Framework: Next.js <versão>
Build: next build --webpack
Deploy: Vercel (Root Directory = apps/web)

GIT
PASS/FAIL

BUILD
PASS/FAIL

ROUTES
PASS/FAIL

DEPLOY
PASS/FAIL

SECURITY
PASS/FAIL

GAUNTLET
SCORE: XX/100 (CLASSIFICAÇÃO)

Problemas encontrados:
1. ...
2. ...

Correções realizadas:
1. ...
2. ...

Arquivos modificados:
1. ...
2. ...

STATUS FINAL:
READY TO SHIP
ou
BLOCKED
```

Se **BLOCKED**, deixe explícito que nenhum `git push` deve ser executado, e explique o que falta resolver.

Nunca execute `git commit` ou `git push` dentro desta skill — isso é responsabilidade exclusiva da skill `/ship`.
