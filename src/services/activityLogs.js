import { apiFetch } from '@/lib/apiClient'

export async function listActivityLogs({ limit = 100 } = {}) {
  return await apiFetch(`/api/admin/activity-logs?limit=${encodeURIComponent(String(limit || 100))}`, { method: 'GET' })
}

export async function logActivity({ action, entityType, entityId, metadata } = {}) {
  return await apiFetch('/api/activity-logs', {
    method: 'POST',
    body: JSON.stringify({ action, entityType, entityId, metadata }),
  })
}
