import { defineConfig } from 'vite';
import { portfolioHtml } from './build/portfolio-html.js';
import { reportsHtml } from './build/reports-html.js';

// Vite config for the engineering portfolio.
// `base: './'` keeps asset URLs relative so the built site works on
// GitHub Pages at any path (user pages or project pages).
export default defineConfig({
  base: './',
  plugins: [reportsHtml(), portfolioHtml()],
  build: {
    outDir: 'dist',
    // Keep images/assets under this size inlined into the bundle
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: 'index.html',
        games: 'games.html',
        bioreactor: 'bioreactor.html',
        qr: 'qr.html',
        deliveryReport: 'reports/mae3-prime-day-delivery-bot.html',
        bioreactorReport: 'reports/mccb-final-report.html',
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
