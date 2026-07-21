import { SITE } from './site';

export function truncateDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).trimEnd()}...`;
}

export function buildPageTitle(pageTitle: string, siteName = SITE.name): string {
  if (pageTitle.includes(siteName)) return pageTitle;
  return `${pageTitle} | ${siteName}`;
}

/** Ensure page paths end with `/` (query string preserved). Skips file URLs with extensions. */
export function withTrailingSlash(path: string): string {
  if (!path || path === '/') return '/';
  const hashIndex = path.indexOf('#');
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const [pathname, query] = withoutHash.split('?');
  if (/\.[a-z0-9]+$/i.test(pathname)) return path;
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return `${normalized}${query ? `?${query}` : ''}${hash}`;
}

export function absoluteUrl(path: string): string {
  return new URL(withTrailingSlash(path), SITE.url).href;
}

export function toIsoDate(date: Date): string {
  return date.toISOString();
}
