import { useMentorDashboard } from '../../hooks/useMentorDashboard'
import {
  DashboardAlert,
  DashboardButton,
  DashboardEmpty,
  DashboardListItem,
  DashboardPage,
  DashboardPanel,
  DashboardSectionHeader,
  DashboardSkeleton,
  DashboardSplit,
  DashboardStatCard,
  DashboardStatsRow,
} from '@/components/dashboard/DashboardChrome'

export function MentorDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useMentorDashboard()

  const summary = data?.summary || {}
  const students = data?.students || []
  const pending = data?.pendingSubmissions || []

  return (
    <DashboardPage>
      {isError ? (
        <DashboardAlert message={error?.message || 'Unable to load mentor dashboard.'} onRetry={() => refetch()} />
      ) : null}

      {isLoading ? (
        <DashboardStatsRow>
          <DashboardSkeleton className="h-32" />
          <DashboardSkeleton className="h-32" />
          <DashboardSkeleton className="h-32" />
        </DashboardStatsRow>
      ) : (
        <DashboardStatsRow>
          <DashboardStatCard
            label="Mentees"
            value={summary.mentees ?? 0}
            sublabel="Students assigned to you"
            href="/mentor/students"
            icon="👥"
            tone="orange"
          />
          <DashboardStatCard
            label="Your courses"
            value={summary.my_courses ?? 0}
            sublabel="Courses you created"
            href="/mentor/courses"
            icon="📚"
            tone="amber"
          />
          <DashboardStatCard
            label="Pending reviews"
            value={summary.pending_reviews ?? 0}
            sublabel="Submissions awaiting approval"
            href="/mentor/assignments"
            icon="✅"
            tone="violet"
          />
        </DashboardStatsRow>
      )}

      <DashboardSplit>
        <DashboardPanel>
          <DashboardSectionHeader
            label="Roster"
            title="Your mentees"
            description="Students linked to you for mentorship and course support."
            href="/mentor/students"
          />
          {isLoading ? (
            <div className="mt-6 space-y-3">
              <DashboardSkeleton className="h-16" />
              <DashboardSkeleton className="h-16" />
              <DashboardSkeleton className="h-16" />
            </div>
          ) : students.length ? (
            <ul className="mt-6 space-y-3">
              {students.slice(0, 6).map((s) => (
                <li key={s.user_id}>
                  <DashboardListItem>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.full_name || s.email}</p>
                      <p className="text-xs text-zinc-500">{s.email}</p>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-300">
                      {s.status || 'active'}
                    </span>
                  </DashboardListItem>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <DashboardEmpty>
                No mentees yet. Staff can assign students from Admin → Users.
              </DashboardEmpty>
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel>
          <DashboardSectionHeader
            label="Queue"
            title="Awaiting review"
            description="Assignment submissions that need your feedback."
            href="/mentor/assignments"
            hrefLabel="Review queue"
          />
          {isLoading ? (
            <div className="mt-6 space-y-3">
              <DashboardSkeleton className="h-16" />
              <DashboardSkeleton className="h-16" />
            </div>
          ) : pending.length ? (
            <ul className="mt-6 space-y-3">
              {pending.slice(0, 5).map((row) => (
                <li key={row.id}>
                  <DashboardListItem>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {row.student?.full_name || row.student?.email || 'Student'}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">{row.assignment?.title || 'Assignment'}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                      Pending
                    </span>
                  </DashboardListItem>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <DashboardEmpty>No pending submissions — you&apos;re all caught up.</DashboardEmpty>
            </div>
          )}
        </DashboardPanel>
      </DashboardSplit>

      <div className="flex flex-wrap gap-3 rounded-[28px] border border-zinc-200/90 bg-gradient-to-r from-zinc-50 to-orange-50/40 p-5 dark:border-zinc-800 dark:from-zinc-950/40 dark:to-orange-950/20">
        <DashboardButton to="/mentor/courses" variant="secondary">
          Manage courses
        </DashboardButton>
        <DashboardButton to="/mentor/assignments">Review assignments</DashboardButton>
        <DashboardButton to="/mentor/students" variant="secondary">
          View all students
        </DashboardButton>
        <DashboardButton to="/mentor/announcements" variant="secondary">
          Send announcement
        </DashboardButton>
      </div>
    </DashboardPage>
  )
}
