import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { fetchMentorSummary, listMentorStudents, listMentorSubmissions } from '@/services/mentor'

export function useMentorDashboard() {
  const { isAuthed, profile } = useAuth()
  const isMentor = profile?.role === 'mentor'
  return useQuery({
    queryKey: ['mentor-dashboard'],
    enabled: isAuthed && isMentor,
    queryFn: async () => {
      const [summary, students, pendingSubmissions] = await Promise.all([
        fetchMentorSummary(),
        listMentorStudents(),
        listMentorSubmissions({ status: 'submitted' }),
      ])
      return { summary, students, pendingSubmissions }
    },
    staleTime: 20_000,
  })
}
