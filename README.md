# Harness Engineering

[![Harness Score](https://raw.githubusercontent.com/goistsg/harness-engineering/main/public/harness-badge.svg)](https://harnessengineering.com.br/quality)
[![CI](https://github.com/goistsg/harness-engineering/actions/workflows/ci.yml/badge.svg)](https://github.com/goistsg/harness-engineering/actions/workflows/ci.yml)
[![Harness Score CI](https://github.com/goistsg/harness-engineering/actions/workflows/quality.yml/badge.svg)](https://github.com/goistsg/harness-engineering/actions/workflows/quality.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-E05638.svg)](./LICENSE)

Código-fonte de [harnessengineering.com.br](https://harnessengineering.com.br) —
um journal técnico em português sobre engenharia de software, liderança de
squads e uso de IA em produção.

## O que é isto

Um site estático que publica artigos longos em três eixos: **Liderança &
Squads**, **IA na Prática** e **Arquitetura & Segurança**. A regra editorial é
uma só: toda afirmação técnica vem com o mecanismo que a sustenta.

O repositório é público por consequência dessa regra. Além do código, ele traz:

- [`spec/`](./spec/) — visão de produto, arquitetura e diretrizes editoriais como
  fonte viva de verdade, com [ADRs](./spec/decisions/) registrando as decisões
  estruturais e as alternativas descartadas;
- [`/quality`](https://harnessengineering.com.br/quality) — a maturidade de
  engenharia deste próprio repositório, medida a cada build e publicada
  **incluindo as verificações que falham**.

### O gate de qualidade

Este repositório roda o [harness-score](https://github.com/paladini/harness-score)
em todo PR e em todo push na `main`: 36 verificações determinísticas em 6
dimensões, com um nível de maturidade de L0 a L4.

**Uma mudança que derrube o nível reprova o build.** Não é aviso, é erro — a
decisão está registrada em [ADR 0001](./spec/decisions/0001-adopt-harness-score.md).

A regra que dá sentido a isso: desabilitar uma verificação exige justificativa
em ADR. Hoje o `.harness-score.json` não exclui nada, e o repositório reprova em
`HYG-08` em público porque não usa MCP e não vai criar um arquivo vazio para
ganhar pontos.

## Stack

| Camada    | Escolha                                                                       |
| --------- | ----------------------------------------------------------------------------- |
| Framework | [Astro 7](https://astro.build) (SSG, zero JS por padrão)                      |
| Estilos   | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first, sem arquivo de config) |
| Conteúdo  | MDX + content collections com schema Zod estrito                              |
| Linguagem | TypeScript estrito                                                            |
| Testes    | [Vitest](https://vitest.dev)                                                  |
| Qualidade | ESLint 10, Prettier, Lighthouse CI, harness-score                             |
| Deploy    | [Vercel](https://vercel.com) via integração Git                               |

Detalhes e trade-offs em [`spec/architecture.md`](./spec/architecture.md).

## Rodando localmente

Requer **Node.js 24+** (a versão exata está em `.nvmrc`).

```bash
git clone https://github.com/goistsg/harness-engineering.git
cd harness-engineering
npm install
npm run dev          # http://localhost:4321
```

Guia completo, variáveis de ambiente e problemas conhecidos em
[`docs/setup.md`](./docs/setup.md).

### Comandos principais

```bash
npm run build        # gera o snapshot de qualidade e constrói o site
npm run build && npm test   # nesta ordem: o smoke test verifica o dist/
npm run lint         # ESLint
npm run typecheck    # astro check
npm run quality      # harness-score neste repositório
```

## Estrutura

```
spec/            Fonte viva de verdade: produto, arquitetura, diretrizes, ADRs
docs/            Operação: setup local e deploy
src/config/      site.ts — identidade, autoria e eixos editoriais
src/content/     Artigos MDX (coleção `journal`)
src/components/  Componentes Astro
src/layouts/     BaseLayout e ArticleLayout
src/pages/       Rotas do site
src/test/        Regras de conteúdo e smoke de build
scripts/         Geração do snapshot de qualidade
.claude/         Harness do agente: skills, comandos, subagentes, hooks
.cursor/rules/   Regras escopadas por caminho
```

`AGENTS.md` na raiz é o ponto de entrada para agentes de código.

## Contribuindo

Correção, discordância técnica e sugestão de pauta são bem-vindas — veja
[CONTRIBUTING.md](./CONTRIBUTING.md) para o padrão de commits (Conventional
Commits), o fluxo de PR e o que o CI exige.

Este projeto adota o [Contributor Covenant](./CODE_OF_CONDUCT.md).
Vulnerabilidades seguem o processo de [SECURITY.md](./SECURITY.md).

## Licença

Duas licenças, com fronteira explícita:

- **Código** (componentes, layouts, configuração, scripts, testes) — [MIT](./LICENSE).
- **Conteúdo editorial** (`src/content/`) —
  [CC BY-NC-SA 4.0](./src/content/LICENSE-CONTENT). Citação com atribuição e link
  é bem-vinda; republicação comercial não é autorizada.
