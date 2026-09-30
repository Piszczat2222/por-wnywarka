import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const articlesDir = join(root, 'src', 'content', 'articles');
const srcDir = join(root, 'src');
const redirectsPath = join(root, 'public', '_redirects');

const CATEGORIES = [
  'tech',
  'home',
  'travel',
  'beauty',
  'fitness',
  'kitchen',
  'pets',
  'baby',
  'office',
  'automotive',
];

const STATIC_PATHS = new Set([
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/reviews',
  '/how-we-review',
  '/rss.xml',
  '/404',
  ...CATEGORIES.map((c) => `/categories/${c}`),
]);

function walkFiles(dir, exts, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walkFiles(full, exts, out);
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

function normalizePath(raw) {
  let p = raw.split('#')[0].split('?')[0];
  if (!p.startsWith('/')) return null;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

const articleSlugs = new Set(
  readdirSync(articlesDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, '')),
);

const redirectSources = new Set();
const redirectTargets = new Set();
for (const line of readFileSync(redirectsPath, 'utf8').split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) continue;
  const from = normalizePath(parts[0].replace(/^https?:\/\/[^/]+/, '') || '/');
  const to = normalizePath(parts[1].replace(/^https?:\/\/[^/]+/, '') || '/');
  if (from) redirectSources.add(from);
  if (to) redirectTargets.add(to);
}

const validPaths = new Set(STATIC_PATHS);
for (const slug of articleSlugs) validPaths.add(`/articles/${slug}`);
for (const p of redirectSources) validPaths.add(p);
for (const p of redirectTargets) validPaths.add(p);

const linkRe =
  /(?:\]\(|href=["']|href:\s*['"])(\/(?:articles|categories|about|contact|privacy|terms|reviews|how-we-review|rss\.xml)[^"'\)\s]*)/g;

const files = [
  ...walkFiles(articlesDir, ['.md']),
  ...walkFiles(srcDir, ['.astro', '.ts', '.tsx', '.js', '.mjs']),
];

const errors = [];
const seen = new Map(); // path -> Set of sources

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const rel = file.slice(root.length + 1).replace(/\\/g, '/');
  let m;
  const re = new RegExp(linkRe.source, 'g');
  while ((m = re.exec(content))) {
    const path = normalizePath(m[1]);
    if (!path) continue;
    if (!seen.has(path)) seen.set(path, new Set());
    seen.get(path).add(rel);

    if (path.startsWith('/articles/')) {
      const slug = path.slice('/articles/'.length);
      if (!slug || slug.includes('/')) {
        errors.push(`${rel}: invalid article path ${path}`);
        continue;
      }
      if (!articleSlugs.has(slug) && !redirectSources.has(path)) {
        errors.push(`${rel}: missing article ${path}`);
      }
      continue;
    }

    if (path.startsWith('/categories/')) {
      const cat = path.slice('/categories/'.length);
      if (!CATEGORIES.includes(cat)) {
        errors.push(`${rel}: unknown category ${path}`);
      }
      continue;
    }

    if (!validPaths.has(path) && !STATIC_PATHS.has(path)) {
      // allow /reviews with hash already stripped
      if (!STATIC_PATHS.has(path)) {
        errors.push(`${rel}: unknown internal path ${path}`);
      }
    }
  }
}

if (errors.length) {
  console.error('Internal link verify FAILED:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}

console.log(
  `Internal link verify: OK — ${seen.size} unique paths checked across ${files.length} files`,
);
