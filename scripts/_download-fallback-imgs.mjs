import { writeFileSync, readFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FALLBACK = [
  'B01MFAOMBI','B00PU2FBF4','B0CMVXQ3SM','B07N7WPRGS','B07RLRDP94',
  'B07PD5MRRL','B07GLC2KHH','B09B3WXPMT','B084GZRQ27','B073WLXHXM',
  'B079QXTNL8','B0B2PWKCBB','B0C55YJC8Y','B07DWM4BTM','B0CG6HN15K',
  'B01IJNJEZ0','B07K3SJHQ8','B0BN36Z27Y','B07Y1CMYGM','B000J49TLC',
  'B014F1DYSE','B07KXJPVWM','B07C5LG4FT','B0CKG57QYH','B09MYQFGS7',
  'B079WG3G4Y','B01KNZJ578','B09WDG35HB','B002MXO8SC','B0BFN8L5SC',
  'B09GFPDS3D','B07WSLXLHB','B0BTJHP31Y','B08P46X2P1','B006YXBVNE',
  'B09HMM3MV5',
];

mkdirSync('public/images/products', { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let ok = 0, small = 0, fail = 0;

for (const asin of FALLBACK) {
  const url = `https://m.media-amazon.com/images/P/${asin}._SL500_.jpg`;
  const out = join('public/images/products', asin + '.jpg');
  
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', Accept: 'image/*' }
    });
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(out, buf);
    
    const size = buf.byteLength;
    if (size > 5000) {
      console.log(`  ${asin}: OK (${(size/1024).toFixed(0)}KB)`);
      ok++;
    } else {
      console.log(`  ${asin}: SMALL (${size}B) — may be placeholder`);
      small++;
    }
  } catch (e) {
    console.log(`  ${asin}: FAIL — ${e.message}`);
    fail++;
  }
  
  await sleep(500);
}

console.log(`\nDone: ${ok} good, ${small} small/placeholder, ${fail} failed`);
