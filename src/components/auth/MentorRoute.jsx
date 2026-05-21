import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isMentorRole } from '../../lib/rbac'

export function MentorRoute({ children }) {
  const { loading, isAuthed, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
      </div>
    )
  }

  if (!isAuthed) {
    const next = encodeURIComponent(location.pathname + location.search + location.hash)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (profile && !isMentorRole(profile.role)) {
    return <Navigate to="/member" replace />
  }

  if (isAuthed && !profile) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading mentor profile…</p>
      </div>
    )
  }

  return children
}
