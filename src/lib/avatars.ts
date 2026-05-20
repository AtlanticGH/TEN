import { apiFetch } from '@/lib/apiClient'

export async function uploadMyAvatar(file: File) {
  const safeName = String(file.name || 'avatar').replace(/[^\w.\-]+/g, '-').slice(0, 120)
  const buf = await file.arrayBuffer()
  const res = await apiFetch(`/api/me/avatar?filename=${encodeURIComponent(safeName)}`, {
    method: 'POST',
    headers: { 'content-type': file.type || 'application/octet-stream' },
    body: buf,
  })
  return res?.path
}

export async function getAvatarSignedUrl(path: string, expiresInSeconds = 60 * 60) {
  if (!path) return null
  const res = await apiFetch(
    `/api/me/avatar-url?path=${encodeURIComponent(path)}&expiresIn=${encodeURIComponent(String(expiresInSeconds))}`,
    { method: 'GET' },
  )
  return res?.signedUrl || null
}

