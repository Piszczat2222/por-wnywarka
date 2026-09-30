import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const articlesDir = join(root, 'src', 'content', 'articles');
const distDir = join(root, 'dist');
const files = readdirSync(articlesDir).filter((file) => file.endsWith('.md'));
const errors = [];
const warnings = [];
const seenTitles = new Map();
const seenDescriptions = new Map();

function value(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) return '';
  try {
    return JSON.parse(match[1]);
  } catch {
    return match[1].replace(/^['"]|['"]$/g, '');
  }
}

function remember(map, item, file, label) {
  if (!item) return;
  const normalized = item.trim().toLowerCase();
  if (map.has(normalized)) errors.push(`${label} duplicated: ${file} and ${map.get(normalized)}`);
  else map.set(normalized, file);
}

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const content = readFileSync(join(articlesDir, file), 'utf8');
  const title = value(content, 'seoTitle') || value(content, 'title');
  const description = value(content, 'seoDescription') || value(content, 'description');
  remember(seenTitles, title, file, 'SEO title');
  remember(seenDescriptions, description, file, 'SEO description');

  if (!title) errors.push(`${file}: missing title`);
  if (!description) errors.push(`${file}: missing description`);
  if (title.length > 65) warnings.push(`${file}: title is ${title.length} characters`);
  if (description.length > 160) errors.push(`${file}: description is ${description.length} characters`);
  if (/\b(wattroi-20|Creators API|pinned ASIN|pinned amazon\.com)\b/i.test(content)) {
    errors.push(`${file}: exposes internal affiliate or generation language`);
  }

  const htmlPath = join(distDir, 'articles', `${slug}.html`);
  if (!existsSync(htmlPath)) {
    errors.push(`${file}: generated HTML missing`);
    continue;
  }
  const html = readFileSync(htmlPath, 'utf8');
  const canonical = `https://altpik.com/articles/${slug}`;
  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) {
    errors.push(`${file}: wrong or missing canonical`);
  }
  if (!html.includes('<meta name="robots" content="index, follow">')) {
    errors.push(`${file}: article is not index, follow`);
  }
  if (!html.includes(`/og/articles/${slug}.png`) && value(content, 'ogImage') === '/og-default.png') {
    errors.push(`${file}: article-specific OG image is not rendered`);
  }
  if (!existsSync(join(root, 'public', 'og', 'articles', `${slug}.png`))) {
    errors.push(`${file}: generated OG image missing`);
  }

  for (const match of html.matchAll(/<a\s+[^>]*href="https:\/\/(?:www\.)?(?:amazon\.com|amzn\.to)[^"]*"[^>]*>/gi)) {
    if (!/\brel="[^"]*\bsponsored\b/i.test(match[0])) {
      errors.push(`${file}: Amazon link without rel=sponsored`);
      break;
    }
  }
}

const notFoundPath = join(distDir, '404.html');
if (!existsSync(notFoundPath)) {
  errors.push('404.html missing');
} else {
  const html = readFileSync(notFoundPath, 'utf8');
  if (!html.includes('noindex, nofollow')) errors.push('404.html missing noindex');
  if (/<link rel="canonical"/i.test(html)) errors.push('404.html must not emit canonical');
}

const sitemap = readFileSync(join(distDir, 'sitemap-0.xml'), 'utf8');
if (/[?&](?:type|cat)=/.test(sitemap)) errors.push('Sitemap contains filter parameters');

const redirects = readFileSync(join(root, 'public', '_redirects'), 'utf8');
for (const line of redirects.split(/\r?\n/)) {
  if (!line.startsWith('/articles/')) continue;
  const [source, target, status] = line.trim().split(/\s+/);
  if (source === target) errors.push(`Redirect loop: ${source}`);
  if (status !== '301') errors.push(`Article redirect is not 301: ${source}`);
  if (!existsSync(join(distDir, `${target.replace(/^\//, '')}.html`))) errors.push(`Redirect target missing: ${target}`);
}

for (const warning of warnings) console.warn(`SEO audit warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`SEO audit error: ${error}`);
  process.exit(1);
}

console.log(`SEO audit: OK — ${files.length} indexable articles, unique metadata, OG images, canonicals, redirects, and sponsored links`);
