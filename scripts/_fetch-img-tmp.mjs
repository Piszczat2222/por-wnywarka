import { readFileSync, writeFileSync, statSync } from 'node:fs';

const ASIN = 'B01G98Y1BA';
const html = readFileSync('scripts/_page-tmp.html', 'utf8');

const landingBlock = html.match(/id="landingImage"[\s\S]{0,2500}/);
console.log('landing block snippet:', landingBlock ? landingBlock[0].replace(/\s+/g,' ').slice(0,500) : 'NONE');

const hires = html.match(/data-old-hires="([^"]+)"/);
console.log('old-hires', hires && hires[1]);

const dyn = html.match(/id="landingImage"[^>]*data-a-dynamic-image="([^"]+)"/);
if (dyn) {
  const raw = dyn[1].replace(/&quot;/g, '"');
  console.log('dyn raw slice', raw.slice(0, 200));
  try {
    const obj = JSON.parse(raw);
    console.log('dyn keys', Object.keys(obj).slice(0,5));
  } catch(e) { console.log('dyn parse err', e.message); }
}

// colorImages from ImageBlockBTF / imageGalleryData
const color = html.match(/'colorImages'\s*:\s*(\{[\s\S]*?\}),\s*'colorToAsin'/);
const color2 = html.match(/var data\s*=\s*(\{[\s\S]*?"colorImages"[\s\S]*?\});\s*/);
const hiResAll = [...html.matchAll(/"hiRes":"(https[^"]+)"/g)].map(m => m[1].replace(/\\\//g,'/'));
console.log('hiRes count', hiResAll.length, 'first', hiResAll[0]);

const main = (hires && hires[1]) || hiResAll[0] || 'https://m.media-amazon.com/images/I/71Wazbe2zfL._SL1500_.jpg';
console.log('MAIN', main);

const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const res = await fetch(main, {
  headers: { 'User-Agent': ua, Accept: 'image/*', Referer: 'https://www.amazon.com/' },
});
const buf = Buffer.from(await res.arrayBuffer());
const out = `public/images/products/${ASIN}.jpg`;
writeFileSync(out, buf);
console.log('status', res.status, 'size', buf.byteLength, 'saved', out, 'stat', statSync(out).size);
