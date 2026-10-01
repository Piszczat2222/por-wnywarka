export const SITE = {
  name: 'AltPik',
  title: 'AltPik: Smart Budget Alternatives to Viral & Luxury Products',
  description:
    'Research-backed comparisons and practical Amazon guides for finding better-value alternatives to viral and premium products.',
  url: 'https://altpik.com',
  author: 'Patryk',
  email: 'apiszczat2222@gmail.com',
  gaMeasurementId: 'G-JRB461EJXP',
  googleAdsId: 'AW-16999094280',
  /** Google Ads “Kliknięcie wychodzące” conversion send_to */
  googleAdsOutboundConversionId: 'AW-16999094280/2O2UCMTGt4sdEIiw5qk_',
  indexNowKey: '748a39219ac649ab8452996fe1d35420',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/reviews#type=listicle', label: 'Guides' },
  { href: '/categories/pets', label: 'Pets' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const AMAZON_DISCLOSURE =
  'AltPik is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate, I earn from qualifying purchases.';

export const FTC_DISCLOSURE =
  'This site contains affiliate links. We may earn a commission at no extra cost to you when you purchase through our links.';

export const POPULAR_ARTICLES = [
  { href: '/articles/monitor-desk-setup-amazon', label: 'Monitor Desk Setup' },
  { href: '/articles/laundry-essentials-amazon', label: 'Laundry Essentials' },
  { href: '/articles/travel-packing-organizers-amazon', label: 'Travel Packing Organizers' },
  { href: '/articles/power-outage-emergency-kit-amazon', label: 'Power Outage Kit' },
  { href: '/articles/home-gym-essentials-under-50-amazon', label: 'Home Gym Essentials' },
  { href: '/articles/grill-bbq-accessories-amazon', label: 'Grill & BBQ Accessories' },
  { href: '/articles/phone-accessories-amazon', label: 'Phone Accessories Best Sellers' },
  { href: '/articles/gaming-desk-accessories-amazon', label: 'Gaming Desk Accessories' },
  { href: '/articles/meal-prep-lunch-essentials-amazon', label: 'Meal Prep Essentials' },
] as const;
