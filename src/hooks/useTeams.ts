import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import { useAuth } from './useAuth'

export function useTeams() {
  const { isAuthed } = useAuth()
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      return await apiFetch('/api/teams', { method: 'GET' })
    },
    enabled: isAuthed,
    staleTime: 20_000,
  })
}

