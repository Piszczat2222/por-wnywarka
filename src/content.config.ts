import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const comparisonRowSchema = z.object({
  feature: z.string(),
  premium: z.string(),
  pick: z.string(),
  highlight: z.enum(['premium', 'pick', 'none']).default('none'),
});

const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const listItemSchema = z.object({
  rank: z.number().optional(),
  name: z.string(),
  asin: z.string().optional(),
  searchQuery: z.string().optional(),
  /** ASIN used only for the product thumbnail (Amazon Associates image). Link still uses searchQuery when set. */
  imageAsin: z.string().optional(),
  /** Direct image URL override (local path or full URL). Takes priority over imageAsin. */
  image: z.string().optional(),
  priceApprox: z.string(),
  badge: z.string().optional(),
  blurb: z.string(),
});

const categoryEnum = z.enum([
  'tech',
  'home',
  'travel',
  'beauty',
  'fitness',
  'kitchen',
  'pets',
  'baby',
  'office',
  'automotive',
]);

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    articleType: z.enum(['comparison', 'listicle']).default('comparison'),
    title: z.string(),
    description: z.string(),
    category: categoryEnum,
    featured: z.boolean().default(false),
    categoryLabel: z.string(),
    cardTitle: z.string(),
    cardExcerpt: z.string(),
    publishedAt: z.coerce.date(),
    ogImage: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    updatedAt: z.coerce.date().optional(),
    // comparison-only (optional for listicles)
    premiumProduct: z.string().optional(),
    premiumPrice: z.string().optional(),
    pickProduct: z.string().optional(),
    pickPrice: z.string().optional(),
    amazonAsin: z.string().optional(),
    runnerUpAsin: z.string().optional(),
    runnerUpProduct: z.string().optional(),
    comparisonTable: z.array(comparisonRowSchema).optional(),
    whoItsFor: z.array(z.string()).optional(),
    whoShouldSkip: z.array(z.string()).optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    verdict: z.string().optional(),
    faq: z.array(faqItemSchema).optional(),
    // listicle-only
    listItems: z.array(listItemSchema).optional(),
  }),
});

export const collections = { articles };

export type ComparisonRow = z.infer<typeof comparisonRowSchema>;
export type ListItem = z.infer<typeof listItemSchema>;
