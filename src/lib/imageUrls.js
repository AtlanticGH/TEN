/** Image URL helpers — CMS should only use Supabase storage uploads. */

const EXTERNAL_IMAGE_HOSTS =
  /unsplash|picsum|cloudinary|imgur|googleusercontent|drive\.google|images\.unsplash/i

export function supabaseProjectHost() {
  const raw = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
  if (!raw) return ''
  try {
    return new URL(raw).host
  } catch {
    return ''
  }
}

/** True when the URL points at this project's Supabase public storage. */
export function isUploadedImageUrl(url) {
  const t = String(url || '').trim()
  if (!t) return true
  const host = supabaseProjectHost()
  if (!host) return false
  try {
    const parsed = new URL(t)
    return parsed.host === host && parsed.pathname.includes('/storage/v1/object/public/')
  } catch {
    return false
  }
}

/** External stock/CDN image URLs (not our Supabase storage or same-origin paths). */
export function isExternalImageUrl(url) {
  const t = String(url || '').trim()
  if (!t) return false
  if (t.startsWith('/') && !t.startsWith('//')) return false
  if (isUploadedImageUrl(t)) return false
  if (EXTERNAL_IMAGE_HOSTS.test(t)) return true
  if (/^https?:\/\//i.test(t) && /\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/i.test(t)) return true
  return false
}

export function sanitizeImageUrl(url) {
  const t = String(url || '').trim()
  if (!t) return ''
  if (isExternalImageUrl(t)) return ''
  if (t.startsWith('/') && !t.startsWith('//')) return ''
  if (isUploadedImageUrl(t)) return t
  return ''
}
