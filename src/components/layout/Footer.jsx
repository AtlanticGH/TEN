import { Link } from 'react-router-dom'

const NAVIGATE_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/resources', label: 'Resources' },
  { to: '/contact', label: 'Contact' },
  { to: '/community', label: 'Community' },
]

const PROGRAM_LINKS = [
  'Ignition Labs',
  'Spark Challenge',
  'Fireside Dialogues',
  'Founder Mastermind',
  'Impact Ventures',
]

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com',
    path: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com',
    path: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com',
    path: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com',
    path: (
      <>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </>
    ),
  },
]

export function Footer() {
  return (
    <footer id="site-footer" className="mt-auto bg-[#0A0A0A] text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 md:py-20 lg:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              The <span className="text-orange-500">Ember</span> Network
            </h2>
            <p className="mt-4 max-w-[320px] text-[14px] leading-relaxed text-zinc-400">
              A community of ignition and empowerment.
            </p>
            <Link
              to="/community"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-[13px] font-bold text-white shadow-glow-sm transition-all duration-200 ease-out hover:bg-orange-400 active:scale-[0.98]"
            >
              Join The Network
            </Link>
          </div>

          {/* Col 2 — Navigate */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Navigate</p>
            <nav className="mt-5 flex flex-col gap-2.5" aria-label="Footer navigation">
              {NAVIGATE_LINKS.map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  className="text-[13px] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3 — Programs */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Programs</p>
            <nav className="mt-5 flex flex-col gap-2.5" aria-label="Programs">
              {PROGRAM_LINKS.map((label) => (
                <Link
                  key={label}
                  to="/programs"
                  className="text-[13px] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 4 — Connect */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Connect</p>
            <nav className="mt-5 flex flex-col gap-2.5" aria-label="Connect links">
              <a
                href="mailto:info@theembernetwork.com"
                className="text-[13px] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400"
              >
                info@theembernetwork.com
              </a>
              <a
                href="tel:+233509404673"
                className="text-[13px] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400"
              >
                +233 50 940 4673
              </a>
              <a
                href="https://www.theembernetwork.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400"
              >
                www.theembernetwork.com
              </a>
            </nav>
            <div className="mt-5 flex gap-4">
              {SOCIALS.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-white/60 transition-colors duration-200 ease-out hover:text-white"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {path}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-zinc-800 pt-6 text-[12px] text-zinc-500 md:flex-row md:items-center md:justify-between">
          <span>&copy; {new Date().getFullYear()} The Ember Network. All rights reserved.</span>
          <span className="italic text-zinc-500">Small Sparks Ignite Big Dreams</span>
        </div>
      </div>
    </footer>
  )
}
