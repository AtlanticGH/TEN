/**
 * Role-based access helpers. Authoritative enforcement is Supabase RLS.
 * CMS app: staff roles only (student/mentor DB values may exist but have no workspace).
 */

export const ROLES = {
  STAFF: 'staff',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
}

export function isStaffRole(role) {
  return [ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role)
}

export function isSuperAdmin(role) {
  return role === ROLES.SUPER_ADMIN
}

export function resolvePostLoginPath(role, nextPath = '/admin') {
  const next = String(nextPath || '/admin')
  if (isStaffRole(role)) {
    return next.startsWith('/admin') ? next : '/admin/content'
  }
  return '/'
}

export function dashboardPathForRole(role) {
  return isStaffRole(role) ? '/admin/content' : '/'
}

/** Permission matrix (UI + client-side checks only). */
export function can(role, action) {
  const staff = isStaffRole(role)
  const superAdmin = isSuperAdmin(role)

  switch (action) {
    case 'access_admin':
    case 'view_activity_logs':
    case 'edit_cms':
    case 'view_analytics':
      return staff
    case 'manage_settings':
    case 'manage_admins':
      return superAdmin
    default:
      return false
  }
}
