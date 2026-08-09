# Política de segurança

## Escopo

Este repositório contém um site estático publicado em
<https://harnessengineering.com.br>. Não há servidor de aplicação, banco de
dados, autenticação ou endpoint que receba dados de usuário.

Na prática, a superfície relevante é:

- o conteúdo servido (HTML, CSS, JavaScript gerado no build);
- a cadeia de dependências de build e o pipeline de CI;
- os hooks e scripts em `.claude/` e `scripts/`, que executam localmente na
  máquina de quem desenvolve.

**Em escopo:** XSS no HTML gerado, dependência comprometida, exposição
acidental de segredo, workflow de CI com permissão excessiva ou passível de
injeção, script deste repositório que execute conteúdo não confiável.

**Fora de escopo:** vulnerabilidades da infraestrutura da Vercel ou do GitHub
(reporte diretamente a eles), ausência de cabeçalhos de segurança que não se
aplicam a site estático sem sessão, e resultados de scanner automático sem
demonstração de impacto.

## Como reportar

Envie um e-mail para **goistsg@gmail.com** com o assunto começando por
`[SECURITY]`.

**Não abra issue pública** para vulnerabilidade ainda não corrigida.

Inclua o que permita reproduzir:

- descrição da vulnerabilidade e do impacto;
- passos de reprodução, ou prova de conceito;
- versão, commit ou URL afetada;
- se você pretende divulgar publicamente e em que prazo.

## O que esperar

| Etapa                             | Prazo                |
| --------------------------------- | -------------------- |
| Confirmação de recebimento        | até 3 dias úteis     |
| Avaliação inicial e classificação | até 7 dias corridos  |
| Correção ou plano com prazo       | até 30 dias corridos |

Se o prazo escorregar, você recebe uma atualização com o motivo. Silêncio não é
resposta aceitável, e cobrança é legítima.

## Divulgação responsável

O pedido é o padrão: dê tempo para a correção antes de tornar público. Como este
é um projeto pessoal e de baixa criticidade, **90 dias** é um teto confortável —
se a correção sair antes, a divulgação pode ser imediata após o deploy.

Quem reportar de boa-fé é creditado no `CHANGELOG.md`, salvo pedido em contrário.
Não há programa de recompensa financeira.

## Compromissos deste repositório

- Nenhum segredo versionado. A única variável de ambiente é pública por natureza
  (`PUBLIC_*`) e opcional.
- `.gitignore` cobre `.env` e variantes; a verificação `HYG-03` do
  [harness-score](https://github.com/paladini/harness-score) roda em todo push e
  reprova arquivo `.env` desprotegido no repositório.
- Workflows de CI declaram `permissions` explicitamente; apenas o workflow de
  qualidade tem escrita, restrita ao commit do badge, do histórico e do baseline.
- Mermaid roda com `securityLevel: 'strict'`, o que impede HTML arbitrário vindo
  do código de um diagrama.
- Dependências de execução são mínimas. As vulnerabilidades reportadas hoje pelo
  `npm audit` estão todas em dependências transitivas do `@lhci/cli`, ferramenta
  de CI que não entra no bundle publicado. Isso é acompanhado, não ignorado: se
  alguma passar a afetar o build ou o conteúdo servido, a ferramenta é trocada.
