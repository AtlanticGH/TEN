import { uploadStorageFile } from './fileUploads'
import { apiFetch } from '@/lib/apiClient'

export async function listLessonFiles(lessonId) {
  return await apiFetch(`/api/lessons/${encodeURIComponent(lessonId)}/files`, { method: 'GET' })
}

export async function uploadLessonFile({ lessonId, title, file } = {}) {
  if (!lessonId) throw new Error('Missing lessonId')
  const upload = await uploadStorageFile({ file, bucket: 'public', folder: `lesson-files/${lessonId}` })

  return await apiFetch(`/api/admin/lessons/${encodeURIComponent(lessonId)}/files`, {
    method: 'POST',
    body: JSON.stringify({
      title: title?.trim() || file?.name || null,
      bucket: upload.bucket,
      path: upload.path,
      mime_type: upload.mime_type,
      size_bytes: upload.size_bytes,
      file_type: upload.file_type,
      position: 1,
    }),
  })
}

export async function deleteLessonFile(row) {
  await apiFetch(`/api/admin/lesson-files/${encodeURIComponent(row.id)}`, { method: 'DELETE' })
}

