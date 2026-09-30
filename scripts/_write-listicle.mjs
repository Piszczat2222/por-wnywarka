import { readFileSync, writeFileSync } from 'node:fs';

export function fmt(n) {
  const x = Number(n);
  if (Number.isInteger(x)) return `$${x}`;
  return `$${x.toFixed(2)}`;
}

export function writeListicle({
  slug,
  title,
  description,
  category,
  categoryLabel,
  cardTitle,
  cardExcerpt,
  seoTitle,
  seoDescription,
  keywords,
  picks,
  names,
  blurbs,
  bestFor = [],
  tradeoffs = [],
  badges = {},
  intro,
  problemHeader,
  problems,
  kits,
  buyFirst,
  budgets,
  tips,
  skips,
  bottom,
  links,
  faq,
  sectionHeadings,
}) {
  const headingVariants = [
    {
      kits: 'Build a practical bundle',
      budgets: 'Choose by budget',
      tips: 'Details that change the decision',
      skips: 'Common buying mistakes',
      bottom: 'Our decision rule',
    },
    {
      kits: 'Three useful ways to combine these picks',
      budgets: 'Where each budget goes furthest',
      tips: 'Before you order',
      skips: 'What is not worth adding',
      bottom: 'Where to start',
    },
    {
      kits: 'Match a bundle to the job',
      budgets: 'Spend in the right order',
      tips: 'What matters in daily use',
      skips: 'Trade-offs to avoid',
      bottom: 'The short version',
    },
  ];
  const variantIndex = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) % headingVariants.length;
  const headings = { ...headingVariants[variantIndex], ...sectionHeadings };

  const items = picks
    .map((p, i) => {
      const rank = p.rank;
      const badge = badges[rank] ? `\n    badge: "${badges[rank]}"` : '';
      const bestForLine = bestFor[i] ? `\n    bestFor: ${JSON.stringify(bestFor[i])}` : '';
      const tradeoffLine = tradeoffs[i] ? `\n    tradeoff: ${JSON.stringify(tradeoffs[i])}` : '';
      return `  - rank: ${rank}
    name: ${JSON.stringify(names[i])}
    asin: "${p.asin}"
    image: "${p.imagePath}"
    priceApprox: "${fmt(p.price)}"${badge}
    blurb: ${JSON.stringify(blurbs[i])}${bestForLine}${tradeoffLine}`;
    })
    .join('\n');

  const problemRows = problems
    .map((row, i) => `| ${row} | ${names[i]} | ${fmt(picks[i].price)} |`)
    .join('\n');

  const kitRows = kits.map((k) => `| ${k.name} | ${k.combo} | ${k.total} |`).join('\n');
  const budgetRows = budgets.map((b) => `| ${b.budget} | ${b.picks} |`).join('\n');
  const tipList = tips.map((t, i) => `${i + 1}. ${t}`).join('  \n');
  const skipList = skips.map((s) => `Don't ${s}`).join(' ');
  const faqYaml = faq
    .map(
      (f) => `  - question: ${JSON.stringify(f.q)}
    answer: ${JSON.stringify(f.a)}`,
    )
    .join('\n');

  const md = `---
articleType: listicle
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
category: ${category}
categoryLabel: ${JSON.stringify(categoryLabel)}
cardTitle: ${JSON.stringify(cardTitle)}
cardExcerpt: ${JSON.stringify(cardExcerpt)}
featured: false
publishedAt: 2026-08-24
updatedAt: 2026-08-24
seoTitle: ${JSON.stringify(seoTitle)}
seoDescription: ${JSON.stringify(seoDescription)}
keywords: ${JSON.stringify(keywords)}
ogImage: "/og-default.png"
listItems:
${items}
faq:
${faqYaml}
---

${intro}

## ${problemHeader}

| If your problem is… | Start with | Price |
|---|---|---|
${problemRows}

## ${headings.kits}

| Kit | Combo | Total |
|---|---|---|
${kitRows}

**Buy first if you only grab three things:** ${buyFirst}

## ${headings.budgets}

| Budget | Best picks |
|---|---|
${budgetRows}

## ${headings.tips}

${tipList}

## ${headings.skips}

${skipList}

## ${headings.bottom}

${bottom}

${links}
`;

  writeFileSync(`src/content/articles/${slug}.md`, md);
  console.log('WROTE', slug);
}

export function loadPicks(name) {
  return JSON.parse(readFileSync(`scripts/_picks-${name}.json`, 'utf8'));
}
