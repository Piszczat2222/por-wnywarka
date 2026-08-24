import { getToken, search } from './_pin-lib.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const token = await getToken();
const picks = JSON.parse(readFileSync('scripts/_picks-pettravel.json', 'utf8'));
const used = new Set(picks.map((p) => p.asin));

async function repin(rank, queries, must, prefer, exclude, maxPrice = 25) {
  const all = [];
  for (const q of queries) {
    all.push(...(await search(token, q)));
    await new Promise((r) => setTimeout(r, 1100));
  }
  const scored = [...new Map(all.map((x) => [x.asin, x])).values()]
    .filter((i) => !used.has(i.asin) && i.price != null && i.price <= maxPrice)
    .filter((i) => must.some((r) => r.test(i.title)))
    .filter((i) => !exclude.some((r) => r.test(i.title)))
    .map((i) => {
      let s = i.salesRank ?? 1e12;
      if (!prefer.some((r) => r.test(i.title))) s += 50000;
      return { ...i, s };
    })
    .sort((a, b) => a.s - b.s);
  const best = scored[0];
  if (!best) throw new Error(`No pick for rank ${rank}`);
  used.add(best.asin);
  const map = JSON.parse(readFileSync('src/data/product-images.json', 'utf8'));
  const imgPath = `public/images/products/${best.asin}.jpg`;
  if (!existsSync(imgPath) && best.img) {
    mkdirSync('public/images/products', { recursive: true });
    const buf = Buffer.from(await (await fetch(best.img, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.amazon.com/' } })).arrayBuffer());
    writeFileSync(imgPath, buf);
  }
  map[best.asin] = `/images/products/${best.asin}.jpg`;
  writeFileSync('src/data/product-images.json', JSON.stringify(map, null, 2) + '\n');
  const idx = picks.findIndex((p) => p.rank === rank);
  picks[idx] = { rank, label: picks[idx].label, asin: best.asin, title: best.title, price: best.price, salesRank: best.salesRank, imagePath: map[best.asin] };
  console.log('FIX', rank, best.asin, best.title.slice(0, 60));
}

// slot 2: travel water bottle not gravity feeder
await repin(2, ['dog travel water bottle portable bowl', 'lesotc dog water bottle portable', 'pet water bottle with bowl dispenser hiking'], [/water.?bottle|portable.?bowl|dispenser/i], [/dog|pet|travel|portable.?bowl|water.?bottle/i], [/gravity|feeder|fountain|dispenser.?station|automatic/i], 25);

// slot 8: avoid duplicate seat belt
await repin(8, ['dog car zip line tether back seat', 'pet car barrier divider back seat', 'dog car barrier net back seat'], [/tether|barrier|zip.?line|net|divider/i], [/dog|pet|car|back.?seat/i], [/seat.?belt.?harness|harness.?only/i], 30);

writeFileSync('scripts/_picks-pettravel.json', JSON.stringify(picks, null, 2) + '\n');
