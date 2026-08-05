import { writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SHORT = 'https://amzn.to/4fJko4c';
const ASIN_HINT = 'B09B8V1LZ3';
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

function cleanUrl(u) {
  return u.replace(/\\u002F/g, '/').replace(/\\\//g, '/').replace(/&amp;/g, '&');
}

function uniq(arr) {
  const seen = new Set();
  const out = [];
  for (const u of arr) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

const resolved = await follow(SHORT);
console.log('REDIRECT CHAIN:');
for (const c of resolved.chain) {
  console.log(c.status, c.url.slice(0, 140), c.loc ? '-> ' + c.loc.slice(0, 120) : '');
}

let asin = extractAsin(resolved.url);
for (const c of resolved.chain) {
  const a = extractAsin(c.url) || (c.loc && extractAsin(c.loc));
  if (a) {
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
  'https://www.amazon.com/dp/' + asin + '?th=1&psc=1&language=en_US&currency=USD';

let jar = cookies;
async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { ...headers, Cookie: jar },
    redirect: 'follow',
  });
  const set = res.headers.getSetCookie?.() || [];
  for (const sc of set) {
    const pair = sc.split(';')[0];
    jar += '; ' + pair;
  }
  const html = await res.text();
  return { res, html };
}

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

// Prefer ordered colorImages gallery
let gallery = [];
const colorBlock = html.match(/'colorImages'\s*:\s*\{\s*'initial'\s*:\s*(\[[\s\S]*?\])\s*\}/);
const colorBlock2 = html.match(/"colorImages"\s*:\s*\{\s*"initial"\s*:\s*(\[[\s\S]*?\])/);
const block = colorBlock?.[1] || colorBlock2?.[1];
if (block) {
  try {
    const fixed = block
      .replace(/'/g, '"')
      .replace(/(\w+):/g, '"$1":')
      .replace(/,\s*]/g, '}')
      .replace(/,\s*]/g, ']');
    // Safer: extract hiRes/large pairs in order
    const objs = [...block.matchAll(/\{[^{}]*?"hiRes"\s*:\s*(?:"([^"]+)"|null)[^{}]*?"large"\s*:\s*"([^"]+)"[^{}]*\}/g)];
    const objs2 = [...block.matchAll(/\{[^{}]*?"large"\s*:\s*"([^"]+)"[^{}]*?"hiRes"\s*:\s*(?:"([^"]+)"|null)[^{}]*\}/g)];
    if (objs.length) {
      gallery = objs.map((m) => cleanUrl(m[1] || m[2]));
    } else if (objs2.length) {
      gallery = objs2.map((m) => cleanUrl(m[2] || m[1]));
    } else {
      const hires = [...block.matchAll(/"hiRes"\s*:\s*"(https:[^"]+)"/g)].map((x) => cleanUrl(x[1]));
      const large = [...block.matchAll(/"large"\s*:\s*"(https:[^"]+)"/g)].map((x) => cleanUrl(x[1]));
      gallery = hires.length >= 2 ? hires : large;
    }
  } catch (e) {
    console.log('colorImages parse err', e.message);
  }
}

// Fallback: imageGalleryData
if (gallery.length < 2) {
  const ig = html.match(/imageGalleryData"\s*:\s*(\[[\s\S]*?\])/);
  if (ig) {
    const mains = [...ig[1].matchAll(/"mainUrl"\s*:\s*"(https:[^"]+)"/g)].map((x) => cleanUrl(x[1]));
    if (mains.length >= 2) gallery = mains;
  }
}

// Fallback: ordered hiRes from landing/color data
if (gallery.length < 2) {
  const hiResAll = [...html.matchAll(/"hiRes"\s*:\s*"(https:[^"]+)"/g)].map((x) => cleanUrl(x[1]));
  gallery = uniq(hiResAll);
}

// Fallback: #altImages thumbnails -> upscale
if (gallery.length < 2) {
  const alts = [...html.matchAll(/id="altImages"[\s\S]{0,8000}?id="imageBlock_feature_div"|id="altImages"[\s\S]{0,8000}/)];
  const altHtml = alts[0]?.[0] || '';
  const thumbs = [...altHtml.matchAll(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/g)].map((x) => x[1]);
  // Convert thumbnail (_SS40_ etc) to larger
  gallery = uniq(
    thumbs.map((t) => t.replace(/\._[A-Z0-9,_]+_\./, '.')).filter((u) => /\/I\/[A-Za-z0-9+%-]+\./.test(u)),
  );
}

gallery = uniq(gallery).filter(Boolean);
console.log('GALLERY_COUNT', gallery.length);
gallery.slice(0, 6).forEach((u, i) => console.log('  [' + i + ']', u.slice(0, 120)));

if (gallery.length < 2) {
  console.log('NO SECOND IMAGE');
  process.exit(1);
}

const imgUrl = gallery[1];
console.log('CHOSEN_INDEX', 1);
console.log('CHOSEN_URL', imgUrl);

// Try alt text near second thumbnail
let altHint = null;
const altImgs = [...html.matchAll(/<img[^>]+id="[^"]*image[^"]*"[^>]*>/gi)];
const altAll = [...html.matchAll(/imageThumbnail[^>]*>[\s\S]{0,200}?alt="([^"]+)"/gi)];
if (altAll[1]) altHint = altAll[1][1];
if (!altHint && altAll[0]) {
  // sometimes first match is main
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
const size = statSync(out).size;
console.log(
  JSON.stringify(
    {
      asin,
      title,
      imgUrl,
      index: 1,
      galleryCount: gallery.length,
      status: imgRes.status,
      size,
      altHint,
      ok: size > 8000,
    },
    null,
    2,
  ),
);
if (size <= 8000) process.exit(2);
