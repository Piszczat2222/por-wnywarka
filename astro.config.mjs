import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import rehypeAffiliateLinks from './src/lib/rehype-affiliate-links.mjs';

export default defineConfig({
  site: 'https://altpik.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeAffiliateLinks],
    }),
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
