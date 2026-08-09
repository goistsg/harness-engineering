import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { SITE, getAxis } from '@/config/site';
import { getPublishedArticles, toUrlSlug } from '@/lib/journal';

export const GET: APIRoute = async (context) => {
  const articles = await getPublishedArticles();

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? SITE.url,
    trailingSlash: false,
    customData: `<language>${SITE.language}</language>`,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.pubDate,
      link: `/journal/${toUrlSlug(article.id)}`,
      categories: [getAxis(article.data.axis).label, ...article.data.tags],
    })),
  });
};
