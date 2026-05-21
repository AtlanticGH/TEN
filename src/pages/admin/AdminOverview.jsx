import { useEffect, useState } from 'react'
import {
  DashboardAlert,
  DashboardListItem,
  DashboardMetricTile,
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
  DashboardSkeleton,
  DashboardSplit,
} from '../../components/dashboard/DashboardChrome'
import { listActivityLogs } from '../../services/activityLogs'
import { listAdminSummary } from '../../services/admin'

function MiniBars({ values }) {
  const max = Math.max(1, ...values.map((v) => Number(v) || 0))
  return (
    <div className="flex h-24 items-end gap-1">
      {values.map((v, idx) => {
        const h = Math.max(8, Math.round(((Number(v) || 0) / max) * 100))
        return (
          <div
            key={idx}
            className="w-2 rounded-full bg-gradient-to-t from-orange-500 to-amber-300"
            style={{ height: `${h}%` }}
            title={`${v}`}
          />
        )
      })}
    </div>
  )
}

export function AdminOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const [s, l] = await Promise.all([listAdminSummary(), listActivityLogs({ limit: 8 }).catch(() => [])])
        if (!alive) return
        setSummary(s)
        setLogs(l || [])
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'Unable to load admin overview.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [])

  const trend = [2, 3, 4, 3, 6, 8, 7, 9, 10, 8, 12, 11]

  if (loading) {
    return (
      <DashboardPage>
        <DashboardSkeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardSkeleton className="h-28" />
          <DashboardSkeleton className="h-28" />
          <DashboardSkeleton className="h-28" />
        </div>
      </DashboardPage>
    )
  }

  if (error) {
    return (
      <DashboardPage>
        <DashboardAlert message={error} />
      </DashboardPage>
    )
  }

  return (
    <DashboardPage>
      <DashboardPageIntro label="Overview" title="At a glance" />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricTile label="Submitted applications" value={summary?.applications_submitted ?? 0} />
        <DashboardMetricTile label="Members" value={summary?.members ?? 0} />
        <DashboardMetricTile label="Published courses" value={summary?.courses ?? 0} />
      </div>

      <DashboardSplit>
        <DashboardPanel>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">Engagement trend</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Illustrative series — wire to `/api/admin/analytics` or a SQL view when ready.
          </p>
          <div className="mt-4">
            <MiniBars values={trend} />
          </div>
        </DashboardPanel>
        <DashboardPanel>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">Recent audit</p>
          <ul className="mt-4 space-y-3">
            {logs.length ? (
              logs.map((r) => (
                <li key={r.id}>
                  <DashboardListItem>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {r.action}
                        <span className="font-normal text-zinc-500"> · {r.entity_type}</span>
                      </p>
                      <p className="text-xs text-zinc-500">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                  </DashboardListItem>
                </li>
              ))
            ) : (
              <li className="text-sm text-zinc-500">No audit entries yet.</li>
            )}
          </ul>
        </DashboardPanel>
      </DashboardSplit>
    </DashboardPage>
  )
}
