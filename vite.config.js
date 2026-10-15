import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import pagesPlugin from './scripts/vite-plugin-pages.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pagesPlugin()],
  // The pages plugin reads the manifest to preload each route's chunks.
  build: { manifest: true },
})
