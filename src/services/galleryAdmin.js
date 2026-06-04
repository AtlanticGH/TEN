import { apiFetch } from '@/lib/apiClient'
import { listAdminPages, listPageBlocks } from './cms/pages'

function isEnsureNotFound(err) {
  const msg = String(err?.message || err || '')
  return msg.includes('Not found') && msg.includes('/api/admin/gallery/ensure')
}

export async function ensureGalleryCms() {
  try {
    return await apiFetch('/api/admin/gallery/ensure', { method: 'POST' })
  } catch (err) {
    if (!isEnsureNotFound(err)) throw err
    const pages = await listAdminPages()
    const page = pages.find((p) => p.slug === 'gallery')
    if (!page) {
      throw new Error(
        'Gallery API is unavailable. Restart the API server: stop dev:all and run npm run dev:all again (or npm start on port 3000).',
      )
    }
    const blocks = await listPageBlocks(page.id)
    return { page, blocks }
  }
}

export async function loadGalleryEditor() {
  const ensured = await ensureGalleryCms()
  const page = ensured.page
  const blocks = ensured.blocks || (await listPageBlocks(page.id))
  return {
    page,
    heroBlock: blocks.find((b) => b.block_type === 'hero') || null,
    videoBlock: blocks.find((b) => b.block_type === 'video_gallery') || null,
    galleryBlock: blocks.find((b) => b.block_type === 'gallery') || null,
    blocks,
  }
}
