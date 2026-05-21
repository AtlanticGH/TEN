import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useMentorDashboard } from '../../hooks/useMentorDashboard'
import {
  WorkspaceAlert,
  WorkspaceHeader,
  WorkspacePage,
  WorkspacePanel,
  WorkspaceStatCard,
} from '@/components/workspace/WorkspaceChrome'

export function MentorDashboardPage() {
  const { profile, user } = useAuth()
  const { data, isLoading, isError, error, refetch } = useMentorDashboard()

  const summary = data?.summary || {}
  const students = data?.students || []
  const pending = data?.pendingSubmissions || []

  const name = profile?.full_name || user?.email || 'Mentor'

  return (
    <WorkspacePage>
      <WorkspaceHeader
        label="Mentor dashboard"
        title={`Welcome back, ${name}`}
        description="Manage your courses, monitor mentees, and review assignment submissions."
        actions={
          <>
            <Link
              to="/mentor/profile"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
            >
              Profile
            </Link>
            <Link
              to="/mentor/courses"
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400"
            >
              Add a course
            </Link>
          </>
        }
      />

      {isError ? <WorkspaceAlert message={error?.message || 'Unable to load mentor dashboard.'} onRetry={() => refetch()} /> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <WorkspaceStatCard
          label="Mentees"
          value={isLoading ? '…' : summary.mentees ?? 0}
          sublabel="Students assigned to you"
          href="/mentor/students"
        />
        <WorkspaceStatCard
          label="Your courses"
          value={isLoading ? '…' : summary.my_courses ?? 0}
          sublabel="Courses you created"
          href="/mentor/courses"
        />
        <WorkspaceStatCard
          label="Pending reviews"
          value={isLoading ? '…' : summary.pending_reviews ?? 0}
          sublabel="Submissions awaiting approval"
          href="/mentor/assignments"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WorkspacePanel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Your mentees</h2>
            <Link to="/mentor/students" className="text-xs font-semibold text-orange-600 hover:underline dark:text-orange-300">
              View all
            </Link>
          </div>
          {isLoading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading…</p>
          ) : students.length ? (
            <ul className="mt-4 space-y-3">
              {students.slice(0, 6).map((s) => (
                <li
                  key={s.user_id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.full_name || s.email}</p>
                    <p className="text-xs text-zinc-500">{s.email}</p>
                  </div>
                  <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                    {s.status || 'active'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
              No mentees yet. Staff can assign students to you from Admin → Users.
            </p>
          )}
        </WorkspacePanel>

        <WorkspacePanel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Awaiting review</h2>
            <Link to="/mentor/assignments" className="text-xs font-semibold text-orange-600 hover:underline dark:text-orange-300">
              Review queue
            </Link>
          </div>
          {isLoading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading…</p>
          ) : pending.length ? (
            <ul className="mt-4 space-y-3">
              {pending.slice(0, 5).map((row) => (
                <li
                  key={row.id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40"
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {row.student?.full_name || row.student?.email || 'Student'}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{row.assignment?.title || 'Assignment'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">No pending submissions. Great work!</p>
          )}
        </WorkspacePanel>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/mentor/assignments"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:border-orange-400 dark:border-zinc-700 dark:text-zinc-200"
        >
          Review assignments
        </Link>
      </div>
    </WorkspacePage>
  )
}
