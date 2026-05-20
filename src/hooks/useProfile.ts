import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      return await apiFetch('/api/profile', { method: 'GET' })
    },
  })
}

