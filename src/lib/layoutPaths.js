/** Dashboard route prefixes (admin CMS only). */
export function isDashboardPath(path) {
  return path.startsWith('/admin')
}
