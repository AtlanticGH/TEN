import { useEffect, useState } from 'react'
import { listMentorSubmissions, reviewMentorSubmission } from '@/services/mentor'
import {
  WorkspaceAlert,
  WorkspaceHeader,
  WorkspaceMutedPanel,
  WorkspacePage,
  WorkspacePanel,
} from '@/components/workspace/WorkspaceChrome'

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'needs_revision', label: 'Needs revision' },
  { value: 'all', label: 'All' },
]

function statusBadge(status) {
  if (status === 'approved') return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
  if (status === 'needs_revision') return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200'
  return 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200'
}

export function MentorAssignmentsPage() {
  const [filter, setFilter] = useState('submitted')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async (status = filter) => {
    setLoading(true)
    setError('')
    try {
      const rows = await listMentorSubmissions({ status })
      setItems(rows)
      if (selectedId && !rows.find((r) => r.id === selectedId)) setSelectedId('')
    } catch (err) {
      setError(err?.message || 'Unable to load submissions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => load(filter))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const selected = items.find((r) => r.id === selectedId)

  const review = async (status) => {
    if (!selectedId) return
    setBusy(true)
    setError('')
    try {
      await reviewMentorSubmission(selectedId, {
        status,
        grade: grade.trim() || null,
        mentor_feedback: feedback.trim() || null,
      })
      await load(filter)
      setSelectedId('')
    } catch (err) {
      setError(err?.message || 'Unable to save review.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <WorkspacePage>
      <WorkspaceHeader
        label="Assignments"
        title="Review & mark work"
        description="Approve submissions or request revisions with feedback and a grade."
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={[
              'rounded-full border px-4 py-2 text-xs font-semibold',
              filter === opt.value
                ? 'border-orange-400 bg-orange-50 text-orange-800 dark:bg-orange-950/30 dark:text-orange-200'
                : 'border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <WorkspaceAlert message={error} />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <WorkspacePanel className="p-4 md:p-6">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : items.length ? (
            <ul className="space-y-2">
              {items.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(row.id)
                      setGrade(row.grade || '')
                      setFeedback(row.mentor_feedback || '')
                    }}
                    className={[
                      'w-full rounded-2xl border px-4 py-3 text-left transition',
                      selectedId === row.id
                        ? 'border-orange-400 bg-orange-50 dark:border-orange-500/50 dark:bg-orange-950/30'
                        : 'border-zinc-200 hover:border-orange-300 dark:border-zinc-800',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{row.assignment?.title || 'Assignment'}</p>
                      <span className={['rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase', statusBadge(row.status)].join(' ')}>
                        {row.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{row.student?.full_name || row.student?.email}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">No submissions in this filter.</p>
          )}
        </WorkspacePanel>

        <WorkspaceMutedPanel>
          {!selected ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Select a submission to review.</p>
          ) : (
            <div key={selectedId} className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Student work</p>
                <p className="mt-1 font-semibold">{selected.student?.full_name || selected.student?.email}</p>
                <p className="mt-2 text-sm font-medium">{selected.assignment?.title}</p>
                {selected.notes ? (
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap">{selected.notes}</p>
                ) : null}
                {selected.link_url ? (
                  <a
                    href={selected.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-sm font-semibold text-orange-600 hover:underline dark:text-orange-300"
                  >
                    Open submission link
                  </a>
                ) : null}
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Grade / mark</span>
                <input
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. A, 92%, Pass"
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900/60"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Feedback</span>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900/60"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => review('approved')}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => review('needs_revision')}
                  className="rounded-full border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  Request revision
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => review('submitted')}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200"
                >
                  Mark pending
                </button>
              </div>
            </div>
          )}
        </WorkspaceMutedPanel>
      </div>
    </WorkspacePage>
  )
}
