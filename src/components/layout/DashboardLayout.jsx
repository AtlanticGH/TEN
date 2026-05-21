import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { AppShellMobileMenu } from './Header'
import { APP_SHELL_BTN, LAYOUT_CONTAINER, SITE_HEADER_OFFSET } from './headerTokens'
import { siteNavPillClass, SITE_EYEBROW } from '../ui/siteDesignTokens'
import {
  DASHBOARD_BANNER_CLASS,
  DASHBOARD_BANNER_GLOW,
  DASHBOARD_CONTENT_PANEL_CLASS,
  DASHBOARD_GRID,
  DASHBOARD_PAGE_BG,
  DASHBOARD_SIDEBAR_CLASS,
} from './dashboardLayoutTokens'

export function DashboardNavLink({ to, end, children, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={!!end}
      onClick={() => onNavigate?.()}
      className={({ isActive }) => siteNavPillClass(isActive)}
    >
      {children}
    </NavLink>
  )
}

/**
 * Workspace shell: banner + 280px sidebar + content outlet.
 * Re-exported as MainDashboardLayout. Site header/footer come from MainLayout.
 */
export function DashboardLayout({
  workspaceLabel,
  workspaceTitle,
  workspaceDescription,
  renderNav,
  mobileMenuTitle = 'Navigation',
  bannerActions,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <main
      id="page-main"
      data-component="page-main"
      data-dashboard="workspace"
      className={[DASHBOARD_PAGE_BG, 'pb-16', SITE_HEADER_OFFSET].join(' ')}
    >
      <div className={`${LAYOUT_CONTAINER} py-8`}>
        <header className={DASHBOARD_BANNER_CLASS}>
          <div aria-hidden="true" className={DASHBOARD_BANNER_GLOW} />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className={SITE_EYEBROW}>{workspaceLabel}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl md:leading-tight">
                {workspaceTitle}
              </h1>
              {workspaceDescription ? (
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">{workspaceDescription}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {bannerActions}
              <button type="button" className={`${APP_SHELL_BTN} lg:hidden`} onClick={() => setMenuOpen(true)}>
                Menu
              </button>
            </div>
          </div>
        </header>

        <div className={`mt-8 ${DASHBOARD_GRID}`}>
          <nav className={DASHBOARD_SIDEBAR_CLASS}>{renderNav({ onNavigate: undefined })}</nav>
          <section className={DASHBOARD_CONTENT_PANEL_CLASS}>
            <Outlet />
          </section>
        </div>
      </div>

      <AppShellMobileMenu open={menuOpen} title={mobileMenuTitle} onClose={closeMenu}>
        {renderNav({ onNavigate: closeMenu })}
      </AppShellMobileMenu>
    </main>
  )
}
