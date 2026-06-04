import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { AppShellMobileMenu } from './Header'
import { APP_SHELL_BTN, LAYOUT_CONTAINER } from './headerTokens'
import {
  DASHBOARD_CONTENT_PANEL_CLASS,
  DASHBOARD_GRID,
  DASHBOARD_PAGE_BG,
  DASHBOARD_SIDEBAR_CLASS,
  DASHBOARD_TOPBAR_CLASS,
  dashboardNavLinkClass,
} from './dashboardLayoutTokens'

export function DashboardNavLink({ to, end, children, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={!!end}
      onClick={() => onNavigate?.()}
      className={({ isActive }) => dashboardNavLinkClass(isActive)}
    >
      {children}
    </NavLink>
  )
}

/**
 * CMS workspace shell — compact top bar, minimal sidebar, content outlet.
 */
export function DashboardLayout({
  workspaceLabel = 'CMS',
  workspaceTitle,
  workspaceDescription,
  renderNav,
  mobileMenuTitle = 'Menu',
  bannerActions,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <main id="page-main" data-component="page-main" data-dashboard="workspace" className={DASHBOARD_PAGE_BG}>
      <header className={DASHBOARD_TOPBAR_CLASS}>
        <div className={`${LAYOUT_CONTAINER} flex h-14 items-center justify-between gap-4`}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-xs font-medium tracking-wide text-zinc-400">{workspaceLabel}</span>
            <span className="text-zinc-300 dark:text-zinc-600" aria-hidden="true">
              /
            </span>
            <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{workspaceTitle}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {bannerActions}
            <button type="button" className={`${APP_SHELL_BTN} lg:hidden`} onClick={() => setMenuOpen(true)}>
              Menu
            </button>
          </div>
        </div>
      </header>

      <div className={`${LAYOUT_CONTAINER} py-8 md:py-10`}>
        <div className={DASHBOARD_GRID}>
          <aside className={DASHBOARD_SIDEBAR_CLASS}>
            {workspaceDescription ? (
              <p className="mb-4 px-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{workspaceDescription}</p>
            ) : null}
            <nav className="space-y-0.5">{renderNav({ onNavigate: undefined })}</nav>
          </aside>
          <section className={DASHBOARD_CONTENT_PANEL_CLASS}>
            <Outlet />
          </section>
        </div>
      </div>

      <AppShellMobileMenu open={menuOpen} title={mobileMenuTitle} onClose={closeMenu}>
        <nav className="space-y-0.5">{renderNav({ onNavigate: closeMenu })}</nav>
      </AppShellMobileMenu>
    </main>
  )
}
