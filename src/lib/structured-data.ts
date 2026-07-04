import { listItemAmazonUrl } from './amazon';
import { absoluteUrl, toIsoDate } from './seo';
import { SITE } from './site';
import type { ListItem } from '../content.config';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl('/favicon.svg'),
    email: SITE.email,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleSchema(options: {
  headline: string;
  description: string;
  url: string;
  publishedAt: Date;
  modifiedAt?: Date;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.headline,
    description: options.description,
    url: options.url,
    datePublished: toIsoDate(options.publishedAt),
    dateModified: toIsoDate(options.modifiedAt ?? options.publishedAt),
    author: {
      '@type': 'Person',
      name: SITE.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/favicon.svg'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': options.url,
    },
    image: options.image ? absoluteUrl(options.image) : absoluteUrl('/og-default.png'),
  };
}

export function itemListSchema(items: ListItem[], pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    url: pageUrl,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: item.rank ?? index + 1,
      name: item.name,
      url: listItemAmazonUrl(item),
    })),
  };
}

export function collectionPageSchema(options: {
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: options.name,
    description: options.description,
    url: options.url,
    numberOfItems: options.numberOfItems,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function mergeJsonLd(
  ...schemas: Record<string, unknown>[]
): Record<string, unknown>[] {
  return schemas;
}
