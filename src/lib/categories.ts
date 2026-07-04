export const CATEGORIES = {
  tech: {
    slug: 'tech',
    label: 'Tech & Gadgets',
    description: 'Headphones, wearables, and viral tech: curated Amazon alternatives.',
    seoTitle: 'Best Amazon Tech Alternatives & Reviews (2026)',
    seoDescription:
      'Curated Amazon tech alternatives and Top 10 phone accessory guides. Budget picks vs premium brands: headphones, earbuds, and gadgets.',
    color: 'bg-blue-100 text-blue-700',
    accent: 'from-blue-600 to-blue-800',
    icon: '💻',
  },
  home: {
    slug: 'home',
    label: 'Home Aesthetic',
    description: 'Decor, lighting, and cleaning gear that looks premium without the markup.',
    seoTitle: 'Best Amazon Home Decor Alternatives & Organizers (2026)',
    seoDescription:
      'TikTok-famous Amazon home organizers, lamps, vacuums, and cleaning gadgets. Premium aesthetic without the designer price tag.',
    color: 'bg-amber-100 text-amber-700',
    accent: 'from-amber-500 to-orange-700',
    icon: '🏠',
  },
  travel: {
    slug: 'travel',
    label: 'Travel & Lifestyle',
    description: 'Bags, tumblers, and gear built for life on the move.',
    seoTitle: 'Best Amazon Travel Gear & Backpack Reviews (2026)',
    seoDescription:
      'Budget Amazon travel backpacks, tumblers, and road trip essentials compared to premium brands. Curated picks for smart travelers.',
    color: 'bg-purple-100 text-purple-700',
    accent: 'from-purple-600 to-indigo-800',
    icon: '✈️',
  },
  beauty: {
    slug: 'beauty',
    label: 'Beauty & Hair',
    description: 'Viral hair tools and skincare-adjacent picks that deliver results.',
    seoTitle: 'Best Amazon Beauty & Hair Tool Alternatives (2026)',
    seoDescription:
      'Amazon alternatives to viral hair tools like Dyson Airwrap. Honest comparisons and budget picks that deliver salon results.',
    color: 'bg-pink-100 text-pink-700',
    accent: 'from-pink-500 to-rose-700',
    icon: '✨',
  },
  fitness: {
    slug: 'fitness',
    label: 'Fitness & Activewear',
    description: 'Leggings, layers, and gym essentials without the logo tax.',
    seoTitle: 'Best Amazon Fitness & Gym Accessories Under $25 (2026)',
    seoDescription:
      'Lululemon legging dupes, gym accessories, and activewear alternatives on Amazon. Top 10 guides for budget fitness shoppers.',
    color: 'bg-emerald-100 text-emerald-700',
    accent: 'from-emerald-500 to-teal-700',
    icon: '🏋️',
  },
  kitchen: {
    slug: 'kitchen',
    label: 'Kitchen & Appliances',
    description: 'TikTok-famous kitchen gear at sensible prices.',
    seoTitle: 'Best Amazon Kitchen Gadgets & Appliance Alternatives (2026)',
    seoDescription:
      'Top 10 Amazon kitchen gadgets under $30 and budget alternatives to KitchenAid and viral appliances. Curated for home cooks.',
    color: 'bg-orange-100 text-orange-700',
    accent: 'from-orange-500 to-red-700',
    icon: '🍳',
  },
  pets: {
    slug: 'pets',
    label: 'Pets & Dogs',
    description: 'Must-have Amazon gadgets and gear for dog owners.',
    seoTitle: 'Best Amazon Dog Gadgets & Pet Essentials (2026)',
    seoDescription:
      'Top 10 must-have Amazon gadgets for dog owners, puppy parents, and grooming. Curated pet picks with honest reviews.',
    color: 'bg-teal-100 text-teal-700',
    accent: 'from-teal-500 to-cyan-700',
    icon: '🐕',
  },
  baby: {
    slug: 'baby',
    label: 'Baby & Kids',
    description: 'Parent-approved Amazon essentials for new families.',
    seoTitle: 'Best Amazon Baby Products & Toddler-Proofing Guides (2026)',
    seoDescription:
      'Must-have Amazon baby products for new parents and top toddler-proofing gadgets. Curated nursery and safety essentials.',
    color: 'bg-sky-100 text-sky-700',
    accent: 'from-sky-500 to-blue-700',
    icon: '👶',
  },
  office: {
    slug: 'office',
    label: 'Office & WFH',
    description: 'Desk upgrades and work-from-home gadgets from Amazon.',
    seoTitle: 'Best Amazon WFH Desk Gadgets & Office Upgrades (2026)',
    seoDescription:
      'Top 10 Amazon desk gadgets for work-from-home setups. Monitor lights, stands, cable trays, and ergonomic picks under $50.',
    color: 'bg-slate-100 text-slate-700',
    accent: 'from-slate-600 to-gray-800',
    icon: '🖥️',
  },
  automotive: {
    slug: 'automotive',
    label: 'Car & Travel',
    description: 'Amazon car accessories and road-trip essentials.',
    seoTitle: 'Best Amazon Car Accessories & Road Trip Gadgets (2026)',
    seoDescription:
      'Top 10 Amazon car accessories under $25 and must-have road trip gadgets. Phone mounts, organizers, and emergency gear.',
    color: 'bg-indigo-100 text-indigo-700',
    accent: 'from-indigo-600 to-violet-800',
    icon: '🚗',
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export function getCategoryKeys(): CategoryKey[] {
  return Object.keys(CATEGORIES) as CategoryKey[];
}
