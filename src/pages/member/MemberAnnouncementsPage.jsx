import { Link } from 'react-router-dom'
import {
  DashboardAlert,
  DashboardEmpty,
  DashboardInsetCard,
  DashboardPage,
  DashboardPageIntro,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { SITE_BTN_SECONDARY } from '../../components/ui/siteDesignTokens'
import { useInvalidateStudentAnnouncements, useStudentAnnouncementFeed } from '../../hooks/useMentorStudentAnnouncements'
import { markAllMentorAnnouncementsRead, markMentorAnnouncementRead } from '../../services/mentorCommunication'

function formatTs(ts) {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ''
  }
}

export function MemberAnnouncementsPage() {
  const invalidate = useInvalidateStudentAnnouncements()
  const { data: items = [], isLoading, isError, error, refetch } = useStudentAnnouncementFeed()

  const unread = items.filter((r) => !r.read).length

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Announcements"
        title="From your mentor"
        description="Updates from your assigned mentor appear here in realtime. Mark items read when you have seen them."
        actions={
          <div className="flex flex-wrap gap-2">
            {unread > 0 ? (
              <button
                type="button"
                className={`${SITE_BTN_SECONDARY} !py-2`}
                onClick={async () => {
                  await markAllMentorAnnouncementsRead()
                  invalidate()
                }}
              >
                Mark all read ({unread})
              </button>
            ) : null}
            <button type="button" onClick={() => refetch()} className={`${SITE_BTN_SECONDARY} !py-2`}>
              Refresh
            </button>
          </div>
        }
      />

      {isError ? (
        <DashboardAlert message={error?.message || 'Unable to load announcements.'} onRetry={() => refetch()} />
      ) : null}

      {isLoading ? (
        <DashboardSkeleton className="h-40" />
      ) : items.length ? (
        <ul className="space-y-3">
          {items.map((row) => {
            const ann = row.mentor_announcements
            const mentorId = ann?.mentor_id
            return (
              <li key={row.id}>
                <DashboardInsetCard>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{ann?.title || 'Announcement'}</p>
                        {!row.read ? (
                          <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-300">
                            Unread
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">{formatTs(ann?.created_at || row.created_at)}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                        {ann?.message}
                      </p>
                      {mentorId ? (
                        <Link
                          to="/member/mentor"
                          className="mt-3 inline-block text-xs font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400"
                        >
                          View mentor profile →
                        </Link>
                      ) : null}
                    </div>
                    {!row.read ? (
                      <button
                        type="button"
                        className="h-fit shrink-0 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold hover:border-orange-500 dark:border-zinc-600"
                        onClick={async () => {
                          await markMentorAnnouncementRead(row.id)
                          invalidate()
                        }}
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </DashboardInsetCard>
              </li>
            )
          })}
        </ul>
      ) : (
        <DashboardEmpty>No mentor announcements yet.</DashboardEmpty>
      )}
    </DashboardPage>
  )
}
