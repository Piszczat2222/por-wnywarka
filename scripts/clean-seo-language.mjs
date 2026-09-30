import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const files = readdirSync(articlesDir).filter((file) => file.endsWith('.md'));
const titleRewrites = {
  'amazon-supplements-best-sellers.md': 'Best-Selling Amazon Supplements (2026): 10 Researched Picks',
  'beats-studio-pro-alternative.md': 'Beats Studio Pro Alternative (2026): Soundcore Space One',
  'cordless-table-lamp-alternative.md': 'Cordless Table Lamp Alternative: Kakanuo vs Poldina Pro',
  'dyson-airwrap-alternative.md': 'Dyson Airwrap Alternative (2026): Shark FlexStyle',
  'kitchenaid-mixer-alternative.md': 'KitchenAid Mixer Alternative (2026): Hamilton Beach 4-Qt',
  'phone-accessories-amazon.md': 'Best Amazon Phone Accessories (2026): 10 Useful Picks',
};

const replacements = [
  [/\bPinned:/g, 'Compared:'],
  [/\bpinned:/g, 'compared:'],
  [/\bWe pinned\b/g, 'We compared'],
  [/\bpinned at\b/gi, 'checked at'],
  [/\bpinned-price\b/gi, 'price-and-feature'],
  [/\bPrice \(pinned\)/gi, 'Price (checked)'],
  [/\bpinned picks?\b/gi, 'selected picks'],
  [/\bpinned products?\b/gi, 'selected products'],
  [/\bproducts? pinned\b/gi, 'products selected'],
  [/\bsupplies pinned on this list\b/gi, 'supplies selected for this list'],
  [/\bpinned RV essentials\b/gi, 'compared RV essentials'],
  [/\bpinned weekend camping kit\b/gi, 'compared weekend camping kit'],
  [/\bpinned here\b/gi, 'linked here'],
  [/\bpinned \$([\d,.]+)/gi, 'checked at $$$1'],
  [/\bpinned \*\*\$/gi, 'checked at **$'],
  [/\bpinned Black\b/gi, 'checked in Black'],
  [/\bpinned price\b/gi, 'checked price'],
  [/\bpinned classroom bestsellers\b/gi, 'classroom staples compared for value'],
  [/\bone pinned product\b/gi, 'one suitable product'],
  [/\bPinned Amazon\b/g, 'Research-backed Amazon'],
  [/\bpinned Amazon\b/g, 'researched Amazon'],
  [/\bpinned amazon\.com\b/g, 'researched Amazon'],
  [/\bpinned bestsellers\b/gi, 'researched popular picks'],
  [/\bresearched Amazon bestsellers\b/gi, 'researched Amazon picks'],
  [/\bresearched Amazon bestsellers under\b/gi, 'researched Amazon picks under'],
  [/\bpinned prices\b/gi, 'recently checked prices'],
  [/\bpinned ASINs?\b/gi, 'selected products'],
  [/\bpinned product links\b/gi, 'direct product links'],
  [/\bwith live Amazon prices\b/gi, 'with recently checked Amazon prices'],
  [/\bcurrent prices\b/gi, 'recently checked prices'],
  [/\blive prices\b/gi, 'recently checked prices'],
  [/\bhigh-sales-rank\b/gi, 'widely available'],
  [/\bsales ranks?\b/gi, 'shopper interest'],
  [/\bCreators API\b/g, 'Amazon catalog'],
  [/\bwattroi-20 direct ASIN links\b/gi, 'direct product links and practical buying notes'],
  [/\bwattroi-20 affiliate links\b/gi, 'clearly disclosed affiliate links'],
  [/\bwattroi-20 bestsellers\b/gi, 'researched popular picks'],
  [/\bbestsellers with wattroi-20 links\b/gi, 'popular picks compared for everyday value'],
  [/\bwattroi-20 links\b/gi, 'clearly disclosed affiliate links'],
  [/\bLinks use (?:our Associates tag )?\(?(?:wattroi-20)\)?\.?/gi, 'Affiliate links are clearly disclosed.'],
  [/\bLinks use wattroi-20\.?/gi, 'Affiliate links are clearly disclosed.'],
  [/— wattroi-20\./gi, '— compared for practical value.'],
  [/\bConfirm recently checked prices\b/gi, "Confirm today's prices"],
  [/\bconfirm today's live price\b/gi, "confirm today's price"],
  [/\bconfirm live Amazon prices? before checkout\b/gi, "confirm today's Amazon price before checkout"],
  [/\bconfirm live before checkout\b/gi, "confirm today's price before checkout"],
  [/\bconfirm the live price\b/gi, "confirm today's price"],
  [/\bconfirm live price\b/gi, "confirm today's price"],
  [/\bAlways confirm live price\b/gi, "Always confirm today's price"],
  [/\ba selected products\b/gi, 'a selected product'],
  [/\.\s+confirm today's Amazon price/g, ". Confirm today's Amazon price"],
  [/answer: "recently checked prices run/g, 'answer: "Prices checked on the article update date ran'],
  [/answer: "recently checked prices total/g, 'answer: "Prices checked on the article update date total'],
  [/\blive price\b/gi, "today's price"],
  [/\bpinned\b/gi, 'checked'],
];

let changedFiles = 0;
let changedLines = 0;

for (const file of files) {
  const path = join(articlesDir, file);
  const original = readFileSync(path, 'utf8');
  let content = original
    .split(/\r?\n/)
    .map((line) => {
      if (line.startsWith('seoTitle:') && titleRewrites[file]) {
        const next = `seoTitle: ${JSON.stringify(titleRewrites[file])}`;
        if (next !== line) changedLines += 1;
        return next;
      }

      const seoDescription = line.match(/^seoDescription:\s*(.+)$/);
      if (seoDescription) {
        try {
          const value = JSON.parse(seoDescription[1]);
          if (value.length > 155) {
            const clipped = value.slice(0, 152);
            const shortened = `${clipped.slice(0, clipped.lastIndexOf(' ')).replace(/[,:;—-]+$/, '')}...`;
            changedLines += 1;
            return `seoDescription: ${JSON.stringify(shortened)}`;
          }
        } catch {
          // Build validation reports malformed frontmatter.
        }
      }

      if (
        /^\s+answer:\s/.test(line) &&
        /(Amazon catalog|ASIN|Associates tag|wattroi-20|shopper interest)/i.test(line)
      ) {
        changedLines += 1;
        return '    answer: "We compare specifications, availability, price-to-usefulness, and recurring themes in shopper feedback. Rankings favor practical fit and clear trade-offs; affiliate status does not influence placement."';
      }

      let next = line;
      for (const [pattern, replacement] of replacements) {
        next = next.replace(pattern, replacement);
      }
      if (next !== line) changedLines += 1;
      return next;
    })
    .join('\n');

  if (content !== original) {
    writeFileSync(path, content, 'utf8');
    changedFiles += 1;
  }
}

console.log(`SEO language cleanup: ${changedFiles} file(s), ${changedLines} line(s) updated`);
