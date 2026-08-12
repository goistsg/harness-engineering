import { getImage } from 'astro:assets';
import type { APIRoute } from 'astro';

import { SITE } from '@/config/site';
import logo from '@/assets/logo.png';

/**
 * Manifesto do site, gerado no build.
 *
 * Existe pelos ícones de 192 e 512 px, que o favicon SVG não cobre: Android e
 * as telas de instalação de PWA só leem PNG desta lista. Os dois saem do mesmo
 * `logo.png` pelo pipeline de imagem do Astro, então não há binário derivado
 * commitado para envelhecer fora de sincronia com a marca.
 */
export const GET: APIRoute = async () => {
  const [icon192, icon512] = await Promise.all([
    getImage({ src: logo, width: 192, height: 192, format: 'png' }),
    getImage({ src: logo, width: 512, height: 512, format: 'png' }),
  ]);

  const manifest = {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    lang: SITE.language,
    start_url: '/',
    display: 'browser',
    background_color: '#18181B',
    theme_color: '#18181B',
    icons: [
      { src: icon192.src, sizes: '192x192', type: 'image/png' },
      { src: icon512.src, sizes: '512x512', type: 'image/png' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
};
