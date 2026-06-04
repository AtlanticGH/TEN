import { apiFetch } from '@/lib/apiClient'

export async function listAdminUsers(limit = 50) {
  return apiFetch(`/api/admin/users?limit=${encodeURIComponent(String(limit))}`, { method: 'GET' })
}

export async function updateAdminUser(userId, patch) {
  return apiFetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(patch || {}),
  })
}
