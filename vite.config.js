import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Dev-only proxy. In production (Vercel), the frontend and API share an
  // origin so no proxy is needed; the browser hits /api/* directly and Vercel
  // routes those requests to api/[[...slug]].js (which mounts the Express app
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
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
})
