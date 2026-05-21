import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createMentorCourse, listMentorCourses, updateMentorCourse } from '@/services/mentor'
import {
  WorkspaceAlert,
  WorkspaceHeader,
  WorkspaceMutedPanel,
  WorkspacePage,
  WorkspacePanel,
  WorkspaceSplit,
} from '@/components/workspace/WorkspaceChrome'

export function MentorCoursesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [busyId, setBusyId] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    category: '',
    difficulty: 'beginner',
    published: false,
  })

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listMentorCourses()
      setItems(data)
    } catch (err) {
      setError(err?.message || 'Unable to load courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [])

  const canCreate = useMemo(() => !!form.title.trim(), [form.title])
  const update = (k) => (e) =>
    setForm((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <WorkspacePage>
      <WorkspaceHeader
        label="Courses"
        title="Your courses"
        description="Create courses, upload cover images, and build modules with lessons and downloadable files."
        actions={
          <button
            type="button"
            onClick={() => refresh()}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 dark:border-zinc-700 dark:text-zinc-200"
          >
            Refresh
          </button>
        }
      />

      <WorkspaceAlert message={error} />

      <WorkspaceSplit>
        <WorkspaceMutedPanel>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Create course</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!canCreate) return
              setBusyId('create')
              setError('')
              try {
                const created = await createMentorCourse({
                  title: form.title.trim(),
                  description: form.description.trim(),
                  instructor: form.instructor.trim(),
                  duration: form.duration.trim(),
                  category: form.category.trim() || null,
                  difficulty: form.difficulty || null,
                  published: !!form.published,
                })
                setForm({
                  title: '',
                  description: '',
                  instructor: '',
                  duration: '',
                  category: '',
                  difficulty: 'beginner',
                  published: false,
                })
                if (created?.id) {
                  window.location.assign(`/mentor/courses/${created.id}`)
                  return
                }
                await refresh()
              } catch (err) {
                setError(err?.message || 'Unable to create course.')
              } finally {
                setBusyId('')
              }
            }}
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Title *</span>
              <input
                value={form.title}
                onChange={update('title')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Description</span>
              <textarea
                value={form.description}
                onChange={update('description')}
                rows={3}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.published} onChange={update('published')} />
              Published (visible to students when enrolled)
            </label>
            <button
              type="submit"
              disabled={!canCreate || busyId === 'create'}
              className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50"
            >
              {busyId === 'create' ? 'Creating…' : 'Create course'}
            </button>
          </form>
        </WorkspaceMutedPanel>

        <WorkspacePanel>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Your list</p>
          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading…</p>
          ) : items.length ? (
            <ul className="mt-4 space-y-3">
              {items.map((c) => (
                <li
                  key={c.id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{c.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{c.published ? 'Published' : 'Draft'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/mentor/courses/${c.id}`}
                        className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold hover:border-orange-400 dark:border-zinc-700"
                      >
                        Build
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === c.id}
                        onClick={async () => {
                          setBusyId(c.id)
                          setError('')
                          try {
                            await updateMentorCourse(c.id, { published: !c.published })
                            await refresh()
                          } catch (err) {
                            setError(err?.message || 'Unable to update.')
                          } finally {
                            setBusyId('')
                          }
                        }}
                        className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold hover:border-orange-400 dark:border-zinc-700"
                      >
                        {c.published ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">No courses yet. Create your first course.</p>
          )}
        </WorkspacePanel>
      </WorkspaceSplit>
    </WorkspacePage>
  )
}
