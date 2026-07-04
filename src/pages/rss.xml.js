import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/site';

export async function GET(context) {
  const articles = await getCollection('articles');
  const sorted = articles
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
    .slice(0, 50);

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
    customData: `<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" />`,
    items: sorted.map((article) => ({
      title: article.data.seoTitle ?? article.data.title,
      description: article.data.seoDescription ?? article.data.description,
      pubDate: article.data.publishedAt,
      link: `/articles/${article.id}/`,
      categories: [article.data.categoryLabel],
    })),
  });
}
