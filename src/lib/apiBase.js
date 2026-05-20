const rawBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL

const base =
  typeof rawBase === 'string' && rawBase.trim()
    ? rawBase.trim().replace(/\/$/, '')
    : ''

export function apiUrl(path) {
  if (!base) return path
  if (!path) return base
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

