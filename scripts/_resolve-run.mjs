import { writeFileSync, readFileSync, statSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ASIN_HINT = '';
const SHORT = 'https://amzn.to/4fTSPW0';
const ua =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const cookies =
  'i18n-prefs=USD; lc-main=en_US; sp-cdn="L5Z9:US"; session-id-time=2082787201l';

const headers = {
  'User-Agent': ua,
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  Cookie: cookies,
  Referer: 'https://www.amazon.com/',
};

function extractAsin(url) {
  const m = url.match(/\/(?:dp|gp\/product|d)\/([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

async function follow(url, depth = 0, chain = []) {
  if (depth > 10) return { url, chain };
  const res = await fetch(url, { redirect: 'manual', headers });
  const loc = res.headers.get('location');
  chain.push({ status: res.status, url, loc });
  if (loc && res.status >= 300 && res.status < 400) {
    return follow(new URL(loc, url).href, depth + 1, chain);
  }
  return { url, chain, status: res.status };
}

async function setZip(htmlCookies) {
  // Attempt address/zip via glow portal if needed; keep cookie jar string
  return htmlCookies;
}

const resolved = await follow(SHORT);
console.log('REDIRECT CHAIN:');
for (const c of resolved.chain) {
  console.log(c.status, c.url.slice(0, 120), c.loc ? '-> ' + c.loc.slice(0, 100) : '');
}

let asin = extractAsin(resolved.url);
for (const c of resolved.chain) {
  const a = extractAsin(c.url) || (c.loc && extractAsin(c.loc));
  if (a) {
    // prefer amazon.com / a.co / ar_su
    const u = (c.loc || c.url).toLowerCase();
    if (u.includes('amazon.com') || u.includes('a.co') || u.includes('ar_su')) {
      asin = a;
      break;
    }
    if (!asin) asin = a;
  }
}
if (!asin) asin = ASIN_HINT;
console.log('RESOLVED_ASIN', asin, 'hint_match', asin === ASIN_HINT);

const productUrl =
  'https://www.amazon.com/dp/' +
  asin +
  '?th=1&psc=1&language=en_US&currency=USD';

// Establish session + zip via cookie / glow
let jar = cookies;
async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { ...headers, Cookie: jar },
    redirect: 'follow',
  });
  const set = res.headers.getSetCookie?.() || [];
  for (const sc of set) {
    const pair = sc.split(';')[0];
    const name = pair.split('=')[0];
    // replace or append
    const re = new RegExp('(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '=[^;]*');
    if (re.test(jar)) jar = jar.replace(re, (m) => (m.startsWith(';') ? '; ' : '') + pair);
    else jar += '; ' + pair;
  }
  const html = await res.text();
  return { res, html };
}

// Try to set delivery zip 10001
try {
  const zipRes = await fetch(
    'https://www.amazon.com/gp/delivery/ajax/address-change.html',
    {
      method: 'POST',
      headers: {
        ...headers,
        Cookie: jar,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body:
        'locationType=LOCATION_INPUT&zipCode=10001&storeContext=generic&deviceType=web&pageType=Detail&actionSource=glow',
    },
  );
  const set = zipRes.headers.getSetCookie?.() || [];
  for (const sc of set) {
    const pair = sc.split(';')[0];
    jar += '; ' + pair;
  }
  console.log('zip status', zipRes.status);
} catch (e) {
  console.log('zip err', e.message);
}

const { res, html } = await fetchPage(productUrl);
writeFileSync('scripts/_page-tmp.html', html);
console.log(
  'page status',
  res.status,
  'final',
  res.url,
  'len',
  html.length,
  'captcha',
  /opfcaptcha|robot check|Enter the characters you see/i.test(html),
);

function pick(re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

const title = (pick(/id="productTitle"[^>]*>\s*([^<]+)/) || '').trim();
const apex = pick(/apexPriceToPay[\s\S]{0,400}?class="a-offscreen">\$([\d.,]+)/);
const core = pick(
  /id="corePrice_feature_div"[\s\S]{0,900}?class="a-offscreen">\$([\d.,]+)/,
);
const coreDisp = pick(
  /id="corePriceDisplay_desktop_feature_div"[\s\S]{0,900}?class="a-offscreen">\$([\d.,]+)/,
);
const priceAmount = pick(/"priceAmount":([\d.]+)/);
const displayPrice = pick(/"displayPrice":"\$([\d.,]+)"/);
const buybox = pick(
  /id="tp_price_block_total_price_ww"[\s\S]{0,500}?class="a-offscreen">\$([\d.,]+)/,
);
const twister = pick(/"displayPrice"\s*:\s*"\$([\d.,]+)"/);

const prices = [];
const reWhole =
  /<span class="a-price-whole">(\d[\d,]*)<\/span><span class="a-price-decimal">[\s\S]*?<span class="a-price-fraction">(\d+)/g;
let m;
while ((m = reWhole.exec(html)) && prices.length < 8) {
  prices.push(m[1].replace(/,/g, '') + '.' + m[2]);
}

const price =
  apex || coreDisp || core || buybox || displayPrice || twister || priceAmount || prices[0] || null;

const hires = pick(/id="landingImage"[^>]*data-old-hires="([^"]+)"/);
const hiResAll = [...html.matchAll(/"hiRes":"(https[^"]+)"/g)].map((x) =>
  x[1].replace(/\\\//g, '/'),
);
let dyn = pick(/id="landingImage"[^>]*data-a-dynamic-image="([^"]+)"/);
let dynUrl = null;
if (dyn) {
  try {
    const obj = JSON.parse(dyn.replace(/&quot;/g, '"'));
    dynUrl = Object.keys(obj).sort((a, b) => (obj[b]?.[0] || 0) - (obj[a]?.[0] || 0))[0];
  } catch {}
}

let imgUrl =
  (hires && hires) ||
  dynUrl ||
  hiResAll[0] ||
  pick(/"large":"(https:[^"]+)"/);
if (imgUrl) imgUrl = imgUrl.replace(/\\u002F/g, '/').replace(/\\\//g, '/');

console.log(
  JSON.stringify(
    {
      asin,
      title,
      price,
      apex,
      core,
      coreDisp,
      buybox,
      displayPrice,
      priceAmount,
      prices: prices.slice(0, 5),
      imgUrl,
      titleTag: pick(/<title[^>]*>([^<]+)/),
    },
    null,
    2,
  ),
);

if (!imgUrl) {
  console.log('NO IMAGE URL');
  process.exit(1);
}

mkdirSync('public/images/products', { recursive: true });
const imgRes = await fetch(imgUrl, {
  headers: {
    'User-Agent': ua,
    Accept: 'image/*',
    Referer: 'https://www.amazon.com/',
  },
});
const buf = Buffer.from(await imgRes.arrayBuffer());
const out = join('public/images/products', asin + '.jpg');
writeFileSync(out, buf);
console.log('IMAGE', imgRes.status, 'size', buf.byteLength, 'path', out, 'stat', statSync(out).size);
