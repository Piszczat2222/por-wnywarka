import { getToken, search } from './_pin-lib.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const token = await getToken();
const picks = JSON.parse(readFileSync('scripts/_picks-entryway.json', 'utf8'));
const used = new Set(picks.filter((p) => p.rank !== 9).map((p) => p.asin));

const queries = ['entryway basket woven storage scarves', 'seagrass basket entryway storage', 'entryway storage basket with handles'];
const all = [];
for (const q of queries) {
  all.push(...(await search(token, q)));
  await new Promise((r) => setTimeout(r, 1100));
}
const best = [...new Map(all.map((x) => [x.asin, x])).values()]
  .filter((i) => !used.has(i.asin) && i.price != null && i.price <= 30)
  .filter((i) => /basket|bin|woven|seagrass/i.test(i.title))
  .filter((i) => !/fabric.?cube|collapsible.?fabric.?storage.?cube/i.test(i.title))
  .sort((a, b) => (a.salesRank ?? 1e12) - (b.salesRank ?? 1e12))[0];

if (!best) throw new Error('No entryway slot 9 fix');
const map = JSON.parse(readFileSync('src/data/product-images.json', 'utf8'));
const imgPath = `public/images/products/${best.asin}.jpg`;
if (!existsSync(imgPath) && best.img) {
  mkdirSync('public/images/products', { recursive: true });
  writeFileSync(imgPath, Buffer.from(await (await fetch(best.img, { headers: { Referer: 'https://www.amazon.com/' } })).arrayBuffer()));
}
map[best.asin] = `/images/products/${best.asin}.jpg`;
picks[8] = { rank: 9, label: 'Basket / Bin', asin: best.asin, title: best.title, price: best.price, salesRank: best.salesRank, imagePath: map[best.asin] };
writeFileSync('src/data/product-images.json', JSON.stringify(map, null, 2) + '\n');
writeFileSync('scripts/_picks-entryway.json', JSON.stringify(picks, null, 2) + '\n');
console.log('FIX entryway 9', best.asin, best.title.slice(0, 60));
