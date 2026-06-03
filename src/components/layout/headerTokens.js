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

/** Selector for full-bleed hero sections (home + inner marketing pages). */
export const HERO_GATEWAY_SELECTOR = '#home-gateway, [data-section="hero-gateway"]'

/** Attribute on the fixed site header for scroll measurements. */
export const SITE_HEADER_ATTR = 'data-site-header'

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
  { to: '/resources', label: 'Resources' },
  { to: '/contact', label: 'Contact' },
  { to: '/community', label: 'Community' },
]

export function siteHeaderStyles(mode) {
  const isHero = mode === 'hero'
  return {
    isHero,
    headerClass: isHero
      ? 'border-transparent bg-transparent shadow-none backdrop-blur-none supports-[backdrop-filter]:backdrop-blur-0'
      : [
          'border-zinc-200/70 bg-white/90 shadow-[0_1px_12px_rgba(0,0,0,0.06)]',
          'backdrop-blur-xl backdrop-saturate-150',
          'dark:border-white/[0.08] dark:bg-zinc-950/75 dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]',
        ].join(' '),
    brandTextClass: isHero
      ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]'
      : 'text-zinc-900 dark:text-zinc-100',
    brandAccentClass: isHero ? 'text-orange-400' : 'text-orange-500',
    navLinkClass: isHero
      ? `${NAV_LINK_BASE} text-white/95 hover:text-orange-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]`
      : `${NAV_LINK_BASE} text-zinc-600 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400`,
    navLinkActiveClass: isHero ? 'text-orange-300' : 'text-orange-500 dark:text-orange-400',
    ghostBtnClass: isHero
      ? `${GHOST_BTN_BASE} border-white/40 bg-white/10 text-white shadow-sm backdrop-blur-sm hover:border-orange-300/80 hover:bg-white/15`
      : `${GHOST_BTN_BASE} border-zinc-200 bg-white/80 text-zinc-700 hover:border-orange-400/80 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:border-orange-500/50`,
    iconBtnClass: isHero
      ? `${ICON_BTN_BASE} border-white/40 bg-white/10 text-white shadow-sm backdrop-blur-sm hover:border-orange-300/80 hover:bg-white/15`
      : `${ICON_BTN_BASE} border-zinc-200 bg-white/80 text-zinc-600 hover:border-orange-400/80 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-orange-500/50`,
    mobileMenuBg: isHero
      ? 'border-white/10 bg-zinc-950/95 text-white backdrop-blur-xl'
      : 'border-zinc-200/70 bg-white/98 text-zinc-900 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/95 dark:text-zinc-100',
  }
}
