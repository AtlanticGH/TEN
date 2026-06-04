import { resolveVideoEmbed } from '../../lib/videoEmbed'
import { Reveal } from './Reveal'

/**
 * @param {{ items: Array<{ url: string, title?: string, caption?: string, poster?: string }> }} props
 */
export function GalleryVideoGrid({ items = [] }) {
  const resolved = items
    .map((item) => {
      const embed = resolveVideoEmbed(item.url)
      if (!embed) return null
      return { ...item, embed }
    })
    .filter(Boolean)

  if (!resolved.length) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
        Video highlights will appear here. Add videos in Admin → Gallery.
      </p>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {resolved.map((item, i) => (
        <Reveal key={item.url + i} as="article" className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="aspect-video w-full bg-zinc-950">
            {item.embed.kind === 'file' ? (
              <video
                className="h-full w-full object-cover"
                src={item.embed.embedUrl}
                poster={item.poster || undefined}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <iframe
                title={item.title || item.caption || 'Video'}
                src={item.embed.embedUrl}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            )}
          </div>
          {item.title || item.caption ? (
            <div className="px-5 py-4">
              {item.title ? <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3> : null}
              {item.caption ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.caption}</p> : null}
            </div>
          ) : null}
        </Reveal>
      ))}
    </div>
  )
}
