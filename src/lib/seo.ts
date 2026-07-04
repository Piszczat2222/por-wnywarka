import { SITE } from './site';

export function truncateDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).trimEnd()}...`;
}

export function buildPageTitle(pageTitle: string, siteName = SITE.name): string {
  if (pageTitle.includes(siteName)) return pageTitle;
  return `${pageTitle} | ${siteName}`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).href;
}

export function toIsoDate(date: Date): string {
  return date.toISOString();
}
