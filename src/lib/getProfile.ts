import { apiFetch } from '@/lib/apiClient'

export async function getProfile() {
  try {
    return await apiFetch('/api/profile', { method: 'GET' })
  } catch {
    return null
  }
}

