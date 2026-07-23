import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const key = process.env.INDEXNOW_KEY ?? '748a39219ac649ab8452996fe1d35420';
const host = 'altpik.com';
const sitemapPath = join(process.cwd(), 'dist', 'sitemap-0.xml');

let sitemap;
try {
  sitemap = readFileSync(sitemapPath, 'utf8');
} catch {
  console.log('IndexNow: sitemap not found, skipping');
  process.exit(0);
}

const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (urls.length === 0) {
  console.log('IndexNow: no URLs in sitemap, skipping');
  process.exit(0);
}

const body = {
  host,
  key,
  keyLocation: `https://${host}/${key}.txt`,
  urlList: urls,
};

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

if (response.ok || response.status === 202) {
  console.log(`IndexNow: submitted ${urls.length} URL(s) (HTTP ${response.status})`);
} else {
  const text = await response.text();
  console.warn(`IndexNow: request failed HTTP ${response.status}: ${text}`);
}
