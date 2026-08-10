# Arquitetura

Como o site é construído, onde ele roda, e o que foi trocado por quê.
Decisões estruturais com alternativa descartada viram ADR em [`decisions/`](./decisions/).

## 1. Visão geral

```
Autor escreve MDX
      │
      ▼
src/content/journal/*.mdx ──► content collections (schema Zod estrito)
      │
      ▼
Astro build (SSG)                    ┌─ prebuild: harness-score --json
      │                              │        └─► src/data/harness-score.json
      ├──────────────────────────────┘
      ▼
dist/  (HTML estático + sitemap + rss + robots)
      │
      ▼
Vercel (CDN)  ──►  harnessengineering.com.br
```

Não há servidor, banco de dados nem chamada em tempo de execução. Toda página é
HTML gerado no build. Isso é uma restrição deliberada: ela elimina classes
inteiras de falha e de superfície de ataque de um site cuja função é publicar texto.

## 2. Stack

| Camada                | Escolha                                          | Versão             |
| --------------------- | ------------------------------------------------ | ------------------ |
| Framework             | Astro (output `static`)                          | 7.x                |
| Conteúdo              | MDX via content collections                      | `@astrojs/mdx` 7.x |
| Estilos               | Tailwind CSS (CSS-first, plugin Vite)            | 4.x                |
| Realce de código      | Shiki, tema `one-dark-pro`                       | nativo do Astro    |
| Diagramas             | Mermaid, carregado sob demanda no cliente        | 11.x               |
| Fontes                | Inter Variable + JetBrains Mono, auto-hospedadas | `@fontsource`      |
| Linguagem             | TypeScript estrito                               | 5.x                |
| Testes                | Vitest                                           | 4.x                |
| Qualidade estática    | ESLint 10 (flat config) + Prettier               | —                  |
| Maturidade do harness | `harness-score`                                  | 1.5.x              |
| Hospedagem            | Vercel (integração Git)                          | —                  |

Node 22.12 ou superior é obrigatório — é o piso do Astro 7, e está fixado em
`engines` no `package.json` e no `node-version` dos workflows.

## 3. Trade-offs assumidos

### SSG puro em vez de SSR

Um journal publica texto que muda quando o autor decide. Renderizar por
requisição adicionaria um runtime para servir conteúdo que é idêntico para todo
mundo. **Custo aceito:** qualquer conteúdo dinâmico futuro (busca, comentários,
contadores) exigirá uma decisão nova, e ela virará ADR.

### Astro em vez de Next.js

Astro entrega zero JavaScript por padrão; Next entrega um runtime React em toda
página, mesmo quando a página é um artigo estático. Para conteúdo, essa é a
diferença entre pagar hidratação por hábito e pagar por necessidade.
Registrado em [ADR 0002](./decisions/0002-astro-as-site-framework.md).

### Tailwind v4 CSS-first

A v4 elimina `tailwind.config.js`: os tokens vivem no `@theme` do CSS. Menos um
arquivo de configuração e um só lugar onde a cor da marca existe.
**Custo aceito:** boa parte do material de referência sobre Tailwind na internet
ainda descreve a v3 com arquivo de config, o que confunde quem chega — daí a
regra em `.cursor/rules/astro-components.mdc`.

### Mermaid no cliente, sob demanda

Renderizar Mermaid no build exigiria um navegador headless (Playwright ou
Puppeteer) no pipeline da Vercel: build mais lento, mais frágil e uma dependência
pesada para um punhado de diagramas.

A escolha foi o oposto: `import('mermaid')` dinâmico, disparado por
`IntersectionObserver` só quando um diagrama entra na viewport. Páginas sem
diagrama não baixam nada; páginas com diagrama não bloqueiam o primeiro paint.

**Custo aceito:** o chunk do Mermaid é grande (~660 kB, mais Cytoscape e KaTeX
sob demanda para tipos específicos de diagrama) e o build emite um aviso de
tamanho de chunk. Sem JavaScript, o leitor vê o código-fonte do diagrama, que
ainda comunica a estrutura. Se o volume de diagramas crescer, o caminho é
pré-renderizar SVG no build e servir imagem — e isso será um ADR.

### Fontes via `@fontsource`, não pela API de fontes do Astro

O Astro 7 traz uma API nativa de fontes (`fonts` no config, com providers) que
gera `@font-face` otimizado, fallback com métricas ajustadas e preload
automático. Ela foi testada e **rejeitada**: o resolvedor de métricas busca dados
na rede durante o build. Um site estático cujo argumento é confiabilidade não
deveria depender de uma requisição externa para conseguir buildar.

