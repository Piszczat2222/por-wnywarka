import { writeFileSync } from 'node:fs';

const ASIN = 'B09B93ZDG4';
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
    const re = new RegExp(
      '(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '=[^;]*',
    );
    if (re.test(jar)) jar = jar.replace(re, (m) => (m.startsWith(';') ? '; ' : '') + pair);
    else jar += '; ' + pair;
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
    jar += '; ' + sc.split(';')[0];
  }
  console.log('zip status', zipRes.status);
} catch (e) {
  console.log('zip err', e.message);
}

const productUrl =
  'https://www.amazon.com/dp/' + ASIN + '?th=1&psc=1&language=en_US&currency=USD';
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

// Gallery: colorImages from ImageBlockATF / landingImage data
const gallery = [];
const colorBlock = html.match(/'colorImages'\s*:\s*\{\s*'initial'\s*:\s*(\[[\s\S]*?\])\s*\}/);
if (colorBlock) {
  try {
    const arr = JSON.parse(colorBlock[1].replace(/'/g, '"'));
    for (const item of arr) {
      const u = (item.hiRes || item.large || '').replace(/\\\//g, '/');
      if (u) gallery.push({ hiRes: item.hiRes || null, large: item.large || null, chosen: u });
    }
  } catch (e) {
    console.log('colorImages parse err', e.message);
  }
}

if (!gallery.length) {
  const hiResAll = [...html.matchAll(/"hiRes":"(https[^"]+)"/g)].map((x) =>
    x[1].replace(/\\\//g, '/'),
  );
  const largeAll = [...html.matchAll(/"large":"(https:[^"]+)"/g)].map((x) =>
    x[1].replace(/\\\//g, '/'),
  );
  const n = Math.max(hiResAll.length, largeAll.length);
  for (let i = 0; i < n; i++) {
    gallery.push({
      hiRes: hiResAll[i] || null,
      large: largeAll[i] || null,
      chosen: hiResAll[i] || largeAll[i] || null,
    });
  }
}

console.log(
  JSON.stringify(
    {
      asin: ASIN,
      title,
      buyboxPrice: price,
      sources: { apex, coreDisp, core, buybox, displayPrice, twister, priceAmount, prices: prices.slice(0, 5) },
      galleryFirst3: gallery.slice(0, 3).map((g, i) => ({ index: i + 1, ...g })),
      titleTag: pick(/<title[^>]*>([^<]+)/),
    },
    null,
    2,
  ),
);
