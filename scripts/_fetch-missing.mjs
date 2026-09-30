import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

// Mobile UA gets different (lighter) page that's less blocked
const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

const prev = JSON.parse(readFileSync('scripts/_new-articles-data.json', 'utf8'));
const done = new Set(prev.filter(p => p.title && p.imgUrl).map(p => p.asin));

const MISSING = [
  'B01MFAOMBI','B00PU2FBF4','B0CMVXQ3SM','B07N7WPRGS','B07RLRDP94',
  'B07PD5MRRL','B07GLC2KHH','B09B3WXPMT','B084GZRQ27','B073WLXHXM',
  'B079QXTNL8','B0B2PWKCBB','B0C55YJC8Y','B07DWM4BTM','B0CG6HN15K',
  'B01IJNJEZ0','B07K3SJHQ8','B0BN36Z27Y','B07Y1CMYGM','B000J49TLC',
  'B014F1DYSE','B07KXJPVWM','B07C5LG4FT','B0CKG57QYH','B09MYQFGS7',
  'B079WG3G4Y','B01KNZJ578','B09WDG35HB','B002MXO8SC','B0BFN8L5SC',
  'B09GFPDS3D','B07WSLXLHB','B0BTJHP31Y','B08P46X2P1','B006YXBVNE',
  'B09HMM3MV5',
].filter(a => !done.has(a));

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchAsin(asin) {
  // Try mobile amazon
  const url = `https://www.amazon.com/dp/${asin}`;
  const tmpFile = `scripts/_m-${asin}.html`;
  
  try {
    execSync(
      `curl -s -L --max-time 20 -o "${tmpFile}" ` +
      `-H "User-Agent: ${ua}" ` +
      `-H "Accept: text/html,application/xhtml+xml" ` +
      `-H "Accept-Language: en-US,en;q=0.9" ` +
      `-H "Cookie: i18n-prefs=USD; lc-main=en_US" ` +
      `"${url}"`,
      { timeout: 25000 }
    );
  } catch (e) {
    return null;
  }

  let html;
  try { html = readFileSync(tmpFile, 'utf8'); } catch { return null; }
  
  // Clean tmp
  try { execSync(`del /f "${tmpFile}" 2>nul`, { shell: 'cmd' }); } catch {}

  if (/robot check|captcha/i.test(html)) {
    console.log(`  ${asin}: CAPTCHA (mobile)`);
    return null;
  }

  function pick(re) {
    const m = html.match(re);
    return m ? m[1] : null;
  }

  // Mobile page has different selectors
  let title = (pick(/id="productTitle"[^>]*>\s*([^<]+)/) || '').trim();
  if (!title) title = (pick(/id="title_feature_div"[\s\S]{0,500}?<span[^>]*>\s*([^<]+)/) || '').trim();
  if (!title) title = (pick(/<title[^>]*>(?:Amazon\.com\s*:\s*)?([^<]+?)(?:\s*:\s*(?:Amazon|Home|Grocery))?<\/title>/) || '').trim();

  // Price from various locations
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
  // Also try og:image
  const ogImg = pick(/property="og:image"[^>]*content="([^"]+)"/);
  
  let imgUrl = hires || dynUrl || hiResAll[0] || ogImg || pick(/"large":"(https:[^"]+)"/);
  if (imgUrl) imgUrl = imgUrl.replace(/\\u002F/g, '/').replace(/\\\//g, '/');

  // If still no image, use Amazon Associates PA-API image format
  if (!imgUrl) {
    imgUrl = `https://m.media-amazon.com/images/P/${asin}._SL500_.jpg`;
  }

  const ok = !!(title && price);
  console.log(`  ${asin}: ${ok ? 'OK' : title ? 'NO_PRICE' : 'EMPTY'} "${(title||'').slice(0,50)}" — $${price || '?'} — img:${imgUrl ? 'YES' : 'NO'}`);

  // Download image
  if (imgUrl && !imgUrl.includes('/images/P/')) {
    mkdirSync('public/images/products', { recursive: true });
    const out = join('public/images/products', asin + '.jpg');
    try {
      execSync(`curl -s -L --max-time 10 -o "${out}" -H "User-Agent: ${ua}" "${imgUrl}"`, { timeout: 15000 });
    } catch {}
  }

  return { asin, title: title || '', price, imgUrl };
}

console.log(`Fetching ${MISSING.length} missing ASINs (mobile UA, 10-25s delays)...\n`);

const newResults = [];
for (let i = 0; i < MISSING.length; i++) {
  const r = await fetchAsin(MISSING[i]);
  if (r) newResults.push(r);
  
  if (i < MISSING.length - 1) {
    const d = 10000 + Math.random() * 15000;
    console.log(`    delay ${(d/1000).toFixed(0)}s...`);
    await sleep(d);
  }
}

// Merge with previous
const merged = [...prev.filter(p => done.has(p.asin)), ...newResults];
writeFileSync('scripts/_new-articles-data.json', JSON.stringify(merged, null, 2));

const full = merged.filter(r => r.title && r.price && r.imgUrl);
const withImg = merged.filter(r => r.imgUrl);
console.log(`\nDone: ${full.length} fully resolved, ${withImg.length} with image. Total: ${merged.length}`);
