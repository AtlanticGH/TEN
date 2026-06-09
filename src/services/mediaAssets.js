import { apiFetch, publicApiFetch } from '@/lib/apiClient'
import { getSupabase } from '@/lib/supabaseClient'
import { buildPublicStorageUrl, resolveMediaAssetUrl } from '@/lib/storageUrls'

const DEFAULT_BUCKET = 'public'
const PROXY_UPLOAD_MAX_BYTES = 4 * 1024 * 1024

function sanitizeFilename(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 120) || 'file'
}

function uploadPath(folder, filename) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${String(folder || 'uploads').replace(/^\/+|\/+$/g, '')}/${stamp}-${filename}`
}

export function getPublicAssetUrl({ bucket = DEFAULT_BUCKET, path, asset }) {
  if (asset) return resolveMediaAssetUrl(asset)
  return buildPublicStorageUrl(bucket, path)
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

export async function listMediaAssets({ limit = 100, query = '', folder = '', type = 'all' } = {}) {
  const params = new URLSearchParams({
    limit: String(limit || 100),
    query: String(query || ''),
    type: String(type || 'all'),
  })
  if (folder) params.set('folder', folder)
  return await apiFetch(`/api/admin/media-assets?${params.toString()}`, { method: 'GET' })
}

async function registerMediaAsset({ bucket, path, folder, mimeType, sizeBytes, title, alt, tags }) {
  return await apiFetch('/api/admin/media-assets/register', {
    method: 'POST',
    body: JSON.stringify({
      bucket,
      path,
      folder,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      title,
      alt,
      tags: Array.isArray(tags) ? tags : [],
    }),
  })
}

async function uploadViaApiProxy({ file, folder, title, alt, tags }) {
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

/** Upload large/video files directly to Supabase storage, then register in media_assets. */
async function uploadDirectToStorage({ file, folder, title, alt, tags }) {
  const safe = sanitizeFilename(file.name)
  const path = uploadPath(folder, safe)
  const supabase = getSupabase()
  const { error: upErr } = await supabase.storage.from(DEFAULT_BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })
  if (upErr) throw new Error(upErr.message)

  return registerMediaAsset({
    bucket: DEFAULT_BUCKET,
    path,
    folder,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    title: title || file.name,
    alt,
    tags,
  })
}

export async function uploadMediaFile({ file, folder = 'uploads', title = '', alt = '', tags = [] } = {}) {
  if (!file) throw new Error('Missing file')

  const isVideo = String(file.type || '').startsWith('video/')
  const useDirect = isVideo || file.size > PROXY_UPLOAD_MAX_BYTES

  if (useDirect) {
    return uploadDirectToStorage({ file, folder, title, alt, tags })
  }
  return uploadViaApiProxy({ file, folder, title, alt, tags })
}

/**
 * Upload multiple files sequentially (images, videos, PDFs).
 * @param {{ files: FileList|File[], folder?: string, title?: string, alt?: string, tags?: string[], onProgress?: (p: { current: number, total: number, file: File }) => void }} opts
 */
export async function uploadMediaFiles({ files, folder = 'uploads', title = '', alt = '', tags = [], onProgress } = {}) {
  const list = Array.from(files || []).filter(Boolean)
  if (!list.length) throw new Error('No files selected')

  const results = []
  const errors = []

  for (let i = 0; i < list.length; i += 1) {
    const file = list[i]
    onProgress?.({ current: i + 1, total: list.length, file })
    try {
      const asset = await uploadMediaFile({
        file,
        folder,
        title: title.trim() || file.name,
        alt,
        tags,
      })
      results.push({ file, asset })
    } catch (err) {
      errors.push({ file, error: err?.message || 'Upload failed' })
    }
  }

  if (!results.length && errors.length) {
    throw new Error(errors.map((e) => `${e.file.name}: ${e.error}`).join('; '))
  }

  return { results, errors, uploaded: results.length, failed: errors.length }
}

export async function updateMediaAsset(id, patch) {
  return await apiFetch(`/api/admin/media-assets/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(patch || {}) })
}

export async function deleteMediaAsset(asset) {
  if (!asset?.id) throw new Error('Missing asset id')
  return await apiFetch(`/api/admin/media-assets/${encodeURIComponent(asset.id)}`, { method: 'DELETE' })
}

export function confirmDeleteMediaAsset(asset) {
  const name = asset?.title || asset?.path?.split('/').pop() || 'this file'
  return window.confirm(
    `Delete "${name}"?\n\nThis permanently removes the file from storage and the media library. Any page still using its URL will need a new image or video.`,
  )
}
