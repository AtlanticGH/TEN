/** Dashboard route prefixes (member, mentor, admin workspaces). */
export function isDashboardPath(pathname = '') {
  const path = String(pathname || '')
  return path.startsWith('/admin') || path.startsWith('/mentor') || path.startsWith('/member')
}

/**
 * Legacy: dashboards now use the global site header/footer like other pages.
 * @deprecated Always false — kept for call-site compatibility during migration.
 */
export function isAppShellPath() {
  return false
}
