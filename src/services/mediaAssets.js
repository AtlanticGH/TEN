import { apiFetch, publicApiFetch } from '@/lib/apiClient'

const DEFAULT_BUCKET = 'public'

function sanitizeFilename(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 120) || 'file'
}

export function getPublicAssetUrl({ bucket = DEFAULT_BUCKET, path }) {
  // Synchronous signature preserved; return empty if misused.
  // Prefer `getDownloadUrl()` or backend-computed URLs.
  void bucket
  void path
  return ''
}

export async function getDownloadUrl({ bucket = DEFAULT_BUCKET, path, expiresIn = 120 } = {}) {
  if (!path) return ''
  const res = await publicApiFetch(
    `/api/public/storage/public-url?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`,
    { method: 'GET' },
  ).catch(async () => {
    return await apiFetch(
      `/api/storage/signed-url?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}&expiresIn=${encodeURIComponent(
        String(expiresIn || 120),
      )}`,
      { method: 'GET' },
    )
  })
  return res?.publicUrl || res?.signedUrl || ''
}

export async function listMediaAssets({ limit = 100, query = '' } = {}) {
  return await apiFetch(
    `/api/admin/media-assets?limit=${encodeURIComponent(String(limit || 100))}&query=${encodeURIComponent(String(query || ''))}`,
    { method: 'GET' },
  )
}

export async function uploadMediaFile({ file, folder = 'uploads', title = '', alt = '', tags = [] } = {}) {
  if (!file) throw new Error('Missing file')
  const safe = sanitizeFilename(file.name)
  const buf = await file.arrayBuffer()
  return await apiFetch(
    `/api/admin/media-assets/upload?folder=${encodeURIComponent(folder)}&filename=${encodeURIComponent(safe)}&title=${encodeURIComponent(
      title || file.name,
    )}&alt=${encodeURIComponent(alt || '')}&tags=${encodeURIComponent((Array.isArray(tags) ? tags : []).join(','))}`,
    {
      method: 'POST',
      headers: { 'content-type': file.type || 'application/octet-stream' },
      body: buf,
    },
  )
}

export async function updateMediaAsset(id, patch) {
  return await apiFetch(`/api/admin/media-assets/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(patch || {}) })
}

export async function deleteMediaAsset(asset) {
  await apiFetch(`/api/admin/media-assets/${encodeURIComponent(asset.id)}`, { method: 'DELETE' })
}

