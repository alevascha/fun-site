import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import pagesPlugin from './scripts/vite-plugin-pages.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pagesPlugin()],
})
