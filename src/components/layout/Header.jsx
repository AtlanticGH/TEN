import { memo, useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { dashboardPathForRole } from '../../lib/rbac'
import { signOut } from '../../services/auth'
import {
  APP_SHELL_BTN,
  APP_SHELL_MENU_Z,
  APP_SHELL_MAIN_OFFSET,
  LAYOUT_CONTAINER,
  SITE_HEADER_Z,
  SITE_NAV_LINKS,
  siteHeaderStyles,
} from './headerTokens'

function SunIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}

function MoonIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752a9.753 9.753 0 0 0-4.497 4.497 9.72 9.72 0 0 0-2.25 12.003A9.744 9.744 0 0 0 12 21.75c2.305 0 4.408-.867 6-2.292Z" />
    </svg>
  )
}

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
      <span className="relative inline-flex h-[18px] w-[18px]" aria-hidden>
        <SunIcon
          className={[
            'absolute inset-0 h-[18px] w-[18px] transition-all duration-200',
            dark ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-90 opacity-0',
          ].join(' ')}
        />
        <MoonIcon
          className={[
            'absolute inset-0 h-[18px] w-[18px] transition-all duration-200',
            dark ? 'scale-75 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
          ].join(' ')}
        />
      </span>
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
export const SiteNavbar = memo(function SiteNavbar({ mode = 'scrolled' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthed, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dashboardTo = dashboardPathForRole(profile?.role)
  const visualMode = mobileOpen ? 'scrolled' : mode
  const styles = siteHeaderStyles(visualMode)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    closeMobile()
  }, [location.pathname, closeMobile])

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

  const handleLogout = async () => {
    try {
      await signOut()
    } finally {
      closeMobile()
      navigate('/', { replace: true })
    }
  }

  return (
    <header
      data-site-header
      className={[
        'fixed inset-x-0 top-0 border-b',
        'transition-[background-color,border-color,box-shadow,backdrop-filter,-webkit-backdrop-filter] duration-300 ease-out',
        SITE_HEADER_Z,
        styles.headerClass,
      ].join(' ')}
    >
      <nav className={`${LAYOUT_CONTAINER} flex items-center justify-between py-4`} aria-label="Primary navigation">
        <Link
          to="/"
          className={`text-[1.1rem] font-semibold tracking-tight transition-colors duration-200 ease-out ${styles.brandTextClass}`}
          onClick={closeMobile}
        >
          The <span className={styles.brandAccentClass}>Ember Network</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {SITE_NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => [styles.navLinkClass, isActive ? styles.navLinkActiveClass : ''].filter(Boolean).join(' ')}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {isAuthed ? (
              <>
                <Link to={dashboardTo} className={styles.ghostBtnClass} onClick={closeMobile}>
                  Dashboard
                </Link>
                <button type="button" className={styles.ghostBtnClass} aria-label="Sign out" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={styles.ghostBtnClass} onClick={closeMobile}>
                Login
              </Link>
            )}
          </div>

          <ThemeToggleButton className={styles.iconBtnClass} />

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className={[styles.iconBtnClass, 'md:hidden'].join(' ')}
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
          'md:hidden overflow-hidden border-t transition-[max-height,opacity] duration-200 ease-out',
          styles.mobileMenuBg,
          mobileOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <div className={`${LAYOUT_CONTAINER} flex flex-col gap-1 py-5`}>
          {SITE_NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => [
                'rounded-lg px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ease-out',
                isActive
                  ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400'
                  : styles.isHero
                    ? 'text-white/80 hover:bg-white/[0.07] hover:text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
              ].join(' ')}
              onClick={closeMobile}
            >
              {label}
            </NavLink>
          ))}

          <div className="mt-3 flex flex-col gap-2 border-t border-current/10 pt-3">
            {isAuthed ? (
              <>
                <Link to={dashboardTo} className={styles.ghostBtnClass} onClick={closeMobile}>
                  Dashboard
                </Link>
                <button type="button" className={styles.ghostBtnClass} aria-label="Sign out" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={styles.ghostBtnClass} onClick={closeMobile}>
                Login
              </Link>
            )}
          </div>
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
