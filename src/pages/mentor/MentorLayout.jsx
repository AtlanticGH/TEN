import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout, DashboardNavLink } from '../../components/layout/DashboardLayout'
import { useAuth } from '../../hooks/useAuth'
import { isMentorRole } from '../../lib/rbac'

export function MentorLayout() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile && !isMentorRole(profile.role)) {
      navigate('/member', { replace: true })
    }
  }, [profile, navigate])

  const renderNav = ({ onNavigate } = {}) => (
    <div className="grid gap-2">
      <DashboardNavLink to="/mentor" end onNavigate={onNavigate}>
        Overview
      </DashboardNavLink>
      <DashboardNavLink to="/mentor/students" onNavigate={onNavigate}>
        Students
      </DashboardNavLink>
      <DashboardNavLink to="/mentor/courses" onNavigate={onNavigate}>
        Courses
      </DashboardNavLink>
      <DashboardNavLink to="/mentor/assignments" onNavigate={onNavigate}>
        Assignments
      </DashboardNavLink>
      <DashboardNavLink to="/mentor/profile" onNavigate={onNavigate}>
        Profile
      </DashboardNavLink>
      <DashboardNavLink to="/mentor/change-password" onNavigate={onNavigate}>
        Password
      </DashboardNavLink>
    </div>
  )

  return (
    <DashboardLayout
      workspaceLabel="Mentor"
      workspaceTitle="Mentor workspace"
      workspaceDescription="Manage courses, monitor mentees, and review assignment submissions."
      mobileMenuTitle="Mentor navigation"
      renderNav={renderNav}
    />
  )
}
