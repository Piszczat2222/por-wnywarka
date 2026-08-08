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
}) {
  const items = picks
    .map((p, i) => {
      const rank = p.rank;
      const badge = badges[rank] ? `\n    badge: "${badges[rank]}"` : '';
      return `  - rank: ${rank}
    name: ${JSON.stringify(names[i])}
    asin: "${p.asin}"
    image: "${p.imagePath}"
    priceApprox: "${fmt(p.price)}"${badge}
    blurb: ${JSON.stringify(blurbs[i])}`;
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
publishedAt: 2026-08-08
updatedAt: 2026-08-08
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

### ${problemHeader}

| If your problem is… | Start with | Price |
|---|---|---|
${problemRows}

### Ready-made kits

| Kit | Combo | Total |
|---|---|---|
${kitRows}

**Buy first if you only grab three things:** ${buyFirst}

### Shop by budget

| Budget | Best picks |
|---|---|
${budgetRows}

### Tips that actually matter

${tipList}

### What to skip

${skipList}

### The bottom line

${bottom}

${links}
`;

  writeFileSync(`src/content/articles/${slug}.md`, md);
  console.log('WROTE', slug);
}

export function loadPicks(name) {
  return JSON.parse(readFileSync(`scripts/_picks-${name}.json`, 'utf8'));
}
