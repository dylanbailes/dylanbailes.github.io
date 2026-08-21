import { defineConfig } from 'vite';

// Vite config for the engineering portfolio.
// `base: './'` keeps asset URLs relative so the built site works on
// GitHub Pages at any path (user pages or project pages).
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    // Keep images/assets under this size inlined into the bundle
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: 'index.html',
        games: 'games.html',
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
