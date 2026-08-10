---
name: quality-gate
description: Roda e interpreta o harness-score deste repositório, diagnostica queda de nível de maturidade e corrige o harness. Use quando o CI de qualidade falhar, quando o nível cair, ou quando pedirem para melhorar o score.
---

# Gate de qualidade (harness-score)

O CI reprova qualquer mudança que derrube o nível de maturidade do repositório.
Ver [ADR 0001](../../../spec/decisions/0001-adopt-harness-score.md).

## Diagnóstico

```bash
npm run quality                                  # nível atual e resumo por dimensão
npx harness-score --json > /tmp/current.json     # relatório completo
npx harness-score --diff quality/baseline.json   # o que mudou desde o baseline
```

O `--diff` é o que responde a pergunta útil: **qual check parou de passar**. Comece por
ele antes de olhar o relatório inteiro.

## Como o nível é calculado

Requisitos cumulativos — L3 exige tudo de L1 e L2 também:

| Nível                | Exige                                                         |
| -------------------- | ------------------------------------------------------------- |
| L1 · Documented      | context ≥ 40%                                                 |
| L2 · Guided          | context ≥ 60% · (skills ≥ 30% ou hooks ≥ 30%) · hygiene ≥ 50% |
| L3 · Sensing         | sensors ≥ 60% · ci ≥ 50%                                      |
| L4 · Self-correcting | hooks ≥ 70% · total ≥ 80%                                     |

O campo `level.nextLevelGaps` do JSON lista exatamente o que falta para subir.

## Onde cada dimensão mora neste repo

| Dimensão | Artefatos                                                    |
| -------- | ------------------------------------------------------------ |
| Context  | `AGENTS.md`, `.cursor/rules/*.mdc`, `README.md`              |
| Skills   | `.claude/skills/*/SKILL.md`, `.claude/commands/*.md`         |
| Agents   | `.claude/agents/*.md`                                        |
| Hooks    | `.claude/settings.json`, `.claude/hooks/*.sh`                |
| Sensors  | `vitest`, `eslint.config.js`, `tsconfig.json`, `src/test/**` |
| CI       | `.github/workflows/*.yml`, `.husky/pre-commit`               |
| Hygiene  | `.gitignore`, `LICENSE`, `package-lock.json`                 |

Cada check reprovado traz `remediation` e `docsUrl` no JSON. Leia antes de improvisar.

## Regra de ouro

**Corrija o harness, não o medidor.** Desabilitar check via `.harness-score.json` só é
aceitável quando o check não se aplica ao projeto, e a exclusão precisa vir com
justificativa registrada em ADR. Exclusão silenciosa transforma a página `/quality` em
propaganda, e o objetivo dela é o oposto disso.

## Depois de corrigir

```bash
npm run quality                                        # confirme o nível
node scripts/harness-report.mjs --write-baseline       # atualize o baseline
```

Use o script, não `npx harness-score --json > quality/baseline.json`: ele
normaliza o campo `root`, que guarda o caminho absoluto de onde a varredura
rodou e mudaria o arquivo a cada máquina.

Se o nível **subiu**, eleve também o `min-level` em `.github/workflows/quality.yml`:
o patamar conquistado vira o novo piso.
