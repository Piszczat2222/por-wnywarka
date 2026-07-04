import productImages from '../data/product-images.json';
import listicleThumbnails from '../data/listicle-thumbnails.json';
import type { ListItem } from '../content.config';

const imageMap = productImages as Record<string, string>;
const thumbnailMap = listicleThumbnails as Record<string, string>;

export function listItemProductImage(
  item: Pick<ListItem, 'image' | 'imageAsin' | 'asin' | 'name'>,
): string | undefined {
  if (item.image) {
    return item.image;
  }

  if (item.name && thumbnailMap[item.name]) {
    return thumbnailMap[item.name];
  }

  const asin = item.imageAsin ?? item.asin;
  if (asin && imageMap[asin]) {
    return imageMap[asin];
  }

  return undefined;
}

export function categoryFallbackImage(category: string): string {
  const map: Record<string, string> = {
    tech: '/images/category/tech.svg',
    home: '/images/category/home.svg',
    travel: '/images/category/travel.svg',
    beauty: '/images/category/beauty.svg',
    fitness: '/images/category/fitness.svg',
    kitchen: '/images/category/kitchen.svg',
    pets: '/images/category/pets.svg',
    baby: '/images/category/baby.svg',
    office: '/images/category/office.svg',
    automotive: '/images/category/automotive.svg',
  };
  return map[category] ?? '/images/category/default.svg';
}
