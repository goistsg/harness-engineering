# Deploy

O site é estático. O `dist/` gerado pelo `npm run build` é servido por CDN — não
há servidor de aplicação, banco de dados nem processo em execução.

## Modelo adotado

**A Vercel builda a partir do Git. O GitHub Actions não faz deploy.**

```
push / abertura de PR
   ├──► GitHub Actions ──► lint · tipos · testes · build · harness-score · Lighthouse
   └──► Vercel          ──► build ──► preview (PR) ou produção (main)
```

Os dois caminhos são independentes por decisão: o CI **valida** e a Vercel
**publica**. A consequência prática é que o repositório não guarda nenhuma
credencial de deploy — não existe `VERCEL_TOKEN` em segredo de Actions.

A contrapartida honesta: um deploy de produção pode acontecer mesmo com o CI
vermelho, porque a Vercel não espera pelo Actions. A proteção correta para isso
é uma branch protection rule na `main` exigindo os checks (seção "Proteção da
branch", abaixo), e não acoplar o pipeline.

## Configuração da Vercel

Se o projeto ainda não está conectado, este é o passo a passo completo.

### 1. Importar o repositório

1. <https://vercel.com/new>
2. Importe `goistsg/harness-engineering`.
3. A Vercel detecta o Astro sozinha. Confirme:

   | Campo            | Valor           |
   | ---------------- | --------------- |
   | Framework Preset | Astro           |
   | Build Command    | `npm run build` |
   | Output Directory | `dist`          |
   | Install Command  | `npm ci`        |
   | Node.js Version  | **22.x**        |

O `npm run build` dispara o `prebuild`, que roda o `harness-score` sobre o
repositório clonado — é assim que a página `/quality` publica o resultado da
build corrente e não um número commitado que envelhece.

### 2. Variáveis de ambiente

Nenhuma é obrigatória. Em Settings → Environment Variables, adicione conforme
precisar:

| Variável                       | Ambientes           | Efeito                                                                          |
| ------------------------------ | ------------------- | ------------------------------------------------------------------------------- |
| `PUBLIC_NEWSLETTER_ACTION_URL` | Production, Preview | Ativa o formulário de newsletter; sem ela, o bloco mostra "Assinatura em breve" |

Variáveis com prefixo `PUBLIC_` vão para o HTML gerado. **Não coloque segredo
nelas.**

### 3. Domínio

1. Settings → Domains → adicione `harnessengineering.com.br`.
2. No registrador (Registro.br, se o domínio é `.com.br`), configure o que a
   Vercel indicar:

   | Tipo    | Nome  | Valor                     |
   | ------- | ----- | ------------------------- |
   | `A`     | `@`   | o IP apontado pela Vercel |
   | `CNAME` | `www` | `cname.vercel-dns.com`    |

3. Defina `harnessengineering.com.br` como domínio primário e deixe o `www`
   redirecionando para ele — o `site` em `astro.config.ts` é o apex, e canonical
   divergente do domínio servido é erro de SEO.
4. O certificado TLS é emitido automaticamente. A propagação de DNS costuma
   levar de minutos a algumas horas.

Depois que o domínio estiver ativo, confira:

```bash
curl -sI https://harnessengineering.com.br | head -1
curl -s  https://harnessengineering.com.br/robots.txt | head -3
curl -s  https://harnessengineering.com.br/sitemap-index.xml | head -3
```

### 4. Proteção da branch

Em Settings → Branches do GitHub, para a `main`:

- exigir pull request antes do merge;
- exigir os checks: `Lint, tipos, testes e build` (CI) e `Gate de maturidade`
  (Harness Score);
- exigir branch atualizada com a base antes do merge.

Sem isso, o gate de maturidade descrito no
[ADR 0001](../spec/decisions/0001-adopt-harness-score.md) reporta a falha mas
não impede o merge.

## Previews

Todo PR ganha uma URL de preview da Vercel. É onde se revisa o artigo
renderizado antes do merge — e é o lugar certo para conferir o índice lateral, o
comportamento do Mermaid e o botão de copiar código, que dependem de JavaScript
e não aparecem no diff.

Preview usa o mesmo build de produção, então o número exibido em `/quality`
naquela URL é o do estado daquele PR.

## Rollback

**Pela Vercel (imediato):** Deployments → selecione o deploy anterior →
"Promote to Production". Não requer novo build e é o caminho para incidente.

**Pelo Git (definitivo):** reverta o commit na `main`; a Vercel builda e publica
o revert. Use quando a causa está no código e precisa sumir do histórico
publicado.

## O que o CI faz (e o que não faz)

| Workflow         | Dispara em         | Faz                                                                                                    |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------ |
| `ci.yml`         | push na `main`, PR | Prettier, ESLint, `astro check`, build, Vitest; publica o `dist/` como artefato                        |
| `quality.yml`    | push na `main`, PR | `harness-score` com `min-level`; comenta o delta no PR; na `main`, commita badge, histórico e baseline |
| `lighthouse.yml` | push na `main`, PR | Lighthouse CI contra o `dist/`; publica os relatórios                                                  |

Nenhum deles faz deploy.

O `quality.yml` é o único com permissão de escrita: ele commita
`data/harness-history.json`, `public/harness-badge.svg` e `quality/baseline.json`
quando a pontuação muda, com `[skip ci]` na mensagem para não realimentar o
pipeline.

## Se o build da Vercel falhar

1. **`npm ci` falhou** — `package-lock.json` fora de sincronia com o
   `package.json`. Rode `npm install` localmente e commite o lockfile.
2. **Versão de Node** — confirme 22.x em Settings → General.
3. **`astro check` reprovou** — o `prebuild` e o build não rodam typecheck; se o
   erro é de tipo, ele aparece no CI, não na Vercel. Rode `npm run typecheck`.
4. **`[quality] varredura falhou`** — apenas aviso. O build segue com o
   baseline; a página `/quality` sinaliza que o dado não é da execução atual.
