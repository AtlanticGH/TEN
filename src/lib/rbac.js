/**
 * CMS RBAC — super_admin, admin, editor, viewer (+ legacy staff).
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  STAFF: 'staff',
}

const DASHBOARD_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER, ROLES.STAFF]
const CONTENT_EDIT_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR, ROLES.STAFF]
const ADMIN_MANAGE_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN]

/** Can open CMS dashboard. */
export function isAdminRole(role) {
  return DASHBOARD_ROLES.includes(role)
}

export function isStaffRole(role) {
  return CONTENT_EDIT_ROLES.includes(role)
}

export function isSuperAdmin(role) {
  return role === ROLES.SUPER_ADMIN
}

export function isViewerOnly(role) {
  return role === ROLES.VIEWER
}

export function canEditContent(role) {
  return CONTENT_EDIT_ROLES.includes(role) && role !== ROLES.VIEWER
}

export function canManageUsers(role) {
  return ADMIN_MANAGE_ROLES.includes(role)
}

export function canManageSettings(role) {
  return ADMIN_MANAGE_ROLES.includes(role) || role === ROLES.SUPER_ADMIN
}

export function resolvePostLoginPath(role, nextPath = '/admin') {
  const next = String(nextPath || '/admin')
  if (isAdminRole(role)) {
    return next.startsWith('/admin') ? next : '/admin/overview'
  }
  return '/'
}

export function dashboardPathForRole(role) {
  return isAdminRole(role) ? '/admin/overview' : '/'
}

export function can(role, action) {
  switch (action) {
    case 'access_admin':
    case 'view_analytics':
      return isAdminRole(role)
    case 'edit_cms':
      return canEditContent(role)
    case 'manage_settings':
      return canManageSettings(role)
    case 'manage_admins':
    case 'manage_users':
      return canManageUsers(role)
    default:
      return false
  }
}
