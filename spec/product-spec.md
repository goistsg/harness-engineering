# Product spec — Harness Engineering

Fonte de verdade sobre o que este produto é, para quem, e com que aparência.
Implementação que divergir daqui está errada — ou esta spec está, e nesse caso
ela é corrigida no mesmo commit.

## 1. Visão

Um journal técnico em português que publica engenharia de software com o
mecanismo à mostra: toda afirmação vem acompanhada da causa que a sustenta e,
sempre que possível, de uma medida.

A tese por trás do produto: existe volume enorme de conteúdo técnico em
português escrito por quem não convive com as consequências do que recomenda.
O diferencial defensável não é escrever melhor — é ser verificável.

## 2. Posicionamento

|             |                                                                           |
| ----------- | ------------------------------------------------------------------------- |
| **Público** | Engenheiros sênior, tech leads e engineering managers no Brasil           |
| **Formato** | Artigos longos, baixa frequência, alta densidade                          |
| **Idioma**  | Português do Brasil (conteúdo); inglês (código e nomenclatura)            |
| **Voz**     | Primeira pessoa, técnica, sem "nós" corporativo, sem hype                 |
| **Prova**   | O próprio repositório é público e mede a própria maturidade em `/quality` |

**O que este journal não publica:** notícia de release, resenha de ferramenta,
opinião sobre linguagem de programação, conteúdo patrocinado.

### O diferencial estrutural

