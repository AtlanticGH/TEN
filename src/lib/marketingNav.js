/** Normalize CMS navigation items for the public marketing header. */

const HREF_ALIASES = {
  '/blog': '/gallery',
}

const LABEL_OVERRIDES = {
  '/gallery': 'Gallery',
}

/** Home is the logo/brand link — omit duplicate "Home" nav items. */
function isHomeNavItem(href, label, external) {
  if (external) return false
  const h = String(href || '').trim()
  if (h === '/' || h === '') return true
  return String(label || '').trim().toLowerCase() === 'home'
}

/**
 * @param {Array<{ label?: string, href?: string, external?: boolean, sort_order?: number }>} items
 */
export function normalizeMarketingNavItems(items = []) {
  const seen = new Set()
  const out = []

  for (const raw of items) {
    const external = !!raw.external
    let href = String(raw.href || '/').trim() || '/'
    if (!external) {
      href = HREF_ALIASES[href] || href
      if (!href.startsWith('/')) href = `/${href}`
    }
    if (isHomeNavItem(href, raw.label, external)) continue
    const key = external ? `ext:${href}` : href
    if (seen.has(key)) continue
    seen.add(key)

    const label =
      !external && LABEL_OVERRIDES[href]
        ? LABEL_OVERRIDES[href]
        : href === '/gallery' && String(raw.label || '').toLowerCase() === 'blog'
          ? 'Gallery'
          : raw.label || 'Link'

    out.push({
      to: href,
      label,
      external,
      sort_order: Number.isFinite(raw.sort_order) ? raw.sort_order : out.length,
    })
  }

  return out.sort((a, b) => a.sort_order - b.sort_order)
}
