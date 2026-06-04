import { apiFetch } from '@/lib/apiClient'

export async function listCmsSummary() {
  return await apiFetch('/api/admin/summary', { method: 'GET' })
}

export async function listApplications() {
  return await apiFetch('/api/admin/applications', { method: 'GET' })
}

export async function updateApplication(id, patch) {
  return await apiFetch(`/api/admin/applications/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(patch || {}),
  })
}
