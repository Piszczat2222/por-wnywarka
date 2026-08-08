import { getToken, search, pinSlots } from './_pin-lib.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

// Re-pin only monitor light bar on existing monitordesk picks
const token = await getToken();
const queries = [
  'BenQ ScreenBar monitor light',
  'monitor light bar USB powered',
  'Quntis monitor light bar',
  'screenbar monitor lamp LED',
];
const must = [/light.?bar|screenbar|monitor.?light|monitor.?lamp|screen.?bar/i];
const prefer = [/light.?bar|screenbar|monitor.?light|Quntis|BenQ/i];
const exclude = [/TV.?light|Govee|bias.?lighting|ambilight|strip.?light|ring.?light|desk.?lamp/i];

const all = [];
for (const q of queries) {
  const items = await search(token, q);
  all.push(...items);
  await new Promise((r) => setTimeout(r, 800));
}

const picks = JSON.parse(readFileSync('scripts/_picks-monitordesk.json', 'utf8'));
const used = new Set(picks.map((p) => p.asin));

const scored = [];
for (const item of all) {
  if (!item.asin || used.has(item.asin)) continue;
  if (item.price == null || item.price > 55) continue;
  if (!must.some((r) => r.test(item.title))) continue;
  if (exclude.some((r) => r.test(item.title))) continue;
  let s = item.salesRank ?? 1e12;
  if (!prefer.some((r) => r.test(item.title))) s += 50000;
  scored.push({ ...item, s });
}
scored.sort((a, b) => a.s - b.s);
if (!scored.length) {
  console.error('No light bar found');
  process.exit(1);
}
const best = scored[0];
mkdirSync('public/images/products', { recursive: true });
const map = JSON.parse(readFileSync('src/data/product-images.json', 'utf8'));
let imagePath = map[best.asin];
if (!imagePath && best.img) {
  const res = await fetch(best.img);
  const buf = Buffer.from(await res.arrayBuffer());
  const dest = `public/images/products/${best.asin}.jpg`;
  writeFileSync(dest, buf);
  imagePath = `/images/products/${best.asin}.jpg`;
  map[best.asin] = imagePath;
  writeFileSync('src/data/product-images.json', JSON.stringify(map, null, 2) + '\n');
}
picks[3] = {
  rank: 4,
  label: 'Monitor Light Bar',
  asin: best.asin,
  title: best.title,
  price: best.price,
  salesRank: best.salesRank,
  imagePath,
};
writeFileSync('scripts/_picks-monitordesk.json', JSON.stringify(picks, null, 2) + '\n');
console.log('OK light bar', best.asin, `$${best.price}`, `#${best.salesRank}`, best.title.slice(0, 70));
