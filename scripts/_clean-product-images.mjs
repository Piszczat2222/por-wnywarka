import fs from 'node:fs';
import path from 'node:path';

const mapPath = 'src/data/product-images.json';
const raw = fs.readFileSync(mapPath, 'utf8');
const map = JSON.parse(raw);
const keys = Object.keys(map);

// duplicate keys in raw text (JSON.parse keeps last)
const keyMatches = [...raw.matchAll(/"([A-Z0-9]{10})"\s*:/g)].map((m) => m[1]);
const dupKeys = [...new Set(keyMatches.filter((k, i) => keyMatches.indexOf(k) !== i))];

console.log('parsed keys', keys.length);
console.log('duplicate keys in file', dupKeys.length, dupKeys);

// ASINs referenced in articles
const articlesDir = 'src/content/articles';
const usedAsins = new Set();
const imagePathsFromArticles = new Set();

for (const file of fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'))) {
  const c = fs.readFileSync(path.join(articlesDir, file), 'utf8');
  for (const m of c.matchAll(/asin:\s*"([A-Z0-9]{10})"/g)) usedAsins.add(m[1]);
  for (const m of c.matchAll(/imageAsin:\s*"([A-Z0-9]{10})"/g)) usedAsins.add(m[1]);
  for (const m of c.matchAll(/amazonAsin:\s*"([A-Z0-9]{10})"/g)) usedAsins.add(m[1]);
  for (const m of c.matchAll(/premiumAsin:\s*"([A-Z0-9]{10})"/g)) usedAsins.add(m[1]);
  for (const m of c.matchAll(/runnerUpAsin:\s*"([A-Z0-9]{10})"/g)) usedAsins.add(m[1]);
  for (const m of c.matchAll(/image:\s*"(\/images\/products\/[^"]+)"/g)) imagePathsFromArticles.add(m[1]);
}

const notInMap = [...usedAsins].filter((a) => !map[a]);
const unusedInMap = keys.filter((a) => !usedAsins.has(a));

console.log('used in articles', usedAsins.size);
console.log('not in map', notInMap.length, notInMap.slice(0, 20));
console.log('unused in map', unusedInMap.length);

// image files on disk
const imgDir = 'public/images/products';
const diskFiles = new Set(fs.readdirSync(imgDir).filter((f) => f.endsWith('.jpg')).map((f) => f.replace('.jpg', '')));

const missingFiles = [...usedAsins].filter((a) => !diskFiles.has(a));
console.log('used ASINs missing jpg', missingFiles.length, missingFiles.slice(0, 20));

// rebuild clean map: only used ASINs, canonical path /images/products/{ASIN}.jpg
const clean = {};
for (const asin of [...usedAsins].sort()) {
  clean[asin] = `/images/products/${asin}.jpg`;
}

fs.writeFileSync(mapPath, JSON.stringify(clean, null, 2) + '\n');
console.log('wrote clean map entries', Object.keys(clean).length);

// report orphan disk files (not in used set)
const orphanFiles = [...diskFiles].filter((a) => !usedAsins.has(a));
console.log('orphan jpg files on disk', orphanFiles.length);
