import { describe, expect, it } from 'vitest';

import {
  SITE,
  AUTHOR,
  EDITORIAL_AXES,
  AXIS_IDS,
  getAxis,
  LOCALES,
  DEFAULT_LOCALE,
} from '@/config/site';

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

describe('idiomas', () => {
  it('tem o idioma padrão em primeiro, disponível e sem prefixo de rota', () => {
    expect(DEFAULT_LOCALE).toBe(LOCALES[0]);
    expect(DEFAULT_LOCALE.code).toBe(SITE.language);
    expect(DEFAULT_LOCALE.available).toBe(true);
    expect(DEFAULT_LOCALE.pathPrefix).toBe('');
  });

  // A assimetria é a decisão do ADR 0003: só o idioma padrão mora na raiz.
  // Um segundo locale sem prefixo colidiria com as URLs já publicadas.
  it('exige prefixo de rota em todo idioma que não seja o padrão', () => {
    for (const locale of LOCALES.filter((candidate) => candidate.code !== SITE.language)) {
      expect(locale.pathPrefix).toMatch(/^\/[a-z]{2}(?:-[A-Z]{2})?$/);
    }
  });

  it('usa códigos e rótulos únicos', () => {
    expect(new Set(LOCALES.map((locale) => locale.code)).size).toBe(LOCALES.length);
    expect(new Set(LOCALES.map((locale) => locale.short)).size).toBe(LOCALES.length);
  });

  it('rotula cada idioma com duas letras maiúsculas e um nome preenchido', () => {
    for (const locale of LOCALES) {
      expect(locale.short).toMatch(/^[A-Z]{2}$/);
      expect(locale.label.trim().length).toBeGreaterThan(0);
    }
  });
});
