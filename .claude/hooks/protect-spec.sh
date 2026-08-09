#!/usr/bin/env bash
#
# Gate hook (PreToolUse). Bloqueia edição de ADR já publicado.
#
# Um ADR registra uma decisão tomada em um momento, com o contexto daquele
# momento. Reescrevê-lo apaga o histórico que dá valor ao registro. Para mudar
# de ideia, escreva um novo ADR que substitua o anterior.
#
# Protocolo: recebe o payload do tool call em stdin; exit 2 bloqueia a chamada e
# devolve o stderr ao agente como motivo.

set -euo pipefail

payload=$(cat)

# Extrai file_path sem depender de jq (não garantido no ambiente do agente).
file_path=$(printf '%s' "$payload" |
  sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' |
  head -n 1)

[ -n "$file_path" ] || exit 0

repo_root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
rel_path=${file_path#"$repo_root"/}

case "$rel_path" in
  spec/decisions/*.md) ;;
  *) exit 0 ;;
esac

# Arquivo ainda não versionado: é um ADR novo, pode escrever.
if ! git -C "$repo_root" ls-files --error-unmatch "$rel_path" >/dev/null 2>&1; then
  exit 0
fi

cat >&2 <<EOF
Bloqueado: $rel_path é um ADR já publicado e ADRs são imutáveis.

Para revisar esta decisão, crie um novo ADR em spec/decisions/ com o próximo
número da sequência, marque nele que ele substitui $(basename "$rel_path"), e
descreva o que mudou no contexto desde então.

Regra registrada em .cursor/rules/spec-sync.mdc.
EOF
exit 2
