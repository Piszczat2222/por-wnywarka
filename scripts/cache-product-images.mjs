import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const outDir = join(process.cwd(), 'public', 'images', 'products');
const mapPath = join(process.cwd(), 'src', 'data', 'product-images.json');

mkdirSync(outDir, { recursive: true });

const asins = new Set();

for (const file of readdirSync(articlesDir)) {
  if (!file.endsWith('.md')) continue;
  const content = readFileSync(join(articlesDir, file), 'utf8');
  for (const match of content.matchAll(/imageAsin: "(B0[A-Z0-9]{8})"/g)) {
    asins.add(match[1]);
  }
}

const candidates = (asin) => [
  `https://m.media-amazon.com/images/P/${asin}._SL300_.jpg`,
  `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`,
  `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SX300_.jpg`,
];

const map = {};
let ok = 0;
let fail = 0;

for (const asin of [...asins].sort()) {
  const localPath = `/images/products/${asin}.jpg`;
  const localFile = join(outDir, `${asin}.jpg`);

  if (existsSync(localFile)) {
    map[asin] = localPath;
    ok++;
    continue;
  }

  let saved = false;
  for (const url of candidates(asin)) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          Referer: 'https://www.amazon.com/',
        },
      });
      const type = res.headers.get('content-type') ?? '';
      const buf = Buffer.from(await res.arrayBuffer());
      if (res.ok && type.includes('jpeg') && buf.byteLength > 800) {
        writeFileSync(localFile, buf);
        map[asin] = localPath;
        ok++;
        saved = true;
        break;
      }
    } catch {
      // try next
    }
  }
  if (!saved) fail++;
}

writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
console.log(`Product images: ${ok} cached locally, ${fail} missing (use category fallback)`);
