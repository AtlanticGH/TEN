import { uploadStorageFile } from './fileUploads'
import { apiFetch, publicApiFetch } from '@/lib/apiClient'

async function withDownloadUrls(rows) {
  return Promise.all(
    (rows || []).map(async (r) => {
      if (r.file_url) return { ...r, download_url: r.file_url }
      if (!r.path) return { ...r, download_url: '' }
      const u = await publicApiFetch(
        `/api/public/storage/public-url?bucket=${encodeURIComponent(r.bucket || 'public')}&path=${encodeURIComponent(r.path)}`,
        { method: 'GET' },
      )
      return { ...r, download_url: u?.publicUrl || '' }
    }),
  )
}

export async function listResources({ limit = 200 } = {}) {
  const rows = await publicApiFetch(`/api/public/resources?limit=${encodeURIComponent(String(limit || 200))}`, {
    method: 'GET',
  })
  return withDownloadUrls(rows)
}

export async function listAdminResources({ limit = 200 } = {}) {
  const rows = await apiFetch(`/api/admin/resources?limit=${encodeURIComponent(String(limit || 200))}`, { method: 'GET' })
  return withDownloadUrls(rows)
}

export async function createResource({ title, description, category, file, file_url } = {}) {
  if (!title?.trim()) throw new Error('Title is required')

  let upload = null
  if (file) {
    upload = await uploadStorageFile({ file, bucket: 'public', folder: 'resources' })
  }

  let resolvedUrl = file_url ? String(file_url).trim() : ''
  if (!resolvedUrl && upload?.bucket && upload?.path) {
    const u = await publicApiFetch(
      `/api/public/storage/public-url?bucket=${encodeURIComponent(upload.bucket)}&path=${encodeURIComponent(upload.path)}`,
      { method: 'GET' },
    )
    resolvedUrl = u?.publicUrl || ''
  }

  if (!resolvedUrl && !file) {
    throw new Error('Upload a file or provide an external download URL')
  }

  return await apiFetch('/api/admin/resources', {
    method: 'POST',
    body: JSON.stringify({
      title: title.trim(),
      description,
      category,
      bucket: upload?.bucket || null,
      path: upload?.path || null,
      file_url: resolvedUrl || null,
      mime_type: upload?.mime_type || null,
      size_bytes: upload?.size_bytes || null,
    }),
  })
}

export async function deleteResource(resource) {
  await apiFetch(`/api/admin/resources/${encodeURIComponent(resource.id)}`, { method: 'DELETE' })
}

