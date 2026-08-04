import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ASIN = 'B01G98Y1BA';
const html = readFileSync('scripts/_page-tmp.html', 'utf8');

function pick(re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

const title = (pick(/id="productTitle"[^>]*>\s*([^<]+)/) || '').trim();

const prices = [];
const reWhole = /<span class="a-price-whole">(\d[\d,]*)<\/span><span class="a-price-decimal">[\s\S]*?<span class="a-price-fraction">(\d+)/g;
let m;
while ((m = reWhole.exec(html)) && prices.length < 8) {
  prices.push(m[1].replace(/,/g, '') + '.' + m[2]);
}

const apex = pick(/apexPriceToPay[\s\S]{0,400}?class="a-offscreen">\$([\d.,]+)/);
const core = pick(/id="corePrice_feature_div"[\s\S]{0,900}?class="a-offscreen">\$([\d.,]+)/);
const coreDisp = pick(/id="corePriceDisplay_desktop_feature_div"[\s\S]{0,900}?class="a-offscreen">\$([\d.,]+)/);
const priceAmount = pick(/"priceAmount":([\d.]+)/);
const displayPrice = pick(/"displayPrice":"\$([\d.,]+)"/);

const landing =
  pick(/id="landingImage"[^>]*data-old-hires="([^"]+)"/) ||
  pick(/data-a-dynamic-image="([^"]+)"/) ||
  pick(/"hiRes":"(https:[^"]+)"/) ||
  pick(/"large":"(https:[^"]+)"/);

let imgUrl = landing;
if (landing && landing.startsWith('{')) {
  try {
    const obj = JSON.parse(landing.replace(/&quot;/g, '"'));
    imgUrl = Object.keys(obj)[0];
  } catch {}
}
// unescape
if (imgUrl) imgUrl = imgUrl.replace(/\\u002F/g, '/').replace(/\\\//g, '/');

console.log(JSON.stringify({ title, apex, core, coreDisp, priceAmount, displayPrice, prices: prices.slice(0, 5), imgUrl }, null, 2));
