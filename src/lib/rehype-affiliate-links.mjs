const AFFILIATE_HOSTS = new Set([
  'amazon.com',
  'www.amazon.com',
  'amzn.to',
  'www.amzn.to',
]);

function visit(node) {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'element' && node.tagName === 'a' && node.properties?.href) {
    try {
      const url = new URL(String(node.properties.href), 'https://altpik.com');
      if (AFFILIATE_HOSTS.has(url.hostname.toLowerCase())) {
        const rel = new Set(
          Array.isArray(node.properties.rel)
            ? node.properties.rel.map(String)
            : String(node.properties.rel ?? '').split(/\s+/).filter(Boolean),
        );
        rel.add('sponsored');
        rel.add('noopener');
        rel.add('noreferrer');
        node.properties.rel = [...rel];
        node.properties.target = '_blank';
      }
    } catch {
      // Leave malformed links untouched; the SEO audit reports them separately.
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) visit(child);
  }
}

export default function rehypeAffiliateLinks() {
  return (tree) => visit(tree);
}