A escolha foi `@fontsource`, que empacota as fontes com o site — nenhuma
requisição a domínio de terceiro, nem em build nem em runtime, e nenhuma
dependência de privacidade.

**Custo aceito:** o preload e o fallback ficam por nossa conta. O preload é
resolvido em `BaseLayout.astro` importando o `.woff2` com `?url`, o que devolve
o caminho final com hash gerado pelo próprio build. Sem esse preload, o texto
renderiza na fonte de fallback e reflui quando a Inter chega — media 0.045 de
CLS na página de artigo antes da correção, zero depois.

### Sem `@tailwindcss/typography`

A tipografia do artigo é escrita à mão em `@layer components` (`.prose-journal`).
O plugin traria um conjunto de padrões que precisariam ser sobrescritos quase
inteiramente para caber nos tokens da marca. **Custo aceito:** elementos novos de
Markdown (por exemplo `<kbd>`, `<details>`) precisam de estilo explícito quando
aparecerem pela primeira vez.

## 4. Integrações

### harness-score

Ver [ADR 0001](./decisions/0001-adopt-harness-score.md). Três pontos de contato:

1. **`prebuild`** — `scripts/harness-report.mjs` roda o scanner e escreve
   `src/data/harness-score.json`, consumido por `/quality`. Roda também no build
   da Vercel, então o número publicado é sempre de uma varredura real. Se o
   scanner falhar, cai para `quality/baseline.json` e a página sinaliza isso.
2. **CI (`quality.yml`)** — gate com `min-level`, badge, comentário de delta no
   PR e, na `main`, commit do histórico em `data/harness-history.json`.
3. **`quality/baseline.json`** — relatório completo commitado, usado pelo
   `--diff` para dizer qual verificação regrediu. Gravado por
   `node scripts/harness-report.mjs --write-baseline`, que normaliza o campo
   `root` para `.`: o relatório bruto guarda o caminho absoluto do diretório
   escaneado, e sem normalizar todo build na `main` gerava um commit cujo único
   diff era esse caminho. Ruído que esconde a mudança real quando ela aparece.

### Idiomas

O site é monolíngue (pt-BR) hoje, mas a estratégia de URL já está fixada:
português na raiz, idiomas futuros prefixados (`/en/about`). Ver
[ADR 0003](./decisions/0003-url-strategy-for-i18n.md) — é a única decisão de
i18n que não podia ser adiada, porque mudá-la depois invalida toda URL
publicada. O bloco `i18n` em `astro.config.ts` é inerte hoje: as rotas geradas
são idênticas com e sem ele.

### Vercel

Integração Git: cada push gera um preview, cada merge na `main` vai para
produção. O CI do GitHub **não** faz deploy — ele só valida. Isso mantém o
repositório livre de credenciais de deploy. Passo a passo em
[`docs/deployment.md`](../docs/deployment.md).

### Newsletter

`<EmailCapture />` lê `PUBLIC_NEWSLETTER_ACTION_URL`. Sem a variável, renderiza
"Assinatura em breve". Nenhum provedor está acoplado ao código.

## 5. Decisões de configuração que não são óbvias

**`.astro/` não pode entrar no `exclude` do `tsconfig.json`.** É lá que vive o
`content.d.ts` gerado, que dá tipo às content collections. Excluí-lo faz
`getCollection('journal')` retornar `any` silenciosamente — o typecheck passa a
reclamar de parâmetros implicitamente `any` em vez de apontar a causa.

**ESLint 10 não infere extensões.** Sem um bloco `files` listando
`{js,mjs,cjs,ts,mts,cts,astro}`, `eslint .` reporta que tudo está ignorado. Por
isso o script usa um glob explícito.

**`import { z } from 'astro:content'` está depreciado** no Astro 7. O import
correto é `astro/zod`.

## 6. Segurança

- Sem runtime de servidor: não há endpoint autenticado nem banco de dados.
- Sem segredo no repositório. A única variável de ambiente é pública por
  natureza (`PUBLIC_*`) e opcional.
- `securityLevel: 'strict'` no Mermaid, que bloqueia HTML arbitrário vindo do
  código do diagrama.
- Dependências de execução são mínimas; as vulnerabilidades reportadas hoje pelo
  `npm audit` estão todas em dependências transitivas do `@lhci/cli`, que é
  ferramenta de CI e não entra no bundle publicado.
- Processo de disclosure em [`SECURITY.md`](../SECURITY.md).
