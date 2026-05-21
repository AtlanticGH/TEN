import { Link } from 'react-router-dom'
import { useThemeToggle } from '../../hooks/useThemeToggle'

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

function ThemeToggleButton() {
  const { dark, toggle } = useThemeToggle()
  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-zinc-600 transition hover:border-orange-400/80 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-orange-500/50"
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

export function AppShellTopBar({ roleLabel, name, email, profileTo, onOpenMenu }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/90 pb-4 dark:border-zinc-800">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">{roleLabel}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</p>
        {email ? <p className="truncate text-xs text-zinc-500">{email}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ThemeToggleButton />
        {profileTo ? (
          <Link
            to={profileTo}
            className="hidden rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-400 sm:inline-flex dark:border-zinc-700 dark:text-zinc-200"
          >
            Profile
          </Link>
        ) : null}
        <Link
          to="/"
          className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-400 dark:border-zinc-700 dark:text-zinc-200"
        >
          Site
        </Link>
        <button
          type="button"
          className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-400 lg:hidden dark:border-zinc-700 dark:text-zinc-200"
          onClick={onOpenMenu}
        >
          Menu
        </button>
      </div>
    </div>
  )
}
