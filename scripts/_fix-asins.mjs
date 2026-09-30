import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

// Products that need ASIN verification + price lookup via Amazon search
const PRODUCTS = [
  { old: 'B01MFAOMBI', name: 'LifeAround2Angels Bath Bombs Gift Set 12' },
  { old: 'B00PU2FBF4', name: 'Chesapeake Bay Candle Peace Tranquility' },
  { old: 'B0CMVXQ3SM', name: 'LiBa Shower Steamers Aromatherapy' },
  { old: 'B07N7WPRGS', name: 'Caspari Lizard Lined Writing Journal' },
  { old: 'B07RLRDP94', name: 'Kitsch Satin Pillowcase' },
  { old: 'B07PD5MRRL', name: 'PMD Clean Mini Facial Cleansing Device' },
  { old: 'B07GLC2KHH', name: 'BAIMEI Jade Roller Gua Sha Set' },
  { old: 'B09B3WXPMT', name: 'WEWATCH 120 Projector Screen with Stand' },
  { old: 'B084GZRQ27', name: 'Vamvo L4500 Mini Projector' },
  { old: 'B073WLXHXM', name: 'Brightown Outdoor String Lights 50ft' },
  { old: 'B079QXTNL8', name: 'Great Northern Popcorn Machine' },
  { old: 'B0B2PWKCBB', name: 'Bedsure Waterproof Outdoor Blanket' },
  { old: 'B0C55YJC8Y', name: 'RTIC 28 Can Soft Cooler' },
  { old: 'B07DWM4BTM', name: 'Bug Bite Thing Suction Tool' },
  { old: 'B0CG6HN15K', name: 'ANEEWAY LED Camping Lanterns 4 Pack' },
  { old: 'B01IJNJEZ0', name: 'Everlasting Comfort Lumbar Support Pillow' },
  { old: 'B07K3SJHQ8', name: 'HUANUO Dual Monitor Stand Riser' },
  { old: 'B0BN36Z27Y', name: 'ErGear Adjustable Foot Rest Under Desk' },
  { old: 'B07Y1CMYGM', name: 'FEIYOLD Blue Light Blocking Glasses' },
  { old: 'B000J49TLC', name: 'Fellowes Office Suites Mesh Back Support' },
  { old: 'B014F1DYSE', name: 'ComfiLife Gel Enhanced Seat Cushion' },
  { old: 'B07KXJPVWM', name: 'Carex Under Desk Elliptical Pedal Exerciser' },
  { old: 'B07C5LG4FT', name: 'Holikme Drill Brush Attachment Set' },
  { old: 'B0CKG57QYH', name: 'Scrub Daddy Original Sponge 3 Pack' },
  { old: 'B09MYQFGS7', name: 'Mr Clean Magic Eraser Extra Durable' },
  { old: 'B079WG3G4Y', name: 'OXO Good Grips All Purpose Squeegee' },
  { old: 'B01KNZJ578', name: 'Angry Mama Microwave Cleaner' },
  { old: 'B09WDG35HB', name: 'Pumice Stone Toilet Bowl Cleaner' },
  { old: 'B002MXO8SC', name: 'Scotch-Brite Lint Roller 5 Pack' },
  { old: 'B0BFN8L5SC', name: 'Loop Quiet Noise Reducing Earplugs' },
  { old: 'B09GFPDS3D', name: 'Ticktime Pomodoro Timer Cube' },
  { old: 'B07WSLXLHB', name: 'Rocketbook Fusion Smart Notebook' },
  { old: 'B0BTJHP31Y', name: 'PAPERAGE Dotted Grid Journal A5' },
  { old: 'B08P46X2P1', name: 'mDesign Plastic Desk Organizer' },
  { old: 'B006YXBVNE', name: 'Post-it Dry Erase Surface 36x24' },
  { old: 'B09HMM3MV5', name: 'Logitech Pebble Mouse 2 M750' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function searchAmazon(name) {
  const query = encodeURIComponent(name);
  const url = `https://www.amazon.com/s?k=${query}&language=en_US`;
  const tmpFile = `scripts/_search-tmp.html`;
  
  try {
    execSync(
      `curl.exe -s -L --max-time 15 -o "${tmpFile}" ` +
      `-H "User-Agent: ${UA}" ` +
      `-H "Accept: text/html" ` +
      `-H "Accept-Language: en-US,en;q=0.9" ` +
      `-H "Cookie: i18n-prefs=USD; lc-main=en_US" ` +
      `"${url}"`,
      { timeout: 20000 }
    );
  } catch { return null; }

  let html;
  try { html = readFileSync(tmpFile, 'utf8'); } catch { return null; }
  
  if (/robot check|captcha/i.test(html)) return null;

  // Extract first product ASIN from search results
  const asinMatch = html.match(/data-asin="(B[A-Z0-9]{9})"/);
  if (!asinMatch) {
    // Try dp/ links
    const dpMatch = html.match(/\/dp\/(B[A-Z0-9]{9})/);
    if (dpMatch) return dpMatch[1];
    return null;
  }
  return asinMatch[1];
}

async function getProductPage(asin) {
  const url = `https://www.amazon.com/dp/${asin}?language=en_US&currency=USD`;
  const tmpFile = `scripts/_dp-tmp.html`;
  
  try {
    execSync(
      `curl.exe -s -L --max-time 15 -o "${tmpFile}" ` +
      `-H "User-Agent: ${UA}" ` +
      `-H "Accept: text/html" ` +
      `-H "Accept-Language: en-US,en;q=0.9" ` +
      `-H "Cookie: i18n-prefs=USD; lc-main=en_US" ` +
      `"${url}"`,
      { timeout: 20000 }
    );
  } catch { return null; }

  let html;
  try { html = readFileSync(tmpFile, 'utf8'); } catch { return null; }
  
  if (/robot check|captcha/i.test(html)) return null;

  function pick(re) {
    const m = html.match(re);
    return m ? m[1] : null;
  }

  let title = (pick(/id="productTitle"[^>]*>\s*([^<]+)/) || '').trim();
  if (!title) title = (pick(/<title[^>]*>(?:Amazon\.com\s*:\s*)?([^<]+?)(?:\s*:\s*(?:Amazon|Home))?<\/title>/) || '').trim();
  if (title === 'Page Not Found') title = '';

  const apex = pick(/apexPriceToPay[\s\S]{0,400}?class="a-offscreen">\$([\d.,]+)/);
  const priceAmount = pick(/"priceAmount":([\d.]+)/);
  const displayPrice = pick(/"displayPrice":"\$([\d.,]+)"/);
  const corePr = pick(/class="a-offscreen">\$([\d.,]+)/);
  const prices = [];
  const reP = /\$([\d]+\.[\d]{2})/g;
  let pm;
  while ((pm = reP.exec(html)) && prices.length < 20) {
    const p = parseFloat(pm[1]);
    if (p > 3 && p < 500) prices.push(pm[1]);
  }
  const price = apex || priceAmount || displayPrice || corePr || prices[0] || null;

  // Image
  const hires = pick(/data-old-hires="([^"]+)"/);
  const hiResAll = [...html.matchAll(/"hiRes":"(https[^"]+)"/g)].map(x => x[1].replace(/\\\//g, '/'));
  let dyn = pick(/data-a-dynamic-image="([^"]+)"/);
  let dynUrl = null;
  if (dyn) {
    try {
      const obj = JSON.parse(dyn.replace(/&quot;/g, '"'));
      dynUrl = Object.keys(obj).sort((a, b) => (obj[b]?.[0] || 0) - (obj[a]?.[0] || 0))[0];
    } catch {}
  }
  const ogImg = pick(/property="og:image"[^>]*content="([^"]+)"/);
  let imgUrl = hires || dynUrl || hiResAll[0] || ogImg;
  if (imgUrl) imgUrl = imgUrl.replace(/\\u002F/g, '/').replace(/\\\//g, '/');

  return { title, price, imgUrl };
}

