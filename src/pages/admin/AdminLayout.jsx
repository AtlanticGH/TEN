import { useNavigate } from 'react-router-dom'
import { MainDashboardLayout, DashboardNavLink } from '../../components/layout/MainDashboardLayout'
import { SITE_BTN_SECONDARY } from '../../components/ui/siteDesignTokens'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../services/auth'

export function AdminLayout() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()

  const renderNav = ({ onNavigate } = {}) => (
    <div className="grid gap-2">
      <DashboardNavLink to="/admin/overview" end onNavigate={onNavigate}>
        Overview
      </DashboardNavLink>
      <DashboardNavLink to="/admin/applications" onNavigate={onNavigate}>
        Applications
      </DashboardNavLink>
      <DashboardNavLink to="/admin/members" onNavigate={onNavigate}>
        Members
      </DashboardNavLink>
      <DashboardNavLink to="/admin/courses" onNavigate={onNavigate}>
        Courses
      </DashboardNavLink>
      <DashboardNavLink to="/admin/progress" onNavigate={onNavigate}>
        Progress
      </DashboardNavLink>
      <DashboardNavLink to="/admin/resources" onNavigate={onNavigate}>
        Resources
      </DashboardNavLink>
      <DashboardNavLink to="/admin/content" onNavigate={onNavigate}>
        Content
      </DashboardNavLink>
      <DashboardNavLink to="/admin/media" onNavigate={onNavigate}>
        Media
      </DashboardNavLink>
      <DashboardNavLink to="/admin/announcements" onNavigate={onNavigate}>
        Announcements
      </DashboardNavLink>
      <DashboardNavLink to="/admin/sessions" onNavigate={onNavigate}>
        Sessions
      </DashboardNavLink>
      <DashboardNavLink to="/admin/logs" onNavigate={onNavigate}>
        Logs
      </DashboardNavLink>
      <DashboardNavLink to="/admin/settings" onNavigate={onNavigate}>
        Settings
      </DashboardNavLink>
    </div>
  )

  return (
    <MainDashboardLayout
      workspaceLabel="Admin"
      workspaceTitle="Platform management"
      workspaceDescription="Applications, members, structured content, and operations — optimized for responsive SaaS workflows."
      mobileMenuTitle="Admin navigation"
      renderNav={renderNav}
      bannerActions={
        <>
          <span className="hidden rounded-full border border-zinc-200/80 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 sm:inline dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
            {profile?.full_name || user?.email || 'Staff'}
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
            className={`${SITE_BTN_SECONDARY} !px-4 !py-2 text-xs`}
          >
            Sign out
          </button>
        </>
      }
    />
  )
}
