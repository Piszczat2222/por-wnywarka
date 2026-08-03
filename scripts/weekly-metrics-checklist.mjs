/**
 * Weekly traffic metrics checklist for AltPik.
 * Run every Monday: node scripts/weekly-metrics-checklist.mjs
 * Does NOT flip trailingSlash — observe impressions 7–14 days after deploy.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const today = new Date().toISOString().slice(0, 10);
const outDir = join(process.cwd(), 'scripts', 'metrics-logs');
mkdirSync(outDir, { recursive: true });

const checklist = `# Weekly traffic check — ${today}

## Hard rules this week
- [ ] Do NOT change trailingSlash / build.format / canonical URL shape
- [ ] Confirm live sitemap: https://altpik.com/sitemap-index.xml

## Google Search Console
- [ ] Performance (28d): note total impressions ____  clicks ____  CTR ____
- [ ] Compare to last week: impressions up / flat / down
- [ ] Top 10 pages by impressions — list URLs (these get next thicken pass)
- [ ] Pages > Indexing: Indexed ____ | Discovered not indexed ____ | Crawled not indexed ____
- [ ] URL Inspection spot-check 3 priority URLs (no trailing slash)

## Bing Webmaster Tools
- [ ] Search Performance: impressions ____ clicks ____
- [ ] IndexNow / URL submission: any new errors?
- [ ] Sitemap status OK?

## Content / distribution follow-ups
- [ ] Posted 1–2 Pinterest pins from public/pinterest/pin-copy.txt
- [ ] Pick next 5 thin listicles from GSC top impressions (not random)
- [ ] After deploy: npm run index-priority

## Notes
(paste observations)

`;

const outPath = join(outDir, `${today}.txt`);
writeFileSync(outPath, checklist, 'utf8');
console.log(checklist);
console.log(`Saved empty checklist template → ${outPath}`);
console.log('Fill it in GSC/Bing UI; commit optional. No URL flips for 7–14 days.');
