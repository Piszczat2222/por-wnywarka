import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const ua =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const ASINS = [
  'B01MFAOMBI','B004EDWMBO','B00BAM7F8C','B00PU2FBF4','B0CMVXQ3SM',
  'B07KC5DWCC','B07N7WPRGS','B07RLRDP94','B07PD5MRRL','B07GLC2KHH',
  'B09B3WXPMT','B084GZRQ27','B073WLXHXM','B079QXTNL8','B08PJ7JMQM',
  'B0B2PWKCBB','B0C55YJC8Y','B09NRG4GK3','B07DWM4BTM','B0CG6HN15K',
  'B01IJNJEZ0','B07K3SJHQ8','B01M11FLUJ','B0BN36Z27Y','B07Y1CMYGM',
  'B000J49TLC','B014F1DYSE','B000OOYECC','B07KXJPVWM','B07ZWK2TQT',
  'B07C5LG4FT','B0016HF5GK','B0CKG57QYH','B09MYQFGS7','B079WG3G4Y',
  'B01KNZJ578','B09WDG35HB','B002MXO8SC','B000V72992','B000EFDOOA',
  'B0BFN8L5SC','B09GFPDS3D','B076VNFZJG','B07WSLXLHB','B0BTJHP31Y',
  'B07ZVKTP53','B08P46X2P1','B006YXBVNE','B00006IE8M','B09HMM3MV5',
];

// Load previous results to skip already-fetched
let prev = [];
try { prev = JSON.parse(readFileSync('scripts/_new-articles-data.json', 'utf8')); } catch {}
const alreadyDone = new Set(prev.filter(p => p.title && p.price && p.imgUrl).map(p => p.asin));

const toFetch = ASINS.filter(a => !alreadyDone.has(a));
console.log(`Already done: ${alreadyDone.size}, remaining: ${toFetch.length}`);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function randomDelay() {
  return 8000 + Math.random() * 12000; // 8-20s between requests
}

async function fetchWithCurl(asin) {
  const url = `https://www.amazon.com/dp/${asin}?th=1&psc=1&language=en_US&currency=USD`;
  const tmpFile = `scripts/_page-${asin}.html`;
  
  try {
    execSync(
      `curl -s -L -o "${tmpFile}" ` +
      `-H "User-Agent: ${ua}" ` +
      `-H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" ` +
      `-H "Accept-Language: en-US,en;q=0.9" ` +
      `-H "Cookie: i18n-prefs=USD; lc-main=en_US; sp-cdn=\\"L5Z9:US\\"; session-id-time=2082787201l" ` +
      `-H "Referer: https://www.amazon.com/" ` +
      `"${url}"`,
      { timeout: 30000 }
    );
  } catch (e) {
    console.log(`  ${asin}: curl failed — ${e.message}`);
    return null;
  }

  let html;
  try { html = readFileSync(tmpFile, 'utf8'); } catch { return null; }

  const captcha = /opfcaptcha|robot check|Enter the characters you see/i.test(html);
  if (captcha) {
    console.log(`  ${asin}: CAPTCHA`);
    return { asin, title: '', price: null, imgUrl: null, captcha: true };
  }

  function pick(re) {
    const m = html.match(re);
    return m ? m[1] : null;
  }

  const title = (pick(/id="productTitle"[^>]*>\s*([^<]+)/) || '').trim();
  const apex = pick(/apexPriceToPay[\s\S]{0,400}?class="a-offscreen">\$([\d.,]+)/);
  const core = pick(/id="corePrice_feature_div"[\s\S]{0,900}?class="a-offscreen">\$([\d.,]+)/);
  const coreDisp = pick(/id="corePriceDisplay_desktop_feature_div"[\s\S]{0,900}?class="a-offscreen">\$([\d.,]+)/);
  const priceAmount = pick(/"priceAmount":([\d.]+)/);
  const displayPrice = pick(/"displayPrice":"\$([\d.,]+)"/);
  const buybox = pick(/id="tp_price_block_total_price_ww"[\s\S]{0,500}?class="a-offscreen">\$([\d.,]+)/);

  const prices = [];
  const reWhole = /<span class="a-price-whole">(\d[\d,]*)<\/span><span class="a-price-decimal">[\s\S]*?<span class="a-price-fraction">(\d+)/g;
  let m;
  while ((m = reWhole.exec(html)) && prices.length < 8) {
    prices.push(m[1].replace(/,/g, '') + '.' + m[2]);
  }

  const price = apex || coreDisp || core || buybox || displayPrice || priceAmount || prices[0] || null;

  const hires = pick(/id="landingImage"[^>]*data-old-hires="([^"]+)"/);
  const hiResAll = [...html.matchAll(/"hiRes":"(https[^"]+)"/g)].map(x => x[1].replace(/\\\//g, '/'));
  let dyn = pick(/id="landingImage"[^>]*data-a-dynamic-image="([^"]+)"/);
  let dynUrl = null;
  if (dyn) {
    try {
      const obj = JSON.parse(dyn.replace(/&quot;/g, '"'));
      dynUrl = Object.keys(obj).sort((a, b) => (obj[b]?.[0] || 0) - (obj[a]?.[0] || 0))[0];
    } catch {}
  }

  let imgUrl = hires || dynUrl || hiResAll[0] || pick(/"large":"(https:[^"]+)"/);
  if (imgUrl) imgUrl = imgUrl.replace(/\\u002F/g, '/').replace(/\\\//g, '/');

  const success = title && (price || imgUrl);
  console.log(`  ${asin}: ${success ? 'OK' : 'PARTIAL'} "${title.slice(0,50)}" — $${price || '?'} — img:${imgUrl ? 'YES' : 'NO'}`);

  // Download image
  if (imgUrl) {
    mkdirSync('public/images/products', { recursive: true });
    const out = join('public/images/products', asin + '.jpg');
    try {
      execSync(`curl -s -L -o "${out}" -H "User-Agent: ${ua}" -H "Accept: image/*" -H "Referer: https://www.amazon.com/" "${imgUrl}"`, { timeout: 15000 });
    } catch {}
  }

  // Clean up tmp html
  try { execSync(`del "${tmpFile}"`, { shell: 'cmd' }); } catch {}

  return { asin, title, price, imgUrl };
}

console.log(`\nFetching ${toFetch.length} products with 8-20s delays...\n`);

const results = [...prev.filter(p => alreadyDone.has(p.asin))];
let captchaCount = 0;

for (let i = 0; i < toFetch.length; i++) {
  const asin = toFetch[i];
  
  if (captchaCount >= 3) {
    console.log(`\n3 CAPTCHAs in a row — pausing 60s...\n`);
    await sleep(60000);
    captchaCount = 0;
  }

  const r = await fetchWithCurl(asin);
  if (r) {
    results.push(r);
    if (r.captcha) {
      captchaCount++;
    } else {
      captchaCount = 0;
    }
  }

  // Save progress after each
  writeFileSync('scripts/_new-articles-data.json', JSON.stringify(results, null, 2));

  if (i < toFetch.length - 1) {
    const delay = randomDelay();
    console.log(`    waiting ${(delay/1000).toFixed(1)}s...`);
    await sleep(delay);
  }
}

const successful = results.filter(r => r.title && r.price && r.imgUrl);
console.log(`\nDone: ${successful.length}/${ASINS.length} fully resolved. Saved to scripts/_new-articles-data.json`);
