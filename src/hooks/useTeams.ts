import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      return await apiFetch('/api/teams', { method: 'GET' })
    },
  })
}

