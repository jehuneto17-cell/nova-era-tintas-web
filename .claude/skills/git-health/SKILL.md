---
name: git-health
description: Audita o estado do repositório Git (branch, remote, arquivos pendentes, secrets, gitignore) e retorna PASS/WARNING/FAIL. Use quando o usuário pedir "/git-health", "audita o git", "posso commitar?" ou antes de qualquer commit/push.
---

# /git-health

Audita a saúde do repositório Git do Nova Era Tintas sem modificar nada.

## Passos

1. Invoque o subagent **git-auditor** (`.claude/agents/git-auditor.md`) via Task/Agent, pedindo a auditoria completa do estado atual do Git.
2. Apresente a saída exatamente no formato que o agente retorna:

```
GIT HEALTH
-----------
Branch:
Remote:
Status:

Arquivos modificados:
Arquivos novos:
Arquivos deletados:

Secrets encontrados:
Sim/Não

Problemas:
...

Status:
PASS / WARNING / FAIL
```

3. Regras de interpretação:
   - **Secrets encontrados = Sim** → status final é sempre **FAIL**, independente de qualquer outra coisa. Nunca imprima o conteúdo do segredo — apenas arquivo e tipo aparente.
   - Gitlink/submódulo indevido em `apps/web` ou `apps/mobile` → **FAIL** (já quebrou o deploy deste projeto antes).
   - `node_modules`, `.next`, `dist`, `.tsbuildinfo` aparecendo como não ignorados → no mínimo **WARNING**.
   - Branch divergente do remote → **WARNING**, não bloqueia.

4. Se o status for **FAIL** por causa de secrets, explique ao usuário exatamente o que fazer (ex.: `git restore --staged <arquivo>`, adicionar ao `.gitignore`, ou — se já foi commitado — que será necessário reescrever histórico, o que exige confirmação explícita antes de qualquer ação).

5. Não execute `git add`, `git commit`, `git push`, nem comandos destrutivos. Esta skill é somente diagnóstico.
