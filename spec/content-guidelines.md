# Diretrizes editoriais

O padrão do que é publicado e as regras técnicas que tornam o conteúdo
encontrável. A maior parte destas regras é verificada por teste — a tabela da
seção 6 mapeia cada uma para o teste que a garante.

## 1. O padrão editorial

Um artigo é publicável quando responde "sim" às cinco perguntas:

1. **Defende uma tese?** Um leitor consegue dizer, em uma frase, o que o texto
   sustenta. Texto que apenas descreve uma tecnologia é resenha, e resenha não
   é publicada aqui.
2. **Cada afirmação técnica traz o mecanismo?** "É mais rápido" sem causa nem
   número é ruído.
3. **Vem de experiência real?** Se o autor não conviveu com as consequências,
   o texto precisa dizer isso explicitamente.
4. **Sobra alguma coisa se cortar 30%?** Se não sobra, é porque o texto é
   preâmbulo.
5. **Um trecho isolado ainda faz sentido?** É o que determina se um mecanismo
   generativo consegue citar o artigo corretamente.

## 2. Estilo

- Português do Brasil. Voz ativa. Frases curtas.
- Primeira pessoa do singular quando for experiência do autor. Nunca "nós"
  corporativo.
- Termo técnico consagrado em inglês fica em inglês (_deploy_, _branch_,
  _harness_). Não se traduz o que ninguém traduz na prática.
- Sem emoji no corpo do artigo.
- Sem exclamação. Sem "simplesmente", "basta", "apenas" antes de algo que não é
  simples.
- Números com unidade e contexto: "de 800 ms para 120 ms em p95", não "muito
  mais rápido".

## 3. Estrutura do artigo

```
Abertura — o problema concreto, em duas ou três frases. Sem preâmbulo,
sem "neste artigo vamos ver".

## <pergunta direta que o artigo responde>
A resposta, com o mecanismo. Esta seção precisa funcionar isolada.

## <desenvolvimento>
Detalhe técnico: código, diagrama, medida.

## <consequência>
O que muda na prática para quem lê.

Fechamento — a tese reafirmada com o que foi demonstrado.
```

`H1` é gerado pelo layout a partir do `title`. **Não escreva `#` no corpo** —
comece em `##`.

## 4. Frontmatter

```yaml
---
title: Título direto, sem o nome do site # 10 a 90 caracteres
description: Uma frase que resume a tese e funciona sozinha em SERP # 80 a 160
pubDate: 2026-08-09
updatedDate: 2026-09-01 # opcional; vira dateModified no JSON-LD
axis: ia-na-pratica # lideranca-squads | ia-na-pratica | arquitetura-seguranca
tags: ['harness', 'avaliacao'] # 1 a 6, minúsculas, sem acento
draft: false
canonical: https://... # opcional; só se publicado antes em outro lugar
---
```

Validado pelo schema Zod em `src/content.config.ts`. Frontmatter inválido
derruba o build, por desenho — é preferível a publicar uma página com `<head>`
incompleto.

## 5. Regras de GEO e SEO

**GEO** (Generative Engine Optimization) é otimizar para ser citado corretamente
por mecanismos generativos, não apenas ranqueado por buscadores.

### A regra que sustenta tudo: H2 em forma de pergunta

Todo artigo precisa de **ao menos um `##` terminando em `?`**, com a resposta
imediatamente abaixo, autocontida.

```markdown
## O que é um harness de agente?

O conjunto de arquivos, testes e gates que um repositório oferece a um agente
de código para que ele saiba o que fazer e seja impedido de fazer o que não deve.
```

Isso não é preferência de estilo. Um modelo que responde "o que é X" procura um
bloco extraível cuja pergunta corresponde à do usuário. Heading em pergunta com
resposta imediata é a forma mais confiável de fornecer esse bloco.

### As demais

| Regra                                          | Motivo                                                 |
| ---------------------------------------------- | ------------------------------------------------------ |
| `description` entre 80 e 160 caracteres        | Abaixo de 80 o buscador reescreve; acima de 160 trunca |
| Bloco de código sempre com linguagem declarada | Realce correto e melhor parsing do trecho              |
| Toda imagem com `alt` descritivo               | Acessibilidade e indexação                             |
| Link externo com `rel="noopener"`              | Segurança da aba de origem                             |
| `canonical` quando republicado                 | Evita competir com a versão original                   |
| Tabela em vez de lista quando há comparação    | Formato que modelos extraem com mais fidelidade        |

### O que é gerado automaticamente

Não escreva à mão: JSON-LD `TechArticle` (`TechArticleSchema.astro`), canonical
e Open Graph (`BaseLayout.astro`), entrada no `sitemap-index.xml` e no
`rss.xml`, e `id` dos headings.

## 6. Regra → teste

Nenhuma destas regras depende de disciplina. Cada uma reprova o build.

| Regra                                     | Onde é verificada                    |
| ----------------------------------------- | ------------------------------------ |
| Nome `NN-slug-em-kebab-case.mdx`          | `src/test/content-rules.test.ts`     |
| Frontmatter completo                      | `content-rules.test.ts` + schema Zod |
| `axis` é um eixo declarado                | `content-rules.test.ts` + schema Zod |
| `description` entre 80 e 160 caracteres   | `content-rules.test.ts` + schema Zod |
| Ao menos um `##` em pergunta direta       | `content-rules.test.ts`              |
| Todo bloco de código com linguagem        | `content-rules.test.ts`              |
| Sem `TODO`/`FIXME`/`Lorem ipsum` no corpo | `content-rules.test.ts`              |
| Slug único entre artigos                  | `content-rules.test.ts`              |
| JSON-LD `TechArticle` presente e válido   | `src/test/build-smoke.test.ts`       |
| Canonical absoluto em toda página         | `build-smoke.test.ts`                |
| `robots.txt` liberando crawlers de IA     | `build-smoke.test.ts`                |
| Sem placeholder no HTML publicado         | `build-smoke.test.ts`                |

Os marcadores de rascunho são comparados **com sensibilidade a maiúsculas**:
"todo" é palavra corrente em português e não pode reprovar um artigo.

## 7. Checklist de publicação

```bash
npm run lint && npm run typecheck
npm run build && npm test
npm run preview   # confira a página, o feed e o índice lateral
```

Antes do merge: revisar com o subagente `editorial-reviewer`
(`.claude/agents/editorial-reviewer.md`), conferir `pubDate`, e confirmar que o
artigo aparece sob o eixo correto na home.
