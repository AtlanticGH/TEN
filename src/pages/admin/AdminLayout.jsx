import { useNavigate } from 'react-router-dom'
import { MainDashboardLayout, DashboardNavLink } from '../../components/layout/MainDashboardLayout'
import { useAuth } from '../../hooks/useAuth'
import { can } from '../../lib/rbac'
import { signOut } from '../../services/auth'

const GHOST_BTN =
  'inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'

export function AdminLayout() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const role = profile?.role

  const renderNav = ({ onNavigate } = {}) => (
    <div className="space-y-0.5">
      <DashboardNavLink to="/admin/overview" end onNavigate={onNavigate}>
        Dashboard
      </DashboardNavLink>
      <DashboardNavLink to="/admin/home" onNavigate={onNavigate}>
        Homepage
      </DashboardNavLink>
      <DashboardNavLink to="/admin/programs" onNavigate={onNavigate}>
        Programs
      </DashboardNavLink>
      <DashboardNavLink to="/admin/heroes" onNavigate={onNavigate}>
        Page heroes
      </DashboardNavLink>
      <DashboardNavLink to="/admin/media" onNavigate={onNavigate}>
        Media library
      </DashboardNavLink>
      <DashboardNavLink to="/admin/gallery" onNavigate={onNavigate}>
        Gallery
      </DashboardNavLink>
      <DashboardNavLink to="/admin/navigation" onNavigate={onNavigate}>
        Navigation
      </DashboardNavLink>
      <DashboardNavLink to="/admin/settings" onNavigate={onNavigate}>
        Site settings
      </DashboardNavLink>
      {can(role, 'manage_users') ? (
        <DashboardNavLink to="/admin/users" onNavigate={onNavigate}>
          Users
        </DashboardNavLink>
      ) : null}
    </div>
  )

  return (
    <MainDashboardLayout
      workspaceLabel="CMS"
      workspaceTitle="Content management"
      workspaceDescription="Manage homepage, media, gallery, navigation, and site settings."
      mobileMenuTitle="CMS menu"
      renderNav={renderNav}
      bannerActions={
        <>
          <a href="/" target="_blank" rel="noreferrer" className={`${GHOST_BTN} hidden sm:inline-flex`}>
            View site
          </a>
          <span className={`${GHOST_BTN} hidden max-w-[140px] truncate sm:inline-flex`} title={profile?.full_name || user?.email}>
            {profile?.full_name || user?.email || 'Admin'}
          </span>
          <button
            type="button"
            onClick={async () => {
              try {
                await signOut()
              } finally {
                navigate('/', { replace: true })
              }
            }}
            className={GHOST_BTN}
          >
            Sign out
          </button>
        </>
      }
    />
  )
}
