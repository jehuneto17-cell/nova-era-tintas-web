---
name: ship
description: Etapa final antes de enviar código — roda git-health, build-check, route-check, deploy-check e o GAUNTLET; só faz commit/push se tudo passar. Use quando o usuário pedir "/ship", "pode publicar", "faz o commit e push" ou "sobe pra produção".
---

# /ship

Última etapa antes de `git push`. Nunca pula direto para commit/push sem passar pelo gate completo.

## Fluxo

```
/ship
   ↓
git-health
   ↓
build-check
   ↓
route-check
   ↓
deploy-check
   ↓
deployment-auditor (consolidado em deploy-check)
   ↓
GAUNTLET (pre-deploy)
   ↓
PASS?
   ↓ sim              ↓ não
mostrar resumo      NÃO commitar, NÃO pushar
   ↓                    ↓
commit               tentar corrigir o que for seguro
   ↓                    ↓
push (com confirmação) executar novamente (máx. 3 ciclos)
```

## Passos

1. Invoque a skill **`/pre-deploy`** (ela já orquestra os 4 auditores, aplica correções seguras, roda o GAUNTLET e devolve o relatório PRE-DEPLOY REPORT com STATUS FINAL).

2. **Se STATUS FINAL = BLOCKED**:
   - Pare. Não execute `git add`, `git commit`, nem `git push`.
   - Apresente o relatório completo ao usuário, deixando claro o que precisa ser resolvido manualmente.
   - Não prossiga para os passos 3-5.

3. **Se STATUS FINAL = READY TO SHIP**:
   - Mostre o resumo do relatório ao usuário.
   - Rode `git status` e `git diff` para montar o conjunto de mudanças a commitar (siga as regras padrão de commit: nunca `git add -A`/`git add .` cego — adicione arquivos específicos; revise o que foi staged antes de commitar; nunca inclua arquivos que pareçam segredo mesmo que o git-auditor não tenha sinalizado).
   - Redija uma mensagem de commit concisa (1-2 frases, foco no "porquê"), seguindo o estilo dos commits recentes do repositório (`git log --oneline -10` para referência de tom).
   - **Antes de rodar `git push`**: confirme explicitamente com o usuário, a menos que ele já tenha pedido "commit e push" nesta mesma mensagem — push é uma ação visível/compartilhada e, por padrão, exige confirmação explícita mesmo com PASS no gate.
   - Depois do commit (e do push, se autorizado), rode `git status` para confirmar sucesso.

4. **Nunca**:
   - Use `--no-verify`, `--no-gpg-sign`, ou pule hooks.
   - Force-push.
   - Faça commit/push se houver qualquer secret detectado, mesmo que o restante do GAUNTLET tenha passado (a regra de override de `/pre-deploy` já força BLOCKED nesse caso).
   - Amende commits existentes — sempre crie um novo commit.

5. Ao final, resuma em poucas linhas: o que foi commitado/pushed, nota GAUNTLET, e o link/branch relevante se aplicável.
