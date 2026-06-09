import { publicApiFetch } from '@/lib/apiClient'

async function fetchGalleryMedia({ limit = 48, folder = '' } = {}) {
  const params = new URLSearchParams({
    limit: String(limit || 48),
    type: 'image',
  })
  if (folder) params.set('folder', folder)
  const rows = await publicApiFetch(`/api/public/gallery-media?${params.toString()}`, { method: 'GET' })
  return Array.isArray(rows) ? rows : []
}

/** Prefer the gallery upload folder, then fall back to all public images. */
export async function listPublicGalleryMedia(limit = 48) {
  const galleryRows = await fetchGalleryMedia({ limit, folder: 'gallery' })
  if (galleryRows.length) return galleryRows
  return fetchGalleryMedia({ limit })
}

export async function listPublicGalleryVideos(limit = 12) {
  const rows = await publicApiFetch(
    `/api/public/gallery-media?limit=${encodeURIComponent(String(limit || 12))}&type=video`,
    { method: 'GET' },
  )
  return Array.isArray(rows) ? rows : []
}
