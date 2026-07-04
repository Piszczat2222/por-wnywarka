import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const sitemapPath = join(process.cwd(), 'dist', 'sitemap-0.xml');

const lastmodByPath = {};

for (const file of readdirSync(articlesDir)) {
  if (!file.endsWith('.md')) continue;

  const content = readFileSync(join(articlesDir, file), 'utf8');
  const slug = file.replace(/\.md$/, '');
  const updatedMatch = content.match(/^updatedAt:\s*(\S+)/m);
  const publishedMatch = content.match(/^publishedAt:\s*(\S+)/m);
  const rawDate = updatedMatch?.[1] ?? publishedMatch?.[1];

  if (rawDate) {
    lastmodByPath[`/articles/${slug}/`] = new Date(rawDate).toISOString();
  }
}

let xml;
try {
  xml = readFileSync(sitemapPath, 'utf8');
} catch {
  console.log('Sitemap patch: dist/sitemap-0.xml not found, skipping');
  process.exit(0);
}

xml = xml.replace(/<url><loc>(https:\/\/altpik\.com\/articles\/[^<]+)<\/loc><\/url>/g, (match, loc) => {
  const path = new URL(loc).pathname;
  const lastmod = lastmodByPath[path];
  if (!lastmod) return match;
  return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
});

writeFileSync(sitemapPath, xml);
console.log(`Sitemap patch: added lastmod to ${Object.keys(lastmodByPath).length} article URL(s)`);
