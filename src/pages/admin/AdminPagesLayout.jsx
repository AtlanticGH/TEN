import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { DashboardPageIntro } from '../../components/dashboard/DashboardChrome'
import { ADMIN_BTN_SECONDARY } from '../../components/dashboard/DashboardChrome'
import { ADMIN_PAGES_MEDIA_TAB, ADMIN_SITE_PAGES, getAdminSitePage } from '../../config/adminSitePages'

function pageTabClass(isActive) {
  return [
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800',
  ].join(' ')
}

export function AdminPagesLayout() {
  const { pageSlug } = useParams()
  const activePage = getAdminSitePage(pageSlug)
  const isMedia = pageSlug === ADMIN_PAGES_MEDIA_TAB.slug

  const title = isMedia ? ADMIN_PAGES_MEDIA_TAB.label : activePage?.label || 'Pages'
  const description = isMedia ? ADMIN_PAGES_MEDIA_TAB.description : activePage?.description
  const previewPath = activePage?.path

  return (
    <>
      <DashboardPageIntro
        label="Pages"
        title={title}
        description={description || 'Open the block builder for each marketing page.'}
        actions={
          <>
            <Link to="/admin/pages/manage" className={ADMIN_BTN_SECONDARY}>
              All pages
            </Link>
            {previewPath ? (
              <a href={previewPath} target="_blank" rel="noreferrer" className={ADMIN_BTN_SECONDARY}>
                Preview ↗
              </a>
            ) : null}
          </>
        }
      />
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        {ADMIN_SITE_PAGES.map((item) => (
          <NavLink
            key={item.slug}
            to={item.editorPath || `/admin/pages/${item.slug}/builder`}
            className={({ isActive }) => pageTabClass(isActive)}
          >
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to={ADMIN_PAGES_MEDIA_TAB.editorPath || '/admin/media'}
          className={({ isActive }) => pageTabClass(isActive)}
        >
          {ADMIN_PAGES_MEDIA_TAB.label}
        </NavLink>
      </nav>
      <Outlet />
    </>
  )
}
