import { apiFetch } from '@/lib/apiClient'

export async function listQuizQuestions(lessonId) {
  return await apiFetch(`/api/lessons/${encodeURIComponent(lessonId)}/quizzes`, { method: 'GET' })
}

export async function createQuizQuestion({ lessonId, question, options, correctAnswer } = {}) {
  return await apiFetch(`/api/admin/lessons/${encodeURIComponent(lessonId)}/quizzes`, {
    method: 'POST',
    body: JSON.stringify({ question, options, correctAnswer }),
  })
}

export async function deleteQuizQuestion(row) {
  await apiFetch(`/api/admin/quizzes/${encodeURIComponent(row.id)}`, { method: 'DELETE' })
}

export async function submitQuizAttempt({ lessonId, answersByQuestionId } = {}) {
  return await apiFetch(`/api/lessons/${encodeURIComponent(lessonId)}/quiz-attempts`, {
    method: 'POST',
    body: JSON.stringify({ answersByQuestionId }),
  })
}

export async function listMyQuizAttempts(lessonId, { limit = 10 } = {}) {
  if (!lessonId) return []
  return await apiFetch(
    `/api/lessons/${encodeURIComponent(lessonId)}/quiz-attempts?limit=${encodeURIComponent(String(limit || 10))}`,
    { method: 'GET' },
  )
}

