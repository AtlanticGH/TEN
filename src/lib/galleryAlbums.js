import { buildPublicStorageUrl } from './storageUrls'

/** @typedef {{ src: string, alt?: string, caption?: string, fallback?: string }} GalleryPhoto */
/** @typedef {{ title?: string, caption?: string, description?: string, items?: GalleryPhoto[] }} GalleryAlbum */

function resolvePhotoSrc(item) {
  const raw = String(item?.image || item?.src || item?.url || item?.public_url || '').trim()
  if (!raw) return ''
  if (raw.includes('/storage/v1/object/public/') || raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw
  }
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw
  return buildPublicStorageUrl('public', raw.replace(/^\/+/, ''))
}

function mapPhoto(item) {
  return {
    src: resolvePhotoSrc(item),
    alt: item.alt || '',
    caption: item.caption || item.title || '',
    fallback: item.fallback_image || item.fallback || '',
    tile: item.tile || '',
  }
}

/**
 * Normalize gallery block content to albums (supports legacy flat `items`).
 * @returns {GalleryAlbum[]}
 */
export function normalizeGalleryAlbums(content) {
  const c = content || {}

  if (Array.isArray(c.albums) && c.albums.length) {
    return c.albums
      .map((album) => ({
        title: album.title || '',
        caption: album.caption || '',
        description: album.description || '',
        items: (album.items || []).map(mapPhoto).filter((photo) => photo.src),
      }))
      .filter((album) => album.items.length > 0)
  }

  const legacyItems = (c.items || []).map(mapPhoto).filter((photo) => photo.src)
  if (!legacyItems.length) return []

  return [
    {
      title: c.album_title || '',
      caption: c.album_caption || c.subtitle || '',
      description: c.album_description || c.description || '',
      items: legacyItems,
    },
  ]
}

export function groupPhotosIntoAlbums(photos, { getGroupKey, getAlbumMeta } = {}) {
  const keyFn = getGroupKey || (() => 'Gallery')
  const metaFn = getAlbumMeta || ((key) => ({ title: key, caption: '', description: '' }))

  const groups = new Map()
  for (const photo of photos || []) {
    if (!photo?.src) continue
    const key = keyFn(photo)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(photo)
  }

  return Array.from(groups.entries()).map(([key, items]) => ({
    ...metaFn(key, items),
    items,
  }))
}
