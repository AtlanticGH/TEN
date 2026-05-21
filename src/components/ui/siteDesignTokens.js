/**
 * Design tokens aligned with the public marketing site (HomePage, ProgramsPage, etc.).
 * Dashboards and workspace pages should import from here — not invent parallel styles.
 */

/** Section eyebrow — matches home “About / How it works” labels */
export const SITE_EYEBROW =
  'text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500'

export const SITE_EYEBROW_RELAXED =
  'text-xs font-semibold uppercase tracking-[0.18em] text-orange-500'

/** Primary marketing card — home feature cards, program modules */
export const SITE_CARD =
  'overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-zinc-800/50'

/** Compact card / stat tile */
export const SITE_CARD_COMPACT =
  'rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow duration-200 ease-out hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900'

/** Muted inset surface — home stat blocks, program nav chips */
export const SITE_SURFACE_MUTED =
  'rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70'

/** Page background band — home about preview */
export const SITE_PAGE_BAND =
  'bg-gradient-to-b from-white to-zinc-50/80 dark:from-zinc-950 dark:to-zinc-900/60'

/** Nav pill (Programs module links, dashboard sidebar) */
export function siteNavPillClass(isActive) {
  return [
    'rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out',
    isActive
      ? 'border-orange-400 bg-orange-50 text-orange-800 shadow-sm dark:border-orange-500/50 dark:bg-orange-950/30 dark:text-orange-200'
      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:border-orange-500/40 dark:hover:bg-orange-950/20',
  ].join(' ')
}

/** Primary CTA — home hero / gateway */
export const SITE_BTN_PRIMARY =
  'inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm transition-all duration-200 ease-out hover:bg-orange-400 hover:shadow-md active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400'

/** Secondary / ghost — home secondary CTA, app shell */
export const SITE_BTN_SECONDARY =
  'inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white/80 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all duration-200 ease-out hover:border-orange-400 hover:text-orange-600 dark:border-zinc-600 dark:bg-zinc-950/40 dark:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400'

/** Body copy on light surfaces */
export const SITE_BODY =
  'text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400'

export const SITE_BODY_SM = 'text-sm leading-relaxed text-zinc-600 dark:text-zinc-300'

/** Heading inside dashboard content */
export const SITE_HEADING_PAGE = 'text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'

export const SITE_HEADING_SECTION =
  'text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'
