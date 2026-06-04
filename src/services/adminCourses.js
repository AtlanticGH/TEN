import { apiFetch } from '@/lib/apiClient'

export async function listAdminCourses() {
  return await apiFetch('/api/admin/courses', { method: 'GET' })
}

export async function createCourse(payload) {
  return await apiFetch('/api/admin/courses', { method: 'POST', body: JSON.stringify(payload || {}) })
}

export async function updateCourse(id, patch) {
  return await apiFetch(`/api/admin/courses/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(patch || {}),
  })
}

export async function deleteCourse(id) {
  return await apiFetch(`/api/admin/courses/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function listModules(courseId) {
  return await apiFetch(`/api/admin/courses/${encodeURIComponent(courseId)}/modules`, { method: 'GET' })
}

export async function createModule(courseId, payload) {
  return await apiFetch(`/api/admin/courses/${encodeURIComponent(courseId)}/modules`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export async function updateModule(id, patch) {
  return await apiFetch(`/api/admin/modules/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(patch || {}),
  })
}

export async function deleteModule(id) {
  return await apiFetch(`/api/admin/modules/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function listLessons(moduleId) {
  return await apiFetch(`/api/admin/modules/${encodeURIComponent(moduleId)}/lessons`, { method: 'GET' })
}

export async function createLesson(moduleId, payload) {
  return await apiFetch(`/api/admin/modules/${encodeURIComponent(moduleId)}/lessons`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export async function updateLesson(id, patch) {
  return await apiFetch(`/api/admin/lessons/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(patch || {}),
  })
}

export async function deleteLesson(id) {
  return await apiFetch(`/api/admin/lessons/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
