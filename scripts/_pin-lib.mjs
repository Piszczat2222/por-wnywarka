import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export async function getToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.AMZ_CLIENT_ID,
      client_secret: process.env.AMZ_CLIENT_SECRET,
      scope: 'creatorsapi::default',
    }),
  });
  const { access_token } = await res.json();
  if (!access_token) throw new Error('No token');
  return access_token;
}

export async function search(token, keywords) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch('https://creatorsapi.amazon/catalog/v1/searchItems', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}, Version 3.1`,
        'Content-Type': 'application/json',
        'x-marketplace': 'www.amazon.com',
        'x-api-version': '3.1',
      },
      body: JSON.stringify({
        partnerTag: 'wattroi-20',
        partnerType: 'Associates',
        keywords,
        searchIndex: 'All',
        itemCount: 10,
        resources: [
          'itemInfo.title',
          'images.primary.large',
          'offersV2.listings.price',
          'browseNodeInfo.websiteSalesRank',
        ],
        marketplace: 'www.amazon.com',
      }),
    });
    const text = await res.text();
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 2500 * (attempt + 1)));
      continue;
    }
    const data = JSON.parse(text);
    return (data.searchResult?.items || []).map((i) => ({
      asin: i.asin,
      title: i.itemInfo?.title?.displayValue || '',
      price: i.offersV2?.listings?.[0]?.price?.money?.amount ?? null,
      salesRank: i.browseNodeInfo?.websiteSalesRank?.salesRank ?? null,
      img: i.images?.primary?.large?.url || null,
    }));
  }
  return [];
}

function score(item, slot) {
  if (item.price == null || item.price > slot.maxPrice) return null;
  if (!slot.must.every((r) => r.test(item.title))) return null;
  if ((slot.exclude || []).some((r) => r.test(item.title))) return null;
  let s = item.salesRank ?? 1e12;
  if (!(slot.prefer || []).some((r) => r.test(item.title))) s += 50000;
  return s;
}

export async function pinSlots(name, slots) {
  const token = await getToken();
  mkdirSync('public/images/products', { recursive: true });
  const map = JSON.parse(readFileSync('src/data/product-images.json', 'utf8'));
  const used = new Set();
  const picks = [];

  for (const slot of slots) {
    const all = [];
    for (const q of slot.queries) {
      await new Promise((r) => setTimeout(r, 1100));
      all.push(...(await search(token, q)));
    }
    const pool = [...new Map(all.map((x) => [x.asin, x])).values()]
      .filter((i) => !used.has(i.asin))
      .map((i) => ({ ...i, _s: score(i, slot) }))
      .filter((i) => i._s != null)
      .sort((a, b) => a._s - b._s);

    const best = pool[0];
    if (!best) {
      console.log('FAIL', name, slot.rank, slot.label);
      continue;
    }

    const imgPath = join('public/images/products', `${best.asin}.jpg`);
    if (!existsSync(imgPath) && best.img) {
      await new Promise((r) => setTimeout(r, 350));
      const buf = Buffer.from(
        await (
          await fetch(best.img, {
            headers: {
              'User-Agent': 'Mozilla/5.0',
              Accept: 'image/*',
              Referer: 'https://www.amazon.com/',
            },
          })
        ).arrayBuffer(),
      );
      writeFileSync(imgPath, buf);
    }
    map[best.asin] = `/images/products/${best.asin}.jpg`;
    used.add(best.asin);
    picks.push({
      rank: slot.rank,
      label: slot.label,
      asin: best.asin,
      title: best.title,
      price: best.price,
      salesRank: best.salesRank,
      imagePath: map[best.asin],
    });
    console.log(
      `OK ${name} ${slot.rank} ${best.asin} $${best.price} #${best.salesRank} ${best.title.slice(0, 60)}`,
    );
  }

  writeFileSync('src/data/product-images.json', JSON.stringify(map, null, 2) + '\n');
  writeFileSync(`scripts/_picks-${name}.json`, JSON.stringify(picks, null, 2));
  console.log('DONE', name, picks.length);
  return picks;
}

export function money(n) {
  return Number(n).toFixed(2).replace(/\.00$/, '');
}

export function fmt(n) {
  const x = Number(n);
  return Number.isInteger(x) ? `$${x}` : `$${x.toFixed(2)}`;
}
