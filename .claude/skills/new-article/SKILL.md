---
name: new-article
description: Cria um novo artigo MDX do journal já conforme as regras editoriais e de GEO do projeto. Use quando pedirem para escrever, rascunhar ou publicar um artigo, post ou texto novo no site.
---

# Novo artigo do journal

Procedimento para criar um artigo que passa nas regras de `src/test/content-rules.test.ts`
na primeira tentativa.

## 1. Colete o que não dá para inventar

Antes de escrever, confirme com quem pediu:

- **Eixo editorial** — um de `lideranca-squads`, `ia-na-pratica`, `arquitetura-seguranca`.
- **Tese central** — a afirmação que o artigo defende, em uma frase.
- **Experiência concreta** que sustenta a tese. Sem isso o texto vira resenha genérica,
  que é exatamente o que este journal não publica.

## 2. Determine o número e o slug

```bash
ls src/content/journal/
```

Pegue o maior `NN` e some 1. Nome do arquivo: `NN-slug-em-kebab-case.mdx`, slug em
português, sem artigos e sem stopwords.

## 3. Escreva o frontmatter

```yaml
---
title: Título direto, sem o nome do site
description: Uma frase de 80 a 160 caracteres que resume a tese e funciona sozinha em SERP
pubDate: AAAA-MM-DD
axis: ia-na-pratica
tags: ['tag-1', 'tag-2']
draft: false
---
```

`description` fora da faixa de 80–160 caracteres reprova no teste. Conte antes.

## 4. Estruture o corpo

Regra não negociável: **ao menos um `##` em forma de pergunta direta**, terminando em `?`.
É o que torna o trecho extraível por mecanismos generativos. Exemplos que contam:
`## O que é um harness de agente?`, `## Por que squads autônomas travam em escala?`.

Esqueleto que costuma funcionar:

```
Abertura: o problema concreto, em duas ou três frases. Sem preâmbulo.

## <pergunta direta que o artigo responde>
A resposta, com o mecanismo.

## <seção de desenvolvimento>
Detalhe técnico, código ou diagrama.

## <seção de consequência>
O que muda na prática para quem lê.

Fechamento: a tese reafirmada com o que foi demonstrado.
```

## 5. Componentes

```mdx
import Callout from '@/components/Callout.astro';
import Mermaid from '@/components/Mermaid.astro';
```

`Callout` aceita `type="note|warning|danger|insight"`. `Mermaid` recebe `chart` e
`caption`. Todo bloco de código precisa declarar a linguagem.

## 6. Verifique

```bash
npm test -- content-rules
npm run build
```

Depois abra `npm run preview` e confira a página renderizada, o JSON-LD no `<head>`
e o artigo no feed da home sob o eixo correto.

## Referência

Regras completas em [spec/content-guidelines.md](../../../spec/content-guidelines.md).
