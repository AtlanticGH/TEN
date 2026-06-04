import { memo, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { readHeaderPillScrolled } from '../../lib/headerMode'
import { Link, NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useMarketingNav } from '../../hooks/useMarketingNav'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import {
  APP_SHELL_BTN,
  APP_SHELL_MENU_Z,
  APP_SHELL_MAIN_OFFSET,
  LAYOUT_CONTAINER,
  SITE_HEADER_Z,
  siteHeaderStyles,
} from './headerTokens'

export function ThemeToggleButton({ className }) {
  const { dark, toggle } = useTheme()
  const btnClass =
    className ||
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-zinc-600 transition hover:border-orange-400/80 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-orange-500/50'
  return (
    <button
      type="button"
      onClick={toggle}
      className={btnClass}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {/* Flat minimal line icon — sun when dark (→ light), crescent when light (→ dark) */}
      <svg
        className="h-[17px] w-[17px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
        )}
      </svg>
    </button>
  )
}

function HamburgerIcon({ open }) {
  return (
    <span className="relative inline-flex h-4 w-[18px] flex-col justify-between" aria-hidden>
      <span
        className={['block h-px w-full origin-center rounded-full bg-current transition-all duration-200', open ? 'translate-y-[7px] rotate-45' : ''].join(' ')}
      />
      <span className={['block h-px w-full rounded-full bg-current transition-all duration-200', open ? 'opacity-0 scale-x-0' : ''].join(' ')} />
      <span
        className={['block h-px w-full origin-center rounded-full bg-current transition-all duration-200', open ? '-translate-y-[7px] -rotate-45' : ''].join(' ')}
      />
    </span>
  )
}

/** Fixed marketing site navbar (public pages). */
function NavItem({ link, navLinkClass, navLinkActiveClass, onNavigate }) {
  const classFn = ({ isActive }) => [navLinkClass, isActive ? navLinkActiveClass : ''].filter(Boolean).join(' ')
  if (link.external) {
    return (
      <a href={link.to} className={navLinkClass} target="_blank" rel="noreferrer" onClick={onNavigate}>
        {link.label}
      </a>
    )
  }
  return (
    <NavLink to={link.to} className={classFn} onClick={onNavigate}>
      {link.label}
    </NavLink>
  )
}

function MobileNavItem({ link, styles, onNavigate }) {
  const base =
    'rounded-lg px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ease-out'
  if (link.external) {
    return (
      <a
        href={link.to}
        className={[base, styles.isHero ? 'text-white/80 hover:bg-white/[0.07] hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'].join(' ')}
        target="_blank"
        rel="noreferrer"
        onClick={onNavigate}
      >
        {link.label}
      </a>
    )
  }
  return (
    <NavLink
      to={link.to}
      className={({ isActive }) =>
        [
          base,
          isActive
            ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400'
            : styles.isHero
              ? 'text-white/80 hover:bg-white/[0.07] hover:text-white'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
        ].join(' ')
      }
      onClick={onNavigate}
    >
      {link.label}
    </NavLink>
  )
}

