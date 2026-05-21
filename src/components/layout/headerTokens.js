/** Shared layout tokens — keep site + app shell headers aligned. */

export const LAYOUT_GUTTER_X = 'px-6 sm:px-8 md:px-12 lg:px-10'

export const LAYOUT_CONTAINER = `mx-auto max-w-7xl ${LAYOUT_GUTTER_X}`

export const LAYOUT_CONTAINER_NARROW = `mx-auto max-w-4xl ${LAYOUT_GUTTER_X}`

/** Fixed marketing navbar clearance (matches ~64px bar + safe gap). */
export const SITE_HEADER_OFFSET = 'pt-28'

/** Full-bleed marketing heroes sit below fixed nav with extra room. */
export const SITE_HERO_OFFSET = 'pt-32 md:pt-36'

export const APP_SHELL_MAIN_OFFSET = 'pt-8'

export const SITE_HEADER_Z = 'z-50'

export const APP_SHELL_MENU_Z = 'z-[90]'

export const NAV_LINK_BASE =
  'text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ease-out'

export const APP_SHELL_BTN =
  'rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200'

export const ICON_BTN_BASE =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border backdrop-blur transition-all duration-200 ease-out'

export const GHOST_BTN_BASE =
  'inline-flex h-9 items-center justify-center rounded-full border px-4 text-[13px] font-medium backdrop-blur transition-all duration-200 ease-out'

export const SITE_NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/apply', label: 'Apply' },
  { to: '/resources', label: 'Resources' },
  { to: '/contact', label: 'Contact' },
]

export function siteHeaderStyles(mode) {
  const isHero = mode === 'hero'
  return {
    isHero,
    headerClass: isHero
      ? 'border-transparent bg-transparent'
      : 'border-zinc-200/70 bg-white/90 shadow-[0_1px_12px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85',
    brandTextClass: isHero ? 'text-white' : 'text-zinc-900 dark:text-zinc-100',
    navLinkClass: isHero
      ? `${NAV_LINK_BASE} text-white/80 hover:text-orange-300`
      : `${NAV_LINK_BASE} text-zinc-500 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400`,
    navLinkActiveClass: isHero ? 'text-orange-300' : 'text-orange-500 dark:text-orange-400',
    ghostBtnClass: isHero
      ? `${GHOST_BTN_BASE} border-white/30 bg-white/[0.08] text-white hover:border-orange-300/80 hover:bg-white/[0.13]`
      : `${GHOST_BTN_BASE} border-zinc-200 bg-white/80 text-zinc-700 hover:border-orange-400/80 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:border-orange-500/50`,
    iconBtnClass: isHero
      ? `${ICON_BTN_BASE} border-white/30 bg-white/[0.08] text-white hover:border-orange-300/80 hover:bg-white/[0.13]`
      : `${ICON_BTN_BASE} border-zinc-200 bg-white/80 text-zinc-600 hover:border-orange-400/80 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-orange-500/50`,
    mobileMenuBg: isHero
      ? 'border-white/10 bg-zinc-950/80 text-white backdrop-blur-md'
      : 'border-zinc-200/70 bg-white/95 text-zinc-900 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/92 dark:text-zinc-100',
  }
}
