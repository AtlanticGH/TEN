import { groupPhotosIntoAlbums, normalizeGalleryAlbums } from './galleryAlbums'
import { DEFAULT_GALLERY_ALBUMS, GALLERY_FOLDER_LABELS } from './galleryDefaults'

function mapMediaRows(mediaRows) {
  return (mediaRows || [])
    .map((row) => ({
      src: row.public_url || row.url || '',
      alt: row.alt || row.title || '',
      caption: row.alt || row.title || '',
      folder: row.folder || 'general',
    }))
    .filter((item) => item.src)
}

function albumsFromMediaRows(mediaRows, { folder } = {}) {
  const rows = folder ? mediaRows.filter((row) => (row.folder || 'general') === folder) : mediaRows
  const photos = mapMediaRows(rows)
  if (!photos.length) return []

  return groupPhotosIntoAlbums(photos, {
    getGroupKey: (photo) => photo.folder || 'general',
    getAlbumMeta: (key) => ({
      title: GALLERY_FOLDER_LABELS[key] || key.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      caption: 'Media library',
      description: `Photos uploaded to the ${GALLERY_FOLDER_LABELS[key] || key} collection.`,
    }),
  })
}

/**
 * Resolve albums for public gallery: CMS block (with photos) → gallery folder → all media → defaults.
 * @param {{ galleryBlockContent?: object, mediaRows?: Array }} input
 */
export function resolveGalleryAlbums({ galleryBlockContent, mediaRows } = {}) {
  const fromCms = normalizeGalleryAlbums(galleryBlockContent)
  if (fromCms.length) return fromCms

  const rows = mediaRows || []
  const fromGalleryFolder = albumsFromMediaRows(rows, { folder: 'gallery' })
  if (fromGalleryFolder.length) return fromGalleryFolder

  const fromAllMedia = albumsFromMediaRows(rows)
  if (fromAllMedia.length) return fromAllMedia

  return DEFAULT_GALLERY_ALBUMS
}

/**
 * Videos shown on the gallery page — CMS block items only (not auto-pulled from media library).
 */
export function resolveGalleryVideos({ videoBlockContent } = {}) {
  return (videoBlockContent?.items || [])
    .map((item) => ({
      url: item.url || item.video || item.src || '',
      title: item.title || '',
      caption: item.caption || item.description || '',
      poster: item.poster || item.poster_image || '',
    }))
    .filter((item) => item.url)
}
