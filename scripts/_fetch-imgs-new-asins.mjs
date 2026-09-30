import { writeFileSync, readFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const PRODUCTS = {
  B01MFGN8S5: 'LifeAround2Angels Bath Bombs Gift Set 12',
  B01N0RSC4K: 'Chesapeake Bay Candle Peace Tranquility Medium Jar',
  B003JBHH3A: 'Caspari Lizard Mini Writing Journal',
  B07XFQVN57: 'Kitsch Satin Pillowcase Standard Queen',
  B09ZB6MWWP: 'PMD Clean Mini Facial Cleansing Device',
  B098QDXL9G: 'BAIMEI Jade Roller Gua Sha Set',
  B09HSGMSYP: 'WEWATCH 120 inch Projector Screen',
  B08H8N2BKL: 'Vamvo Mini Projector L4500',
  B09TGSQKRF: 'Brightown Outdoor String Lights 50ft G40',
  B09LNR22YP: 'Great Northern Popcorn Machine Pop Pup',
  B07DWM4BTM: 'Bug Bite Thing Suction Tool',
  B01IJNJAZ0: 'Everlasting Comfort Lumbar Support Pillow',
  B07T5SY43L: 'HUANUO Dual Monitor Stand Riser',
  B0B6W3SCKD: 'ErGear Adjustable Foot Rest Under Desk',
  B08Q7M5TM5: 'FEIYOLD Blue Light Blocking Glasses 2 Pack',
  B006ZEX304: 'Fellowes Office Suites Mesh Back Support',
  B08QMNR1B6: 'ComfiLife Gel Enhanced Seat Cushion',
  B004T02O6K: 'Carex Under Desk Pedal Exerciser',
  B09FX4QJQT: 'Holikme Drill Brush Attachment Set 4-Pack',
  B0CJ1NHWGX: 'Scrub Daddy Original Sponge 3-Pack',
  B08QTXPR9G: 'Mr Clean Magic Eraser Extra Durable 10 Pack',
  B011E581LO: 'OXO Good Grips All Purpose Squeegee',
  B01ID0TIT2: 'Angry Mama Microwave Cleaner',
  B095NSNL2X: 'Pumice Stone Toilet Bowl Cleaner 2 Pack',
  B09K8CY7D1: 'Scotch-Brite Lint Roller 5 Pack',
  B08MFCPHTD: 'Loop Quiet Noise Reducing Earplugs',
  B08HWCWY6Z: 'Ticktime Pomodoro Timer Cube',
  B07RSH69HC: 'Rocketbook Fusion Smart Notebook',
  B08FBY91JV: 'PAPERAGE Dotted Grid Journal A5',
  B081S2VWWX: 'mDesign Plastic Desk Organizer',
  B00T6J9QPG: 'Post-it Dry Erase Surface 36x24',
  B0BT4GFFGR: 'Logitech Pebble Mouse 2 M350s',
  // Products with no better ASIN — search by name
  B0CMVXQ3SM: 'LiBa Shower Steamers Aromatherapy eucalyptus',
  B0B2PWKCBB: 'Bedsure Waterproof Outdoor Blanket',
  B0C55YJC8Y: 'RTIC 28 Can Everyday Soft Cooler',
  B0CG6HN15K: 'LED Camping Lanterns collapsible 4 Pack',
};

async function ddgImageSearch(query) {
  const searchPage = await fetch(
    `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
    { headers: { 'User-Agent': UA } },
  );
  const html = await searchPage.text();
  const vqd = html.match(/vqd=(['"])([\d-]+)\1/)?.[2] ?? html.match(/vqd=([\d-]+)/)?.[1];
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
  const results = data.results?.map(r => r.image).filter(Boolean) ?? [];
  const amazonImg = results.find(u => u.includes('amazon.com') || u.includes('media-amazon.com'));
  return amazonImg || results[0] || null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
mkdirSync('public/images/products', { recursive: true });

const asins = Object.keys(PRODUCTS);
let ok = 0, skip = 0, fail = 0;

console.log(`Fetching images for ${asins.length} new ASINs...\n`);

for (let i = 0; i < asins.length; i++) {
  const asin = asins[i];
  const out = join('public/images/products', asin + '.jpg');
  
  // Skip if already have a good image
  if (existsSync(out)) {
    try {
      const size = statSync(out).size;
      if (size > 5000) {
        console.log(`  ${asin}: SKIP (already ${(size/1024).toFixed(0)}KB)`);
        skip++;
        continue;
      }
    } catch {}
  }

  const name = PRODUCTS[asin];
  const query = `${name} amazon product`;
  
  try {
    const imgUrl = await ddgImageSearch(query);
    if (imgUrl) {
      const res = await fetch(imgUrl, { headers: { 'User-Agent': UA, Accept: 'image/*' }, redirect: 'follow' });
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength > 1000) {
        writeFileSync(out, buf);
        console.log(`  ${asin}: OK (${(buf.byteLength/1024).toFixed(0)}KB) — ${name.slice(0,40)}`);
        ok++;
      } else {
        console.log(`  ${asin}: TOO_SMALL — ${name.slice(0,40)}`);
        fail++;
      }
    } else {
      console.log(`  ${asin}: NO_RESULTS — ${name.slice(0,40)}`);
      fail++;
    }
  } catch (e) {
    console.log(`  ${asin}: ERROR — ${name.slice(0,40)}`);
    fail++;
  }

  if (i < asins.length - 1) await sleep(3000 + Math.random() * 3000);
}

console.log(`\nDone: ${ok} new, ${skip} skipped, ${fail} failed`);