console.log(`Fixing ASINs for ${PRODUCTS.length} products...\n`);

const results = [];

for (let i = 0; i < PRODUCTS.length; i++) {
  const prod = PRODUCTS[i];
  console.log(`[${i+1}/${PRODUCTS.length}] ${prod.name.slice(0,40)}...`);
  
  // Step 1: Search Amazon for correct ASIN
  const newAsin = await searchAmazon(prod.name);
  await sleep(5000 + Math.random() * 5000);
  
  if (!newAsin) {
    console.log(`  Search failed — keeping ${prod.old}`);
    results.push({ ...prod, newAsin: prod.old, title: '', price: null, imgUrl: null });
    continue;
  }

  console.log(`  Found ASIN: ${newAsin} (was ${prod.old})`);

  // Step 2: Get product page for title/price/image
  const data = await getProductPage(newAsin);
  await sleep(5000 + Math.random() * 5000);

  if (data) {
    console.log(`  Title: "${(data.title||'').slice(0,50)}" Price: $${data.price||'?'} Img: ${data.imgUrl ? 'YES' : 'NO'}`);
    
    // Download hi-res image if available
    if (data.imgUrl) {
      mkdirSync('public/images/products', { recursive: true });
      const out = join('public/images/products', newAsin + '.jpg');
      try {
        const res = await fetch(data.imgUrl, { headers: { 'User-Agent': UA, Accept: 'image/*' } });
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.byteLength > 1000) writeFileSync(out, buf);
      } catch {}
    }
    
    results.push({ ...prod, newAsin, ...data });
  } else {
    console.log(`  Product page failed`);
    results.push({ ...prod, newAsin, title: '', price: null, imgUrl: null });
  }
}

writeFileSync('scripts/_asin-fixes.json', JSON.stringify(results, null, 2));

const fixed = results.filter(r => r.newAsin !== r.old);
const withPrice = results.filter(r => r.price);
const withImg = results.filter(r => r.imgUrl);
console.log(`\nDone: ${fixed.length} ASINs changed, ${withPrice.length} with price, ${withImg.length} with image`);
