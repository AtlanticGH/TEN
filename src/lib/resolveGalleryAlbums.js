import { groupPhotosIntoAlbums, normalizeGalleryAlbums } from './galleryAlbums'
import { DEFAULT_GALLERY_ALBUMS, GALLERY_FOLDER_LABELS } from './galleryDefaults'

/**
 * Resolve albums for public gallery: CMS block → media library → built-in defaults.
 * @param {{ galleryBlockContent?: object, mediaRows?: Array }} input
 */
export function resolveGalleryAlbums({ galleryBlockContent, mediaRows } = {}) {
  const fromCms = normalizeGalleryAlbums(galleryBlockContent)
  if (fromCms.length) return fromCms

  const fromMedia = (mediaRows || [])
    .map((row) => ({
      src: row.public_url || row.url || '',
      alt: row.alt || row.title || '',
      caption: row.alt || row.title || '',
      folder: row.folder || 'general',
    }))
    .filter((item) => item.src)

  if (fromMedia.length) {
    return groupPhotosIntoAlbums(fromMedia, {
      getGroupKey: (photo) => photo.folder || 'general',
      getAlbumMeta: (key) => ({
        title: GALLERY_FOLDER_LABELS[key] || key.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        caption: 'Media library',
        description: `Photos uploaded to the ${GALLERY_FOLDER_LABELS[key] || key} collection.`,
      }),
    })
  }

  return DEFAULT_GALLERY_ALBUMS
}

/**
 * Merge CMS video block items with uploaded media library videos.
 */
export function resolveGalleryVideos({ videoBlockContent, mediaRows } = {}) {
  const fromBlock = (videoBlockContent?.items || [])
    .map((item) => ({
      url: item.url || item.video || item.src || '',
      title: item.title || '',
      caption: item.caption || item.description || '',
      poster: item.poster || item.poster_image || '',
    }))
    .filter((item) => item.url)

  const seen = new Set(fromBlock.map((v) => v.url))
  const fromMedia = []
  for (const row of mediaRows || []) {
    const url = row.public_url || ''
    if (!url || seen.has(url)) continue
    seen.add(url)
    fromMedia.push({
      url,
      title: row.title || '',
      caption: row.alt || row.title || '',
      poster: '',
    })
  }

  return [...fromBlock, ...fromMedia]
}
