// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Prepended to every built JS chunk. The `/*!` form marks it as a legal comment.
const COPYRIGHT_BANNER =
  '/*! Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/ Unauthorized copying, modification, or distribution is prohibited. */\n'

// Edits the final (already minified) output, so the banner is added verbatim to each JS chunk.
const copyrightBanner = () => ({
  name: 'copyright-banner',
  apply: 'build',
  enforce: 'post',
  generateBundle(_options, bundle) {
    let count = 0
    for (const file of Object.values(bundle)) {
      if (file.type === 'chunk') {
        file.code = COPYRIGHT_BANNER + file.code
        count += 1
      }
    }
    console.log(`copyright-banner: added to ${count} JS chunks`)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), copyrightBanner()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    css: true,
  },
})
