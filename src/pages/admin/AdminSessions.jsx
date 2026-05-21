import { useEffect, useMemo, useState } from 'react'
import {
  ADMIN_FIELD_LABEL,
  DashboardAlert,
  DashboardEmpty,
  DashboardInsetCard,
  DashboardPage,
  DashboardPageIntro,
  DashboardSkeleton,
  DashboardSplit,
} from '../../components/dashboard/DashboardChrome'
import { SITE_BTN_PRIMARY, SITE_BTN_SECONDARY } from '../../components/ui/siteDesignTokens'
import { createSession, listSessions } from '../../services/adminSessions'

export function AdminSessionsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    starts_at: '',
    ends_at: '',
    meeting_url: '',
  })

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listSessions()
      setItems(data)
    } catch (err) {
      setError(err?.message || 'Unable to load sessions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [])

  const canCreate = useMemo(() => !!form.title.trim() && !!form.starts_at, [form.title, form.starts_at])
  const update = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.value }))

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Sessions"
        title="Mentorship sessions"
        description="Create upcoming sessions; attendees can be added next."
        actions={
          <button type="button" onClick={() => refresh()} className={`${SITE_BTN_SECONDARY} !py-2`}>
            Refresh
          </button>
        }
      />

      {error ? <DashboardAlert message={error} onRetry={refresh} /> : null}

      <DashboardSplit className="lg:grid-cols-[0.9fr_1.1fr]">
        <DashboardInsetCard>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Create session</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setError('')
              if (!canCreate) return
              setBusy(true)
              try {
                await createSession({
                  title: form.title.trim(),
                  description: form.description.trim(),
                  starts_at: new Date(form.starts_at).toISOString(),
                  ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
                  meeting_url: form.meeting_url.trim() || null,
                })
                setForm({ title: '', description: '', starts_at: '', ends_at: '', meeting_url: '' })
                await refresh()
              } catch (err) {
                setError(err?.message || 'Unable to create session.')
              } finally {
                setBusy(false)
              }
            }}
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Title *</span>
              <input
                value={form.title}
                onChange={update('title')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Starts at *</span>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={update('starts_at')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Ends at</span>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={update('ends_at')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Meeting URL</span>
              <input
                value={form.meeting_url}
                onChange={update('meeting_url')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Description</span>
              <textarea
                value={form.description}
                onChange={update('description')}
                className="mt-2 min-h-24 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <button type="submit" disabled={!canCreate || busy} className={`w-full ${SITE_BTN_PRIMARY} disabled:opacity-60`}>
              {busy ? 'Creating…' : 'Create'}
            </button>
          </form>
        </DashboardInsetCard>

        <div>
          <p className={ADMIN_FIELD_LABEL}>Upcoming</p>
          {loading ? (
            <DashboardSkeleton className="mt-4 h-32" />
          ) : items.length ? (
            <div className="mt-4 space-y-3">
              {items.map((s) => (
                <DashboardInsetCard key={s.id}>
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{new Date(s.starts_at).toLocaleString()}</p>
                  {s.meeting_url ? (
                    <a className="mt-2 inline-flex text-sm font-semibold text-orange-600 hover:underline dark:text-orange-300" href={s.meeting_url}>
                      Open meeting
                    </a>
                  ) : null}
                  {s.description ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{s.description}</p> : null}
                </DashboardInsetCard>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <DashboardEmpty>No sessions yet.</DashboardEmpty>
            </div>
          )}
        </div>
      </DashboardSplit>
    </DashboardPage>
  )
}

