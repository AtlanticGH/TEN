import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { listCmsSummary } from '../../services/admin'

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
        const [s, l] = await Promise.all([listCmsSummary(), listActivityLogs({ limit: 8 }).catch(() => [])])
        if (!alive) return
        setSummary(s)
        setLogs(l || [])
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'Unable to load overview.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [])

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
      <DashboardPageIntro label="CMS" title="Site at a glance" />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricTile label="Content blocks" value={summary?.content_blocks ?? 0} />
        <DashboardMetricTile label="Media assets" value={summary?.media_assets ?? 0} />
        <DashboardMetricTile label="Resources" value={summary?.resources ?? 0} />
      </div>

      <DashboardSplit>
        <DashboardPanel>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">Quick links</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/admin/content" className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400">
                Edit site content →
              </Link>
            </li>
            <li>
              <Link to="/admin/media" className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400">
                Manage media library →
              </Link>
            </li>
            <li>
              <Link to="/admin/resources" className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400">
                Update resources →
              </Link>
            </li>
          </ul>
        </DashboardPanel>
        <DashboardPanel>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">Recent activity</p>
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
              <li className="text-sm text-zinc-500">No activity yet.</li>
            )}
          </ul>
        </DashboardPanel>
      </DashboardSplit>
    </DashboardPage>
  )
}
