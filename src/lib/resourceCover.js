const DEFAULT_RESOURCE_COVER = '/assets/images/1454165804606-c3d57bc86b40.jpg'

/** Cover image for a resource tile (explicit cover → image file → default). */
export function resolveResourceCoverUrl(resource) {
  const cover = String(resource?.cover_image_url || '').trim()
  if (cover) return cover

  const mime = String(resource?.mime_type || '')
  const url = String(resource?.download_url || resource?.file_url || '').trim()
  if (url && (mime.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg)(\?|#|$)/i.test(url))) {
    return url
  }

  return DEFAULT_RESOURCE_COVER
}
