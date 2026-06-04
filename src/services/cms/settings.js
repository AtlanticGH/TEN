import { apiFetch, publicApiFetch } from '@/lib/apiClient'

const DEFAULT_KEY = 'global.v1'

export async function getPublicSiteSettings(key = DEFAULT_KEY) {
  return publicApiFetch(`/api/public/cms/settings?key=${encodeURIComponent(key)}`, { method: 'GET' })
}

export async function getAdminSiteSettings(key = DEFAULT_KEY) {
  return apiFetch(`/api/admin/site-settings?key=${encodeURIComponent(key)}`, { method: 'GET' })
}

export async function updateSiteSettings(key, value) {
  return apiFetch('/api/admin/site-settings', {
    method: 'PUT',
    body: JSON.stringify({ key, value }),
  })
}
