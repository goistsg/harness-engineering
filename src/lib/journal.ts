import { getCollection, type CollectionEntry } from 'astro:content';

import { EDITORIAL_AXES, type AxisId, type EditorialAxis } from '@/config/site';

export type Article = CollectionEntry<'journal'>;

/**
 * Artigos publicáveis, do mais recente para o mais antigo.
 *
 * Rascunhos ficam de fora do build de produção mas continuam visíveis em
 * desenvolvimento, para que dê para revisar a página renderizada antes de
 * publicar.
 */
export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await getCollection('journal', ({ data }) => {
    return import.meta.env.DEV || !data.draft;
  });

  return articles.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export interface AxisGroup {
  readonly axis: EditorialAxis;
  readonly articles: readonly Article[];
}

/** Agrupa artigos por eixo editorial, preservando a ordem declarada dos eixos. */
export function groupByAxis(articles: readonly Article[]): AxisGroup[] {
  return EDITORIAL_AXES.map((axis) => ({
    axis,
    articles: articles.filter((article) => article.data.axis === axis.id),
  }));
}

/** Slug de URL sem o prefixo numérico de ordenação (`00-manifesto` → `manifesto`). */
export function toUrlSlug(id: string): string {
  return id.replace(/^\d+-/, '');
}

export function articleUrl(article: Article): string {
  return `/journal/${toUrlSlug(article.id)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function axisLabel(id: AxisId): string {
  return EDITORIAL_AXES.find((axis) => axis.id === id)?.label ?? id;
}
