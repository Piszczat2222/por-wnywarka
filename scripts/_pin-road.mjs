import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const slots = [
  {
    rank: 1,
    label: 'Soft Cooler Bag',
    queries: [
      'soft cooler bag insulated 28 can',
      'insulated cooler bag for car travel',
      'soft sided cooler bag leak proof',
    ],
    maxPrice: 45,
    must: [/cooler/i],
    prefer: [/soft|insulated|cooler.?bag|can/i],
    exclude: [/ice.?pack.?only|hard.?cooler.?only|wheel/i],
  },
  {
    rank: 2,
    label: 'Travel Neck Pillow',
    queries: [
      'travel neck pillow memory foam chin support',
      'memory foam travel pillow airplane car',
      'Cabeau travel neck pillow',
    ],
    maxPrice: 50,
    must: [/neck.?pillow|travel.?pillow|u.?shaped.?pillow/i],
    prefer: [/memory.?foam|neck|travel.?pillow|chin/i],
    exclude: [/body.?pillow|bed.?pillow|pregnancy/i],
  },
  {
    rank: 3,
    label: 'Car Power Inverter',
    queries: [
      'car power inverter 300W AC USB 12V',
      '300 watt car inverter cigarette lighter',
      'BESTEK 300W car power inverter',
    ],
    maxPrice: 45,
    must: [/inverter/i],
    prefer: [/300|power.?inverter|car.?inverter|12.?v/i],
    exclude: [/2000|pure.?sine.?huge|solar.?inverter.?only/i],
  },
  {
    rank: 4,
    label: 'Backseat Organizer',
    queries: [
      'backseat car organizer tablet holder',
      'car back seat organizer with tablet pocket',
      'kick mat backseat organizer kids',
    ],
    maxPrice: 30,
    must: [/organizer|kick.?mat/i],
    prefer: [/back.?seat|backseat|tablet|organizer/i],
    exclude: [/trunk.?only|seat.?gap/i],
  },
  {
    rank: 5,
    label: 'Portable Jump Starter',
    queries: [
      'portable jump starter lithium battery pack',
      'NOCO jump starter portable',
      'lithium car jump starter USB',
    ],
    maxPrice: 120,
    must: [/jump.?starter|jump.?box|battery.?booster/i],
    prefer: [/jump.?starter|lithium|portable|noco/i],
    exclude: [/jumper.?cable.?only|charger.?only|battery.?tender.?only/i],
  },
  {
    rank: 6,
    label: 'Tire Pressure Gauge',
    queries: [
      'digital tire pressure gauge backlit',
      'AstroAI digital tire pressure gauge',
      'tire pressure gauge 150 PSI digital',
    ],
    maxPrice: 20,
    must: [/tire.?pressure|pressure.?gauge/i],
    prefer: [/digital|gauge|backlit|tire.?pressure/i],
    exclude: [/inflator|compressor|monitor.?tpms.?sensor.?kit.?expensive/i],
  },
  {
    rank: 7,
    label: 'Car Window Sun Shades',
    queries: [
      'car window sun shades 4 pack static cling',
      'side window sun shade 4 pack car',
      'car rear window sun shade kids 4 pack',
    ],
    maxPrice: 25,
    must: [/sun.?shade|sunshade|shade/i],
    prefer: [/window|4.?pack|static|cling|side/i],
    exclude: [/windshield.?only|roof/i],
  },
  {
    rank: 8,
    label: 'Insulated Travel Mug',
    queries: [
      'insulated travel mug 20oz double wall',
      'Yeti Rambler travel mug 20 oz',
      'Stanley travel mug 20 oz',
    ],
    maxPrice: 40,
    must: [/mug|tumbler|travel.?cup/i],
    prefer: [/travel.?mug|20|insulated|tumbler/i],
    exclude: [/lid.?only|straw.?only|coffee.?maker/i],
  },
  {
    rank: 9,
    label: 'First Aid Kit',
    queries: [
      'first aid kit 299 piece compact',
      'car first aid kit comprehensive',
      'BAND-AID portable first aid kit',
    ],
    maxPrice: 35,
    must: [/first.?aid/i],
    prefer: [/first.?aid.?kit|piece|compact|car/i],
    exclude: [/refill.?only|bandage.?only/i],
  },
  {
    rank: 10,
    label: 'Solar Phone Charger',
    queries: [
      'solar phone charger 21W foldable panel',
      'foldable solar charger panel USB',
      'BigBlue solar charger foldable',
    ],
    maxPrice: 45,
    must: [/solar/i],
    prefer: [/solar.?charger|foldable|panel|21|usb/i],
    exclude: [/power.?bank.?only.?no.?solar|cable.?only|garden.?light/i],
  },
];

const tokenRes = await fetch('https://api.amazon.com/auth/o2/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: process.env.AMZ_CLIENT_ID,
    client_secret: process.env.AMZ_CLIENT_SECRET,
    scope: 'creatorsapi::default',
  }),
});
const { access_token: token } = await tokenRes.json();
if (!token) throw new Error('No token');

async function search(keywords) {
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
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
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
  if (slot.exclude.some((r) => r.test(item.title))) return null;
  let s = item.salesRank ?? 1e12;
  if (!slot.prefer.some((r) => r.test(item.title))) s += 50000;
  return s;
}

mkdirSync('public/images/products', { recursive: true });
const map = JSON.parse(readFileSync('src/data/product-images.json', 'utf8'));
const used = new Set();
const picks = [];

for (const slot of slots) {
  const all = [];
  for (const q of slot.queries) {
    await new Promise((r) => setTimeout(r, 1100));
    all.push(...(await search(q)));
  }
  const pool = [...new Map(all.map((x) => [x.asin, x])).values()]
    .filter((i) => !used.has(i.asin))
    .map((i) => ({ ...i, _s: score(i, slot) }))
    .filter((i) => i._s != null)
    .sort((a, b) => a._s - b._s);

  const best = pool[0];
  if (!best) {
    console.log('FAIL', slot.rank, slot.label);
    console.log(
      ' top:',
      [...new Map(all.map((x) => [x.asin, x])).values()]
        .slice(0, 6)
        .map((i) => `${i.asin} $${i.price} #${i.salesRank} ${i.title.slice(0, 55)}`)
        .join('\n  '),
    );
    continue;
  }

  const imgPath = join('public/images/products', `${best.asin}.jpg`);
  if (!existsSync(imgPath) && best.img) {
    await new Promise((r) => setTimeout(r, 400));
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
    `OK ${slot.rank} ${best.asin} $${best.price} #${best.salesRank} ${best.title.slice(0, 70)}`,
  );
}

writeFileSync('src/data/product-images.json', JSON.stringify(map, null, 2) + '\n');
writeFileSync('scripts/_road-picks.json', JSON.stringify(picks, null, 2));
console.log('DONE', picks.length);
