import { apiFetch, publicApiFetch } from '@/lib/apiClient'

// Simple client-side CMS accessor.
// - Public reads are allowed via RLS (anon/auth)
// - Writes require staff/admin

export async function getSiteContent(key) {
  return await publicApiFetch(`/api/public/site-content/${encodeURIComponent(String(key || ''))}`, { method: 'GET' })
}

export async function upsertSiteContent({ key, value }) {
  return await apiFetch('/api/admin/site-content', { method: 'PUT', body: JSON.stringify({ key, value }) })
}

