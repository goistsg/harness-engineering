import { describe, expect, it } from 'vitest';

import { SITE, AUTHOR, EDITORIAL_AXES, AXIS_IDS, getAxis } from '@/config/site';

describe('configuração do site', () => {
  it('usa URL absoluta em https, sem barra final', () => {
    expect(SITE.url).toMatch(/^https:\/\//);
    expect(SITE.url.endsWith('/')).toBe(false);
    expect(() => new URL(SITE.url)).not.toThrow();
  });

  it('tem description dentro da faixa útil para SERP', () => {
    expect(SITE.description.length).toBeGreaterThanOrEqual(80);
    expect(SITE.description.length).toBeLessThanOrEqual(160);
  });

  it('aponta para um repositório do GitHub', () => {
    expect(SITE.repository).toMatch(/^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/);
  });

  it('tem contato de segurança em formato de e-mail', () => {
    expect(SITE.securityContact).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});

describe('autoria', () => {
  // O nome é obrigatório porque vai para o JSON-LD de todo artigo. Headline e
  // bio podem estar vazias — nesse caso os componentes simplesmente não as
  // renderizam, em vez de publicar placeholder.
  it('declara um nome real', () => {
    expect(AUTHOR.name.trim().length).toBeGreaterThan(0);
    expect(AUTHOR.name).not.toMatch(/placeholder|seu nome/i);
  });

  it('não publica placeholder em nenhum campo textual', () => {
    for (const value of [AUTHOR.name, AUTHOR.headline, AUTHOR.bio]) {
      expect(value).not.toMatch(/\b(TODO|FIXME|XXX)\b/);
      expect(value).not.toMatch(/lorem ipsum/i);
    }
  });

  it('lista apenas URLs absolutas em sameAs', () => {
    for (const profile of AUTHOR.sameAs) {
      expect(() => new URL(profile)).not.toThrow();
      expect(profile).toMatch(/^https:\/\//);
    }
  });
});

describe('eixos editoriais', () => {
  it('declara exatamente os três eixos do produto', () => {
    expect(EDITORIAL_AXES).toHaveLength(3);
  });

  it('usa ids únicos em kebab-case', () => {
    for (const axis of EDITORIAL_AXES) {
      expect(axis.id).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
    }
    expect(new Set(AXIS_IDS).size).toBe(AXIS_IDS.length);
  });

  it('resolve cada id declarado', () => {
    for (const id of AXIS_IDS) {
      expect(getAxis(id).id).toBe(id);
    }
  });

  it('lança erro em eixo desconhecido em vez de devolver undefined', () => {
    // @ts-expect-error — validando o comportamento em tempo de execução.
    expect(() => getAxis('eixo-inexistente')).toThrow();
  });
});
