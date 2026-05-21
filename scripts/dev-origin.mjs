/** Local dev site origin for bootstrap script hints (Vite may use 5174, 5175, …). */
export function devOrigin() {
  const raw = process.env.FRONTEND_ORIGIN || process.env.SITE_URL || 'http://localhost:5173'
  return String(raw).trim().replace(/\/$/, '')
}
