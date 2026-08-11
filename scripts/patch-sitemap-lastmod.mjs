import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const sitemapPath = join(process.cwd(), 'dist', 'sitemap-0.xml');

const STATIC_PATHS = ['/', '/reviews', '/about', '/contact', '/privacy', '/terms'];

const lastmodByPath = {};
const latestByCategory = {};
let siteLatestMs = 0;

for (const file of readdirSync(articlesDir)) {
  if (!file.endsWith('.md')) continue;

  const content = readFileSync(join(articlesDir, file), 'utf8');
  const slug = file.replace(/\.md$/, '');
  const updatedMatch = content.match(/^updatedAt:\s*(\S+)/m);
  const publishedMatch = content.match(/^publishedAt:\s*(\S+)/m);
  const categoryMatch = content.match(/^category:\s*(\S+)/m);
  const rawDate = updatedMatch?.[1] ?? publishedMatch?.[1];
  const category = categoryMatch?.[1];

  if (!rawDate) continue;

  const iso = new Date(rawDate).toISOString();
  const ms = Date.parse(iso);
  lastmodByPath[`/articles/${slug}`] = iso;

  if (Number.isFinite(ms) && ms > siteLatestMs) {
    siteLatestMs = ms;
  }

  if (category) {
    const prev = latestByCategory[category];
    if (!prev || ms > Date.parse(prev)) {
      latestByCategory[category] = iso;
    }
  }
}

for (const [category, iso] of Object.entries(latestByCategory)) {
  lastmodByPath[`/categories/${category}`] = iso;
}

if (siteLatestMs > 0) {
  const siteIso = new Date(siteLatestMs).toISOString();
  for (const path of STATIC_PATHS) {
    lastmodByPath[path] = siteIso;
  }
}

let xml;
try {
  xml = readFileSync(sitemapPath, 'utf8');
} catch {
  console.log('Sitemap patch: dist/sitemap-0.xml not found, skipping');
  process.exit(0);
}

let patched = 0;
xml = xml.replace(/<url><loc>(https:\/\/altpik\.com[^<]*)<\/loc><\/url>/g, (match, loc) => {
  const path = new URL(loc).pathname;
  const lastmod = lastmodByPath[path];
  if (!lastmod) return match;
  patched += 1;
  return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
});

writeFileSync(sitemapPath, xml);
console.log(
  `Sitemap patch: added lastmod to ${patched} URL(s) (${Object.keys(lastmodByPath).length} mapped)`,
);
