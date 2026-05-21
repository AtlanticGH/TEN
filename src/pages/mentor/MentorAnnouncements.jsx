import { useEffect, useState } from 'react'
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
import { listMentorAnnouncements, sendMentorAnnouncement } from '../../services/mentorCommunication'

export function MentorAnnouncementsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ title: '', message: '' })

  const refresh = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const data = await listMentorAnnouncements()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Unable to load announcements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [])

  const update = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.value }))

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Announcements"
        title="Message your students"
        description="Sending notifies assigned students instantly (dashboard + email). Updates appear in realtime on their feed."
        actions={
          <button type="button" onClick={() => refresh()} className={`${SITE_BTN_SECONDARY} !py-2`}>
            Refresh
          </button>
        }
      />

      {error ? <DashboardAlert message={error} onRetry={refresh} /> : null}
      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          {success}
        </p>
      ) : null}

      <DashboardSplit className="lg:grid-cols-[0.9fr_1.1fr]">
        <DashboardInsetCard>
          <p className={ADMIN_FIELD_LABEL}>New announcement</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setError('')
              setSuccess('')
              if (!form.title.trim() || !form.message.trim()) {
                setError('Title and message are required.')
                return
              }
              setBusy(true)
              try {
                const result = await sendMentorAnnouncement({
                  title: form.title.trim(),
                  message: form.message.trim(),
                })
                const email = result?.email
                let msg = `Sent to ${result?.mentee_count ?? 0} student(s). They will see it live in their feed.`
                if (email?.sent) msg += ` ${email.sent} email${email.sent === 1 ? '' : 's'} delivered.`
                if (email?.skipped) msg += ` ${email.skipped} skipped (no email on file).`
                if (email?.failed) msg += ` ${email.failed} email failed.`
                setSuccess(msg)
                setForm({ title: '', message: '' })
                await refresh()
              } catch (err) {
                setError(err?.message || 'Unable to send announcement.')
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
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Message *</span>
              <textarea
                value={form.message}
                onChange={update('message')}
                className="mt-2 min-h-32 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <button type="submit" disabled={busy} className={`w-full ${SITE_BTN_PRIMARY} disabled:opacity-60`}>
              {busy ? 'Sending…' : 'Send to students'}
            </button>
          </form>
        </DashboardInsetCard>

        <div>
          <p className={ADMIN_FIELD_LABEL}>History</p>
          {loading ? (
            <DashboardSkeleton className="mt-4 h-32" />
          ) : items.length ? (
            <div className="mt-4 space-y-3">
              {items.map((a) => (
                <DashboardInsetCard key={a.id}>
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                    Sent {new Date(a.created_at).toLocaleString()}
                    {a.mentor_announcement_recipients?.[0]?.count != null
                      ? ` • ${a.mentor_announcement_recipients[0].count} recipients`
                      : ''}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">{a.message}</p>
                </DashboardInsetCard>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <DashboardEmpty>No announcements yet.</DashboardEmpty>
            </div>
          )}
        </div>
      </DashboardSplit>
    </DashboardPage>
  )
}
