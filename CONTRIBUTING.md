# Como contribuir

Este é o repositório de um journal com um autor. A contribuição mais valiosa
aqui não é código: é **discordância técnica fundamentada**. Se um artigo afirma
algo que sua experiência contradiz, abra uma issue com o caso concreto.

## O que é bem-vindo

| Tipo                                              | Como                                        |
| ------------------------------------------------- | ------------------------------------------- |
| Correção técnica em artigo                        | Issue com a evidência, ou PR direto no MDX  |
| Erro de português ou link quebrado                | PR direto                                   |
| Bug no site (layout, acessibilidade, performance) | Issue com navegador e passos                |
| Sugestão de pauta                                 | Issue descrevendo o problema, não a solução |
| Melhoria de infraestrutura                        | Issue antes do PR, para alinhar o escopo    |

## O que provavelmente será recusado

- Mudança de identidade visual sem discussão prévia — os tokens são decisão de
  produto, documentada em [`spec/product-spec.md`](./spec/product-spec.md).
- Troca de framework ou de dependência estrutural sem ADR.
- Adição de dependência que o projeto consegue resolver com o que já tem.
- Afrouxamento de um gate de qualidade para fazer uma mudança passar.

## Fluxo

```bash
git checkout -b feat/descricao-curta
# ... suas mudanças ...
npm run lint && npm run typecheck
npm run build && npm test
npm run quality
git commit -m "feat: descrição no imperativo"
```

Abra o PR contra a `main`. O CI roda formatação, lint, tipos, build, testes,
Lighthouse e o gate de maturidade.

## Conventional Commits

Obrigatório desde o primeiro commit. Formato:

```
<tipo>(<escopo opcional>): <descrição no imperativo, minúscula, sem ponto final>
```

| Tipo       | Uso                                         |
| ---------- | ------------------------------------------- |
| `feat`     | Nova funcionalidade ou nova página          |
| `fix`      | Correção de bug                             |
| `content`  | Artigo novo ou edição de artigo             |
| `docs`     | README, `docs/`, `spec/`                    |
| `style`    | Formatação, sem mudança de comportamento    |
| `refactor` | Reestruturação sem mudança de comportamento |
| `test`     | Testes                                      |
| `build`    | Dependências, configuração de build         |
| `ci`       | Workflows                                   |
| `chore`    | Manutenção que não se encaixa acima         |

Exemplos reais deste repositório:

```
feat(quality): publica o resultado do harness-score em /quality
content: adiciona o manifesto como artigo 00
docs(spec): registra a decisão de adotar o harness-score como ADR 0001
fix(a11y): troca o acento por fg-muted em texto pequeno sobre surface
```

Descrição em português, no imperativo ("adiciona", não "adicionado"), com o
porquê no corpo do commit quando a mudança não for óbvia.

## O que o CI exige

| Verificação                  | Comando local                                         |
| ---------------------------- | ----------------------------------------------------- |
| Formatação                   | `npm run format:check` (corrija com `npm run format`) |
| Lint                         | `npm run lint`                                        |
| Tipos                        | `npm run typecheck`                                   |
| Build                        | `npm run build`                                       |
| Testes                       | `npm test`                                            |
| Maturidade do harness        | `npm run quality`                                     |
| Performance e acessibilidade | `npm run lighthouse`                                  |

O hook de pre-commit roda ESLint e Prettier nos arquivos preparados, então a
maior parte disso é resolvida antes de você abrir o PR.

### O gate de maturidade

Se o PR derrubar o nível do `harness-score`, o build reprova. Para diagnosticar:

```bash
npx harness-score --diff quality/baseline.json
```

O diff diz **qual verificação** parou de passar. A correção é no harness — não
em desabilitar a verificação. Exclusão exige justificativa em ADR
(ver [ADR 0001](./spec/decisions/0001-adopt-harness-score.md)).

## Contribuindo com um artigo

Leia [`spec/content-guidelines.md`](./spec/content-guidelines.md) antes. O
essencial:

- nome do arquivo `NN-slug-em-kebab-case.mdx` em `src/content/journal/`;
- frontmatter completo, com `description` entre 80 e 160 caracteres;
- **ao menos um `##` em forma de pergunta direta** — regra verificada por teste;
- todo bloco de código com linguagem declarada;
- comece em `##`; o `#` é gerado pelo layout.

Artigos são licenciados sob [CC BY-NC-SA 4.0](./src/content/LICENSE-CONTENT); ao
enviar um PR de conteúdo você concorda com essa licença.

## Padrões de código

Detalhados nas regras escopadas em [`.cursor/rules/`](./.cursor/rules/), que
valem tanto para humanos quanto para agentes:

- nenhum hexadecimal literal em componente — use os tokens do `@theme`;
- texto pequeno em `text-accent` sobre `bg-surface` é proibido (3.94:1, abaixo
  de AA); use `text-fg-muted`;
- toda identidade pública sai de `src/config/site.ts`;
- JavaScript no cliente só com interação real;
- nunca publique valor inventado: sem dado real, o componente não renderiza.

## Trabalhando com agentes de código

O repositório traz um harness pronto: [`AGENTS.md`](./AGENTS.md) como contexto,
regras escopadas em `.cursor/rules/`, skills e comandos em `.claude/`, e hooks
que bloqueiam edição de ADR publicado e formatam o que foi editado.

Contribuição gerada por agente é bem-vinda, com uma condição: você revisou e
entende o que está enviando. O gate de qualidade cobre a máquina; a
responsabilidade pelo conteúdo é de quem abre o PR.
