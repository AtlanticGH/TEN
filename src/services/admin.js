import { apiFetch } from '@/lib/apiClient'

export async function listCmsSummary() {
  return await apiFetch('/api/admin/summary', { method: 'GET' })
}
