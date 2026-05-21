import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainDashboardLayout, DashboardNavLink } from '../../components/layout/MainDashboardLayout'
import { AnnouncementNavBadge } from '../../components/dashboard/AnnouncementNavBadge'
import { useAuth } from '../../hooks/useAuth'
import { isMentorRole } from '../../lib/rbac'

export function MemberLayout() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile && isMentorRole(profile.role)) {
      navigate('/mentor', { replace: true })
    }
  }, [profile, navigate])

  const renderNav = ({ onNavigate } = {}) => (
    <div className="grid gap-2">
      <DashboardNavLink to="/member" end onNavigate={onNavigate}>
        Overview
      </DashboardNavLink>
      <DashboardNavLink to="/member/courses" onNavigate={onNavigate}>
        Courses
      </DashboardNavLink>
      <DashboardNavLink to="/member/profile" onNavigate={onNavigate}>
        Profile
      </DashboardNavLink>
      <DashboardNavLink to="/member/change-password" onNavigate={onNavigate}>
        Password
      </DashboardNavLink>
      <DashboardNavLink to="/member/announcements" onNavigate={onNavigate}>
        <span className="flex w-full items-center gap-2">
          <span>Announcements</span>
          <AnnouncementNavBadge />
        </span>
      </DashboardNavLink>
      <DashboardNavLink to="/member/mentor" onNavigate={onNavigate}>
        My mentor
      </DashboardNavLink>
      <DashboardNavLink to="/member/activity" onNavigate={onNavigate}>
        Activity
      </DashboardNavLink>
    </div>
  )

  return (
    <MainDashboardLayout
      workspaceLabel="Student"
      workspaceTitle="Your learning dashboard"
      workspaceDescription="Track enrolled programs, mentorship sessions, and your latest activity in one place."
      mobileMenuTitle="Student navigation"
      renderNav={renderNav}
    />
  )
}
