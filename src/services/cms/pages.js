import { apiFetch, publicApiFetch } from '@/lib/apiClient'

export async function listPublicPages() {
  return publicApiFetch('/api/public/cms/pages', { method: 'GET' })
}

export async function getPublicPage(slug) {
  return publicApiFetch(`/api/public/cms/pages/${encodeURIComponent(slug)}`, { method: 'GET' })
}

export async function listAdminPages() {
  return apiFetch('/api/admin/pages', { method: 'GET' })
}

export async function createPage(payload) {
  return apiFetch('/api/admin/pages', { method: 'POST', body: JSON.stringify(payload || {}) })
}

export async function updatePage(id, patch) {
  return apiFetch(`/api/admin/pages/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(patch || {}),
  })
}

export async function deletePage(id) {
  return apiFetch(`/api/admin/pages/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function duplicatePage(id) {
  return apiFetch(`/api/admin/pages/${encodeURIComponent(id)}/duplicate`, { method: 'POST' })
}

export async function listPageBlocks(pageId) {
  return apiFetch(`/api/admin/pages/${encodeURIComponent(pageId)}/blocks`, { method: 'GET' })
}

export async function createPageBlock(pageId, payload) {
  return apiFetch(`/api/admin/pages/${encodeURIComponent(pageId)}/blocks`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export async function updatePageBlock(blockId, patch) {
  return apiFetch(`/api/admin/page-blocks/${encodeURIComponent(blockId)}`, {
    method: 'PUT',
    body: JSON.stringify(patch || {}),
  })
}

export async function deletePageBlock(blockId) {
  return apiFetch(`/api/admin/page-blocks/${encodeURIComponent(blockId)}`, { method: 'DELETE' })
}

export async function reorderPageBlocks(pageId, order) {
  return apiFetch(`/api/admin/pages/${encodeURIComponent(pageId)}/blocks/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ order }),
  })
}

export async function listBlockTypes() {
  return apiFetch('/api/admin/block-types', { method: 'GET' })
}

export async function getCmsSummary() {
  return apiFetch('/api/admin/cms-summary', { method: 'GET' })
}
