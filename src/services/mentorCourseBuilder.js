import { apiFetch } from '@/lib/apiClient'

export async function getMentorCourse(courseId) {
  return apiFetch(`/api/mentor/courses/${encodeURIComponent(courseId)}`, { method: 'GET' })
}

export async function listMentorCourseModules(courseId) {
  return apiFetch(`/api/mentor/courses/${encodeURIComponent(courseId)}/modules`, { method: 'GET' })
}

export async function createMentorModule({ course_id, title, description }) {
  return apiFetch(`/api/mentor/courses/${encodeURIComponent(course_id)}/modules`, {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  })
}

export async function updateMentorModule(moduleId, patch) {
  return apiFetch(`/api/mentor/modules/${encodeURIComponent(moduleId)}`, {
    method: 'PUT',
    body: JSON.stringify(patch || {}),
  })
}

export async function deleteMentorModule(moduleId) {
  await apiFetch(`/api/mentor/modules/${encodeURIComponent(moduleId)}`, { method: 'DELETE' })
}

export async function reorderMentorModules(courseId, orderedModuleIds) {
  await apiFetch(`/api/mentor/courses/${encodeURIComponent(courseId)}/modules/reorder`, {
    method: 'POST',
    body: JSON.stringify({ orderedModuleIds: orderedModuleIds || [] }),
  })
}

export async function listMentorModuleLessons(moduleId) {
  return apiFetch(`/api/mentor/modules/${encodeURIComponent(moduleId)}/lessons`, { method: 'GET' })
}

export async function createMentorLesson({ module_id, title, description }) {
  return apiFetch(`/api/mentor/modules/${encodeURIComponent(module_id)}/lessons`, {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  })
}

export async function updateMentorLesson(lessonId, patch) {
  return apiFetch(`/api/mentor/lessons/${encodeURIComponent(lessonId)}`, {
    method: 'PUT',
    body: JSON.stringify(patch || {}),
  })
}

export async function publishMentorLesson(lessonId) {
  return updateMentorLesson(lessonId, { status: 'published', published_at: new Date().toISOString() })
}

export async function unpublishMentorLesson(lessonId) {
  return updateMentorLesson(lessonId, { status: 'draft', published_at: null })
}

export async function deleteMentorLesson(lessonId) {
  await apiFetch(`/api/mentor/lessons/${encodeURIComponent(lessonId)}`, { method: 'DELETE' })
}

export async function reorderMentorLessons(moduleId, orderedLessonIds) {
  await apiFetch(`/api/mentor/modules/${encodeURIComponent(moduleId)}/lessons/reorder`, {
    method: 'POST',
    body: JSON.stringify({ orderedLessonIds: orderedLessonIds || [] }),
  })
}
