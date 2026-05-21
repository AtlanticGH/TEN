import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isMentorRole, isStaffRole } from '../../lib/rbac'
import { getSupabase } from '@/lib/supabaseClient'
import { AdminLayout } from './AdminLayout'
import { AdminLoginPage } from './AdminLogin'

export function AdminGate() {
  const { loading, isAuthed, profile, profileError, refreshProfile } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthed || profile || profileError) return
    refreshProfile().catch(() => {})
  }, [isAuthed, profile, profileError, refreshProfile])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-8 pb-16 pt-28 md:px-12 lg:px-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
        </div>
      </div>
    )
  }

  if (isAuthed && profile && isMentorRole(profile?.role)) {
    return <Navigate to="/mentor" replace />
  }

  if (isAuthed && profile && !isStaffRole(profile?.role)) {
    return <Navigate to="/member" replace />
  }

  if (!isAuthed) {
    return <AdminLoginPage />
  }

  if (profileError || !profile) {
    return (
      <div className="mx-auto max-w-7xl px-8 pb-16 pt-28 md:px-12 lg:px-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900/40 dark:bg-rose-950/30">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-100">Could not load your admin profile</p>
          <p className="mt-2 text-sm text-rose-700 dark:text-rose-200">
            {profileError ||
              'Your session may be outdated after a database change. Sign out, then log in again. For local dev, run npm run dev:all.'}
          </p>
          <button
            type="button"
            className="mt-4 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
            onClick={async () => {
              await getSupabase().auth.signOut()
              window.location.href = '/admin'
            }}
          >
            Sign out and retry
          </button>
        </div>
      </div>
    )
  }

  if (isStaffRole(profile?.role)) return <AdminLayout />

  const next = encodeURIComponent(location.pathname + location.search + location.hash)
  return <Navigate to={`/login?next=${next}`} replace />
}
