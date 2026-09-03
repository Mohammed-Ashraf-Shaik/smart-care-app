import { defineConfig } from 'vite';

export default defineConfig({
  // Use './' for local dev; GitHub Pages CI can override with /smart-care-app/
  base: './',
  server: {
    port: 5173,
    // SPA fallback: serve index.html for all unknown routes (e.g. /dashboard/patient/apply/1)
    historyApiFallback: true,
  },
  preview: {
    port: 4173,
    historyApiFallback: true,
  },
});
