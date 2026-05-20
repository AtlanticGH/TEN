import { apiFetch, publicApiFetch } from '@/lib/apiClient'

export async function listCmsContentRows({ includeDrafts = false } = {}) {
  return await publicApiFetch(`/api/public/cms-content?includeDrafts=${includeDrafts ? 'true' : 'false'}`, { method: 'GET' })
}

export async function upsertCmsContentRow(row) {
  return await apiFetch('/api/admin/cms-content', { method: 'PUT', body: JSON.stringify(row || {}) })
}
