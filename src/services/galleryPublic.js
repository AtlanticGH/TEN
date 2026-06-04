import { publicApiFetch } from '@/lib/apiClient'

export async function listPublicGalleryMedia(limit = 48) {
  const rows = await publicApiFetch(
    `/api/public/gallery-media?limit=${encodeURIComponent(String(limit || 48))}&type=image`,
    { method: 'GET' },
  )
  return Array.isArray(rows) ? rows : []
}

export async function listPublicGalleryVideos(limit = 12) {
  const rows = await publicApiFetch(
    `/api/public/gallery-media?limit=${encodeURIComponent(String(limit || 12))}&type=video`,
    { method: 'GET' },
  )
  return Array.isArray(rows) ? rows : []
}
