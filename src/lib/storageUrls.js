/** Build Supabase public storage URLs (sync, for admin UI). */
export function buildPublicStorageUrl(bucket = 'public', path = '') {
  const base = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const p = String(path || '').trim()
  if (!base || !p) return ''
  const encodedPath = p
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`
}

export function resolveMediaAssetUrl(asset) {
  if (!asset) return ''
  if (asset.public_url) return asset.public_url
  return buildPublicStorageUrl(asset.bucket || 'public', asset.path)
}
