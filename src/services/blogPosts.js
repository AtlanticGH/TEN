import { apiFetch } from '@/lib/apiClient'

export async function listBlogPosts() {
  return await apiFetch('/api/admin/blog-posts', { method: 'GET' })
}

export async function createBlogPost(payload) {
  return await apiFetch('/api/admin/blog-posts', { method: 'POST', body: JSON.stringify(payload || {}) })
}

export async function updateBlogPost(id, patch) {
  return await apiFetch(`/api/admin/blog-posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(patch || {}),
  })
}

export async function deleteBlogPost(id) {
  return await apiFetch(`/api/admin/blog-posts/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
