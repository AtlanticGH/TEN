const rawBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL

/** Same-origin `/api/*` when unset. Strip trailing slashes and a redundant `/api` suffix. */
function normalizeApiBase(value) {
  let base = String(value || '').trim().replace(/\/+$/, '')
  if (base.endsWith('/api')) base = base.slice(0, -4)
  return base
}

const base = normalizeApiBase(rawBase)

export function apiUrl(path) {
  if (!base) return path
  if (!path) return base
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

export function usesSameOriginApi() {
  return !base
}
