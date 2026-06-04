import { apiFetch } from '@/lib/apiClient'

export async function listBlogCategories() {
  return apiFetch('/api/admin/blog-categories', { method: 'GET' })
}

export async function createBlogCategory(payload) {
  return apiFetch('/api/admin/blog-categories', { method: 'POST', body: JSON.stringify(payload || {}) })
}

export async function listBlogTags() {
  return apiFetch('/api/admin/blog-tags', { method: 'GET' })
}
