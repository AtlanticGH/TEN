/** Normalize hosted files and YouTube/Vimeo links for embed playback. */
export function resolveVideoEmbed(url) {
  const raw = String(url || '').trim()
  if (!raw) return null

  const yt =
    raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/i) ||
    raw.match(/youtube\.com\/shorts\/([\w-]{11})/i)
  if (yt?.[1]) {
    return {
      kind: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt[1]}`,
      watchUrl: `https://www.youtube.com/watch?v=${yt[1]}`,
    }
  }

  const vimeo = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vimeo?.[1]) {
    return {
      kind: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}`,
      watchUrl: `https://vimeo.com/${vimeo[1]}`,
    }
  }

  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(raw) || raw.startsWith('/assets/') || raw.includes('/storage/v1/object/public/')) {
    return { kind: 'file', embedUrl: raw, watchUrl: raw }
  }

  if (raw.startsWith('http')) {
    return { kind: 'file', embedUrl: raw, watchUrl: raw }
  }

  return null
}
