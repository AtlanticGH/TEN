import { publicApiFetch } from '@/lib/apiClient'

export async function listPublicBlogPosts(limit = 20) {
  return publicApiFetch(`/api/public/blog-posts?limit=${encodeURIComponent(String(limit))}`, { method: 'GET' })
}

export async function getPublicBlogPost(slug) {
  return publicApiFetch(`/api/public/blog-posts/${encodeURIComponent(slug)}`, { method: 'GET' })
}
