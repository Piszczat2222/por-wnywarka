const DEFAULT_TAG = 'wattroi-20';

export function getAmazonTag(): string {
  return import.meta.env.AMAZON_ASSOCIATE_TAG ?? DEFAULT_TAG;
}

export function amazonUrl(asin: string, tag = getAmazonTag()): string {
  return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
}

export function amazonSearchUrl(query: string, tag = getAmazonTag()): string {
  const params = new URLSearchParams({ k: query, tag });
  return `https://www.amazon.com/s?${params.toString()}`;
}

export function listItemAmazonUrl(
  item: { searchQuery?: string; asin?: string; name: string },
  tag = getAmazonTag(),
): string {
  if (item.asin && !item.searchQuery) {
    return amazonUrl(item.asin, tag);
  }
  return amazonSearchUrl(item.searchQuery ?? item.name, tag);
}

export function amazonProductImageUrl(asin: string): string {
  return `https://m.media-amazon.com/images/P/${asin}._SL300_.jpg`;
}