A página [`/quality`](https://harnessengineering.com.br/quality) publica o
resultado do `harness-score` rodado neste repositório a cada build, incluindo
as verificações reprovadas. Um site que dá conselho sobre qualidade de
engenharia e não expõe a própria é pedindo confiança que não ofereceu.

Isso só funciona enquanto for honesto: exclusão de verificação exige ADR.
Ver [ADR 0001](./decisions/0001-adopt-harness-score.md).

## 3. Eixos editoriais

Declarados em `src/config/site.ts` como `EDITORIAL_AXES` — aquele arquivo é a
implementação desta seção, e o `id` de cada eixo é validado no frontmatter dos
artigos pelo schema Zod.

| Eixo (`id`)             | Escopo                                                         |
| ----------------------- | -------------------------------------------------------------- |
| `lideranca-squads`      | Autonomia, ritmo, contratos entre squads, custo de coordenação |
| `ia-na-pratica`         | Modelos e agentes em produção: harness, avaliação, guardrails  |
| `arquitetura-seguranca` | Limites de sistema, falhas previsíveis, segurança como design  |

Adicionar um quarto eixo é decisão de produto: exige atualizar esta seção,
`EDITORIAL_AXES`, e o teste em `src/test/site-config.test.ts` que fixa a
contagem em três.

## 4. Design system

### Cores

Todos os tokens vivem no bloco `@theme` de `src/styles/global.css`. Tailwind v4
é CSS-first — não existe `tailwind.config.js`.

| Papel                    | Token              | Valor     | Utilitário      |
| ------------------------ | ------------------ | --------- | --------------- |
| Fundo principal          | `--color-bg`       | `#18181B` | `bg-bg`         |
| Fundo secundário / cards | `--color-surface`  | `#27272A` | `bg-surface`    |
| Acento (cobre vulcânico) | `--color-accent`   | `#E05638` | `text-accent`   |
| Texto primário           | `--color-fg`       | `#F4F4F5` | `text-fg`       |
| Texto secundário         | `--color-fg-muted` | `#A1A1AA` | `text-fg-muted` |
| Bordas                   | `--color-border`   | `#3F3F46` | `border-border` |

Dois tons existem só para estado de hover, e não entram em texto:

| Papel                   | Token                   | Valor     | Utilitário             |
| ----------------------- | ----------------------- | --------- | ---------------------- |
| Borda sob o cursor      | `--color-border-strong` | `#52525B` | `border-border-strong` |
| Superfície sob o cursor | `--color-surface-hover` | `#2D2D31` | `bg-surface-hover`     |

### Contraste — restrição conhecida

Razões WCAG 2.1 medidas (não estimadas):

| Combinação                 | Razão       | Uso permitido                                                                |
| -------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `fg` sobre `bg`            | **16.12:1** | Qualquer texto (AAA)                                                         |
| `fg-muted` sobre `bg`      | **6.91:1**  | Qualquer texto (AAA para corpo, AA para pequeno)                             |
| `accent` sobre `bg`        | **4.69:1**  | Links, títulos e CTAs. Passa AA (≥4.5), reprova AAA                          |
| `fg-muted` sobre `surface` | **5.81:1**  | Qualquer texto dentro de card                                                |
| `accent` sobre `surface`   | **3.94:1**  | **Somente texto grande** (≥24px ou ≥19px em negrito), onde o limiar AA é 3:1 |
| `bg` sobre `accent`        | **4.69:1**  | Texto de botão com fundo de acento                                           |

A regra que decorre disso, e que vale como revisão de código:

> Dentro de um bloco `bg-surface`, texto pequeno em `text-accent` é proibido —
> use `text-fg-muted`. O acento sobre `surface` só aparece em números e títulos
> grandes.

Ocorrências que dependem dessa exceção hoje: o nível de maturidade (`L4`) na
página `/quality`, renderizado em `text-7xl font-bold`.

A meta de acessibilidade no Lighthouse é 100, e essa restrição é o que a mantém
alcançável sem trocar a cor da marca. Para reproduzir os números, use qualquer
calculadora de contraste WCAG com os valores hexadecimais da tabela acima.

### Tipografia

| Papel             | Fonte          | Especificação                   |
| ----------------- | -------------- | ------------------------------- |
| Interface e corpo | Inter Variable | Corpo em 18px / line-height 1.7 |
| Código            | JetBrains Mono | 15px / line-height 1.6          |

Ambas são auto-hospedadas via `@fontsource` — nenhuma requisição a servidor de
terceiro, o que remove um render-blocking request e uma dependência de privacidade.

Realce de sintaxe: Shiki com o tema `one-dark-pro`, configurado em
`astro.config.ts`. A escolha entre Dracula e One Dark Pro foi por contraste: o
fundo `#282c34` do One Dark Pro fica mais próximo de `--color-surface` e evita
que o bloco de código pareça um recorte de outro site.

### Números medidos

Todo valor quantitativo que o site publica — nível de maturidade, pontuação,
percentuais por dimensão, pontos por verificação — sai em JetBrains Mono com
`tabular-nums`, e não na fonte do corpo de texto. É a distinção entre o que o
site afirma e o que o site mediu, feita na tipografia.

| Papel                             | Especificação                     |
| --------------------------------- | --------------------------------- |
| Nível de maturidade (`L4`)        | mono, 4.5rem, peso 700, em acento |
| Pontuação e percentual do topo    | mono, 1.5rem, `fg-muted`          |
| Números de dimensão e verificação | mono, 0.875rem, `fg-muted`        |

O nível é o maior elemento tipográfico do site fora do `H1`, e é a única
ocorrência de acento sobre `surface` — legal porque é texto grande (ver a
tabela de contraste acima).

Barras de progresso por dimensão: 6px de altura, trilho em `--color-border`,
preenchimento em `--color-accent` (verde quando a dimensão está em 100%). Sem
animação de preenchimento — a barra já está no estado final quando a página
carrega.

### Ritmo de espaçamento

Três degraus, e nada entre eles:

| Degrau | Valor               | Onde                                                  |
| ------ | ------------------- | ----------------------------------------------------- |
| Seção  | 4rem (`py-16`)      | Entre blocos de natureza diferente, e antes do rodapé |
| Grupo  | 3rem (`space-y-12`) | Entre grupos do mesmo tipo (eixos do feed)            |
| Item   | 1.5rem (`py-6`)     | Dentro de um grupo (cards de artigo)                  |

A exceção deliberada: o feed fecha em 1.5rem antes da captura de e-mail, porque
ela continua a leitura do feed em vez de abrir um bloco novo.

O rodapé não tem margem superior própria. O espaço antes dele é o `py-16` da
última seção da página — com margem no rodapé, o intervalo virava a soma dos
dois e cada página fechava num ritmo diferente.

### Estados de hover e foco

A regra, que vale como revisão de código:

> Hover muda superfície, não cor de texto.

- **Links de texto:** underline de 1px passa a 2px. A cor não muda.
- **Links de navegação:** `fg-muted` passa a `fg` — é ganho de legibilidade no
  item apontado, não mudança de cor de marca.
- **Cards (artigo, manifesto):** borda clareia para `border-strong` e o fundo
  para `surface-hover`. O título **não** muda de cor: um card que troca a cor
  do texto faz a página piscar enquanto se lê a lista.
- **Sem transform, sem sombra, sem escala.** Nada se move sob o cursor.
- **Foco:** `outline` de 2px em acento com 2px de deslocamento, herdado do
  `:focus-visible` global. Estado de foco nunca é removido em favor do hover.

### Responsivo

Um único breakpoint estrutural: **640px** (`sm`). Abaixo dele:

- a navegação principal colapsa num menu de hambúrguer; logo e seletor de
  idioma continuam visíveis, porque são o que orienta quem chegou por um link
  externo;
- a tabela das 36 verificações de `/quality` vira lista de cards empilhados —
  mesmo HTML, layout trocado por CSS. Rolagem horizontal esconderia justamente
  a coluna de remediação;
- o nome da marca no cabeçalho reduz para "Harness".

Nenhum outro componente muda de estrutura: o layout já é de coluna única.

### Layout

- Largura máxima do corpo de artigo: `68ch`.
- Largura máxima de página: `max-w-5xl` (conteúdo geral), `max-w-3xl` (about).
- Índice lateral (`sticky`) aparece em artigos com mais de um `H2`, acima de `lg`.

### Marca

O logo é o monograma "HE" numa moldura de bússola, com uma rede de nós
conectados em cobre ao fundo — direção e rede de conhecimento. O arquivo de
origem é `src/assets/logo.png`, e todo tamanho derivado sai dele pelo pipeline
de imagem do build.

| Aplicação             | Tamanho  | Observação                                     |
| --------------------- | -------- | ---------------------------------------------- |
| Cabeçalho             | 30px     | Ao lado do nome por extenso, não no lugar dele |
| Marca d'água (rodapé) | 22px     | 14% de opacidade, decorativa                   |
| `apple-touch-icon`    | 180px    | Gerado no build                                |
| Manifesto do site     | 192, 512 | Gerados no build                               |
| OG image              | 64px     | Dentro de `public/og.png`                      |

O favicon **não** usa este arquivo: `public/favicon.svg` é um mark simplificado,
porque a rede de nós vira ruído ilegível em 16px.

A imagem de compartilhamento social (`public/og.png`, 1200×630) é única para o
site inteiro, gerada a partir de `scripts/og-image.html`. OG image por artigo,
com o título de cada um, exigiria satori ou `@vercel/og` — fica para quando o
volume de artigos justificar a dependência.

### Idiomas na interface

O seletor de idioma fica no cabeçalho, fora do grupo de navegação: idioma não é
destino de navegação. Compacto ("PT ▾"), abre por clique — nunca por hover — e
fecha no Escape, ao clicar fora ou ao escolher.

Na Fase 1 do i18n, inglês e espanhol aparecem no menu **desabilitados**, com
"em breve". Publicar um link para `/en/` antes da tradução existir seria
publicar um 404. A lista mora em `LOCALES`, em `src/config/site.ts`, e virar a
flag `available` é o que liga cada idioma. As rotas seguem o
[ADR 0003](./decisions/0003-url-strategy-for-i18n.md): pt-BR na raiz, os demais
prefixados.

Inglês e espanhol produzem textos 20–30% mais longos que o português. Nenhum
componente de texto pode depender de caber numa linha: hero, botões, cards e o
próprio cabeçalho usam `flex-wrap` e altura automática.

## 5. Estrutura de páginas (MVP)

| Rota                 | Conteúdo                                                               |
| -------------------- | ---------------------------------------------------------------------- |
| `/`                  | Hero, destaque do manifesto, feed por eixo temático, captura de e-mail |
| `/journal`           | Todos os artigos, agrupados por eixo                                   |
| `/journal/[slug]`    | Artigo: MDX, callouts, Mermaid, código copiável, JSON-LD `TechArticle` |
| `/about`             | Autoria, escopo editorial, como o site funciona, contato               |
| `/quality`           | Resultado do `harness-score` deste repositório, com as falhas visíveis |
| `/rss.xml`           | Feed completo                                                          |
| `/sitemap-index.xml` | Gerado por `@astrojs/sitemap`                                          |
| `/site.webmanifest`  | Manifesto com os ícones de 192 e 512 px, gerados no build              |

## 6. Plano de conteúdo

**Cadência-alvo:** um artigo a cada duas semanas. Densidade acima de frequência —
publicar menos é preferível a publicar fraco.

| #   | Artigo                                  | Eixo            | Estado    |
| --- | --------------------------------------- | --------------- | --------- |
| 00  | Manifesto — por que este journal existe | `ia-na-pratica` | Publicado |
| 01  | _(a definir)_                           | —               | —         |

Cada artigo é rascunhado com `draft: true`, o que o mantém visível em `npm run dev`
e fora do build de produção.

## 7. Métricas de sucesso

Ordenadas por quanto realmente informam:

1. **Nível de maturidade do repositório** — mantido em L4, visível em `/quality`.
2. **Lighthouse** — performance ≥ 95, acessibilidade = 100, SEO = 100.
3. **Citações com atribuição** por mecanismos generativos (busca manual periódica).
4. **Assinantes da lista** — indicador de retorno, não de alcance.

Explicitamente **não** são métricas: pageviews totais, tempo na página, número
de artigos publicados.

## 8. Não-objetivos

- Comentários no site (a discussão acontece nas issues do repositório).
- Busca client-side enquanto o acervo couber em uma página.
- Modo claro — a identidade é escura por decisão, não por padrão de sistema.
- Internacionalização. Este journal é em português.
