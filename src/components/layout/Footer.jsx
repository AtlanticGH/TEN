import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/apply', label: 'Apply' },
  { to: '/resources', label: 'Resources' },
  { to: '/contact', label: 'Contact' },
]

const CONNECT_LINKS = [
  { href: 'https://www.theembernetwork.com', label: 'Website', external: true },
  { href: 'mailto:info@theembernetwork.com', label: 'info@theembernetwork.com', external: false },
  { href: 'tel:+233509404673', label: '+233 50 940 4673', external: false },
]

const SOCIAL_LABELS = ['Instagram', 'LinkedIn', 'YouTube']

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="site-footer" className="mt-auto bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 md:px-12 md:py-20 lg:px-10">
        <div className="grid gap-12 border-b border-zinc-800/70 pb-12 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              The <span className="text-orange-500">Ember Network</span>
            </h2>
            <p className="mt-4 max-w-[340px] text-[14px] leading-relaxed text-zinc-400/90">
              A community of ignition and empowerment helping aspiring entrepreneurs transform small sparks into
              lasting ventures through mentorship, structure, and opportunity.
            </p>
            <Link
              to="/apply"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-glow-sm transition-all duration-200 ease-out hover:bg-orange-400 active:scale-[0.98]"
            >
              Apply for Membership
            </Link>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Gateway</p>
            <nav className="mt-5 flex flex-col gap-2.5" aria-label="Footer navigation">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-[12px] uppercase tracking-[0.16em] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Connect</p>
            <nav className="mt-5 flex flex-col gap-2.5" aria-label="Connect links">
              {CONNECT_LINKS.map(({ href, label, external }) => (
                <a
                  key={href}
                  href={href}
                  className="text-[13px] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400"
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-5 flex flex-wrap gap-2">
              {SOCIAL_LABELS.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-7 text-[12px] text-zinc-600 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            <span>© {year} The Ember Network</span>
            <span className="cursor-default transition-colors duration-200 hover:text-zinc-400">Privacy Policy</span>
            <span className="cursor-default transition-colors duration-200 hover:text-zinc-400">Cookie Settings</span>
          </div>
          <p className="italic text-zinc-500">Small Sparks Ignite Big Dreams</p>
        </div>
      </div>

      <div className="border-t border-zinc-800 bg-zinc-900/60">
        <div className="mx-auto max-w-7xl px-6 py-3 text-xs leading-relaxed text-zinc-400 sm:px-8 md:px-12 lg:px-10">
          TEN Spotlight: Members engage in weekly challenges, monthly workshops, and quarterly pitch reviews to build
          resilient ventures.
        </div>
      </div>
    </footer>
  )
}
