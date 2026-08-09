---
description: Cria um novo artigo MDX do journal seguindo as regras editoriais e de GEO
argument-hint: <eixo> <tese em uma frase>
---

Crie um novo artigo do journal seguindo a skill `new-article`.

Argumentos recebidos: $ARGUMENTS

Passos:

1. Leia `.claude/skills/new-article/SKILL.md` e `spec/content-guidelines.md`.
2. Liste `src/content/journal/` para determinar o próximo número da sequência.
3. Se o eixo ou a tese não vieram nos argumentos, pergunte antes de escrever — não
   invente o ângulo do artigo.
4. Escreva o arquivo em `src/content/journal/NN-slug.mdx` com frontmatter completo e
   ao menos um `##` em forma de pergunta direta.
5. Rode `npm test -- content-rules` e `npm run build`.
6. Reporte o caminho do arquivo criado e a URL que ele terá em produção.
