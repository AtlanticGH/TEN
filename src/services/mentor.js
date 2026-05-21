import { apiFetch } from '@/lib/apiClient'

export async function fetchMentorSummary() {
  return apiFetch('/api/mentor/summary', { method: 'GET' })
}

export async function listMentorStudents() {
  return apiFetch('/api/mentor/students', { method: 'GET' })
}

export async function fetchMenteeProgress(userId) {
  return apiFetch(`/api/mentor/students/${encodeURIComponent(userId)}/progress`, { method: 'GET' })
}

export async function listMentorCourses() {
  return apiFetch('/api/mentor/courses', { method: 'GET' })
}

export async function createMentorCourse(payload) {
  return apiFetch('/api/mentor/courses', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateMentorCourse(id, payload) {
  return apiFetch(`/api/mentor/courses/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function listMentorSubmissions({ status = 'submitted' } = {}) {
  const q = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiFetch(`/api/mentor/submissions${q}`, { method: 'GET' })
}

export async function reviewMentorSubmission(id, payload) {
  return apiFetch(`/api/mentor/submissions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function fetchMyAssignmentSubmission(assignmentId) {
  return apiFetch(`/api/assignments/${encodeURIComponent(assignmentId)}/my-submission`, { method: 'GET' })
}

export async function submitAssignmentWork(assignmentId, payload) {
  return apiFetch(`/api/assignments/${encodeURIComponent(assignmentId)}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
