import { uploadStorageFile } from './fileUploads'
import { apiFetch } from '@/lib/apiClient'
import { listLessonFiles } from './lessonFiles'

export { listLessonFiles }

export async function uploadMentorLessonFile({ lessonId, title, file } = {}) {
  if (!lessonId) throw new Error('Missing lessonId')
  if (!file) throw new Error('File is required')

  const upload = await uploadStorageFile({ file, bucket: 'public', folder: `lesson-files/${lessonId}` })

  return apiFetch(`/api/mentor/lessons/${encodeURIComponent(lessonId)}/files`, {
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

export async function deleteMentorLessonFile(row) {
  await apiFetch(`/api/mentor/lesson-files/${encodeURIComponent(row.id)}`, { method: 'DELETE' })
}
