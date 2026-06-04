/** Shared media library folder + asset type helpers. */

export const MEDIA_LIBRARY_FOLDERS = [
  { id: 'cms', label: 'CMS', description: 'Heroes, programs, about, and page images' },
  { id: 'gallery', label: 'Gallery', description: 'Public gallery photos and videos' },
  { id: 'resources', label: 'Resources', description: 'Downloadable files on /resources' },
  { id: 'uploads', label: 'Uploads', description: 'General uploads' },
  { id: 'general', label: 'General', description: 'Uncategorized assets' },
]

export const MEDIA_TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Videos' },
  { id: 'pdf', label: 'PDFs' },
]

export function resolveAssetFolder(asset) {
  if (asset?.folder) return asset.folder
  const path = String(asset?.path || '')
  const seg = path.split('/')[0]
  if (MEDIA_LIBRARY_FOLDERS.some((f) => f.id === seg)) return seg
  return 'general'
}

export function mediaAssetKind(asset) {
  const mime = String(asset?.mime_type || '')
  const path = String(asset?.path || '')
  if (mime.startsWith('video/') || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(path)) return 'video'
  if (mime.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(path)) return 'image'
  if (mime === 'application/pdf' || /\.pdf(\?|$)/i.test(path)) return 'pdf'
  return 'file'
}

export function matchesMediaTypeFilter(asset, typeFilter) {
  const filter = String(typeFilter || 'all').toLowerCase()
  if (filter === 'all') return true
  return mediaAssetKind(asset) === filter
}

export function formatMediaBytes(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}
