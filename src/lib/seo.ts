import { SITE } from './site';

export function truncateDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).trimEnd()}...`;
}

export function buildPageTitle(pageTitle: string, siteName = SITE.name): string {
  if (pageTitle.includes(siteName)) return pageTitle;
  return `${pageTitle} | ${siteName}`;
}

/** Ensure page paths have no trailing `/` and no `.html` suffix (query preserved). Root stays `/`. */
export function withoutTrailingSlash(path: string): string {
  if (!path || path === '/') return '/';
  const hashIndex = path.indexOf('#');
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const [rawPathname, query] = withoutHash.split('?');
  let pathname = rawPathname.replace(/\.html$/i, '');
  if (pathname === '/index') pathname = '/';
  if (!pathname) pathname = '/';
  if (pathname !== '/' && /\.[a-z0-9]+$/i.test(pathname)) {
    return `${pathname}${query ? `?${query}` : ''}${hash}`;
  }
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return `${normalized}${query ? `?${query}` : ''}${hash}`;
}

/** @deprecated use withoutTrailingSlash — kept as alias during migration */
export const withTrailingSlash = withoutTrailingSlash;

export function absoluteUrl(path: string): string {
  return new URL(withoutTrailingSlash(path), SITE.url).href;
}

export function toIsoDate(date: Date): string {
  return date.toISOString();
}
