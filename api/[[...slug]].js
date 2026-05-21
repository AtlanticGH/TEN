// Vercel serverless adapter.
//
// This file is the catch-all for every /api/* path on Vercel. It simply
// imports the Express app from server/index.js and re-exports it as a
// Vercel function handler — Express's (req, res) signature is compatible
// with Node's @vercel/node runtime.
//
// Specific per-endpoint files in api/ (inviteApplicant.js, etc.) still
// take precedence over this catch-all (Vercel routes by most-specific
// filesystem match), and they behave identically because the same handler
// modules are also wired into the Express app in server/index.js.
//
// Local dev still uses `npm start` which calls .listen() because the
// VERCEL env var is not set there.

import app from '../server/index.js'

/** Normalize path before Express routing (Vercel strips /api prefix). */
function prepareRequest(req) {
  const raw = req.url || '/'
  const q = raw.includes('?') ? raw.slice(raw.indexOf('?')) : ''
  const pathOnly = q ? raw.slice(0, raw.indexOf('?')) : raw
  if (pathOnly && !pathOnly.startsWith('/api')) {
    req.url = `/api${pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`}${q}`
  }
}

export default function handler(req, res) {
  prepareRequest(req)
  return app(req, res)
}

// Vercel function config. bodyParser:false ensures express.raw/express.json
// inside the app handle the body themselves (avoids double-parsing).
export const config = {
  api: {
    bodyParser: false,
  },
}
