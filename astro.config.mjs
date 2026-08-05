import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://altpik.com',
  output: 'static',
  trailingSlash: 'never',
  redirects: {
    '/articles/summer-beach-bags-straw-amazon': '/articles/beach-day-essentials-amazon',
  },
  build: {
    format: 'file',
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
