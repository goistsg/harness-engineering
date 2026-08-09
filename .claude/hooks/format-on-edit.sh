#!/usr/bin/env bash
#
# Feedback hook (PostToolUse). Formata o arquivo recém-editado com Prettier.
#
# Mantém o agente dentro do padrão do repositório sem gastar um ciclo de
# revisão humana com espaço em branco. Nunca falha o turno: formatação é
# conveniência, não gate — quem reprova estilo é o CI.

set -uo pipefail

payload=$(cat)

file_path=$(printf '%s' "$payload" |
  sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' |
  head -n 1)

[ -n "$file_path" ] || exit 0
[ -f "$file_path" ] || exit 0

case "$file_path" in
  *.ts | *.tsx | *.js | *.mjs | *.astro | *.json | *.md | *.mdx | *.css | *.yml | *.yaml) ;;
  *) exit 0 ;;
esac

repo_root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
[ -x "$repo_root/node_modules/.bin/prettier" ] || exit 0

"$repo_root/node_modules/.bin/prettier" --write --ignore-unknown "$file_path" >/dev/null 2>&1 || true
exit 0
