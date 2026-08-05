import { readFileSync, statSync } from 'node:fs';
const html = readFileSync('scripts/_page-tmp.html', 'utf8');
const altSec = html.match(/id="altImages"[\s\S]{0,15000}/);
if (altSec) {
  const imgs = [...altSec[0].matchAll(/<img[^>]+>/g)];
  imgs.slice(0, 6).forEach((im, i) => {
    const alt = (im[0].match(/alt="([^"]*)"/) || [])[1];
    const src = (im[0].match(/src="([^"]+)"/) || [])[1];
    console.log(i, JSON.stringify(alt), src && src.slice(0, 100));
  });
}
const variants = [...html.matchAll(/"variant"\s*:\s*"([^"]+)"/g)].slice(0, 12).map((m) => m[1]);
console.log('variants', variants);
console.log('size', statSync('public/images/products/B09B93ZDG4.jpg').size);
