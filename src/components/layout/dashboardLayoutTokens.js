import { SITE_CARD, SITE_PAGE_BAND } from '../ui/siteDesignTokens'

/** Shared dashboard shell tokens — public site is the visual reference. */

export const DASHBOARD_GRID = 'grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]'

export const DASHBOARD_SIDEBAR_CLASS = [
  'sticky top-24 hidden h-fit gap-2 lg:grid',
  SITE_CARD,
  'p-4',
].join(' ')

export const DASHBOARD_CONTENT_PANEL_CLASS =
  'min-h-[320px] min-w-0 w-full max-w-full p-0'

export const DASHBOARD_BANNER_CLASS = [
  SITE_CARD,
  'relative overflow-hidden p-6 md:p-8',
].join(' ')

export const DASHBOARD_BANNER_GLOW =
  'pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/[0.06] via-transparent to-amber-400/[0.04]'

export const DASHBOARD_PAGE_BG = ['min-h-0 flex-1', SITE_PAGE_BAND].join(' ')
