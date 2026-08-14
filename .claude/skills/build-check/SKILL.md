---
name: build-check
description: Roda install/lint/typecheck/build reais do projeto (detectando o gerenciador de pacotes e os scripts que existem de fato) e reporta PASS/WARNING/FAIL. Use quando o usuário pedir "/build-check", "a build passa?", ou depois de mudar dependências/imports.
---

# /build-check

Valida que `apps/web` (e, se solicitado, `apps/mobile`) realmente builda em produção — como se rodasse em Linux, não apenas no Windows local.

## Passos

1. Detecte o app alvo. Padrão: `apps/web`. Se o usuário mencionar mobile explicitamente, inclua `apps/mobile` também — mas lembre-se que Expo não tem um "build de produção" análogo ao `next build`; para mobile, valide com `npx expo-doctor` e/ou `npx tsc --noEmit` em vez de tentar simular um build nativo completo.

2. Invoque o subagent **build-auditor** (`.claude/agents/build-auditor.md`) para executar:
   - Detecção do gerenciador de pacotes pelo lockfile presente (não assuma npm).
   - `install` limpo se necessário.
   - `lint` **somente se o script existir** em `package.json`.
   - `npx tsc --noEmit` para typecheck.
   - `build` usando o script real (`npm run build`, que hoje executa `next build --webpack` em `apps/web` — não troque para Turbopack sem justificativa, dado o histórico de bug de Edge Runtime).
   - Varredura de case-sensitivity de imports (Windows vs Linux).
   - Varredura de imports/módulos inexistentes.
   - Varredura de `process.env.*` usadas no código sem estar documentadas/configuradas.

3. **Nunca invente scripts.** Se `package.json` não tem `test`, não rode `npm test`. Se não tem `lint`, marque como SKIPPED, não FAIL.

4. Apresente o relatório no formato retornado pelo build-auditor:

```
BUILD CHECK
-----------
App:
Gerenciador:
Install: PASS/FAIL
Lint: PASS/FAIL/SKIPPED
Typecheck: PASS/FAIL
Build: PASS/FAIL

Problemas de case-sensitivity:
Imports quebrados:
Env vars não configuradas:

STATUS: PASS | WARNING | FAIL
```

5. Se **FAIL**, identifique a causa raiz (arquivo + linha) antes de sugerir qualquer correção. Só aplique correção automaticamente se:
   - For um erro óbvio e mecânico (ex.: import com case errado, import de arquivo renomeado).
   - Você conseguir testar novamente depois (rodar o build de novo) para confirmar que resolveu.
   Correções em lógica de negócio, tipos complexos ou configuração de deploy (`next.config.ts`) exigem confirmação do usuário antes de aplicar.

6. Depois de qualquer correção automática, **rode o build de novo** para confirmar. Não declare PASS sem essa segunda execução.
