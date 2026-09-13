export const CATEGORIES = {
  tech: {
    slug: 'tech',
    label: 'Tech & Gadgets',
    description: 'Headphones, wearables, and viral tech: curated Amazon alternatives.',
    editorial:
      'Start with the problem, not the gadget. Our tech guides separate compatibility, battery life, desk ergonomics, and ecosystem lock-in so a lower price does not create a second purchase later. Use the focused guides below for audio, charging, gaming, and smart-home decisions.',
    featuredSlugs: ['phone-accessories-amazon', 'gaming-desk-accessories-amazon', 'smart-home-gadgets-under-50-amazon'],
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
    editorial:
      'Home organization products overlap, but the jobs are different: closets need vertical space, kitchens need washable dividers, and bathrooms need moisture-safe storage. Begin with the room causing daily friction, then use the relevant guide instead of buying a matching set for the whole house.',
    featuredSlugs: ['tiktok-home-organizers-amazon', 'closet-organization-amazon', 'robot-vacuum-alternative'],
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
    editorial:
      'Good travel gear earns its space on every trip. These guides prioritize dimensions, weight, packing access, durability, and the exact moment an accessory becomes useful—from airport security to a day hike or roadside stop.',
    featuredSlugs: ['budget-travel-backpack', 'travel-packing-organizers-amazon', 'day-hike-essentials-amazon'],
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
    editorial:
      'Beauty tools should be judged by routine fit, heat or intensity controls, cleaning effort, and replacement cost—not social-media visibility. Our comparisons spell out where a budget tool preserves the useful features and where the premium option still has an edge.',
    featuredSlugs: ['dyson-airwrap-alternative', 'skincare-tools-amazon', 'mens-grooming-gadgets-amazon'],
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
    editorial:
      'Fitness purchases work only when they match the activity. We compare fabric and fit for apparel, portability and resistance for home training, and comfort or visibility for running so you can build a small kit before adding specialized gear.',
    featuredSlugs: ['lululemon-leggings-alternative', 'home-gym-essentials-under-50-amazon', 'running-accessories-amazon'],
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
    editorial:
      'Kitchen tools must save more time than they take to clean and store. Start with the appliance or repeated task you actually use, then compare capacity, counter space, materials, and cleanup before buying another single-purpose gadget.',
    featuredSlugs: ['air-fryer-accessories-amazon', 'top-10-kitchen-gadgets-under-30-amazon', 'kitchenaid-mixer-alternative'],
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
    editorial:
      'Pet gear depends on the animal, home, and routine. Our guides separate first-week puppy needs, grooming, travel safety, enrichment, and cleanup so owners can solve one recurring problem without collecting novelty products.',
    featuredSlugs: ['must-have-dog-gadgets-amazon', 'new-puppy-parents-amazon', 'dog-grooming-tools-amazon'],
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
    editorial:
      'Baby and child products require a narrower decision process than general shopping. We focus on age fit, supervision, cleaning, space, and manufacturer instructions; safety-critical choices should always be checked against current official guidance.',
    featuredSlugs: ['baby-brezza-alternative', 'must-have-baby-products-amazon', 'toddler-proofing-gadgets-amazon'],
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
    editorial:
      'A better desk starts with screen height, lighting, cable routing, and the devices already in use. These guides prioritize ergonomic basics and compatibility before decorative upgrades, with separate routes for WFH, monitor, teaching, and streaming setups.',
    featuredSlugs: ['top-10-wfh-desk-gadgets-amazon', 'monitor-desk-setup-amazon', 'teacher-classroom-gadgets-amazon'],
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
    editorial:
      'Car accessories should improve safety, visibility, power, storage, or comfort without distracting the driver. Use the emergency guide for breakdown basics, the road-trip guide for longer journeys, and seasonal guides for weather-specific preparation.',
    featuredSlugs: ['car-emergency-kit-amazon', 'road-trip-gadgets-amazon', 'winter-driving-essentials-amazon'],
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
