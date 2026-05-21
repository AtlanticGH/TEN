import { Link } from 'react-router-dom'

/** Full-width column used inside member/mentor layout outlets. */
export function WorkspacePage({ children, className = '' }) {
  return <div className={['w-full max-w-none space-y-6', className].join(' ')}>{children}</div>
}

/** Standard two-column mentor/member workspace (equal width on large screens). */
export function WorkspaceSplit({ children, className = '' }) {
  return <div className={['grid w-full max-w-none gap-6 lg:grid-cols-2', className].join(' ')}>{children}</div>
}

export function WorkspaceHeader({ label, title, description, actions }) {
  return (
    <header className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="relative p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">{label}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl">{title}</h1>
            {description ? (
              <div className="mt-2 max-w-none text-sm text-zinc-600 dark:text-zinc-300">{description}</div>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
    </header>
  )
}

export function WorkspacePanel({ children, className = '' }) {
  return (
    <div
      className={[
        'rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function WorkspaceMutedPanel({ children, className = '' }) {
  return (
    <div
      className={[
        'rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function WorkspaceAlert({ message, tone = 'error', onRetry }) {
  if (!message) return null
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
      : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200'
  return (
    <div className={['rounded-[28px] border p-4 text-sm', toneClass].join(' ')}>
      {message}
      {onRetry ? (
        <button type="button" onClick={onRetry} className="ml-3 font-semibold underline">
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
        'rounded-3xl border bg-gradient-to-br p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
        toneClass,
      ].join(' ')}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
      {sublabel ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{sublabel}</p> : null}
    </div>
  )

  if (href) {
    return (
      <Link to={href} className="block">
        {inner}
      </Link>
    )
  }
  return inner
}
