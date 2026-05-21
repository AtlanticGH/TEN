import { uploadStorageFile } from './fileUploads'
import { apiFetch } from '@/lib/apiClient'

export async function createMentorAssignment({ lessonId, title, description, file } = {}) {
  if (!lessonId) throw new Error('Missing lessonId')
  if (!title?.trim()) throw new Error('Title is required')

  let upload = null
  if (file) {
    upload = await uploadStorageFile({ file, bucket: 'public', folder: `assignments/${lessonId}` })
  }

  return apiFetch(`/api/mentor/lessons/${encodeURIComponent(lessonId)}/assignments`, {
    method: 'POST',
    body: JSON.stringify({
      title: title.trim(),
      description: description?.trim() || null,
      bucket: upload?.bucket || 'public',
      path: upload?.path || null,
      file_url: null,
    }),
  })
}

export async function deleteMentorAssignment(row) {
  await apiFetch(`/api/mentor/assignments/${encodeURIComponent(row.id)}`, { method: 'DELETE' })
}
