import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { AXIS_IDS } from '@/config/site';

/**
 * As regras editoriais de spec/content-guidelines.md, aplicadas como gate.
 *
 * A intenção é explícita: regra de GEO que depende de disciplina humana é
 * abandonada no terceiro artigo. Aqui ela reprova o build.
 */

const CONTENT_DIR = join(process.cwd(), 'src', 'content', 'journal');

interface ParsedArticle {
  readonly file: string;
  readonly frontmatter: Record<string, string>;
  readonly body: string;
}

function parseArticle(file: string): ParsedArticle {
  const raw = readFileSync(join(CONTENT_DIR, file), 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);

  if (!match) {
    throw new Error(`${file}: frontmatter ausente ou malformado.`);
  }

  const [, rawFrontmatter = '', body = ''] = match;
  const frontmatter: Record<string, string> = {};

  for (const line of rawFrontmatter.split('\n')) {
    const entry = /^([a-zA-Z]+):\s*(.*)$/.exec(line);
    if (entry?.[1]) {
      frontmatter[entry[1]] = (entry[2] ?? '').trim().replace(/^['"]|['"]$/g, '');
    }
  }

  return { file, frontmatter, body };
}

const files = readdirSync(CONTENT_DIR).filter((file) => file.endsWith('.mdx'));
const articles = files.map(parseArticle);

describe('coleção journal', () => {
  it('tem ao menos um artigo', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('não tem slug duplicado depois de remover o prefixo numérico', () => {
    const slugs = files.map((file) => file.replace(/^\d+-/, '').replace(/\.mdx$/, ''));
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe.each(articles)('$file', ({ file, frontmatter, body }) => {
  it('segue o padrão de nome NN-slug-em-kebab-case.mdx', () => {
    expect(file).toMatch(/^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.mdx$/);
  });

  it('declara title, description, pubDate, axis e tags', () => {
    for (const field of ['title', 'description', 'pubDate', 'axis', 'tags']) {
      expect(frontmatter[field], `campo "${field}" ausente`).toBeTruthy();
    }
  });

  it('usa um eixo editorial válido', () => {
    expect(AXIS_IDS).toContain(frontmatter['axis']);
  });

  it('tem description entre 80 e 160 caracteres', () => {
    const description = frontmatter['description'] ?? '';
    expect(
      description.length,
      `description tem ${description.length} caracteres`
    ).toBeGreaterThanOrEqual(80);
    expect(
      description.length,
      `description tem ${description.length} caracteres`
    ).toBeLessThanOrEqual(160);
  });

  // A regra que sustenta a estratégia de GEO do site: um mecanismo generativo
  // consegue extrair a resposta porque a pergunta está no heading.
  it('tem ao menos um H2 em forma de pergunta direta', () => {
    const h2s = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]?.trim() ?? '');
    const questions = h2s.filter((heading) => heading.endsWith('?'));

    expect(
      questions.length,
      `nenhum "## ...?" encontrado. H2 presentes: ${h2s.join(' | ') || 'nenhum'}`
    ).toBeGreaterThanOrEqual(1);
  });

  it('declara a linguagem em todo bloco de código', () => {
    const fences = [...body.matchAll(/^```(\w*)/gm)].map((match) => match[1] ?? '');
    // Cercas alternam abertura/fechamento; só as de abertura (índice par) declaram linguagem.
    const openings = fences.filter((_, index) => index % 2 === 0);
    expect(openings.every((language) => language.length > 0)).toBe(true);
  });

  // Marcadores são comparados com sensibilidade a maiúsculas de propósito:
  // "todo" é palavra corrente em português e não pode reprovar um artigo.
  it('não contém marcador de rascunho no corpo', () => {
    expect(body).not.toMatch(/\b(TODO|FIXME|XXX)\b/);
    expect(body).not.toMatch(/lorem ipsum/i);
  });
});
