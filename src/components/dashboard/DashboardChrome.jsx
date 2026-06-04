import { useId } from 'react'
import { Link } from 'react-router-dom'
import {
  SITE_BODY_SM,
  SITE_BTN_PRIMARY,
  SITE_BTN_SECONDARY,
  SITE_CARD,
  SITE_CARD_COMPACT,
  SITE_EYEBROW,
  SITE_EYEBROW_RELAXED,
  SITE_HEADING_PAGE,
  SITE_HEADING_SECTION,
  SITE_SURFACE_MUTED,
} from '../ui/siteDesignTokens'

export function DashboardPage({ children, className = '' }) {
  return <div className={['w-full min-w-0 space-y-6', className].filter(Boolean).join(' ')}>{children}</div>
}

/** In-page intro for admin sub-routes */
export function DashboardPageIntro({ label, title, description, actions }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
      <div className="min-w-0">
        {label ? <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{label}</p> : null}
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h2>
        {description ? <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  )
}

export function DashboardHero({ label, title, description, avatar, badges = [], actions }) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className={[SITE_CARD, 'relative overflow-hidden'].join(' ')}>
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/15" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/[0.08] via-transparent to-amber-400/[0.04]" />
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            {avatar ? <div className="shrink-0">{avatar}</div> : null}
            <div className="min-w-0">
              <p className={SITE_EYEBROW}>{label}</p>
              <h1 id={titleId} className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl lg:text-4xl">
                {title}
              </h1>
              {description ? <p className={`mt-3 max-w-2xl ${SITE_BODY_SM}`}>{description}</p> : null}
              {badges.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {badges.map((b) => (
                    <span
                      key={b.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/80 px-3 py-1 text-xs text-zinc-600 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-300"
                    >
                      <span className="font-medium text-zinc-500">{b.label}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{b.value}</span>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
    </section>
  )
}

const STAT_TONES = {
  orange: 'from-orange-500/15 via-amber-400/8 to-white/0 border-orange-200/70 dark:border-orange-900/50',
  emerald: 'from-emerald-500/15 via-emerald-400/8 to-white/0 border-emerald-200/70 dark:border-emerald-900/50',
  amber: 'from-amber-500/15 via-yellow-400/8 to-white/0 border-amber-200/70 dark:border-amber-900/50',
  zinc: 'from-zinc-500/10 via-zinc-400/5 to-white/0 border-zinc-200/70 dark:border-zinc-800',
  violet: 'from-violet-500/15 via-purple-400/8 to-white/0 border-violet-200/70 dark:border-violet-900/50',
}

export function DashboardStatCard({ label, value, sublabel, href, tone = 'orange', icon }) {
  const toneClass = STAT_TONES[tone] || STAT_TONES.orange
  const inner = (
    <div
      className={[
        'group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm ring-1 ring-zinc-100/40 transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:shadow-md dark:ring-zinc-800/40',
        toneClass,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={SITE_EYEBROW_RELAXED}>{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
          {sublabel ? <p className={`mt-2 ${SITE_BODY_SM}`}>{sublabel}</p> : null}
        </div>
        {icon ? (
          <div className="grid h-11 w-11 shrink-0 place-content-center rounded-2xl border border-white/60 bg-white/80 text-lg shadow-sm backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-950/60">
            {icon}
          </div>
        ) : null}
      </div>
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

export function DashboardStatsRow({ children, className = '' }) {
  return <div className={['grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3', className].filter(Boolean).join(' ')}>{children}</div>
}

export function DashboardPanel({ children, className = '' }) {
  return (
    <section
      className={[
        'rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  )
}

export function DashboardSectionHeader({ label, title, description, href, hrefLabel = 'View all', bordered = true }) {
  return (
    <div
      className={[
        'flex flex-wrap items-end justify-between gap-3',
        bordered ? 'border-b border-zinc-100 pb-4 dark:border-zinc-800' : '',
      ].join(' ')}
    >
      <div>
        {label ? <p className={SITE_EYEBROW_RELAXED}>{label}</p> : null}
        <h2 className={`mt-1 ${SITE_HEADING_SECTION}`}>{title}</h2>
        {description ? <p className={`mt-1 ${SITE_BODY_SM}`}>{description}</p> : null}
      </div>
      {href ? (
        <Link
          to={href}
          className="text-sm font-semibold text-orange-600 transition-colors duration-200 hover:text-orange-500 hover:underline dark:text-orange-300"
        >
          {hrefLabel} →
        </Link>
      ) : null}
    </div>
  )
}

export function DashboardListItem({ children, className = '', active = false, as: Tag = 'div', ...props }) {
  const Comp = Tag
  return (
    <Comp
      className={[
        'flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-3 transition-colors',
        active
          ? 'border-zinc-300 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800'
          : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/50',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function DashboardEmpty({ children }) {
  return (
    <div
      className={[
        SITE_SURFACE_MUTED,
        'border-dashed px-5 py-8 text-center text-sm text-zinc-600 dark:text-zinc-400',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function DashboardProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200/90 dark:bg-zinc-800">
      <div
        className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 transition-all duration-500 ease-out"
        style={{ width: `${v}%` }}
      />
    </div>
  )
}

export function DashboardAvatar({ name, email, imageUrl, size = 'md' }) {
  const initials = (() => {
    const base = (name || email || 'U').trim()
    const parts = base.split(/\s+/).filter(Boolean)
    const a = (parts[0]?.[0] || 'U').toUpperCase()
    const b = (parts[1]?.[0] || parts[0]?.[1] || 'N').toUpperCase()
    return `${a}${b}`
  })()
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-base' : 'h-14 w-14 text-sm'
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={['rounded-full object-cover ring-2 ring-orange-300/80 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900', sizeClass].join(' ')}
        loading="lazy"
      />
    )
  }
  return (
    <div
      className={[
        'grid place-content-center rounded-full bg-gradient-to-br from-orange-500 via-amber-400 to-orange-600 font-bold text-white shadow-md',
        sizeClass,
      ].join(' ')}
    >
      {initials}
    </div>
  )
}

export function DashboardButton({ to, onClick, children, variant = 'primary', className = '' }) {
  const cls = [(variant === 'secondary' ? SITE_BTN_SECONDARY : SITE_BTN_PRIMARY), className].join(' ')
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  )
}

export function DashboardSplit({ children, className = '' }) {
  return <div className={['grid w-full gap-6 lg:grid-cols-2', className].filter(Boolean).join(' ')}>{children}</div>
}

export function DashboardSkeleton({ className = '' }) {
  return <div className={['animate-pulse rounded-md bg-zinc-200/80 dark:bg-zinc-800', className].join(' ')} />
}

export function DashboardAlert({ message, onRetry }) {
  return (
    <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className={`mt-3 ${SITE_BTN_PRIMARY} !px-4 !py-2 text-xs`}>
          Retry
        </button>
      ) : null}
    </div>
  )
}

/** Minimal stat tile for CMS overview */
export function DashboardMetricTile({ label, value, className = '', highlight = false }) {
  return (
    <div
      className={[
        'rounded-lg border bg-white p-4 dark:bg-zinc-900',
        highlight
          ? 'border-zinc-300 dark:border-zinc-600'
          : 'border-zinc-200 dark:border-zinc-800',
        className,
      ].join(' ')}
    >
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  )
}

/** Compact content card for admin tables/lists */
export function DashboardInsetCard({ children, className = '' }) {
  return (
    <div
      className={['rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900', className].join(' ')}
    >
      {children}
    </div>
  )
}

/** Admin form controls — minimal CMS style */
export const ADMIN_INPUT_CLASS =
  'h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500 dark:focus:ring-zinc-600'

export const ADMIN_TEXTAREA_CLASS =
  'w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500'

export const ADMIN_FIELD_LABEL = 'text-xs font-medium text-zinc-500'

export const ADMIN_TABLE_CLASS =
  'overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800'

export const ADMIN_TABLE_HEAD_CLASS =
  'border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80'

export function adminFilterPillClass(active) {
  return active
    ? 'rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900'
    : 'rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
}

export const ADMIN_BTN_PRIMARY =
  'inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'

export const ADMIN_BTN_SECONDARY =
  'inline-flex items-center justify-center rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'

export function DashboardNotice({ message, tone = 'success' }) {
  if (!message) return null
  const toneClass =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
  return <div className={['rounded-md border p-3 text-sm', toneClass].join(' ')}>{message}</div>
}
