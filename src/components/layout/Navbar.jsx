import { useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../services/auth'

function SunIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}

function MoonIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752a9.753 9.753 0 0 0-4.497 4.497 9.72 9.72 0 0 0-2.25 12.003A9.744 9.744 0 0 0 12 21.75c2.305 0 4.408-.867 6-2.292Z" />
    </svg>
  )
}

function ThemeToggleIcons({ dark }) {
  return (
    <span className="relative inline-flex h-[18px] w-[18px] shrink-0" aria-hidden>
      <SunIcon className={[
        'absolute inset-0 h-[18px] w-[18px] transition-all duration-200 ease-out',
        dark ? 'scale-100 rotate-0 opacity-100' : 'pointer-events-none scale-75 -rotate-90 opacity-0',
      ].join(' ')} />
      <MoonIcon className={[
        'absolute inset-0 h-[18px] w-[18px] transition-all duration-200 ease-out',
        dark ? 'pointer-events-none scale-75 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
      ].join(' ')} />
    </span>
  )
}

function HamburgerIcon({ open }) {
  return (
    <span className="relative inline-flex h-4 w-[18px] flex-col justify-between" aria-hidden>
      <span className={['block h-px w-full origin-center rounded-full bg-current transition-all duration-200',
        open ? 'translate-y-[7px] rotate-45' : ''].join(' ')} />
      <span className={['block h-px w-full rounded-full bg-current transition-all duration-200',
        open ? 'opacity-0 scale-x-0' : ''].join(' ')} />
      <span className={['block h-px w-full origin-center rounded-full bg-current transition-all duration-200',
        open ? '-translate-y-[7px] -rotate-45' : ''].join(' ')} />
    </span>
  )
}

const NAV_LINKS = [
  { to: '/about',     label: 'About' },
  { to: '/programs',  label: 'Programs' },
  { to: '/apply',     label: 'Apply' },
  { to: '/resources', label: 'Resources' },
  { to: '/contact',   label: 'Contact' },
]

export function Navbar({ dark, mode = 'scrolled', onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthed } = useAuth()
  const navigate = useNavigate()
  const isHero = mode === 'hero'

  const closeMobile = () => setMobileOpen(false)

  const headerClass = isHero
    ? 'border-transparent bg-transparent'
    : 'border-zinc-200/70 bg-white/90 shadow-[0_1px_12px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85'

  const brandTextClass = isHero
    ? 'text-white'
    : 'text-zinc-900 dark:text-zinc-100'

  const navLinkBase = 'text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ease-out'
  const navLinkClass = useMemo(() => isHero
    ? `${navLinkBase} text-white/80 hover:text-orange-300`
    : `${navLinkBase} text-zinc-500 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400`,
    [isHero])

  const ghostBtnClass = isHero
    ? 'inline-flex h-9 items-center justify-center rounded-full border border-white/30 bg-white/[0.08] px-4 text-[13px] font-medium text-white backdrop-blur transition-all duration-200 ease-out hover:border-orange-300/80 hover:bg-white/[0.13]'
    : 'inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 bg-white/80 px-4 text-[13px] font-medium text-zinc-700 backdrop-blur transition-all duration-200 ease-out hover:border-orange-400/80 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:border-orange-500/50'

  const iconBtnClass = isHero
    ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/[0.08] text-white backdrop-blur transition-all duration-200 ease-out hover:border-orange-300/80 hover:bg-white/[0.13]'
    : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-zinc-600 backdrop-blur transition-all duration-200 ease-out hover:border-orange-400/80 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-orange-500/50'

  const mobileMenuBg = isHero
    ? 'border-white/10 bg-zinc-950/80 text-white backdrop-blur-md'
    : 'border-zinc-200/70 bg-white/95 text-zinc-900 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/92 dark:text-zinc-100'

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200 ease-out',
        headerClass,
      ].join(' ')}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 md:px-12 lg:px-10"
        aria-label="Primary navigation"
      >
        {/* Brand */}
        <Link
          to="/"
          className={`text-[1.1rem] font-semibold tracking-tight transition-colors duration-200 ease-out ${brandTextClass}`}
          onClick={closeMobile}
        >
          The <span className="text-orange-500">Ember Network</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-7 md:flex" role="list">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={navLinkClass} role="listitem">
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Auth links (desktop) */}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthed ? (
              <>
                <Link to="/member" className={ghostBtnClass} onClick={closeMobile}>Dashboard</Link>
                <button
                  type="button"
                  className={ghostBtnClass}
                  onClick={async () => {
                    try { await signOut() } finally {
                      closeMobile()
                      navigate('/', { replace: true })
                    }
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={ghostBtnClass} onClick={closeMobile}>Login</Link>
            )}
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={iconBtnClass}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            <ThemeToggleIcons dark={dark} />
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className={[iconBtnClass, 'md:hidden'].join(' ')}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
        className={[
          'md:hidden overflow-hidden border-t transition-[max-height,opacity] duration-200 ease-out',
          mobileMenuBg,
          mobileOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-5 sm:px-8">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => [
                'rounded-lg px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ease-out',
                isActive
                  ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400'
                  : isHero
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
                <Link to="/member" className={ghostBtnClass} onClick={closeMobile}>Dashboard</Link>
                <button
                  type="button"
                  className={ghostBtnClass}
                  onClick={async () => {
                    try { await signOut() } finally {
                      closeMobile()
                      navigate('/', { replace: true })
                    }
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={ghostBtnClass} onClick={closeMobile}>Login</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
