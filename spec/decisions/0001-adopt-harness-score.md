# ADR 0001 — Adotar o harness-score como gate de qualidade

- **Status:** Aceito
- **Data:** 2026-08-09
- **Decisor:** Tiago Gois

## Contexto

O Harness Engineering publica conteúdo sobre qualidade de engenharia. Um site
que dá conselho sobre engenharia e não expõe a própria prática está pedindo
confiança que não ofereceu — e a assimetria é justamente o que o projeto
critica.

Existe uma segunda razão, mais concreta. Este repositório é trabalhado com
agentes de código. A qualidade do que um agente produz depende diretamente do
harness ao redor dele: contexto escrito, regras escopadas, testes, gates de CI,
hooks. Esse harness se degrada silenciosamente — ninguém abre um PR chamado
"remover as salvaguardas". Ele apodrece por omissão, um atalho de cada vez.

Precisamos de duas coisas ao mesmo tempo:

1. Um sinal objetivo e determinístico da maturidade do harness, que não dependa
   de autoavaliação nem de julgamento humano recorrente.
2. Que esse sinal seja **público**, porque uma métrica interna que só o autor vê
   não constitui prova para o leitor.

## Decisão

Adotar o [harness-score](https://github.com/paladini/harness-score) como gate de
qualidade do repositório, desde o primeiro commit, com quatro pontos de integração:

1. **Dependência de desenvolvimento.** `harness-score` no `package.json` e
   `npm run quality` disponível localmente. O sinal precisa ser reproduzível na
   máquina de quem escreve, não só no CI.
2. **Gate no CI.** `.github/workflows/quality.yml` roda o scanner em todo PR e
   em todo push na `main`, com `min-level` no patamar já conquistado.
   **Regressão de maturidade reprova o build.** Não é aviso, não é comentário
   informativo: é erro. Aviso amarelo é ignorado em duas semanas.
3. **Publicação.** A varredura roda no `prebuild` (portanto também no build da
   Vercel) e alimenta a página [`/quality`](https://harnessengineering.com.br/quality),
   com nível, dimensões, histórico e **as verificações que falham**. O badge no
   README aponta para o SVG regenerado a cada push na `main`.
4. **Baseline versionado.** `quality/baseline.json` permite `--diff`, que
   responde "qual verificação regrediu" em vez de apenas "o nível caiu".

### A regra que dá sentido ao resto

Exclusão de verificação via `.harness-score.json` só é aceitável quando a
verificação **não se aplica** ao projeto, e exige justificativa em ADR. Exclusão
silenciosa transforma `/quality` em propaganda.

Hoje `.harness-score.json` não exclui nada. O repositório reprova em `HYG-08`
(interpolação de variáveis de ambiente em configuração MCP) porque não usa MCP.
Criar um arquivo vazio para ganhar 3 pontos seria exatamente o comportamento que
esta regra existe para impedir. A verificação fica vermelha, em público.

## Alternativas consideradas

### Checklist manual de qualidade em CONTRIBUTING.md

**Rejeitada.** Um checklist depende de quem revisa lembrar de aplicá-lo, e é
avaliado por julgamento — o que significa que o padrão muda conforme o dia e a
pressa. Não produz série histórica nem sinal comparável entre commits. É a
solução que já falha em quase todo repositório que a adota.

### SonarQube, CodeClimate ou Codacy

**Rejeitada.** Medem propriedades do _código_: cobertura, duplicação,
complexidade ciclomática, code smells. São úteis, mas ortogonais ao problema
aqui: nenhuma delas sabe se existe `AGENTS.md`, se as regras têm frontmatter
válido, se há hook de gate antes de comando arriscado, ou se o CI executa os
testes. Para um site estático de cinco páginas, as métricas tradicionais de
código seriam quase todas triviais e nada informativas.

### Escrever um script próprio de verificação

**Rejeitada.** Custo de manutenção alto e, pior, o critério seria definido pela
mesma pessoa avaliada por ele. Uma ferramenta externa com modelo de maturidade
publicado é mais difícil de dobrar em causa própria. O ganho de usar algo de
terceiro é exatamente não controlar a régua.

### Adotar a ferramenta, mas sem falhar o build

**Rejeitada.** É a versão que parece prudente e não muda nada. Métrica que não
bloqueia é métrica que se ignora; o gate é o mecanismo, o número é só o
indicador.

## Consequências

### Positivas

- Sinal objetivo e reproduzível da maturidade do harness, em toda mudança.
- Prova pública verificável, que é o diferencial editorial do projeto.
- O harness melhora por construção: passar de L2 para L4 exigiu escrever
  `AGENTS.md`, regras escopadas, skills, subagente, hooks de gate e de feedback,
  testes e CI. Todo esse trabalho é infraestrutura que o projeto usaria de
  qualquer forma.
- O `--diff` transforma "o nível caiu" em "a verificação X parou de passar",
  que é acionável.

### Negativas e riscos aceitos

- **Acoplamento a ferramenta de terceiro.** Se o `harness-score` for
  descontinuado ou mudar o modelo de maturidade, o gate quebra. Mitigação: a
  versão é fixada no `package.json`, o modelo de níveis está documentado em
  `.claude/skills/quality-gate/SKILL.md`, e a saída em JSON é estável o
  suficiente para ser reproduzida se necessário.
- **Custo de manter L4.** Cada dimensão precisa continuar acima do limiar. Uma
  mudança grande pode exigir trabalho de harness junto — que é o ponto, mas
  custa tempo real.
- **Risco de otimizar para a métrica.** O modo de falha óbvio é adicionar
  artefatos vazios para pontuar. A defesa é a regra de exclusão acima e o fato
  de a página `/quality` mostrar as evidências de cada verificação, não só o
  número.
- **Uma mudança de versão do scanner pode alterar a pontuação sem que o
  repositório mude.** O campo `maturityModelChanged` do `--diff` sinaliza isso;
  quando ocorrer, o baseline é atualizado com a mudança registrada no commit.

## Estado na adoção

A primeira varredura, feita quando existiam apenas os artefatos de contexto,
skills e hooks — antes de CI, testes e licença — deu **L2 · Guided, 89/108
(82%)**, com o relatório apontando exatamente o que faltava.

Ao fim do scaffolding, com CI, testes, licença e higiene no lugar:

| Dimensão           | Pontuação                                |
| ------------------ | ---------------------------------------- |
| Context & Guides   | 20/20                                    |
| Skills & Commands  | 17/17                                    |
| Hooks & Guardrails | 14/14                                    |
| Sensors & Feedback | 20/20                                    |
| CI Feedback        | 14/14                                    |
| Hygiene & Safety   | 20/23                                    |
| **Total**          | **105/108 (97%) — L4 · Self-correcting** |

Os 3 pontos ausentes são a verificação `HYG-08`, mantida reprovada pelo motivo
descrito acima.

`min-level` no workflow está fixado em **4**: o patamar medido, nunca um valor
aspiracional. Quando a pontuação subir, o piso sobe junto — o procedimento está
em `.claude/skills/quality-gate/SKILL.md`.
