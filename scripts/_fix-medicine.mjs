import { getToken, search } from './_pin-lib.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const token = await getToken();
const picks = JSON.parse(readFileSync('scripts/_picks-medicine.json', 'utf8'));
const used = new Set(picks.filter((p) => p.rank !== 7).map((p) => p.asin));

const queries = ['magnetic strip bathroom bobby pins small', 'magnetic organizer bar bathroom vanity', 'magnetic strip holder bathroom metal items'];
const all = [];
for (const q of queries) {
  all.push(...(await search(token, q)));
  await new Promise((r) => setTimeout(r, 1100));
}
const best = [...new Map(all.map((x) => [x.asin, x])).values()]
  .filter((i) => !used.has(i.asin) && i.price != null && i.price <= 15)
  .filter((i) => /magnetic/i.test(i.title))
  .filter((i) => !/paper.?towel|fridge|knife|tool/i.test(i.title))
  .filter((i) => /strip|bar|holder|organizer|bobby|pin/i.test(i.title))
  .sort((a, b) => (a.salesRank ?? 1e12) - (b.salesRank ?? 1e12))[0];

if (!best) throw new Error('No medicine slot 7 fix');
const map = JSON.parse(readFileSync('src/data/product-images.json', 'utf8'));
const imgPath = `public/images/products/${best.asin}.jpg`;
if (!existsSync(imgPath) && best.img) {
  mkdirSync('public/images/products', { recursive: true });
  writeFileSync(imgPath, Buffer.from(await (await fetch(best.img, { headers: { Referer: 'https://www.amazon.com/' } })).arrayBuffer()));
}
map[best.asin] = `/images/products/${best.asin}.jpg`;
picks[6] = { rank: 7, label: 'Magnetic Strip', asin: best.asin, title: best.title, price: best.price, salesRank: best.salesRank, imagePath: map[best.asin] };
writeFileSync('src/data/product-images.json', JSON.stringify(map, null, 2) + '\n');
writeFileSync('scripts/_picks-medicine.json', JSON.stringify(picks, null, 2) + '\n');
console.log('FIX medicine 7', best.asin, best.title.slice(0, 60));
