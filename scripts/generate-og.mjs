import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const publicDir = join(process.cwd(), 'public');
const svgFiles = readdirSync(publicDir).filter((file) => file.startsWith('og-') && file.endsWith('.svg'));

for (const file of svgFiles) {
  const svg = readFileSync(join(publicDir, file), 'utf8');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const pngData = resvg.render();
  const pngName = file.replace('.svg', '.png');
  writeFileSync(join(publicDir, pngName), pngData.asPng());
  console.log(`Generated ${pngName}`);
}

console.log(`Done: ${svgFiles.length} OG PNG(s) written to public/`);
