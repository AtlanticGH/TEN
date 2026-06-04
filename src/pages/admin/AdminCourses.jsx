import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ADMIN_INPUT_CLASS,
  DashboardAlert,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { ADMIN_BTN_PRIMARY, ADMIN_BTN_SECONDARY } from '../../components/dashboard/DashboardChrome'
import { createCourse, deleteCourse, listAdminCourses, updateCourse } from '../../services/adminCourses'

export function AdminCoursesPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setCourses(await listAdminCourses())
    } catch (err) {
      setError(err?.message || 'Unable to load courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <DashboardPage>
        <DashboardSkeleton className="h-8 w-40" />
        <DashboardSkeleton className="h-48" />
      </DashboardPage>
    )
  }

  return (
    <DashboardPage>
      <DashboardPageIntro label="Courses" title="Courses & lessons" description="Create courses and manage modules and lessons." />
      {error ? <DashboardAlert message={error} /> : null}
      <DashboardNotice message={notice} />

      <DashboardPanel className="mb-6">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!title.trim()) return
            setBusy(true)
            try {
              const c = await createCourse({ title: title.trim(), published: false })
              setTitle('')
              setNotice('Course created.')
              await load()
              window.location.assign(`/admin/courses/${c.id}/edit`)
            } catch (err) {
              setError(err?.message || 'Create failed.')
            } finally {
              setBusy(false)
            }
          }}
        >
          <label className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">New course title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={`mt-2 ${ADMIN_INPUT_CLASS}`} />
          </label>
          <button type="submit" disabled={busy} className={`${ADMIN_BTN_PRIMARY} shrink-0 disabled:opacity-60`}>
            Add course
          </button>
        </form>
      </DashboardPanel>

      <ul className="space-y-3">
        {courses.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{c.title}</p>
              <p className="text-xs text-zinc-500">{c.published ? 'Published' : 'Draft'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/admin/courses/${c.id}/edit`} className={ADMIN_BTN_SECONDARY}>
                Edit lessons
              </Link>
              <button
                type="button"
                className={ADMIN_BTN_SECONDARY}
                onClick={async () => {
                  await updateCourse(c.id, { published: !c.published })
                  setNotice('Course updated.')
                  await load()
                }}
              >
                {c.published ? 'Unpublish' : 'Publish'}
              </button>
              <button
                type="button"
                className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700"
                onClick={async () => {
                  if (!window.confirm('Delete course and all modules/lessons?')) return
                  await deleteCourse(c.id)
                  setNotice('Course deleted.')
                  await load()
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </DashboardPage>
  )
}
