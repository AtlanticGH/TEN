import { apiFetch, publicApiFetch } from '@/lib/apiClient'

export async function getPublicNavigation(key = 'main') {
  return publicApiFetch(`/api/public/cms/navigation/${encodeURIComponent(key)}`, { method: 'GET' })
}

export async function getAdminNavigation(key = 'main') {
  return apiFetch(`/api/admin/navigation/${encodeURIComponent(key)}`, { method: 'GET' })
}

export async function updateNavigation(key, payload) {
  return apiFetch(`/api/admin/navigation/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify(payload || {}),
  })
}
