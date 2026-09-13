import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const publicDir = join(process.cwd(), 'public');
const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const articleOgDir = join(publicDir, 'og', 'articles');
mkdirSync(articleOgDir, { recursive: true });

function renderPng(svg, outputPath) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  writeFileSync(outputPath, resvg.render().asPng());
}

function xml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function frontmatterValue(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) return '';
  const raw = match[1].trim();
  try {
    return JSON.parse(raw);
  } catch {
    return raw.replace(/^['"]|['"]$/g, '');
  }
}

function wrapTitle(title, max = 34, limit = 3) {
  const words = title.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if (current && `${current} ${word}`.length > max) {
      lines.push(current);
      current = word;
      if (lines.length === limit - 1) break;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  const used = lines.join(' ').split(/\s+/).filter(Boolean).length;
  const remaining = words.slice(used).join(' ');
  if (remaining) lines.push(remaining.length > max + 8 ? `${remaining.slice(0, max + 5).trim()}…` : remaining);
  return lines.slice(0, limit);
}

const svgFiles = readdirSync(publicDir).filter((file) => file.startsWith('og-') && file.endsWith('.svg'));
for (const file of svgFiles) {
  const pngName = file.replace('.svg', '.png');
  renderPng(readFileSync(join(publicDir, file), 'utf8'), join(publicDir, pngName));
  console.log(`Generated ${pngName}`);
}

let articleCount = 0;
for (const file of readdirSync(articlesDir).filter((name) => name.endsWith('.md'))) {
  const content = readFileSync(join(articlesDir, file), 'utf8');
  const title = frontmatterValue(content, 'title');
  const category = frontmatterValue(content, 'categoryLabel') || 'Shopping guide';
  const slug = file.replace(/\.md$/, '');
  const titleText = wrapTitle(title)
    .map((line, index) => `<text x="72" y="${238 + index * 76}" fill="#ffffff" font-family="Arial, sans-serif" font-size="58" font-weight="800">${xml(line)}</text>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111827"/><stop offset="1" stop-color="#14532d"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1080" cy="80" r="230" fill="#22c55e" opacity=".12"/>
  <text x="72" y="92" fill="#86efac" font-family="Arial, sans-serif" font-size="32" font-weight="700">AltPik</text>
  <text x="72" y="148" fill="#d1d5db" font-family="Arial, sans-serif" font-size="23">${xml(category)}</text>
  ${titleText}
  <text x="72" y="570" fill="#9ca3af" font-family="Arial, sans-serif" font-size="22">Research-backed shopping guide · altpik.com</text>
  </svg>`;
  renderPng(svg, join(articleOgDir, `${slug}.png`));
  articleCount += 1;
}

try {
  renderPng(readFileSync(join(publicDir, 'favicon.svg'), 'utf8'), join(publicDir, 'logo.png'));
  console.log('Generated logo.png');
} catch {
  console.warn('Could not generate logo.png from favicon.svg');
}

console.log(`Done: ${svgFiles.length} shared and ${articleCount} article OG PNG(s) written`);
