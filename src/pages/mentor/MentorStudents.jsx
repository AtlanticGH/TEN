import { useEffect, useState } from 'react'
import { fetchMenteeProgress, listMentorStudents } from '@/services/mentor'

export function MentorStudentsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const rows = await listMentorStudents()
        if (!cancelled) setStudents(rows)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load students.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return undefined
    }
    let cancelled = false
    ;(async () => {
      setDetailLoading(true)
      try {
        const data = await fetchMenteeProgress(selectedId)
        if (!cancelled) setDetail(data)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load progress.')
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const selected = students.find((s) => s.user_id === selectedId)

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Students</p>
      <h2 className="mt-2 text-2xl font-semibold">Monitor mentees</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Track enrollments, completions, and assignment status.</p>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : students.length ? (
            <ul className="space-y-2">
              {students.map((s) => (
                <li key={s.user_id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(s.user_id)}
                    className={[
                      'w-full rounded-2xl border px-4 py-3 text-left text-sm transition',
                      selectedId === s.user_id
                        ? 'border-orange-400 bg-orange-50 dark:border-orange-500/50 dark:bg-orange-950/30'
                        : 'border-zinc-200 hover:border-orange-300 dark:border-zinc-800',
                    ].join(' ')}
                  >
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{s.full_name || s.email}</p>
                    <p className="mt-1 text-xs text-zinc-500">{s.email}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">No mentees assigned yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          {!selectedId ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Select a student to view progress.</p>
          ) : detailLoading ? (
            <p className="text-sm text-zinc-500">Loading progress…</p>
          ) : detail ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Selected</p>
                <p className="mt-1 text-lg font-semibold">{selected?.full_name || selected?.email}</p>
                {selected?.goals ? (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">{selected.goals}</p>
                ) : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Enrollments</p>
                <p className="mt-1 text-2xl font-semibold">{detail.enrollments?.length || 0}</p>
                <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {(detail.courses || []).map((c) => (
                    <li key={c.id}>• {c.title}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <p className="text-xs text-zinc-500">Lessons done</p>
                  <p className="text-xl font-semibold">{detail.lesson_completions?.length || 0}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <p className="text-xs text-zinc-500">Courses done</p>
                  <p className="text-xl font-semibold">{detail.course_completions?.length || 0}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Assignment submissions</p>
                <ul className="mt-2 space-y-2">
                  {(detail.assignment_submissions || []).slice(0, 8).map((sub) => (
                    <li
                      key={sub.id}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/60"
                    >
                      <span className="font-medium capitalize">{sub.status?.replace('_', ' ')}</span>
                      {sub.grade ? <span className="text-zinc-500"> · Grade: {sub.grade}</span> : null}
                    </li>
                  ))}
                  {!detail.assignment_submissions?.length ? (
                    <li className="text-sm text-zinc-500">No submissions yet.</li>
                  ) : null}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
