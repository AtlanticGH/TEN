import { useEffect, useState } from 'react'
import {
  ADMIN_TABLE_CLASS,
  ADMIN_TABLE_HEAD_CLASS,
  DashboardAlert,
  DashboardPage,
  DashboardPageIntro,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { listActivityLogs } from '../../services/activityLogs'

export function AdminLogsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listActivityLogs({ limit: 200 })
        if (!alive) return
        setRows(data)
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'Unable to load activity logs.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [])

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Audit"
        title="Activity logs"
        description="Immutable-style trail of admin actions (extend server triggers for full coverage)."
      />

      {loading ? (
        <DashboardSkeleton className="h-64" />
      ) : error ? (
        <DashboardAlert message={error} />
      ) : (
        <div className={ADMIN_TABLE_CLASS}>
          <table className="min-w-full text-left text-sm">
            <thead className={ADMIN_TABLE_HEAD_CLASS}>
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.length ? (
                rows.map((r) => (
                  <tr key={r.id} className="bg-white dark:bg-zinc-900/40">
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{r.action}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {r.entity_type} {r.entity_id ? `· ${r.entity_id}` : ''}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{r.actor_user_id ? String(r.actor_user_id).slice(0, 8) : '—'}…</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                    No log entries yet. Approve or update an application after running migrations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPage>
  )
}
