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

const EXPECTED_SUPABASE_PROJECT = 'zygkofiiurlsnrkcmaya'

/** Fail Vercel builds when client Supabase env is wrong. Server keys are checked at API runtime. */
function assertVercelSupabaseEnv() {
  return {
    name: 'assert-vercel-supabase-env',
    buildStart() {
      if (!process.env.VERCEL) return

      const url = String(process.env.VITE_SUPABASE_URL || '').trim()
      const anon = String(process.env.VITE_SUPABASE_ANON_KEY || '').trim()
      const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

      if (!url.includes(EXPECTED_SUPABASE_PROJECT)) {
        throw new Error(
          `Vercel build: VITE_SUPABASE_URL must be https://${EXPECTED_SUPABASE_PROJECT}.supabase.co (got "${url || 'empty'}"). Update Vercel → Settings → Environment Variables for Production and Preview, then redeploy.`,
        )
      }
      if (!anon) {
        throw new Error(
          'Vercel build: VITE_SUPABASE_ANON_KEY is missing. Add it in Vercel → Settings → Environment Variables (Production + Preview).',
        )
      }
      if (!serviceKey) {
        // Service role is server-only — often unavailable during Vite build on Vercel.
        // Runtime API routes validate via /api/env-status and /api/healthz.
        console.warn(
          '[build] SUPABASE_SERVICE_ROLE_KEY not visible at build time — ensure it is set for Production + Preview in Vercel (required for /api/* at runtime).',
        )
      }
    },
  }
}

export default defineConfig({
  plugins: [assertVercelSupabaseEnv(), react(), tailwindcss()],
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
  //
  // Local defaults (5190 / 3090) avoid clashing with other apps on 5173 / 3000.
  // Always start with npm run dev:all — not npm run dev alone.
  server: {
    port: 5190,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.DEV_API_PORT || '3090'}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5190,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.DEV_API_PORT || '3090'}`,
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
