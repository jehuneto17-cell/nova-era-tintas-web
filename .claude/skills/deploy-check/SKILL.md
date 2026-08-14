---
name: deploy-check
description: Identifica a plataforma de deploy e audita a configuração relacionada (Vercel, env vars, next.config, assets, domínio). Use quando o usuário pedir "/deploy-check" ou "por que quebrou só em produção?".
---

# /deploy-check

Audita tudo que só se manifesta depois do deploy — a categoria de bug mais cara do projeto.

## Passos

1. **Detectar a plataforma de deploy** antes de assumir qualquer coisa:
   - Procure `vercel.json`, pasta `.vercel/`, `netlify.toml`, `.github/workflows/*.yml`, `firebase.json`, `.htaccess`/config de Hostinger.
   - Neste projeto, o CLAUDE.md (seção 9) já documenta: **Vercel, Root Directory = `apps/web`, sem `vercel.json` na raiz**. Confirme que esse é ainda o estado real antes de prosseguir — não assuma cegamente, verifique.

2. Invoque o subagent **deployment-auditor** (`.claude/agents/deployment-auditor.md`) para auditar:
   - Ausência de gitlinks indevidos em `apps/web`/`apps/mobile`.
   - Ausência de `vercel.json` na raiz.
   - Conteúdo de `apps/web/next.config.ts` (qualquer opção não-trivial exige justificativa, dado o histórico de incidentes: `outputFileTracingRoot`, middleware Edge, Turbopack vs webpack).
   - Env vars `NEXT_PUBLIC_*` usadas no código vs. documentadas no CLAUDE.md seção 8.
   - Caminhos absolutos do Windows hardcoded no código-fonte.
   - Case-sensitivity de assets em `apps/web/public/`.
   - Uso de `export const runtime = "edge"` com APIs incompatíveis.

3. Gere o checklist manual (itens que não são verificáveis por código — o agente não tem acesso ao painel Vercel nem ao Firebase Console):
   - [ ] Env vars configuradas no painel Vercel para Production + Preview + Development
   - [ ] Domínio de produção autorizado em Firebase Console → Authentication → Settings → Authorized domains
   - [ ] Upload preset do Cloudinary configurado como "unsigned" se for usado client-side

4. Formato de saída:

```
DEPLOY CHECK
-----------
Plataforma detectada: Vercel
Root Directory esperado: apps/web
Gitlinks indevidos: SIM (FAIL) / NÃO (OK)
vercel.json na raiz: PRESENTE (FAIL) / AUSENTE (OK)
next.config.ts: <resumo + risco>
Env vars não documentadas: <lista ou nenhuma>
Checklist manual: <itens>

STATUS: PASS | WARNING | FAIL
```

5. Esta skill é diagnóstica. Correções (ex.: remover `vercel.json` indevido) só devem ser aplicadas com confirmação do usuário, exceto quando rodando dentro de `/pre-deploy` com uma correção classificada como segura.
