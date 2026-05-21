import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { changePasswordPathForRole } from '../../lib/rbac'

export function ProtectedRoute({ children }) {
  const { isAuthed, loading, user, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-8 pb-16 pt-32 md:px-12 lg:px-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    const next = encodeURIComponent(location.pathname + location.search + location.hash)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  const needsReset = !!user?.user_metadata?.force_password_reset
  const changePwPath = changePasswordPathForRole(profile?.role)
  const isOnChangePw =
    location.pathname.startsWith('/member/change-password') || location.pathname.startsWith('/mentor/change-password')
  if (needsReset && !isOnChangePw) {
    return <Navigate to={changePwPath} replace />
  }

  return children
}

