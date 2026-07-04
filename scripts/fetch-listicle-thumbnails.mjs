import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const outDir = join(process.cwd(), 'public', 'images', 'thumbnails');
const mapPath = join(process.cwd(), 'src', 'data', 'listicle-thumbnails.json');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const GOOGLE_KEY = process.env.GOOGLE_CSE_API_KEY ?? process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CSE_ID ?? process.env.GOOGLE_CX;
const SKIP = process.env.THUMBNAILS_SKIP === '1';

mkdirSync(outDir, { recursive: true });

if (SKIP) {
  console.log('Listicle thumbnails: skipped (THUMBNAILS_SKIP=1)');
  process.exit(0);
}

/** @typedef {{ name: string; searchQuery?: string }} ListItemRef */

/** @returns {ListItemRef[]} */
function collectListItems() {
  /** @type {Map<string, ListItemRef>} */
  const items = new Map();

  for (const file of readdirSync(articlesDir)) {
    if (!file.endsWith('.md')) continue;
    const content = readFileSync(join(articlesDir, file), 'utf8');
    if (!content.includes('articleType: listicle')) continue;

    const blocks = content.split(/\n  - rank:/).slice(1);
    for (const block of blocks) {
      const name = block.match(/\n    name: "([^"]+)"/)?.[1];
      if (!name) continue;
      const searchQuery = block.match(/\n    searchQuery: "([^"]+)"/)?.[1];
      if (!items.has(name)) {
        items.set(name, { name, searchQuery });
      }
    }
  }

  return [...items.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function itemId(name) {
  return createHash('sha1').update(name).digest('hex').slice(0, 12);
}

function searchQueryFor(item) {
  const base = item.searchQuery?.trim() || item.name;
  return `${base} product amazon`;
}

/** @param {string} query */
async function googleImageSearch(query) {
  if (!GOOGLE_KEY || !GOOGLE_CX) return null;

  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', GOOGLE_KEY);
  url.searchParams.set('cx', GOOGLE_CX);
  url.searchParams.set('q', query);
  url.searchParams.set('searchType', 'image');
  url.searchParams.set('num', '3');
  url.searchParams.set('safe', 'active');
  url.searchParams.set('imgSize', 'medium');

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`Google CSE HTTP ${res.status} for "${query}"`);
    return null;
  }

  const data = await res.json();
  return data.items?.map((item) => item.link).filter(Boolean) ?? null;
}

/** @param {string} query */
async function duckDuckGoImageSearch(query) {
  const searchPage = await fetch(
    `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
    { headers: { 'User-Agent': UA } },
  );
  const html = await searchPage.text();
  const vqd =
    html.match(/vqd=(['"])([\d-]+)\1/)?.[2] ??
    html.match(/vqd=([\d-]+)/)?.[1];
  if (!vqd) return null;

  const apiUrl = new URL('https://duckduckgo.com/i.js');
  apiUrl.searchParams.set('l', 'us-en');
  apiUrl.searchParams.set('o', 'json');
  apiUrl.searchParams.set('q', query);
  apiUrl.searchParams.set('vqd', vqd);
  apiUrl.searchParams.set('f', ',,,,,');
  apiUrl.searchParams.set('p', '1');

  const res = await fetch(apiUrl, {
    headers: { 'User-Agent': UA, Referer: 'https://duckduckgo.com/' },
  });
  if (!res.ok) return null;

  const data = await res.json();
  return data.results?.map((r) => r.image).filter(Boolean) ?? null;
}

/** @param {string} query */
async function findImageUrls(query) {
  const google = await googleImageSearch(query);
  if (google?.length) return google;

  const ddg = await duckDuckGoImageSearch(query);
  if (ddg?.length) return ddg;

  return null;
}

/** @param {string} url */
async function downloadImage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
    redirect: 'follow',
  });

  const type = res.headers.get('content-type') ?? '';
  const buf = Buffer.from(await res.arrayBuffer());

  if (!res.ok || buf.byteLength < 1200) return null;
  if (!type.startsWith('image/')) return null;
  if (type.includes('svg') || type.includes('gif')) return null;

  return buf;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const existingMap = existsSync(mapPath)
  ? JSON.parse(readFileSync(mapPath, 'utf8'))
  : {};

/** @type {Record<string, string>} */
const map = { ...existingMap };
let cached = 0;
let fetched = 0;
let failed = 0;

const items = collectListItems();
const source = GOOGLE_KEY && GOOGLE_CX ? 'Google Images API' : 'DuckDuckGo Images';

console.log(`Fetching ${items.length} listicle thumbnails via ${source}…`);

for (const item of items) {
  const id = itemId(item.name);
  const localPath = `/images/thumbnails/${id}.jpg`;
  const localFile = join(outDir, `${id}.jpg`);

  if (existsSync(localFile) && map[item.name] === localPath) {
    cached++;
    continue;
  }

  const query = searchQueryFor(item);
  let saved = false;

  try {
    const urls = await findImageUrls(query);
    if (urls) {
      for (const url of urls.slice(0, 5)) {
        const buf = await downloadImage(url);
        if (buf) {
          writeFileSync(localFile, buf);
          map[item.name] = localPath;
          fetched++;
          saved = true;
          break;
        }
      }
    }
  } catch (err) {
    console.warn(`  ✗ ${item.name}: ${err instanceof Error ? err.message : err}`);
  }

  if (!saved) {
    failed++;
    if (map[item.name] && !existsSync(localFile)) {
      delete map[item.name];
    }
  }

  await sleep(350);
}

writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
console.log(
  `Listicle thumbnails: ${cached} cached, ${fetched} new, ${failed} missing (${Object.keys(map).length} total in map)`,
);

if (!GOOGLE_KEY || !GOOGLE_CX) {
  console.log(
    'Tip: set GOOGLE_CSE_API_KEY + GOOGLE_CSE_ID for Google Images (100 free queries/day).',
  );
}
