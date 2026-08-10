import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE } from './src/config/site';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  integrations: [mdx(), sitemap()],
  /**
   * Estratégia de URL por idioma, fixada antes do primeiro deploy de produção.
   *
   * `prefixDefaultLocale: false` mantém o português na raiz (`/about`), e
   * qualquer idioma futuro entra prefixado (`/en/about`). Declarado
   * explicitamente mesmo sendo o padrão do Astro, porque é a única decisão de
   * i18n que não dá para adiar: mover o pt-BR para `/pt-br/` depois invalida
   * toda URL já publicada, indexada e citada. Ver ADR 0003.
   */
  i18n: {
    defaultLocale: SITE.language,
    locales: [SITE.language],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    // Shiki segue sendo o realce nativo do Astro. O tema espelha os tokens
    // documentados em spec/product-spec.md.
    syntaxHighlight: { type: 'shiki' },
    shikiConfig: {
      theme: 'one-dark-pro',
      wrap: false,
    },
  },
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
