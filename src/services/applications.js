import { publicApiFetch } from '@/lib/apiClient'

export async function submitApplication(payload) {
  return await publicApiFetch('/api/public/applications', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload || {}),
  })
}
