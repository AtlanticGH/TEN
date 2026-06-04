/**
 * Merge CMS JSON overrides onto defaults.
 * Empty/null/undefined values keep defaults so visible copy never blanks after fetch.
 */
export function parseSiteContentValue(value) {
  if (value == null) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    try {
      return JSON.parse(trimmed)
    } catch {
      return null
    }
  }
  if (typeof value === 'object' && !Array.isArray(value)) return value
  return null
}

export function mergeSiteContentDefaults(defaults, override) {
  const parsed = parseSiteContentValue(override)
  if (!parsed) return { ...defaults }

  const merged = { ...defaults }
  for (const [key, value] of Object.entries(parsed)) {
    if (value === null || value === undefined) continue
    if (typeof value === 'string' && value.trim() === '') continue
    if (Array.isArray(value)) {
      merged[key] = value
      continue
    }
    merged[key] = value
  }
  return merged
}

export function siteContentFieldsEqual(a, b, keys) {
  return keys.every((key) => a[key] === b[key])
}
