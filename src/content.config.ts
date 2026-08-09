import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

import { AXIS_IDS } from './config/site';

/**
 * Coleção `journal` — os artigos do site.
 *
 * O schema é estrito de propósito: frontmatter inválido derruba o build em vez
 * de publicar uma página incompleta. `axis` é validado contra os eixos
 * declarados em src/config/site.ts, então renomear um eixo lá quebra aqui até
 * que os artigos sejam atualizados.
 */
const journal = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/journal' }),
  schema: z.object({
    title: z.string().min(10).max(90),
    description: z
      .string()
      .min(80, 'description precisa de ao menos 80 caracteres para funcionar em SERP')
      .max(160, 'description acima de 160 caracteres é truncada pelos buscadores'),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    axis: z.enum(AXIS_IDS),
    tags: z.array(z.string()).min(1).max(6),
    draft: z.boolean().default(false),
    /** URL original, quando o artigo foi publicado antes em outro lugar. */
    canonical: z.url().optional(),
  }),
});

export const collections = { journal };
