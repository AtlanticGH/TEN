import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useMentorDashboard } from '../../hooks/useMentorDashboard'

function StatCard({ label, value, sublabel, href }) {
  const inner = (
    <div className="rounded-3xl border border-orange-200/60 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-orange-900/40">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
      {sublabel ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{sublabel}</p> : null}
    </div>
  )
  if (href) {
    return (
      <Link to={href} className="block">
        {inner}
      </Link>
    )
  }
  return inner
}

export function MentorDashboardPage() {
  const { profile, user } = useAuth()
  const { data, isLoading, isError, error, refetch } = useMentorDashboard()

  const summary = data?.summary || {}
  const students = data?.students || []
  const pending = data?.pendingSubmissions || []

  const name = profile?.full_name || user?.email || 'Mentor'

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-zinc-200 bg-gradient-to-br from-orange-500/10 via-white to-white p-6 shadow-sm dark:border-zinc-800 dark:from-orange-950/20 dark:via-zinc-900/60 dark:to-zinc-900/60">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Mentor dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Welcome back, {name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
          Manage your courses, monitor mentees, and review assignment submissions.
        </p>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error?.message || 'Unable to load mentor dashboard.'}
          <button type="button" onClick={() => refetch()} className="ml-3 font-semibold underline">
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Mentees"
          value={isLoading ? '…' : summary.mentees ?? 0}
          sublabel="Students assigned to you"
          href="/mentor/students"
        />
        <StatCard
          label="Your courses"
          value={isLoading ? '…' : summary.my_courses ?? 0}
          sublabel="Courses you created"
          href="/mentor/courses"
        />
        <StatCard
          label="Pending reviews"
          value={isLoading ? '…' : summary.pending_reviews ?? 0}
          sublabel="Submissions awaiting approval"
          href="/mentor/assignments"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
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
        </section>

        <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
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
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/mentor/courses"
          className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"
        >
          Add a course
        </Link>
        <Link
          to="/mentor/assignments"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:border-orange-400 dark:border-zinc-700 dark:text-zinc-200"
        >
          Review assignments
        </Link>
      </div>
    </div>
  )
}
