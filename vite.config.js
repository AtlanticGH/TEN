import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'))

/** UI / animation / icon libs to isolate when present in dependencies */
const VENDOR_UI_PACKAGES = [
  'framer-motion',
  'lucide-react',
  'clsx',
  'tailwind-merge',
  '@radix-ui',
  '@headlessui',
].filter((name) => name in (pkg.dependencies || {}) || name in (pkg.devDependencies || {}))

function manualChunks(id) {
  if (!id.includes('node_modules')) return undefined

  if (id.includes('@supabase/supabase-js')) return 'vendor-supabase'
  if (id.includes('@tanstack/react-query')) return 'vendor-query'

  if (VENDOR_UI_PACKAGES.some((pkg) => id.includes(`node_modules/${pkg}`))) {
    return 'vendor-ui'
  }

  if (
    id.includes('react-router-dom') ||
    id.includes('react-dom') ||
    /node_modules\/react\//.test(id)
  ) {
    return 'vendor-react'
  }

  return undefined
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    jsxDev: false,
  },
  // Dev-only proxy. In production (Vercel), the frontend and API share an
  // origin so no proxy is needed; the browser hits /api/* directly and Vercel
  // routes those requests to api/index.js (which mounts the Express app
  // from server/index.js). If VITE_API_URL is set in a build env, fetch
  // helpers in src/ use it instead of relative /api paths.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
    esbuild: {
      jsxDev: false,
      drop: ['console', 'debugger'],
    },
  },
})
