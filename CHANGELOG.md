# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Adicionado

- Scaffolding inicial do site em Astro 7 com MDX, Tailwind CSS v4 e TypeScript
  estrito.
- Páginas do MVP: home com feed por eixo temático, listagem do journal, artigo,
  `/about` e `/quality`.
- Content collection `journal` com schema Zod estrito — frontmatter inválido
  reprova o build.
- Integração com o [harness-score](https://github.com/paladini/harness-score)
  como gate de qualidade: dependência de desenvolvimento, gate no CI com
  `min-level`, badge no README, snapshot gerado no `prebuild` e publicado em
  `/quality`, e baseline versionado para diff por verificação.
- Harness para agentes de código: `AGENTS.md`, regras escopadas em
  `.cursor/rules/`, skills `new-article` e `quality-gate`, comando
  `/new-article`, subagente `editorial-reviewer`, e hooks de gate
  (bloqueia edição de ADR publicado) e de feedback (formata o arquivo editado).
- SEO e GEO: `robots.txt` liberando crawlers de mecanismos generativos, sitemap,
  RSS, JSON-LD `TechArticle` em todo artigo, e a regra de `H2` em forma de
  pergunta direta verificada por teste.
- `spec/` como fonte viva de verdade: `product-spec.md`, `architecture.md`,
  `content-guidelines.md` e os ADRs 0001 (adoção do harness-score) e 0002
  (escolha do Astro).
- `docs/setup.md` e `docs/deployment.md`.
- Suíte de testes com Vitest: regras editoriais, configuração do site e smoke do
  build.
- Workflows de CI: qualidade (lint, tipos, testes, build), gate de maturidade e
  Lighthouse CI.
- Artigo 00 — Manifesto, validando o pipeline MDX ponta a ponta.

### Decidido

- Estratégia de URL por idioma fixada antes do primeiro deploy: português na
  raiz, idiomas futuros prefixados (`/en/about`). Declarada em `astro.config.ts`
  e registrada no [ADR 0003](./spec/decisions/0003-url-strategy-for-i18n.md).
  A configuração é inerte hoje — as rotas geradas são idênticas — mas é a única
  decisão de i18n que não podia ser adiada, porque mudá-la depois invalida toda
  URL publicada, indexada e citada.

### Corrigido

- Contraste do acento `#E05638` sobre `--color-surface` medido em 3.94:1, abaixo
  do mínimo AA para texto pequeno. Rótulos pequenos sobre cards passaram a usar
  `--color-fg-muted`, e a restrição está documentada em `spec/product-spec.md`.
- Comentários em blocos de código herdavam `#7F848E` do tema `one-dark-pro`,
  que dá 3.73:1 sobre o fundo do bloco. Sobrescritos para 5.07:1 — em artigo
  técnico o comentário costuma ser a parte mais importante do trecho.
- Links dentro de parágrafo eram distinguidos apenas por cor, o que reprova em
  `link-in-text-block`. Passaram a vir sublinhados por padrão.
- Layout shift causado pela troca da fonte de fallback pela Inter. A fonte
  passou a ser pré-carregada com o caminho com hash resolvido pelo próprio
  build, zerando o CLS.

Com essas correções, o Lighthouse fecha em **100 em performance,
acessibilidade, boas práticas e SEO** nas três páginas medidas, com CLS 0.

Encontrados ao inspecionar as páginas renderizadas em um navegador real:

- Links quebrados em várias linhas pelo Prettier saíam colados na palavra
  anterior ("resultado do**harness-score**"), em 5 pontos de `/about` e
  `/quality`. Corrigido com `{' '}` explícito e coberto por teste, para que o
  erro não volte silenciosamente.
- O tema `dark` do Mermaid ignora `themeVariables` para borda de nó e fundo de
  rótulo de aresta, aplicando `#CCCCCC` e `#585858` — fora do design system.
  Trocado para o tema `base`, que respeita os tokens; valores conferidos no
  DOM renderizado.
- `quality/baseline.json` guardava o caminho absoluto do diretório escaneado,
  o que fazia todo build na `main` produzir um commit cujo único diff era esse
  caminho. O baseline passou a ser gravado por
  `scripts/harness-report.mjs --write-baseline`, que normaliza o campo — agora
  o arquivo é idêntico independente de onde a varredura roda.

## Sobre este arquivo

Contribuições que alterem comportamento visível, decisões de arquitetura ou
regras editoriais devem adicionar uma entrada em **[Não lançado]**. Correção de
segurança reportada por terceiros credita quem reportou, salvo pedido em
contrário — ver [SECURITY.md](./SECURITY.md).
