import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isAdminRole } from '../../lib/rbac'
import { signOut } from '../../services/auth'
import { APP_SHELL_MAIN_OFFSET, LAYOUT_CONTAINER } from '../layout/headerTokens'

function isExactAdminPath(pathname) {
  return pathname === '/admin' || pathname === '/admin/'
}

function safeAdminNext(search) {
  const next = new URLSearchParams(search).get('next')
  if (!next) return null
  try {
    const path = decodeURIComponent(next)
    if (path.startsWith('/admin') && path !== '/admin' && path !== '/admin/') {
      return path
    }
  } catch {
    return null
  }
  return null
}

function AdminGateLoading() {
  return (
    <div className={`${LAYOUT_CONTAINER} pb-16 ${APP_SHELL_MAIN_OFFSET}`}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
      </div>
    </div>
  )
}

function AdminProfileError({ message }) {
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      window.location.href = '/admin'
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <div className={`${LAYOUT_CONTAINER} pb-16 ${APP_SHELL_MAIN_OFFSET}`}>
      <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
        <p className="font-medium">Could not load your staff profile.</p>
        {message ? (
          <p className="text-xs text-rose-700/90 dark:text-rose-300/90">{message}</p>
        ) : null}
        <ul className="list-inside list-disc space-y-1 text-rose-700/90 dark:text-rose-300/90">
          <li>Run <code className="rounded bg-rose-100/80 px-1 dark:bg-rose-900/50">npm run dev:all</code> so the API on port 3000 is up.</li>
          <li>Sign out and sign in again (clears a stale session from another environment).</li>
        </ul>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}

export function AdminRoot() {
  const { loading, profileLoading, isAuthed, profile, profileError } = useAuth()
  const location = useLocation()
  const exact = isExactAdminPath(location.pathname)
  const authPending = loading || (isAuthed && profileLoading)

  if (authPending) {
    return <AdminGateLoading />
  }

  if (!isAuthed) {
    if (exact) return <Outlet />
    const next = encodeURIComponent(location.pathname + location.search + location.hash)
    return <Navigate to={`/admin?next=${next}`} replace />
  }

  if (!profile) {
    return <AdminProfileError message={profileError} />
  }

  if (!isAdminRole(profile.role)) {
    return <Navigate to="/" replace />
  }

  if (exact) {
    const dest = safeAdminNext(location.search) || '/admin/overview'
    return <Navigate to={dest} replace />
  }

  return <Outlet />
}

/** Legacy `/admin/login` URLs → `/admin` (keeps `?next=`). */
export function AdminLoginRedirect() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: '/admin', search }} replace />
}
