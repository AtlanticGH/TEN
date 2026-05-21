import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  APP_SHELL_MAIN_OFFSET,
  AppShellHeader,
  AppShellMobileMenu,
  AppShellNavLink,
  LAYOUT_CONTAINER,
} from '../../components/layout/Header'
import { useAuth } from '../../hooks/useAuth'
import { isMentorRole } from '../../lib/rbac'

export function MemberLayout() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (profile && isMentorRole(profile.role)) {
      navigate('/mentor', { replace: true })
    }
  }, [profile, navigate])

  const closeMenu = () => setMenuOpen(false)

  const nav = ({ onNavigate } = {}) => (
    <div className="grid gap-2">
      <AppShellNavLink to="/member" end onNavigate={onNavigate}>
        Overview
      </AppShellNavLink>
      <AppShellNavLink to="/member/courses" onNavigate={onNavigate}>
        Courses
      </AppShellNavLink>
      <AppShellNavLink to="/member/profile" onNavigate={onNavigate}>
        Profile
      </AppShellNavLink>
      <AppShellNavLink to="/member/change-password" onNavigate={onNavigate}>
        Password
      </AppShellNavLink>
      <AppShellNavLink to="/member/activity" onNavigate={onNavigate}>
        Activity
      </AppShellNavLink>
    </div>
  )

  return (
    <main id="page-main" data-component="page-main" className={`${LAYOUT_CONTAINER} pb-20 ${APP_SHELL_MAIN_OFFSET}`}>
      <AppShellHeader
        roleLabel="Student workspace"
        name={profile?.full_name || 'Member'}
        email={user?.email}
        profileTo="/member/profile"
        onOpenMenu={() => setMenuOpen(true)}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Navigation</p>
            <div className="mt-4">{nav()}</div>
          </div>
        </aside>

        <section className="min-w-0 w-full">
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </section>
      </div>

      <AppShellMobileMenu open={menuOpen} title="Student navigation" onClose={closeMenu}>
        {nav({ onNavigate: closeMenu })}
      </AppShellMobileMenu>
    </main>
  )
}
