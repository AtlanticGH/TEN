import { resolveVideoEmbed } from '../../lib/videoEmbed'
import { ImageWithFallback } from '../ui/ImageWithFallback'

/** Card media: optional video (file, YouTube, Vimeo) with image as poster/fallback. */
export function ProgramCardMedia({ image, imageAlt, video, title, aspectClass = 'aspect-[16/10]' }) {
  const rawVideo = String(video || '').trim()
  const embed = resolveVideoEmbed(rawVideo)

  if (embed?.kind === 'youtube' || embed?.kind === 'vimeo') {
    return (
      <div className={`relative w-full overflow-hidden bg-zinc-950 ${aspectClass}`}>
        <iframe
          src={embed.embedUrl}
          title={title || 'Program video'}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (rawVideo) {
    const src = embed?.embedUrl || rawVideo
    return (
      <video
        className={`w-full object-cover ${aspectClass}`}
        poster={image || undefined}
        autoPlay
        muted
        loop
        playsInline
        aria-label={imageAlt || title}
      >
        <source src={src} />
      </video>
    )
  }

  return (
    <ImageWithFallback
      src={image}
      alt={imageAlt || title}
      className={`w-full object-cover ${aspectClass}`}
      loading="lazy"
    />
  )
}
