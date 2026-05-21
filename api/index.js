// Vercel entry for all /api/* routes (Vite projects — use api/index.js + rewrites).
// The [[...slug]] filename is Next.js-only and is NOT routed on Vercel for this stack.
//
// Local dev uses `npm run dev:all` / `npm start` (server/index.js .listen()).

import app from '../server/index.js'

/** Restore full /api/... path after Vercel rewrite to this function. */
function prepareRequest(req) {
  const raw = req.url || '/'
  const qIndex = raw.indexOf('?')
  const pathOnly = qIndex >= 0 ? raw.slice(0, qIndex) : raw
  const search = qIndex >= 0 ? raw.slice(qIndex) : ''
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)

  const vercelPath = params.get('__path')
  if (vercelPath) {
    params.delete('__path')
    const qs = params.toString()
    req.url = `/api/${vercelPath}${qs ? `?${qs}` : ''}`
    return
  }

  if (pathOnly && !pathOnly.startsWith('/api')) {
    req.url = `/api${pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`}${search}`
  }
}

export default function handler(req, res) {
  prepareRequest(req)
  return app(req, res)
}

export const config = {
  api: {
    bodyParser: false,
  },
}
