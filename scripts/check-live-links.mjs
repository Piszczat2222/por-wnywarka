import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.SITE_URL || 'https://altpik.com';
const root = process.cwd();

function normalizePath(raw) {
  let p = raw.split('#')[0].split('?')[0];
  if (!p.startsWith('/')) return null;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

async function headOrGet(url, { follow = true } = {}) {
  const init = {
    method: 'HEAD',
    redirect: follow ? 'follow' : 'manual',
    headers: { 'User-Agent': 'AltPikLinkCheck/1.0' },
  };
  let res = await fetch(url, init);
  // Some hosts reject HEAD — fall back to GET
  if (res.status === 405 || res.status === 403) {
    res = await fetch(url, { ...init, method: 'GET' });
  }
  return res;
}

function collectContentArticleLinks() {
  const articlesDir = join(root, 'src', 'content', 'articles');
  const paths = new Set();
  const re = /\]\(\/articles\/([a-z0-9-]+)\)/gi;
  for (const file of readdirSync(articlesDir).filter((f) => f.endsWith('.md'))) {
    const content = readFileSync(join(articlesDir, file), 'utf8');
    let m;
    while ((m = re.exec(content))) {
      paths.add(`/articles/${m[1]}`);
    }
  }
  return [...paths];
}

function collectRedirects() {
  const lines = readFileSync(join(root, 'public', '_redirects'), 'utf8').split(/\r?\n/);
  const pairs = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 3) continue;
    // Skip host-level redirects with wildcards for this check (handled separately if needed)
    if (parts[0].includes('*') || parts[0].startsWith('http')) continue;
    const from = normalizePath(parts[0]);
    const to = normalizePath(parts[1]);
    const code = Number(parts[2]) || 301;
    if (from && to) pairs.push({ from, to, code });
  }
  return pairs;
}

async function fetchSitemapPaths() {
  const res = await fetch(`${BASE}/sitemap-0.xml`, {
    headers: { 'User-Agent': 'AltPikLinkCheck/1.0' },
  });
  if (!res.ok) throw new Error(`sitemap-0.xml HTTP ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return locs.map((u) => {
    try {
      return new URL(u).pathname.replace(/\/$/, '') || '/';
    } catch {
      return null;
    }
  }).filter(Boolean);
}

async function checkUrl(path, { expect = [200], follow = true } = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  try {
    const res = await headOrGet(url, { follow });
    const ok = expect.includes(res.status);
    return { path, url, status: res.status, ok, finalUrl: res.url };
  } catch (e) {
    return { path, url, status: 0, ok: false, error: e.message };
  }
}

console.log(`Live link check against ${BASE}\n`);

const failures = [];

// 1) Sitemap URLs → 200
console.log('1) Sitemap URLs...');
const sitemapPaths = await fetchSitemapPaths();
for (const path of sitemapPaths) {
  const r = await checkUrl(path === '' ? '/' : path);
  if (!r.ok) {
    failures.push(r);
    console.log(`  FAIL ${r.status} ${path}`);
  }
}
console.log(`  checked ${sitemapPaths.length}, failures ${failures.length}`);

// 2) Content cross-links → 200
console.log('\n2) Article cross-links from markdown...');
const cross = collectContentArticleLinks();
let crossFail = 0;
for (const path of cross) {
  const r = await checkUrl(path);
  if (!r.ok) {
    failures.push(r);
    crossFail++;
    console.log(`  FAIL ${r.status} ${path}`);
  }
}
console.log(`  checked ${cross.length}, failures ${crossFail}`);

// 3) Redirect sources → 301 then final 200
console.log('\n3) Redirect sources...');
const redirects = collectRedirects();
let redirFail = 0;
for (const { from, to, code } of redirects) {
  const first = await checkUrl(from, { expect: [code, 301, 302, 308], follow: false });
  if (!first.ok) {
    failures.push({ ...first, note: `expected redirect ${code}` });
    redirFail++;
    console.log(`  FAIL first-hop ${first.status} ${from} (expected ${code})`);
    continue;
  }
  const final = await checkUrl(from, { expect: [200], follow: true });
  if (!final.ok) {
    failures.push({ ...final, note: `redirect ${from} → ${to}` });
    redirFail++;
    console.log(`  FAIL final ${final.status} ${from} → ${to}`);
  }
}
console.log(`  checked ${redirects.length}, failures ${redirFail}`);

console.log('\n---');
if (failures.length) {
  console.error(`Live link check FAILED: ${failures.length} issue(s)`);
  process.exit(1);
}
console.log('Live link check: OK — sitemap, cross-links, and redirects all good');
