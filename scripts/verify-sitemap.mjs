import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const sitemapPath = join(process.cwd(), 'dist', 'sitemap-0.xml');

const articleSlugs = readdirSync(articlesDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''))
  .sort();

let xml;
try {
  xml = readFileSync(sitemapPath, 'utf8');
} catch {
  console.error('Sitemap verify: dist/sitemap-0.xml not found');
  process.exit(1);
}

const sitemapSlugs = [...xml.matchAll(/<loc>https:\/\/altpik\.com\/articles\/([^<]+)<\/loc>/g)]
  .map((match) => match[1])
  .sort();

const articleSet = new Set(articleSlugs);
const sitemapSet = new Set(sitemapSlugs);

const missing = articleSlugs.filter((slug) => !sitemapSet.has(slug));
const extra = sitemapSlugs.filter((slug) => !articleSet.has(slug));
const lastmodCount = [...xml.matchAll(/<lastmod>/g)].length;

if (missing.length || extra.length) {
  if (missing.length) {
    console.error(`Sitemap verify: missing articles (${missing.length}): ${missing.join(', ')}`);
  }
  if (extra.length) {
    console.error(`Sitemap verify: extra articles (${extra.length}): ${extra.join(', ')}`);
  }
  process.exit(1);
}

if (lastmodCount === 0) {
  console.error('Sitemap verify: no <lastmod> tags found (patch may have failed)');
  process.exit(1);
}

console.log(
  `Sitemap verify: OK — ${articleSlugs.length} articles, ${lastmodCount} lastmod tag(s)`,
);
