import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const storageKey = 'ten-help-open'

const links = [
  { label: 'Apply for membership', to: '/apply' },
  { label: 'Programs', to: '/programs' },
  { label: 'Contact us', to: '/contact' },
  { label: 'Member login', to: '/login' },
]

export function ChatWidget() {
  const [open, setOpen] = useState(() => localStorage.getItem(storageKey) === '1')

  useEffect(() => {
    localStorage.setItem(storageKey, open ? '1' : '0')
  }, [open])

  return (
    <div id="help-widget" className="fixed bottom-5 right-4 z-[9999]">
      <button
        type="button"
        className="relative grid h-14 w-14 place-content-center rounded-full bg-orange-500 text-white shadow-glow transition-all duration-200 ease-out hover:scale-[1.04] hover:shadow-lg active:scale-[0.98]"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open help menu"
        aria-expanded={open}
      >
        <span className="absolute inset-0 rounded-full border border-orange-300/80 animate-pulseRing" />
        ?
      </button>
      <div
        className={[
          'absolute bottom-16 right-0 w-[300px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-900',
          open ? 'opacity-100 translate-y-0 scale-100' : 'pointer-events-none opacity-0 translate-y-3 scale-[0.98]',
        ].join(' ')}
        aria-hidden={open ? 'false' : 'true'}
      >
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Need help?</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Quick links to membership, programs, and support.
          </p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
