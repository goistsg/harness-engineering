# Rodando localmente

## Pré-requisitos

| Ferramenta | Versão                  | Por quê                                         |
| ---------- | ----------------------- | ----------------------------------------------- |
| Node.js    | **24 ou superior**      | Versão em `.nvmrc`, também exigida em `engines` |
| npm        | 10 ou superior          | O lockfile é `package-lock.json`                |
| Git        | qualquer versão recente | O hook de pre-commit depende dele               |

A versão do Node vive em `.nvmrc` — uma só fonte, lida pelos gerenciadores de
versão e pelos três workflows de CI (`node-version-file`). Bump de versão é uma
linha.

```bash
nvm use     # ou: fnm use — ambos leem o .nvmrc
node -v     # precisa ser >= v24
npm -v
```

O Astro 7 exige no mínimo Node 22.12; o piso deste projeto é mais alto de
propósito. Node 22 entrou em manutenção em outubro de 2025 e sai de suporte em
abril de 2027, enquanto o 24 é o LTS ativo e vai até abril de 2028 — e é o
default da Vercel para projetos novos desde janeiro de 2026.

## Instalação

```bash
git clone https://github.com/goistsg/harness-engineering.git
cd harness-engineering
npm install
```

O `npm install` também instala o hook de pre-commit (via `husky`), que roda
ESLint e Prettier nos arquivos preparados para commit.

## Rodar o site

```bash
npm run dev
```

Servidor em <http://localhost:4321>, com hot reload.

Em desenvolvimento, artigos com `draft: true` **aparecem** — é o que permite
revisar a página renderizada antes de publicar. No build de produção eles são
omitidos.

## Comandos

| Comando              | O que faz                                                 |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento                               |
| `npm run build`      | Gera o snapshot de qualidade e constrói o site em `dist/` |
| `npm run preview`    | Serve o `dist/` já construído                             |
| `npm run lint`       | ESLint                                                    |
| `npm run format`     | Prettier (escreve)                                        |
| `npm run typecheck`  | `astro check`                                             |
| `npm test`           | Vitest                                                    |
| `npm run quality`    | `harness-score` neste repositório                         |
| `npm run lighthouse` | Lighthouse CI contra o `dist/`                            |

### Ordem que importa

O smoke test verifica o HTML gerado em `dist/`. Rode o build antes dos testes:

```bash
npm run build && npm test
```

Sem `dist/`, os testes de smoke são pulados explicitamente em vez de passar sem
verificar nada — mas aí você não testou o que achou que testou.

## Variáveis de ambiente

Todas são opcionais. Sem elas o site roda; os componentes afetados mostram um
estado degradado explícito.

```bash
cp .env.example .env
```

| Variável                       | Efeito quando ausente                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `PUBLIC_NEWSLETTER_ACTION_URL` | O bloco de captura mostra "Assinatura em breve" em vez de um formulário que não envia |

Para plugar um provedor de newsletter, coloque nessa variável a URL de `action`
do formulário dele (Buttondown, Kit/ConvertKit, Listmonk…) e reinicie o servidor.
Nenhum provedor está acoplado ao código.

## Escrever um artigo

O procedimento completo está em [`spec/content-guidelines.md`](../spec/content-guidelines.md).
Resumo:

1. Crie `src/content/journal/NN-slug-em-kebab-case.mdx`, com `NN` sendo o
   próximo número da sequência.
2. Preencha o frontmatter (`title`, `description` de 80 a 160 caracteres,
   `pubDate`, `axis`, `tags`).
3. Escreva ao menos um `##` em forma de pergunta direta — é regra verificada por
   teste, não sugestão.
4. Rode `npm test -- content-rules` e `npm run build`.

Trabalhando com um agente de código, o comando `/new-article` executa esse
procedimento (ver `.claude/commands/new-article.md`).

## Problemas conhecidos

**`astro check` acusa parâmetros implicitamente `any` em `src/lib/journal.ts`.**
Os tipos das content collections são gerados em `.astro/content.d.ts`. Se esse
diretório estiver no `exclude` do `tsconfig.json`, `getCollection` degrada para
`any`. Não exclua `.astro/`. Se os tipos parecerem desatualizados:

```bash
npx astro sync
```

**`eslint .` diz que todos os arquivos estão ignorados.** O ESLint 10 não infere
extensões. Use `npm run lint`, que passa o glob explícito.

**`npm audit` reporta vulnerabilidades.** Todas vêm de dependências transitivas
do `@lhci/cli`, que é ferramenta de CI e não entra no bundle publicado. Rodar
`npm audit fix --force` quebra o Lighthouse CI.

**`npm run lighthouse` não conecta ao Chrome.** O Lighthouse precisa de um
Chrome instalado. Se ele não estiver no caminho padrão, aponte com
`CHROME_PATH=/caminho/para/chrome`. O `lighthouserc.json` já passa
`--no-sandbox`, necessário para rodar dentro de contêiner como root.

**A varredura do `harness-score` falhou no build.** O build continua, usando
`quality/baseline.json` como fallback, e a página `/quality` avisa que o dado
não é da execução atual. A mensagem `[quality]` no log diz o que aconteceu.
