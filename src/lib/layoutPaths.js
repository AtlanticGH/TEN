/** Routes that use the in-app shell (no marketing site navbar/footer). */
export function isAppShellPath(pathname = '') {
  const path = String(pathname || '')
  return path.startsWith('/admin') || path.startsWith('/mentor') || path.startsWith('/member')
}
