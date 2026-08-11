/**
 * Print ready-to-post Pinterest pin copy from scripts/pinterest-pins.json
 * Usage: node scripts/print-pinterest-pins.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const pins = JSON.parse(readFileSync(join(process.cwd(), 'scripts', 'pinterest-pins.json'), 'utf8'));
const outDir = join(process.cwd(), 'public', 'pinterest');
mkdirSync(outDir, { recursive: true });

const boards = [
  'Skincare Tools & Self-Care',
  'Gift Ideas Under $25',
  'Home Comfort Finds',
  'Kitchen Amazon Finds',
  'Fitness & Yoga Essentials',
];

let md = `# AltPik Pinterest — 4-week schedule (${pins.length} pins)

Post **1–2 pins/day** in order (week → day). Canva: **1000×1500**, one headline + one sub + optional “Save this list”.
Destination URL = article URL (no trailing slash). Soft CTA — no keyword stuffing.

## Boards to create (once)

${boards.map((b) => `- ${b}`).join('\n')}

## Profile (once)

- Avatar: export \`public/favicon.svg\` to PNG ~400×400 (green check)
- Bio: Amazon picks that earn a spot — beauty, home, gifts. Honest lists on altpik.com
- Website: https://altpik.com

## Cadence

| Week | Cluster | Pins |
|---|---|---|
| 1 | Beauty / skincare | days 1–7 → skincare-tools-amazon |
| 2 | Beauty extend | days 8–13 → grooming, Airwrap alt, jewelry |
| 3 | Home / organize | days 15–25 → organizers, bathroom, sleep |
| 4 | Gifts + kitchen | days 26–32 → gifts under $20, housewarming, kitchen under $30 |

Ads: see \`public/pinterest/ads-checklist.txt\` after days 10–14 of organic data.

---

`;

let currentWeek = null;
pins.forEach((pin, i) => {
  if (pin.week !== currentWeek) {
    currentWeek = pin.week;
    md += `\n# Week ${pin.week} — ${pin.cluster}\n\n`;
  }

  md += `## Day ${pin.day ?? i + 1}. ${pin.title}\n`;
  md += `- Board: ${pin.board}\n`;
  md += `- Link: ${pin.url}\n`;
  md += `- Alt: ${pin.altText}\n`;
  if (pin.canvaHook) {
    md += `- Canva hook: ${pin.canvaHook}`;
    if (pin.canvaSub) md += ` / ${pin.canvaSub}`;
    md += `\n`;
  }
  if (pin.image) md += `- Existing image: ${pin.image}\n`;
  md += `- Description:\n\n${pin.description}\n\n`;

  console.log(`\n--- W${pin.week} D${pin.day} [${pin.board}] ---`);
  console.log(`Title: ${pin.title}`);
  console.log(`Link: ${pin.url}`);
  console.log(`Desc: ${pin.description}`);
});

writeFileSync(join(outDir, 'pin-copy.txt'), md, 'utf8');
console.log(`\nWrote ${join(outDir, 'pin-copy.txt')} (${pins.length} pins)`);
