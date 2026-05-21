import { useId } from 'react'
import { Link } from 'react-router-dom'
import {
  SITE_BODY_SM,
  SITE_BTN_PRIMARY,
  SITE_CARD,
  SITE_EYEBROW_RELAXED,
  SITE_HEADING_PAGE,
  SITE_SURFACE_MUTED,
} from '../ui/siteDesignTokens'

/** Shared layout chrome for member + mentor sub-pages (uses main-site tokens). */
export function WorkspacePage({ children, className = '' }) {
  return <div className={['w-full min-w-0 space-y-6', className].filter(Boolean).join(' ')}>{children}</div>
}

export function WorkspaceSplit({ children, className = '' }) {
  return (
    <div className={['grid w-full min-w-0 gap-6 lg:grid-cols-2', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function WorkspaceRow({ children, className = '' }) {
  return <div className={['grid w-full min-w-0 gap-4', className].filter(Boolean).join(' ')}>{children}</div>
}

export function WorkspaceHeader({ label, title, description, actions }) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className={[SITE_CARD, 'relative overflow-hidden'].join(' ')}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/[0.06] via-transparent to-amber-400/[0.04]" />
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className={SITE_EYEBROW_RELAXED}>{label}</p>
            <h1 id={titleId} className={`mt-2 ${SITE_HEADING_PAGE}`}>
              {title}
            </h1>
            {description ? <p className={`mt-2 ${SITE_BODY_SM}`}>{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
    </section>
  )
}

export function WorkspacePanel({ children, className = '' }) {
  return <div className={[SITE_CARD, 'p-6 md:p-7', className].join(' ')}>{children}</div>
}

export function WorkspaceMutedPanel({ children, className = '' }) {
  return <div className={[SITE_SURFACE_MUTED, 'p-6 md:p-7', className].join(' ')}>{children}</div>
}

export function WorkspaceAlert({ message, tone = 'error', onRetry }) {
  if (!message) return null
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
      : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200'
  return (
    <div className={['rounded-2xl border p-4 text-sm', toneClass].join(' ')}>
      {message}
      {onRetry ? (
        <button type="button" onClick={onRetry} className={`ml-3 ${SITE_BTN_PRIMARY} !inline !px-4 !py-2 text-xs`}>
          Retry
        </button>
      ) : null}
    </div>
  )
}

export function WorkspaceStatCard({ label, value, sublabel, href, tone = 'orange' }) {
  const toneClass =
    tone === 'emerald'
      ? 'from-emerald-500/10 via-emerald-400/5 to-transparent border-emerald-200/60 dark:border-emerald-900/40'
      : 'from-orange-500/10 via-amber-400/5 to-transparent border-orange-200/60 dark:border-orange-900/40'

  const inner = (
    <div
      className={[
        'rounded-2xl border bg-gradient-to-br p-5 shadow-sm ring-1 ring-zinc-100/40 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md dark:ring-zinc-800/40',
        toneClass,
      ].join(' ')}
    >
      <p className={SITE_EYEBROW_RELAXED}>{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
      {sublabel ? <p className={`mt-2 ${SITE_BODY_SM}`}>{sublabel}</p> : null}
    </div>
  )

  if (href) {
    return (
      <Link to={href} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
        {inner}
      </Link>
    )
  }
  return inner
}
