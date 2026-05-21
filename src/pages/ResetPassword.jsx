import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { InnerPageHero } from '../components/shared/InnerPageHero'
import { supabase } from '@/lib/supabaseClient'
import { updateMyPassword } from '../services/auth'

function isRecoveryHash() {
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return false
  return new URLSearchParams(hash).get('type') === 'recovery'
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [recoveryReady, setRecoveryReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let ignore = false

    if (isRecoveryHash()) {
      setRecoveryReady(true)
    }

    const init = async () => {
      await supabase.auth.getSession()
      if (!ignore) setLoading(false)
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (ignore) return
      if (event === 'PASSWORD_RECOVERY' && session) {
        setRecoveryReady(true)
        setLoading(false)
      }
    })

    return () => {
      ignore = true
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError('')
    setSuccess('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await updateMyPassword(password)
      setSuccess('Your password has been updated. Redirecting…')
      window.setTimeout(() => navigate('/member', { replace: true }), 1200)
    } catch (err) {
      setError(err?.message || 'Unable to update password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const heroHeading = loading
    ? 'Reset password'
    : recoveryReady
      ? 'Choose new password'
      : 'Reset link invalid'

  const heroDescription = loading
    ? 'Verifying your reset link…'
    : recoveryReady
      ? 'Enter and confirm your new password below.'
      : 'This link has expired or is invalid. Request a new one.'

  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <InnerPageHero
        badge="Account"
        heading={heroHeading}
        description={heroDescription}
        image="https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&w=1800&q=80"
      />

      <section className="mx-auto max-w-7xl px-8 pb-16 pt-10 md:px-12 lg:px-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          {loading ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Verifying reset link…</p>
          ) : !recoveryReady ? (
            <>
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Account</p>
              <h1 className="mt-3 text-3xl font-semibold">Reset link invalid</h1>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                This link has expired or is invalid. Request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="mt-6 inline-flex text-sm font-semibold text-orange-600 underline-offset-2 hover:underline dark:text-orange-300"
              >
                Request a new reset link
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Account</p>
              <h1 className="mt-3 text-3xl font-semibold">Choose new password</h1>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">Enter and confirm your new password below.</p>

              <form className="mt-6 space-y-4" onSubmit={submit}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    minLength={8}
                  />
                </div>

                {success ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                    {success}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
