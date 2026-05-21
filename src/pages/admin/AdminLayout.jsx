import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  APP_SHELL_MAIN_OFFSET,
  AppShellHeader,
  AppShellMobileMenu,
  LAYOUT_CONTAINER,
} from '../../components/layout/Header'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../services/auth'

function AdminNavLink({ to, children, onNavigate }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-xl px-4 py-3 text-sm font-semibold transition',
          isActive
            ? 'bg-orange-500 text-white shadow-glow'
            : 'border border-zinc-200 bg-white text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200',
        ].join(' ')
      }
      end={to === '/admin/dashboard'}
      onClick={() => onNavigate?.()}
    >
      {children}
    </NavLink>
  )
}

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { profile, user } = useAuth()
  const navigate = useNavigate()

  const nav = ({ onNavigate } = {}) => (
    <div className="grid gap-2">
      <AdminNavLink to="/admin/dashboard" onNavigate={onNavigate}>
        Dashboard
      </AdminNavLink>
      <AdminNavLink to="/admin/applications" onNavigate={onNavigate}>
        Applications
      </AdminNavLink>
      <AdminNavLink to="/admin/users" onNavigate={onNavigate}>
        Users
      </AdminNavLink>
      <AdminNavLink to="/admin/courses" onNavigate={onNavigate}>
        Courses
      </AdminNavLink>
      <AdminNavLink to="/admin/progress" onNavigate={onNavigate}>
        Progress
      </AdminNavLink>
      <AdminNavLink to="/admin/resources" onNavigate={onNavigate}>
        Resources
      </AdminNavLink>
      <AdminNavLink to="/admin/content" onNavigate={onNavigate}>
        Content
      </AdminNavLink>
      <AdminNavLink to="/admin/media" onNavigate={onNavigate}>
        Media
      </AdminNavLink>
      <AdminNavLink to="/admin/announcements" onNavigate={onNavigate}>
        Announcements
      </AdminNavLink>
      <AdminNavLink to="/admin/sessions" onNavigate={onNavigate}>
        Sessions
      </AdminNavLink>
      <AdminNavLink to="/admin/logs" onNavigate={onNavigate}>
        Logs
      </AdminNavLink>
      <AdminNavLink to="/admin/settings" onNavigate={onNavigate}>
        Settings
      </AdminNavLink>
    </div>
  )

  const closeMenu = () => setMenuOpen(false)

  return (
    <main id="page-main" data-component="page-main" className={`min-h-screen bg-zinc-50/80 pb-20 ${APP_SHELL_MAIN_OFFSET} dark:bg-zinc-950/80`}>
      <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className={`${LAYOUT_CONTAINER} py-3`}>
          <AppShellHeader
            variant="bar"
            roleLabel="CMS"
            name="The Ember Network"
            email={profile?.full_name || user?.email || 'Staff'}
            siteTo="/"
            onOpenMenu={() => setMenuOpen(true)}
            trailing={
              <button
                type="button"
                onClick={async () => {
                  try {
                    await signOut()
                  } finally {
                    navigate('/', { replace: true })
                  }
                }}
                className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Sign out
              </button>
            }
          />
        </div>
      </div>

      <div className={`${LAYOUT_CONTAINER} pt-8`}>
        <header className="rounded-[28px] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Platform management</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
            Applications, members, structured content, and operations — optimized for responsive SaaS workflows.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <nav className="sticky top-24 hidden h-fit gap-2 rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 lg:grid">
            {nav()}
          </nav>

          <section className="min-h-[320px] rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 md:p-8">
            <Outlet />
          </section>
        </div>
      </div>

      <AppShellMobileMenu open={menuOpen} title="Admin navigation" onClose={closeMenu}>
        {nav({ onNavigate: closeMenu })}
      </AppShellMobileMenu>
    </main>
  )
}
