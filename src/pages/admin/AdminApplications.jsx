import { useEffect, useState } from 'react'
import {
  ADMIN_FIELD_LABEL,
  ADMIN_TEXTAREA_CLASS,
  DashboardAlert,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { ADMIN_BTN_PRIMARY } from '../../components/dashboard/DashboardChrome'
import { listApplications, updateApplication } from '../../services/admin'

const STATUSES = ['submitted', 'waitlist', 'approved', 'rejected']

export function AdminApplicationsPage() {
  const [loading, setLoading] = useState(true)
  const [apps, setApps] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('submitted')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setApps(await listApplications())
    } catch (err) {
      setError(err?.message || 'Unable to load applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const selected = apps.find((a) => a.id === selectedId) || null

  useEffect(() => {
    if (!selected) return
    setNotes(selected.notes || '')
    setStatus(selected.status || 'submitted')
  }, [selectedId, selected])

  if (loading) {
    return (
      <DashboardPage>
        <DashboardSkeleton className="h-8 w-40" />
        <DashboardSkeleton className="h-64" />
      </DashboardPage>
    )
  }

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Applications"
        title="Membership applications"
        description="Review submissions from the public site. Update status and internal notes."
      />
      {error ? <DashboardAlert message={error} /> : null}
      <DashboardNotice message={notice} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <DashboardPanel>
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {apps.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  className={[
                    'w-full px-2 py-3 text-left text-sm',
                    selectedId === a.id ? 'bg-zinc-100 dark:bg-zinc-800' : '',
                  ].join(' ')}
                >
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{a.full_name}</p>
                  <p className="text-xs text-zinc-500">
                    {a.email} · {a.status}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel>
          {selected ? (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                setBusy(true)
                setError('')
                try {
                  await updateApplication(selected.id, { status, notes })
                  setNotice('Application updated.')
                  await load()
                } catch (err) {
                  setError(err?.message || 'Update failed.')
                } finally {
                  setBusy(false)
                }
              }}
            >
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                <p>
                  <strong>Name:</strong> {selected.full_name}
                </p>
                <p>
                  <strong>Email:</strong> {selected.email}
                </p>
                {selected.phone ? (
                  <p>
                    <strong>Phone:</strong> {selected.phone}
                  </p>
                ) : null}
                {selected.message ? (
                  <p className="mt-2 whitespace-pre-wrap">
                    <strong>Message:</strong> {selected.message}
                  </p>
                ) : null}
              </div>
              <label className="block">
                <span className={ADMIN_FIELD_LABEL}>Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950/40"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={ADMIN_FIELD_LABEL}>Internal notes</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`mt-2 ${ADMIN_TEXTAREA_CLASS}`} />
              </label>
              <button type="submit" disabled={busy} className={`${ADMIN_BTN_PRIMARY} disabled:opacity-60`}>
                {busy ? 'Saving…' : 'Save decision'}
              </button>
            </form>
          ) : (
            <p className="text-sm text-zinc-500">Select an application to review.</p>
          )}
        </DashboardPanel>
      </div>
    </DashboardPage>
  )
}
