import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  // @tiinex/app is an ESM source package and intentionally uses Vite asset
  // queries such as ?raw. Let Vite's normal transform pipeline handle it
  // instead of dependency pre-bundling, which can treat the query as part of
  // a Windows filesystem path during optimizer scanning.
  optimizeDeps: {
    exclude: ['@tiinex/app'],
  },
  build: {
    outDir: '.site-publish',
    emptyOutDir: true,
    sourcemap: true
  }
});
