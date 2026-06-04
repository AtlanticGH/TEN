import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isAdminRole } from '../../lib/rbac'
import { signInWithEmailOrUsername, signOut } from '../../services/auth'
import { getMyProfile } from '../../services/db'
import { LAYOUT_CONTAINER, SITE_HEADER_OFFSET } from '../../components/layout/headerTokens'

function postLoginPath(search) {
  const next = new URLSearchParams(search).get('next')
  if (!next) return '/admin/overview'
  try {
    const path = decodeURIComponent(next)
    if (path.startsWith('/admin') && path !== '/admin' && path !== '/admin/') {
      return path
    }
  } catch {
    /* ignore */
  }
  return '/admin/overview'
}

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [searchParams] = useSearchParams()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => String(emailOrUsername || '').trim() && password, [emailOrUsername, password])

  const submit = async (identifier, p) => {
    setError('')
    const trimmed = String(identifier || '').trim()
    if (!trimmed) {
      setError('Please enter your email or username.')
      return
    }
    if (!p) {
      setError('Please enter your password.')
      return
    }
    const pwd = String(p ?? '')
    if (!pwd) {
      setError('Please enter your password.')
      return
    }
    setSubmitting(true)
    try {
      await signInWithEmailOrUsername({ emailOrUsername: trimmed, password: pwd })
      const profile = (await getMyProfile().catch(() => null)) ?? (await refreshProfile())
      if (!isAdminRole(profile?.role)) {
        await signOut().catch(() => {})
        setError('Staff access only. Use a CMS staff account (admin, editor, or super_admin).')
        return
      }
      navigate(postLoginPath(searchParams.toString()), { replace: true })
    } catch (err) {
      const msg = err?.message || 'Unable to login. Please try again.'
      if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('confirm')) {
        setError('Please confirm your email address before logging in. Check your inbox for the verification link.')
      } else {
        setError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main id="page-main" data-component="page-main" className={`${LAYOUT_CONTAINER} pb-16 ${SITE_HEADER_OFFSET}`}>
      <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-orange-500">CMS</p>
            <h1 className="mt-3 text-3xl font-semibold">Staff login</h1>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              The <span className="text-orange-500">Ember Network</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">Sign in to edit site content, media, and resources. Staff accounts only.</p>

        <div className="mt-6">
          <form
            className="space-y-4"
            onSubmit={async (ev) => {
              ev.preventDefault()
              await submit(emailOrUsername, password)
            }}
          >
            <div>
              <label htmlFor="admin-login-identifier" className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Email or username</label>
              <input
                id="admin-login-identifier"
                type="text"
                value={emailOrUsername}
                onChange={(ev) => setEmailOrUsername(ev.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                placeholder="you@company.com or yourname"
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="admin-login-password" className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Password</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 transition focus-within:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40">
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="w-full bg-transparent py-0.5 text-sm outline-none"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 hover:border-orange-300 hover:text-orange-600 dark:border-zinc-800 dark:text-zinc-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="inline-flex w-full justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

