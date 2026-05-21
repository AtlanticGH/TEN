import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { InnerPageHero } from '../components/shared/InnerPageHero'
import { signInWithEmail } from '../services/auth'
import { useAuth } from '../hooks/useAuth'

const LOCKOUT_SECONDS = 30
const MAX_ATTEMPTS = 4

function friendlyAuthError(message) {
  const msg = String(message || '').toLowerCase()
  if (msg.includes('invalid login credentials')) return 'Incorrect email or password.'
  if (msg.includes('email not confirmed') || (msg.includes('email') && msg.includes('confirm'))) {
    return 'Please confirm your email before logging in. Check your inbox.'
  }
  if (msg.includes('too many requests')) return 'Too many attempts. Please wait a moment and try again.'
  if (msg.includes('network') || msg.includes('failed to fetch')) {
    return 'Connection error. Please check your internet and try again.'
  }
  return message || 'Unable to login. Please try again.'
}

export function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { isAuthed, profile, user } = useAuth()

  const nextPath = useMemo(() => params.get('next') || '/member', [params])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [attemptCount, setAttemptCount] = useState(0)
  const [lockoutRemaining, setLockoutRemaining] = useState(0)

  useEffect(() => {
    if (lockoutRemaining <= 0) return undefined
    const timer = window.setInterval(() => {
      setLockoutRemaining((s) => {
        if (s <= 1) {
          setAttemptCount(0)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [lockoutRemaining])

  useEffect(() => {
    if (!isAuthed) return
    if (user?.user_metadata?.force_password_reset) {
      navigate('/member/change-password', { replace: true })
      return
    }
    const role = profile?.role
    const isStaff = ['admin', 'super_admin', 'staff'].includes(role)
    const requestedAdmin = String(nextPath || '').startsWith('/admin')
    const dest = isStaff ? (requestedAdmin ? nextPath : '/admin/dashboard') : requestedAdmin ? '/member' : nextPath
    navigate(dest, { replace: true })
  }, [isAuthed, navigate, nextPath, profile?.role, user?.user_metadata?.force_password_reset])

  const submit = async ({ email: e, password: p }) => {
    if (submitting) return
    if (lockoutRemaining > 0) return

    setError('')
    const trimmedEmail = String(e || '').trim()
    if (!trimmedEmail) {
      setError('Please enter your email.')
      return
    }
    if (!p) {
      setError('Please enter your password.')
      return
    }
    setSubmitting(true)
    try {
      const res = await signInWithEmail({ email: trimmedEmail, password: p })
      setAttemptCount(0)
      setLockoutRemaining(0)
      if (res?.user?.user_metadata?.force_password_reset) {
        navigate('/member/change-password', { replace: true })
        return
      }
      const role = res?.profile?.role || profile?.role
      const isStaff = ['admin', 'super_admin', 'staff'].includes(role)
      const requestedAdmin = String(nextPath || '').startsWith('/admin')
      const dest = isStaff ? (requestedAdmin ? nextPath : '/admin/dashboard') : requestedAdmin ? '/member' : nextPath
      navigate(dest, { replace: true })
    } catch (err) {
      const nextAttempts = attemptCount + 1
      setAttemptCount(nextAttempts)
      if (nextAttempts >= MAX_ATTEMPTS) {
        setLockoutRemaining(LOCKOUT_SECONDS)
        setError(`Too many failed attempts. Try again in ${LOCKOUT_SECONDS} seconds.`)
      } else {
        setError(friendlyAuthError(err?.message))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const submitDisabled = submitting || lockoutRemaining > 0

  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <InnerPageHero
        badge="Member Access"
        heading="Login"
        description="Access your dashboard, enrolled courses, and learning progress."
        image="https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&w=1800&q=80"
      />

      <section className="mx-auto max-w-7xl px-8 pb-16 pt-10 md:px-12 lg:px-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Member Access</p>
              <h1 className="mt-3 text-3xl font-semibold">Login</h1>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                The <span className="text-orange-500">Ember Network</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">Access your dashboard, enrolled courses, and learning progress.</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              await submit({ email, password })
            }}
          >
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Password
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 transition focus-within:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {lockoutRemaining > 0 ? (
                  <p className="mt-2 text-xs opacity-90">Try again in {lockoutRemaining}s</p>
                ) : null}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitDisabled}
              className="inline-flex w-full justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? 'Signing in…'
                : lockoutRemaining > 0
                  ? `Try again in ${lockoutRemaining}s`
                  : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={() => navigate('/forgot-password', { state: { email: email.trim() } })}
              className="text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-300"
            >
              Forgot password?
            </button>
            <Link to="/apply" className="text-orange-600 underline-offset-2 hover:underline dark:text-orange-300">
              Apply for membership
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
