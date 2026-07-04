export const SITE = {
  name: 'VettedPick',
  title: 'VettedPick — Smart Budget Alternatives to Viral & Luxury Products',
  description:
    'We review and find the absolute best budget-friendly alternatives to viral and luxury products. Tested by experts, loved by smart shoppers.',
  url: 'https://vettedpick.com',
  author: 'Patryk',
  email: 'hello@vettedpick.com',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/reviews?type=listicle', label: 'Guides' },
  { href: '/categories/pets', label: 'Pets' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const AMAZON_DISCLOSURE =
  'VettedPick is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate, I earn from qualifying purchases.';

export const FTC_DISCLOSURE =
  'This site contains affiliate links. We may earn a commission at no extra cost to you when you purchase through our links.';

export const POPULAR_ARTICLES = [
  { href: '/articles/gaming-desk-accessories-amazon', label: 'Gaming Desk Accessories' },
  { href: '/articles/air-fryer-accessories-amazon', label: 'Air Fryer Accessories' },
  { href: '/articles/car-detailing-gadgets-amazon', label: 'Car Detailing Gadgets' },
  { href: '/articles/beats-fit-pro-alternative', label: 'Beats Fit Pro Alternative' },
  { href: '/articles/theragun-alternative', label: 'Theragun Alternative' },
  { href: '/articles/dyson-airwrap-alternative', label: 'Dyson Airwrap Alternative' },
  { href: '/articles/content-creator-gadgets-amazon', label: 'Content Creator Gadgets' },
  { href: '/articles/sleep-gadgets-amazon', label: 'Sleep Gadgets' },
] as const;
