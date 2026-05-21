import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { listCourses, listMyCourseProgress, listMyEnrollments } from '@/services/db'

export function useMemberCourses() {
  const { isAuthed } = useAuth()
  return useQuery({
    queryKey: ['member-courses'],
    enabled: isAuthed,
    queryFn: async () => {
      const [courses, enrollments, progress] = await Promise.all([
        listCourses(),
        listMyEnrollments(),
        listMyCourseProgress(),
      ])
      return { courses, enrollments, progress }
    },
    staleTime: 20_000,
  })
}
