import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Smoke test do build: as páginas existem, renderizaram conteúdo real e o
 * `<head>` carrega o que o site promete (canonical, JSON-LD, feeds).
 *
 * Depende de `npm run build` ter rodado antes. Sem `dist/`, a suíte falha com
 * uma mensagem explícita em vez de passar silenciosamente sem verificar nada.
 */

const DIST = join(process.cwd(), 'dist');
const distExists = existsSync(DIST);

function read(relativePath: string): string {
  return readFileSync(join(DIST, relativePath), 'utf8');
}

describe('dist/', () => {
  it('existe (rode `npm run build` antes de `npm test`)', () => {
    expect(distExists, 'dist/ não encontrado — rode `npm run build`').toBe(true);
  });
});

describe.skipIf(!distExists)('páginas geradas', () => {
  const PAGES = [
    'index.html',
    'journal/index.html',
    'journal/manifesto/index.html',
    'about/index.html',
    'quality/index.html',
  ];

  it.each(PAGES)('%s existe e tem conteúdo', (page) => {
    expect(existsSync(join(DIST, page)), `${page} não foi gerado`).toBe(true);
    expect(read(page).length).toBeGreaterThan(1000);
  });

  it.each(PAGES)('%s tem title e meta description preenchidos', (page) => {
    const html = read(page);
    const title = /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? '';
    const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';

    expect(title.trim().length).toBeGreaterThan(10);
    expect(description.trim().length).toBeGreaterThanOrEqual(80);
  });

  it.each(PAGES)('%s declara canonical absoluto', (page) => {
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(read(page))?.[1] ?? '';
    expect(canonical).toMatch(/^https:\/\/harnessengineering\.com\.br\//);
  });

  it.each(PAGES)('%s declara lang pt-BR', (page) => {
    expect(read(page)).toMatch(/<html lang="pt-BR"/);
  });
});

describe.skipIf(!distExists)('artefatos de SEO/GEO', () => {
  it('gera sitemap e RSS', () => {
    expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true);
    expect(existsSync(join(DIST, 'rss.xml'))).toBe(true);
  });

  it('publica robots.txt liberando os crawlers de IA', () => {
    const robots = read('robots.txt');
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
      expect(robots, `${bot} ausente do robots.txt`).toContain(bot);
    }
    expect(robots).toContain('Sitemap: https://harnessengineering.com.br/sitemap-index.xml');
  });

  it('inclui o RSS com os artigos publicados', () => {
    const rss = read('rss.xml');
    expect(rss).toContain('<language>pt-BR</language>');
    expect(rss).toContain('/journal/manifesto');
  });
});

describe.skipIf(!distExists)('JSON-LD do artigo', () => {
  const html = distExists ? read('journal/manifesto/index.html') : '';
  const raw = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';

  it('está presente e é JSON válido', () => {
    expect(raw.length).toBeGreaterThan(0);
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it('é um TechArticle com autor, publisher e datas', () => {
    const schema = JSON.parse(raw) as Record<string, unknown>;
    expect(schema['@type']).toBe('TechArticle');
    expect(schema['inLanguage']).toBe('pt-BR');
    expect(schema['datePublished']).toBeTruthy();
    expect((schema['author'] as Record<string, unknown>)['name']).toBeTruthy();
    expect((schema['publisher'] as Record<string, unknown>)['name']).toBe('Harness Engineering');
  });
});

describe.skipIf(!distExists)('conteúdo publicável', () => {
  const PAGES = [
    'index.html',
    'journal/index.html',
    'journal/manifesto/index.html',
    'about/index.html',
    'quality/index.html',
  ];

  // O manifesto discute a palavra "TODO" como conceito; a regra vale para o
  // texto renderizado, então checamos os marcadores em formato de placeholder.
  it.each(PAGES)('%s não contém placeholder não preenchido', (page) => {
    const html = read(page);
    expect(html).not.toMatch(/Lorem ipsum/i);
    expect(html).not.toMatch(/\bFIXME\b/);
    expect(html).not.toMatch(/\{\{\s*\w+\s*\}\}/);
    expect(html).not.toMatch(/\bundefined\b(?![\w-])/);
  });
});

describe.skipIf(!distExists)('página /quality', () => {
  const html = distExists ? read('quality/index.html') : '';

  it('publica o nível de maturidade medido', () => {
    expect(html).toMatch(/L[0-4]/);
    expect(html).toContain('harness-score');
  });

  it('lista as 36 verificações', () => {
    const rows = html.match(/>(CTX|SKL|AGT|HKS|SNS|CI|HYG)-\d{2}</g) ?? [];
    expect(rows.length).toBe(36);
  });

  it('mostra verificações reprovadas em vez de esconder', () => {
    expect(html).toContain('falha');
  });
});