export const SiteNavbar = memo(function SiteNavbar({ mode = 'scrolled' }) {
  const { links } = useMarketingNav()
  const { settings } = useSiteSettings()
  const siteName = settings?.site_name || 'The Ember Network'
  const logoUrl = settings?.logo_url?.trim()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(() => readHeaderPillScrolled())
  const [chromeReady, setChromeReady] = useState(false)
  const visualMode = mobileOpen ? 'scrolled' : mode
  const styles = siteHeaderStyles(visualMode)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  const usePill = scrolled && !mobileOpen

  useLayoutEffect(() => {
    setScrolled(readHeaderPillScrolled())
    setChromeReady(true)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') closeMobile()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen, closeMobile])

  // Floating pill: past ~70px the bar morphs into a centred pill.
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setScrolled(readHeaderPillScrolled()))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header
      data-site-header
      className={[
        'site-header fixed inset-x-0 mx-auto',
        chromeReady ? 'is-ready' : '',
        SITE_HEADER_Z,
        styles.headerClass,
        mobileOpen ? 'overflow-visible' : 'overflow-hidden',
        usePill
          ? 'is-pill top-3 max-w-[calc(100vw-32px)] rounded-full border sm:max-w-6xl'
          : 'top-0 max-w-[100vw] rounded-none border-b',
      ].join(' ')}
    >
      <nav
        className={[
          'flex items-center justify-between gap-3 transition-[max-width,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          usePill ? 'mx-auto max-w-6xl px-6 py-3.5 sm:px-8' : `${LAYOUT_CONTAINER} py-4`,
        ].join(' ')}
        aria-label="Primary navigation"
      >
        <Link
          to="/"
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap text-[1.1rem] font-semibold tracking-tight transition-colors duration-200 ease-out hover:opacity-90 ${styles.brandTextClass}`}
          onClick={closeMobile}
          aria-label={`${siteName} — home`}
          title="Go to homepage"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-8 w-auto max-w-[160px] object-contain" />
          ) : siteName.includes('Ember') ? (
            <>
              The <span className={styles.brandAccentClass}>Ember Network</span>
            </>
          ) : (
            siteName
          )}
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex lg:gap-5 xl:gap-6">
          {links.map((link) => (
            <NavItem
              key={`${link.to}-${link.label}`}
              link={link}
              navLinkClass={styles.navLinkClass}
              navLinkActiveClass={styles.navLinkActiveClass}
              onNavigate={closeMobile}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggleButton className={styles.iconBtnClass} />

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className={[styles.iconBtnClass, 'lg:hidden'].join(' ')}
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </div>
      </nav>

      <div
        id="site-mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        className={[
          'lg:hidden overflow-hidden border-t transition-[max-height,opacity] duration-200 ease-out',
          usePill ? 'rounded-b-3xl' : '',
          styles.mobileMenuBg,
          mobileOpen ? 'max-h-[min(32rem,80dvh)] overflow-y-auto opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <div className={[usePill ? 'mx-auto w-full px-5 sm:px-8' : LAYOUT_CONTAINER, 'flex flex-col gap-1 py-5'].join(' ')}>
          {links.map((link) => (
            <MobileNavItem key={`${link.to}-${link.label}`} link={link} styles={styles} onNavigate={closeMobile} />
          ))}
        </div>
      </div>
    </header>
  )
})

/** In-app workspace top bar (member / mentor / admin). */
export function AppShellHeader({
  roleLabel,
  name,
  email,
  profileTo,
  siteTo = '/',
  onOpenMenu,
  variant = 'page',
  trailing,
}) {
  const rowClass =
    variant === 'bar'
      ? 'flex flex-wrap items-center justify-between gap-3'
      : 'mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/90 pb-4 dark:border-zinc-800'

  return (
    <div className={rowClass}>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">{roleLabel}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</p>
        {email ? <p className="truncate text-xs text-zinc-500">{email}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ThemeToggleButton />
        {profileTo ? (
          <Link to={profileTo} className={[APP_SHELL_BTN, 'hidden sm:inline-flex'].join(' ')}>
            Profile
          </Link>
        ) : null}
        {siteTo ? (
          <Link to={siteTo} className={APP_SHELL_BTN}>
            Site
          </Link>
        ) : null}
        {trailing}
        {onOpenMenu ? (
          <button type="button" className={[APP_SHELL_BTN, 'lg:hidden'].join(' ')} onClick={onOpenMenu}>
            Menu
          </button>
        ) : null}
      </div>
    </div>
  )
}

/** Shared mobile drawer for app-shell side navigation. */
export function AppShellMobileMenu({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 ${APP_SHELL_MENU_Z} bg-black/60 px-4 py-8 lg:hidden`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="mx-auto w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-3 px-2 py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">{title}</p>
          <button type="button" onClick={onClose} className={APP_SHELL_BTN}>
            Close
          </button>
        </div>
        <div className="mt-2 px-2 pb-2">{children}</div>
      </div>
    </div>
  )
}

/** Sidebar / drawer nav link for app shells. */
export function AppShellNavLink({ to, end, children, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={!!end}
      onClick={() => onNavigate?.()}
      className={({ isActive }) =>
        [
          'rounded-2xl border px-4 py-3 text-sm font-semibold transition',
          isActive
            ? 'border-orange-400 bg-orange-50 text-orange-800 dark:border-orange-500/50 dark:bg-orange-950/30 dark:text-orange-200'
            : 'border-zinc-200 bg-white text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export { APP_SHELL_MAIN_OFFSET, LAYOUT_CONTAINER }

/** @deprecated Use SiteNavbar */
export const Navbar = SiteNavbar

/** @deprecated Use AppShellHeader */
export const AppShellTopBar = AppShellHeader
