import { getToken, search } from './_pin-lib.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const token = await getToken();
const picks = JSON.parse(readFileSync('scripts/_picks-undersink.json', 'utf8'));
const used = new Set(picks.filter((p) => p.rank !== 2).map((p) => p.asin));

const queries = ['under sink expandable shelf rack', 'under sink basket sliding organizer', 'under sink storage basket pull out'];
const all = [];
for (const q of queries) {
  all.push(...(await search(token, q)));
  await new Promise((r) => setTimeout(r, 1100));
}
const best = [...new Map(all.map((x) => [x.asin, x])).values()]
  .filter((i) => !used.has(i.asin) && i.price != null && i.price <= 40)
  .filter((i) => /under.?sink|sink.?cabinet|cabinet/i.test(i.title))
  .filter((i) => /shelf|basket|rack|expand/i.test(i.title))
  .filter((i) => !/REALINN|pull.?out.?2.?tier.?L/i.test(i.title))
  .map((i) => ({ ...i, s: (i.salesRank ?? 1e12) + (/expand|basket|shelf/i.test(i.title) ? 0 : 50000) }))
  .sort((a, b) => a.s - b.s)[0];

if (!best) throw new Error('No undersink slot 2 fix');
const map = JSON.parse(readFileSync('src/data/product-images.json', 'utf8'));
const imgPath = `public/images/products/${best.asin}.jpg`;
if (!existsSync(imgPath) && best.img) {
  mkdirSync('public/images/products', { recursive: true });
  writeFileSync(imgPath, Buffer.from(await (await fetch(best.img, { headers: { Referer: 'https://www.amazon.com/' } })).arrayBuffer()));
}
map[best.asin] = `/images/products/${best.asin}.jpg`;
picks[1] = { rank: 2, label: 'Under Sink Basket', asin: best.asin, title: best.title, price: best.price, salesRank: best.salesRank, imagePath: map[best.asin] };
writeFileSync('src/data/product-images.json', JSON.stringify(map, null, 2) + '\n');
writeFileSync('scripts/_picks-undersink.json', JSON.stringify(picks, null, 2) + '\n');
console.log('FIX undersink 2', best.asin, best.title.slice(0, 60));
