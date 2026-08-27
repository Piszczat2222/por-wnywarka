/**
 * Priority IndexNow + GSC/Bing checklist for AltPik traffic sprint.
 * Run after deploy: node scripts/priority-index-urls.mjs
 * Manual: paste each URL into GSC URL Inspection and Bing URL Submission (no trailing slash).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const key = process.env.INDEXNOW_KEY ?? '748a39219ac649ab8452996fe1d35420';
const host = 'altpik.com';

/** 5 SEO-refreshed top GSC pages + 4 new articles from content SEO sprint */
export const PRIORITY_URLS = [
  'https://altpik.com/articles/phone-accessories-amazon',
  'https://altpik.com/articles/amazon-supplements-best-sellers',
  'https://altpik.com/articles/ninja-creami-alternative',
  'https://altpik.com/articles/robot-vacuum-alternative',
  'https://altpik.com/articles/college-dorm-essentials-amazon',
  'https://altpik.com/articles/amazon-kitchen-best-sellers',
  'https://altpik.com/articles/amazon-gifts-under-20',
  'https://altpik.com/articles/housewarming-gifts-amazon',
  // Traffic sprint additions
  'https://altpik.com/articles/baby-brezza-alternative',
  'https://altpik.com/articles/car-emergency-kit-amazon',
  'https://altpik.com/articles/teacher-classroom-gadgets-amazon',
  'https://altpik.com/articles/air-fryer-accessories-amazon',
  'https://altpik.com/articles/stanley-tumbler-alternative',
  'https://altpik.com/articles/tiktok-home-organizers-amazon',
  // New API-pinned listicles (Aug 2026)
  'https://altpik.com/articles/closet-organization-amazon',
  'https://altpik.com/articles/under-sink-kitchen-organizers-amazon',
  'https://altpik.com/articles/pet-travel-car-amazon',
  'https://altpik.com/articles/streaming-setup-amazon',
  'https://altpik.com/articles/winter-driving-essentials-amazon',
  'https://altpik.com/articles/entryway-organizers-amazon',
  'https://altpik.com/articles/home-tool-kit-essentials-amazon',
  'https://altpik.com/articles/kids-art-supplies-amazon',
  'https://altpik.com/articles/kitchen-drawer-organizers-amazon',
  'https://altpik.com/articles/medicine-cabinet-organizers-amazon',
];

const checklistPath = join(process.cwd(), 'scripts', 'gsc-bing-index-checklist.txt');

const checklist = `# AltPik — GSC + Bing index checklist (no trailing slash)
Generated for traffic growth sprint. Do NOT flip trailingSlash in astro.config.

## Before indexing
1. npm run deploy  (needs CLOUDFLARE_API_TOKEN locally)
2. Confirm live: https://altpik.com/sitemap-index.xml
3. Re-submit sitemap in GSC and Bing Webmaster Tools

## URL Inspection / Bing Submit (request indexing)
${PRIORITY_URLS.map((u, i) => `${i + 1}. ${u}`).join('\n')}

## After submit
- Wait 7–14 days — no URL format changes
- Weekly: GSC Performance (impressions → clicks) + Pages indexing summary
- Bing: Search Performance + IndexNow success

## Automate IndexNow for this list
node scripts/priority-index-urls.mjs
`;

writeFileSync(checklistPath, checklist, 'utf8');
console.log(`Wrote ${checklistPath}`);

const body = {
  host,
  key,
  keyLocation: `https://${host}/${key}.txt`,
  urlList: PRIORITY_URLS,
};

try {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (response.ok || response.status === 202) {
    console.log(`IndexNow: submitted ${PRIORITY_URLS.length} priority URL(s) (HTTP ${response.status})`);
  } else {
    console.warn(`IndexNow: failed HTTP ${response.status}: ${text}`);
    console.warn('Deploy first, then re-run this script. Use the checklist for GSC/Bing UI.');
  }
} catch (err) {
  console.warn(`IndexNow: network error — ${err.message}`);
  console.warn('Checklist still written; submit URLs manually after deploy.');
}
