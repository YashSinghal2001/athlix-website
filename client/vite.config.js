import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Never emit source maps in production: they would expose original source,
    // file paths, and structure. Minification (on by default) keeps stack
    // traces opaque in the shipped bundle.
    sourcemap: false,
  },
  server: {
    // Forward API calls to the local backend during development so the client
    // can use same-origin "/api/apply" with no CORS or hardcoded URLs.
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
