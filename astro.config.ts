import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE } from './src/config/site';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  integrations: [mdx(), sitemap()],
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
