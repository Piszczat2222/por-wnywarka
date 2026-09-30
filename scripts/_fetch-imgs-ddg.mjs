import { writeFileSync, readFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// Product names from the articles for each ASIN
const PRODUCTS = {
  B01MFAOMBI: 'LifeAround2Angels Bath Bombs Gift Set 12-Pack',
  B00PU2FBF4: 'Chesapeake Bay Candle Peace Tranquility',
  B0CMVXQ3SM: 'LiBa Shower Steamers Aromatherapy 12-Pack',
  B07N7WPRGS: 'Caspari Lizard Lined Writing Journal',
  B07RLRDP94: 'Kitsch Satin Pillowcase 2-Pack',
  B07PD5MRRL: 'PMD Clean Mini Facial Cleansing Device',
  B07GLC2KHH: 'BAIMEI Jade Roller Gua Sha Set',
  B09B3WXPMT: 'WEWATCH 120 inch Projector Screen with Stand',
  B084GZRQ27: 'Vamvo L4500 Mini Projector',
  B073WLXHXM: 'Brightown Outdoor String Lights 50 ft',
  B079QXTNL8: 'Great Northern 2.5 oz Popcorn Machine',
  B0B2PWKCBB: 'Bedsure Waterproof Outdoor Blanket',
  B0C55YJC8Y: 'RTIC 28 Can Everyday Cooler',
  B07DWM4BTM: 'Bug Bite Thing Suction Tool',
  B0CG6HN15K: 'ANEEWAY LED Camping Lanterns 4-Pack',
  B01IJNJEZ0: 'Everlasting Comfort Lumbar Support Pillow',
  B07K3SJHQ8: 'HUANUO Dual Monitor Stand Riser',
  B0BN36Z27Y: 'ErGear Adjustable Foot Rest Under Desk',
  B07Y1CMYGM: 'FEIYOLD Blue Light Blocking Glasses 2-Pack',
  B000J49TLC: 'Fellowes Office Suites Mesh Back Support',
  B014F1DYSE: 'ComfiLife Gel Enhanced Seat Cushion',
  B07KXJPVWM: 'Carex Under Desk Elliptical',
  B07C5LG4FT: 'Holikme Drill Brush Attachment Set 4-Pack',
  B0CKG57QYH: 'Scrub Daddy Original Sponge 3-Pack',
  B09MYQFGS7: 'Mr. Clean Magic Eraser Extra Durable 10-Pack',
  B079WG3G4Y: 'OXO Good Grips All-Purpose Squeegee',
  B01KNZJ578: 'Angry Mama Microwave Cleaner',
  B09WDG35HB: 'Pumice Stone Toilet Bowl Cleaner 2-Pack',
  B002MXO8SC: 'Scotch-Brite Lint Roller 5-Pack 475 Sheets',
  B0BFN8L5SC: 'Loop Quiet Noise-Reducing Earplugs',
  B09GFPDS3D: 'Ticktime Pomodoro Timer Cube',
  B07WSLXLHB: 'Rocketbook Fusion Smart Notebook',
  B0BTJHP31Y: 'PAPERAGE Dotted Grid Journal',
  B08P46X2P1: 'mDesign Plastic Desk Organizer',
  B006YXBVNE: 'Post-it Dry Erase Surface 36x24',
  B09HMM3MV5: 'Logitech Pebble Mouse 2 M750',
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
  // Prefer amazon.com images
  const results = data.results?.map(r => r.image).filter(Boolean) ?? [];
  const amazonImg = results.find(u => u.includes('amazon.com') || u.includes('media-amazon.com'));
  return amazonImg || results[0] || null;
}

async function downloadImg(url, asin) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/*' },
    redirect: 'follow',
  });
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength < 1000) return false;
  const out = join('public/images/products', asin + '.jpg');
  writeFileSync(out, buf);
  return buf.byteLength;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

mkdirSync('public/images/products', { recursive: true });

const asins = Object.keys(PRODUCTS);
console.log(`Searching DuckDuckGo images for ${asins.length} products...\n`);

let ok = 0, fail = 0;

for (let i = 0; i < asins.length; i++) {
  const asin = asins[i];
  const name = PRODUCTS[asin];
  const query = `${name} amazon product`;
  
  try {
    const imgUrl = await ddgImageSearch(query);
    if (imgUrl) {
      const size = await downloadImg(imgUrl, asin);
      if (size) {
        console.log(`  ${asin}: OK (${(size/1024).toFixed(0)}KB) — ${name.slice(0,40)}`);
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
    console.log(`  ${asin}: ERROR ${e.message} — ${name.slice(0,40)}`);
    fail++;
  }

  if (i < asins.length - 1) {
    const d = 3000 + Math.random() * 4000;
    await sleep(d);
  }
}

console.log(`\nDone: ${ok} images downloaded, ${fail} failed`);
