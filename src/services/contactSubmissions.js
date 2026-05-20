import { publicApiFetch } from '@/lib/apiClient'

export async function submitContact(payload) {
  return await publicApiFetch('/api/public/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload || {}) })
}

