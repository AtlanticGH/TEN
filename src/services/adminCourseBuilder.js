import { apiFetch } from '@/lib/apiClient'

export async function getAdminCourse(courseId) {
  return await apiFetch(`/api/admin/courses/${encodeURIComponent(courseId)}`, { method: 'GET' })
}

export async function listCourseModules(courseId) {
  return await apiFetch(`/api/admin/courses/${encodeURIComponent(courseId)}/modules`, { method: 'GET' })
}

export async function createModule({ course_id, title, description }) {
  return await apiFetch(`/api/admin/courses/${encodeURIComponent(course_id)}/modules`, {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  })
}

export async function updateModule(moduleId, patch) {
  return await apiFetch(`/api/admin/modules/${encodeURIComponent(moduleId)}`, { method: 'PUT', body: JSON.stringify(patch || {}) })
}

export async function deleteModule(moduleId) {
  await apiFetch(`/api/admin/modules/${encodeURIComponent(moduleId)}`, { method: 'DELETE' })
}

export async function reorderModules(courseId, orderedModuleIds) {
  await apiFetch(`/api/admin/courses/${encodeURIComponent(courseId)}/modules/reorder`, {
    method: 'POST',
    body: JSON.stringify({ orderedModuleIds: orderedModuleIds || [] }),
  })
}

export async function listModuleLessons(moduleId) {
  return await apiFetch(`/api/admin/modules/${encodeURIComponent(moduleId)}/lessons`, { method: 'GET' })
}

export async function createLesson({ module_id, title, description }) {
  return await apiFetch(`/api/admin/modules/${encodeURIComponent(module_id)}/lessons`, {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  })
}

export async function updateLesson(lessonId, patch) {
  return await apiFetch(`/api/admin/lessons/${encodeURIComponent(lessonId)}`, { method: 'PUT', body: JSON.stringify(patch || {}) })
}

export async function publishLesson(lessonId) {
  return await updateLesson(lessonId, { status: 'published', published_at: new Date().toISOString() })
}

export async function unpublishLesson(lessonId) {
  return await updateLesson(lessonId, { status: 'draft', published_at: null })
}

export async function deleteLesson(lessonId) {
  await apiFetch(`/api/admin/lessons/${encodeURIComponent(lessonId)}`, { method: 'DELETE' })
}

export async function reorderLessons(moduleId, orderedLessonIds) {
  await apiFetch(`/api/admin/modules/${encodeURIComponent(moduleId)}/lessons/reorder`, {
    method: 'POST',
    body: JSON.stringify({ orderedLessonIds: orderedLessonIds || [] }),
  })
}

