# ADR 0002 — Astro como framework do site

- **Status:** Aceito
- **Data:** 2026-08-09
- **Decisor:** Tiago Gois

## Contexto

O Harness Engineering é um journal: artigos longos, publicação de baixa
frequência, conteúdo idêntico para todos os leitores. As páginas mudam quando o
autor escreve, não quando alguém acessa.

Três restrições vindas do produto:

1. **Performance é parte do argumento.** Um site que fala sobre engenharia e
   demora para carregar contradiz o próprio texto. A meta é performance ≥ 95 e
   acessibilidade 100 no Lighthouse, e essas metas são publicadas.
2. **MDX é obrigatório.** Os artigos precisam de callouts, diagramas e código
   realçado como componentes, não como HTML colado no Markdown.
3. **Longevidade.** Este repositório é vitrine. O custo de manutenção de um
   framework pesado se paga em atrito a cada dependência atualizada.

## Decisão

Usar **Astro** com output estático (`static`), MDX via `@astrojs/mdx` e content
collections com schema Zod.

O que decidiu a escolha: Astro entrega **zero JavaScript por padrão**. Um artigo
é HTML e CSS; JavaScript só existe onde há interação real — hoje, o botão de
copiar código e o carregamento sob demanda do Mermaid. Isso não é uma otimização
aplicada depois, é o comportamento base.

As content collections cobrem a segunda necessidade: schema Zod estrito
transforma frontmatter inválido em erro de build, que é o comportamento correto
para um site onde o `<head>` de cada artigo depende do frontmatter.

## Alternativas consideradas

### Next.js (App Router, SSG)

**Rejeitada.** Next é excelente para aplicação, e um journal não é aplicação.
Mesmo com geração estática, o modelo entrega um runtime React em toda página
para renderizar conteúdo que nunca muda no cliente. Seria pagar hidratação por
hábito. Some-se a superfície de configuração e a cadência de mudanças
estruturais do framework, que geram trabalho de manutenção sem contrapartida
para um site de texto.

### Hugo ou Eleventy

**Rejeitada.** São ótimos geradores estáticos e provavelmente mais rápidos no
build. O problema é o MDX: em ambos, componentes dentro do conteúdo exigem
shortcodes próprios (Hugo) ou uma configuração adicional de bundler (Eleventy),
com tipagem fraca ou inexistente na fronteira entre frontmatter e template. O
projeto quer TypeScript estrito atravessando o conteúdo, e no Astro isso é
nativo.

### Um site em HTML e CSS escritos à mão

**Rejeitada.** Honesto para dois artigos, insustentável a partir do décimo: sem
coleção tipada, sem feed automático, sem sitemap, sem garantia de que todo
artigo tem `<head>` completo. O trabalho iria para tarefas que um gerador já
resolve.

### Ferramentas de publicação hospedadas (Substack, Ghost, Medium)

**Rejeitada** pelo motivo central do projeto: o repositório público que mede a
própria maturidade **é** o diferencial editorial. Numa plataforma fechada não há
`/quality`, não há `spec/`, não há gate de CI, e a customização visual é limitada
ao que a plataforma permite. Também há a questão de posse do canal e do domínio.

## Consequências

### Positivas

- Zero JavaScript por padrão: metas de Lighthouse alcançáveis sem esforço extra.
- Frontmatter tipado de ponta a ponta; erro vira falha de build.
- MDX com componentes Astro sem camada de compatibilidade.
- Deploy trivialmente estático — qualquer CDN serve o `dist/`, o que reduz o
  custo de trocar de hospedagem.
- Sem `tailwind.config.js` na v4: um só lugar define os tokens da marca.

### Negativas e riscos aceitos

- **Ecossistema menor que o de React/Next.** Componente pronto de terceiro é
  mais raro. Aceito: o site tem poucos componentes e todos são próprios.
- **Astro evolui rápido e quebra em majors.** A v7 depreciou
  `import { z } from 'astro:content'` e trocou o processador de Markdown padrão.
  Mitigação: versões fixadas, `astro check` no CI, e as pegadinhas registradas em
  `spec/architecture.md`.
- **Interatividade futura exigirá decisão explícita.** Adicionar busca ou
  comentários significa escolher uma ilha e uma estratégia de hidratação — e
  isso será um ADR novo, não uma decisão de implementação.
- **Node 22.12+ obrigatório**, o que exclui ambientes presos em versões antigas.
  Fixado em `engines` e nos workflows.
