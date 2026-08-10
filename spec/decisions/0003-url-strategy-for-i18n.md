# ADR 0003 — Português na raiz, idiomas futuros prefixados

- **Status:** Aceito
- **Data:** 2026-08-10
- **Decisor:** Tiago Gois

## Contexto

O site vai ao ar apenas em português do Brasil. Há intenção declarada de
oferecer as páginas principais (home, `/about`, `/quality`) também em inglês
mais adiante — sem previsão, e sem decisão ainda sobre traduzir os artigos.

Quase tudo de i18n pode ser adiado sem custo: extrair strings de UI, montar
dicionários, gerar `hreflang`, parametrizar formatação de data. Nenhuma dessas
coisas fica mais cara por ser feita depois.

**Uma decisão não é adiável: onde mora o idioma padrão na URL.**

Se o site for publicado com `/about` e mais tarde o português for movido para
`/pt-br/about`, toda URL já publicada quebra. E o dano não é apenas de link
interno:

- links externos e citações em outros sites apontam para o endereço antigo;
- o índice dos buscadores precisa ser reconstruído, com perda temporária de
  posicionamento;
- mecanismos generativos que citaram o conteúdo passam a apontar para 404 — o
  que é especialmente ruim num projeto cuja estratégia de distribuição é ser
  citado corretamente por eles;
- redirects permanentes mitigam, mas não eliminam: são dívida operacional que
  fica para sempre.

Ou seja: é barato decidir agora e caro descobrir depois. Por isso a decisão é
tomada **antes do primeiro deploy de produção**, mesmo sem existir uma única
tradução.

## Decisão

O português do Brasil fica **sem prefixo de idioma**, na raiz. Idiomas futuros
entram prefixados.

| Hoje                 | Depois            |
| -------------------- | ----------------- |
| `/`                  | `/en/`            |
| `/about`             | `/en/about`       |
| `/quality`           | `/en/quality`     |
| `/journal/manifesto` | `/en/journal/...` |

Implementado em `astro.config.ts`:

```ts
i18n: {
  defaultLocale: SITE.language,
  locales: [SITE.language],
  routing: { prefixDefaultLocale: false },
}
```

A configuração é declarada explicitamente embora `prefixDefaultLocale: false`
já seja o padrão do Astro. Um padrão implícito não comunica intenção e pode
mudar entre versões maiores; um valor escrito com um ADR ao lado, não.

Verificado na adoção: as rotas geradas em `dist/` são idênticas antes e depois
da mudança. Hoje a configuração é inerte — ela existe para tornar a decisão
explícita e para ser o ponto de extensão quando o segundo idioma chegar.

## Alternativas consideradas

### Prefixar todos os idiomas, inclusive o padrão (`/pt-br/about`)

**Rejeitada.** É a opção mais simétrica, e tem defensores justamente por isso:
nenhum idioma é "especial", e adicionar o terceiro não exige pensar. O problema
é o custo cobrado hoje por um benefício hipotético: a raiz do domínio passaria a
ser um redirect, toda URL ficaria mais longa, e o site pagaria complexidade de
roteamento por um segundo idioma que ainda não existe e pode nunca existir.

Para um journal de autor único escrevendo em português, a assimetria é honesta:
português **é** o idioma padrão do produto.

### Subdomínio por idioma (`en.harnessengineering.com.br`)

**Rejeitada.** Exige DNS e configuração de domínio por idioma na Vercel, e
divide a autoridade de SEO entre hosts. O ganho — deploys independentes por
idioma — não se aplica a um site estático de uma pessoa.

### Negociação por `Accept-Language` com redirecionamento automático

**Rejeitada por incompatibilidade com a arquitetura.** O site é estático, sem
runtime de servidor (ADR 0002); redirecionar por cabeçalho exigiria middleware
ou configuração de edge. Além disso é hostil: um leitor brasileiro com o
navegador em inglês seria empurrado para uma tradução parcial do conteúdo, sem
ter pedido. Escolha de idioma é do leitor.

### Não decidir agora e resolver quando o i18n for implementado

**Rejeitada.** É exatamente a decisão que não pode ser adiada, pelo motivo
descrito no contexto. Adiar aqui não é manter opções em aberto — é escolher a
opção mais cara por omissão.

## Consequências

### Positivas

- URLs publicadas hoje permanecem válidas para sempre, sem redirect.
- Adicionar inglês depois é aditivo: nenhuma rota existente muda.
- A raiz do domínio serve conteúdo, não um redirect.
- Custo de adoção zero: build e rotas verificados como idênticos.

### Negativas e riscos aceitos

- **Assimetria permanente entre idiomas.** O português nunca terá URL
  prefixada. Se um dia o inglês virar o idioma principal do projeto, a inversão
  custa exatamente a migração que este ADR evita. Aceito: seria uma mudança de
  identidade do produto, e mereceria um ADR próprio de qualquer forma.
- **`hreflang` fica obrigatório** quando o segundo idioma entrar. Sem
  `hreflang` recíproco entre `/about` e `/en/about`, os buscadores tratam as
  duas páginas como conteúdo duplicado em vez de traduções. Fica registrado
  aqui como requisito, não como detalhe de implementação.

## O que este ADR não decide

Deliberadamente fora de escopo, para quando o i18n for implementado de fato:

- se os artigos serão traduzidos ou se apenas a UI e as páginas institucionais;
- o que acontece quando um leitor em `/en` abre um artigo que só existe em
  português (esconder, exibir com aviso, ou redirecionar);
- a organização de `src/content/journal/` para múltiplos idiomas — que afeta
  slugs e, portanto, merece a mesma atenção que este ADR deu às URLs;
- o formato dos dicionários de tradução.
