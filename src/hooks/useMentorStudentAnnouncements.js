import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  countUnreadMentorAnnouncements,
  listMyMentorAnnouncementFeed,
} from '../services/mentorCommunication'

export function useStudentAnnouncementFeed() {
  const { isAuthed } = useAuth()
  return useQuery({
    queryKey: ['student-announcements'],
    enabled: isAuthed,
    queryFn: listMyMentorAnnouncementFeed,
    staleTime: 15_000,
  })
}

export function useUnreadAnnouncementCount() {
  const { isAuthed } = useAuth()
  return useQuery({
    queryKey: ['student-announcements-unread'],
    enabled: isAuthed,
    queryFn: countUnreadMentorAnnouncements,
    staleTime: 10_000,
  })
}

export function useInvalidateStudentAnnouncements() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['student-announcements'] })
    qc.invalidateQueries({ queryKey: ['student-announcements-unread'] })
    qc.invalidateQueries({ queryKey: ['member-dashboard'] })
  }
}
