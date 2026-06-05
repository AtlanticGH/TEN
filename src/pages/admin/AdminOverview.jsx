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
import { apiFetch } from '@/lib/apiClient'
import { getCmsSummary } from '../../services/cms/pages'

const QUICK_LINKS = [
  ['Homepage hero', '/admin/home'],
  ['Applications', '/admin/applications'],
  ['Programs page', '/admin/programs'],
  ['About page', '/admin/about'],
  ['Page heroes', '/admin/heroes'],
  ['Media library', '/admin/media'],
  ['Gallery', '/admin/gallery'],
  ['Navigation', '/admin/navigation'],
  ['Site settings', '/admin/settings'],
]

export function AdminOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [activity, setActivity] = useState([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const [s, logs] = await Promise.all([
          getCmsSummary(),
          apiFetch('/api/admin/activity-logs/recent?limit=8').catch(() => []),
        ])
        if (!alive) return
        setSummary(s)
        setActivity(Array.isArray(logs) ? logs : [])
      } catch (err) {
        if (alive) setError(err?.message || 'Unable to load overview.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  if (loading) {
    return (
      <DashboardPage>
        <DashboardSkeleton className="h-7 w-40" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardSkeleton className="h-24" />
          <DashboardSkeleton className="h-24" />
          <DashboardSkeleton className="h-24" />
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
      <DashboardPageIntro label="Dashboard" title="Content overview" description="Published content and recent CMS activity." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardMetricTile label="Media assets" value={summary?.media_assets ?? 0} />
        <DashboardMetricTile label="Blog posts" value={summary?.blog_posts ?? 0} />
        <DashboardMetricTile label="Pending applications" value={summary?.applications_pending ?? 0} />
      </div>

      <DashboardSplit>
        <DashboardPanel>
          <p className="text-xs font-medium text-zinc-500">Quick links</p>
          <ul className="mt-3 space-y-1.5">
            {QUICK_LINKS.map(([label, to]) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm font-medium text-zinc-700 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-300"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </DashboardPanel>
        <DashboardPanel>
          <p className="text-xs font-medium text-zinc-500">Recent activity</p>
          {activity.length ? (
            <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {activity.map((log) => (
                <li key={log.id}>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{log.action}</span>
                  {log.entity_type ? ` · ${log.entity_type}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <DashboardListItem className="mt-3 border-0 bg-transparent p-0 text-sm text-zinc-500">
              Activity will appear as editors save pages and settings.
            </DashboardListItem>
          )}
        </DashboardPanel>
      </DashboardSplit>
    </DashboardPage>
  )
}
