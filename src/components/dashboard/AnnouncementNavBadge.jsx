import { useUnreadAnnouncementCount } from '../../hooks/useMentorStudentAnnouncements'

export function AnnouncementNavBadge() {
  const { data: count = 0 } = useUnreadAnnouncementCount()
  if (!count) return null
  return (
    <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}
