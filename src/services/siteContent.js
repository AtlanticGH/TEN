import { apiFetch, publicApiFetch } from '@/lib/apiClient'
import { parseSiteContentValue } from '@/utils/mergeSiteContent'

// Simple client-side CMS accessor.
// - Public reads are allowed via RLS (anon/auth)
// - Writes require staff/admin

/** Normalize API row (`{ key, value }`), bare value object, or null. */
export function extractSiteContentValue(row) {
  if (row == null) return null
  if (row.value !== undefined && row.value !== null) {
    return parseSiteContentValue(row.value)
  }
  if (typeof row === 'object' && !Array.isArray(row) && (row.badge || row.headline_before || row.headline_emphasis)) {
    return parseSiteContentValue(row)
  }
  return null
}

export async function getSiteContent(key) {
  return await publicApiFetch(`/api/public/site-content/${encodeURIComponent(String(key || ''))}`, { method: 'GET' })
}

export async function getSiteContentValue(key) {
  try {
    const row = await getSiteContent(key)
    return extractSiteContentValue(row)
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[siteContent] Failed to load', key, err?.message || err)
    }
    return null
  }
}

export async function upsertSiteContent({ key, value }) {
  return await apiFetch('/api/admin/site-content', { method: 'PUT', body: JSON.stringify({ key, value }) })
}

