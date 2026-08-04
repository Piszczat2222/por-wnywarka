import { readFileSync } from 'node:fs';
const html = readFileSync('scripts/_page-tmp.html','utf8');
const title = (html.match(/id="productTitle"[^>]*>\s*([^<]+)/)||[])[1]?.trim();
const titleTag = (html.match(/<title[^>]*>([^<]+)/)||[])[1];
const sel = html.match(/id="inline-twister-expanded-dimension-text-color_name"[^>]*>\s*([^<]+)/);
const sel2 = [...html.matchAll(/class="selection"[^>]*>\s*([^<]+)/g)].map(m=>m[1].trim());
const twisterSelected = html.match(/"selected_variations"\s*:\s*(\{[^}]+\})/);
const landingAlt = html.match(/id="landingImage"[^>]*alt="([^"]+)"/);
const defaultAsin = html.match(/data-defaultasin="([^"]+)"/);
const parentAsin = html.match(/"parentAsin"\s*:\s*"([^"]+)"/);
console.log(JSON.stringify({
  title,
  titleTag: titleTag?.slice(0,180),
  sel: sel&&sel[1]?.trim(),
  sel2: sel2.slice(0,5),
  twisterSelected: twisterSelected&&twisterSelected[1],
  landingAlt: landingAlt&&landingAlt[1]?.slice(0,120),
  defaultAsin: defaultAsin&&defaultAsin[1],
  parentAsin: parentAsin&&parentAsin[1],
}, null, 2));
for (const team of ['Minnesota Vikings','Cincinnati Bengals']) {
  console.log('count', team, (html.split(team).length-1));
}
const aria = html.match(/aria-label="([^"]*(?:Vikings|Bengals|Team)[^"]*)"/g);
console.log('aria', aria&&aria.slice(0,12));
