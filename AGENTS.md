# AGENTS.md — Harness Engineering

Contexto operacional para agentes de código trabalhando neste repositório.
Humanos: comece pelo [README.md](./README.md) e por [docs/setup.md](./docs/setup.md).

## O que é este projeto

Site e journal técnico de [harnessengineering.com.br](https://harnessengineering.com.br):
artigos sobre engenharia de software, liderança de squads e uso de IA em produção.
Site estático em Astro, conteúdo em MDX, deploy na Vercel.

O repositório é público e serve como demonstração de prática de engenharia. Isso tem
uma consequência direta: **mudança que degrada a qualidade mensurável do repositório
é uma mudança ruim**, mesmo que o site continue funcionando.

## Idiomas

Duas convenções coexistem, e a distinção é intencional:

- **Código, nomes de arquivo, pastas, branches e mensagens de commit: inglês.**
- **Conteúdo editorial (`src/content/**`), documentação em `spec/` e `docs/`,
  e comentários de código: português do Brasil.**

## Stack

| Camada    | Escolha                                                          |
| --------- | ---------------------------------------------------------------- |
| Framework | Astro 7 (SSG puro, sem adaptador de servidor)                    |
| Estilos   | Tailwind CSS v4 (CSS-first, tokens em `src/styles/global.css`)   |
| Conteúdo  | MDX via content collections (`src/content.config.ts`)            |
| Linguagem | TypeScript estrito (`strict: true` + `noUncheckedIndexedAccess`) |
| Testes    | Vitest                                                           |
| Deploy    | Vercel (build automático via integração Git)                     |

## Mapa do repositório

```
spec/            Fonte viva de verdade: produto, arquitetura, diretrizes, ADRs
docs/            Operação: como rodar, como fazer deploy
src/config/      site.ts — identidade, autoria e eixos editoriais
src/content/     Artigos MDX (a coleção `journal`)
src/components/  Componentes Astro
src/layouts/     BaseLayout (casca) e ArticleLayout (artigo)
src/pages/       Rotas
src/test/        Testes de regra de conteúdo e smoke de build
scripts/         Automação Node (geração do snapshot de qualidade)
.claude/         Harness do agente: skills, comandos, subagentes, hooks
.cursor/rules/   Regras escopadas por caminho
```

## Comandos

```bash
npm install        # instalar dependências
npm run dev        # servidor local em http://localhost:4321
npm run build      # prebuild gera o snapshot de qualidade e depois builda
npm run preview    # servir o dist/ construído
npm run lint       # ESLint
npm run typecheck  # astro check
npm test           # Vitest
npm run quality    # harness-score neste repositório
```

## Regras de trabalho

1. **A spec vem antes do código.** Mudança de comportamento do produto se reflete em
   `spec/`. Decisão estrutural vira ADR numerado em `spec/decisions/`. ADRs publicados
   são imutáveis — para revertê-los, escreva um novo ADR que os substitua.
2. **Toda identidade pública sai de `src/config/site.ts`.** Não escreva nome de autor,
   URL ou domínio direto em componente ou artigo.
3. **Nunca invente dado que vai a público.** Sem valor real, o campo fica vazio e o
   componente não renderiza. É proibido publicar `TODO`, `Lorem ipsum` ou `FIXME` —
   `src/test/build-smoke.test.ts` falha se algo disso chegar ao `dist/`.
4. **Todo artigo precisa de ao menos um `##` em forma de pergunta direta.** Não é
   estilo, é regra de GEO verificada por `src/test/content-rules.test.ts`.
5. **Conventional Commits.** Ver [CONTRIBUTING.md](./CONTRIBUTING.md).
6. **Não commite segredo.** Configuração sensível entra por variável de ambiente,
   documentada em `.env.example`.

## Antes de dizer que terminou

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run quality
```

O `npm run quality` roda o [harness-score](https://github.com/paladini/harness-score),
que mede a maturidade do harness deste repositório. O CI reprova PR que reduza o nível
— ver [ADR 0001](./spec/decisions/0001-adopt-harness-score.md). Se sua mudança derruba
o nível, corrija o harness junto, não desabilite o check.
