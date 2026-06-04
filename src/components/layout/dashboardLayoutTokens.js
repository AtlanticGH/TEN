/** CMS dashboard — modern minimal shell tokens */

export const DASHBOARD_GRID = 'grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]'

export const DASHBOARD_SIDEBAR_CLASS = 'hidden lg:block'

export const DASHBOARD_CONTENT_PANEL_CLASS = 'min-w-0 w-full max-w-full'

export const DASHBOARD_PAGE_BG = 'min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100'

export const DASHBOARD_TOPBAR_CLASS =
  'border-b border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900'

export function dashboardNavLinkClass(isActive) {
  return [
    'block rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
    isActive
      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
  ].join(' ')
}

export const DASHBOARD_NAV_GROUP_LABEL =
  'mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 first:mt-0 dark:text-zinc-500'
