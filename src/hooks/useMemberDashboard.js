import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  listCourses,
  listMyCourseProgress,
  listMyEnrollments,
  listMyMilestones,
  listMyNotifications,
  listMyUpcomingSessions,
} from '@/services/db'

export function useMemberDashboard() {
  const { isAuthed } = useAuth()
  return useQuery({
    queryKey: ['member-dashboard'],
    enabled: isAuthed,
    queryFn: async () => {
      const [courses, enrollments, progress, milestones, notifications, sessions] = await Promise.all([
        listCourses(),
        listMyEnrollments(),
        listMyCourseProgress(),
        listMyMilestones(),
        listMyNotifications({ limit: 6 }),
        listMyUpcomingSessions({ limit: 5 }),
      ])
      return { courses, enrollments, progress, milestones, notifications, sessions }
    },
    staleTime: 20_000,
  })
}
