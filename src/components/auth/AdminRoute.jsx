import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isAdminRole } from '../../lib/rbac'
import { APP_SHELL_MAIN_OFFSET, LAYOUT_CONTAINER } from '../layout/headerTokens'

export function AdminRoute({ children }) {
  const { loading, profileLoading, isAuthed, profile } = useAuth()
  const location = useLocation()

  if (loading || (isAuthed && profileLoading)) {
    return (
      <div className={`${LAYOUT_CONTAINER} pb-16 ${APP_SHELL_MAIN_OFFSET}`}>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    const next = encodeURIComponent(location.pathname + location.search + location.hash)
    return <Navigate to={`/admin?next=${next}`} replace />
  }

  if (!profile || !isAdminRole(profile.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

