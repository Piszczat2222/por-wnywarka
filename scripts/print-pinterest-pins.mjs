/**
 * Print ready-to-post Pinterest pin copy from scripts/pinterest-pins.json
 * Usage: node scripts/print-pinterest-pins.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const pins = JSON.parse(readFileSync(join(process.cwd(), 'scripts', 'pinterest-pins.json'), 'utf8'));
const outDir = join(process.cwd(), 'public', 'pinterest');
mkdirSync(outDir, { recursive: true });

let md = `# AltPik Pinterest batch (${pins.length} pins)

Post 1–2 per day. Vertical images: use generated PNGs in /public/pinterest/ or Canva 1000×1500.
Destination URL = article URL (no trailing slash). Soft CTA in description — no spammy keyword stuffing.

`;

pins.forEach((pin, i) => {
  md += `## ${i + 1}. ${pin.title}\n`;
  md += `- Board: ${pin.board}\n`;
  md += `- Link: ${pin.url}\n`;
  md += `- Alt: ${pin.altText}\n`;
  md += `- Description:\n\n${pin.description}\n\n`;
  console.log(`\n--- Pin ${i + 1}/${pins.length} [${pin.board}] ---`);
  console.log(`Title: ${pin.title}`);
  console.log(`Link: ${pin.url}`);
  console.log(`Desc: ${pin.description}`);
});

writeFileSync(join(outDir, 'pin-copy.txt'), md, 'utf8');
console.log(`\nWrote ${join(outDir, 'pin-copy.txt')}`);
