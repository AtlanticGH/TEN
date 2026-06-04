/** Slugs that must not resolve to dynamic CMS pages (static routes take precedence). */
export const RESERVED_PUBLIC_SLUGS = new Set([
  'admin',
  'api',
  'assets',
  'gallery',
  'about',
  'programs',
  'resources',
  'contact',
  'community',
  'login',
  'auth',
  'apply',
  'join',
  'member',
  'mentor',
  'dashboard',
  'forgot-password',
  'reset-password',
  'program-components',
])

export function isReservedPublicSlug(slug: string) {
  return RESERVED_PUBLIC_SLUGS.has(String(slug || '').toLowerCase())
}
