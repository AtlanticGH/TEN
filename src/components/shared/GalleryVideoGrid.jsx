import { useState } from 'react'
import { getVideoPoster, resolveVideoEmbed } from '../../lib/videoEmbed'
import { Reveal } from './Reveal'

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function VideoMeta({ title, caption, variant = 'overlay' }) {
  if (!title && !caption) return null

  if (variant === 'footer') {
    return (
      <div className="border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
        {caption ? (
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-orange-500">{caption}</p>
        ) : null}
        {title ? (
          <h3 className={`font-semibold text-zinc-900 dark:text-zinc-100 ${caption ? 'mt-2 text-lg md:text-xl' : 'text-lg md:text-xl'}`}>
            {title}
          </h3>
        ) : null}
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-5 pb-5 pt-16 text-left">
      {caption ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400">{caption}</p>
      ) : null}
      {title ? (
        <h3 className={`text-lg font-semibold leading-snug text-white md:text-xl ${caption ? 'mt-1.5' : ''}`}>
          {title}
        </h3>
      ) : null}
    </div>
  )
}

/**
 * @param {{ items: Array<{ url: string, title?: string, caption?: string, poster?: string }> }} props
 */
export function GalleryVideoGrid({ items = [] }) {
  const [activeIndex, setActiveIndex] = useState(null)

  const resolved = items
    .map((item) => {
      const embed = resolveVideoEmbed(item.url)
      if (!embed) return null
      return { ...item, embed, poster: getVideoPoster(item.url, item.poster) }
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
    <div className="grid gap-8 md:grid-cols-2">
      {resolved.map((item, i) => {
        const isActive = activeIndex === i
        const embedUrl =
          isActive && item.embed.kind !== 'file'
            ? `${item.embed.embedUrl}${item.embed.embedUrl.includes('?') ? '&' : '?'}autoplay=1`
            : item.embed.embedUrl
        const label = item.title || item.caption || 'Play video'

        return (
          <Reveal
            key={item.url + i}
            as="article"
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="relative aspect-video w-full bg-zinc-950">
              {isActive ? (
                item.embed.kind === 'file' ? (
                  <video
                    className="h-full w-full object-cover"
                    src={item.embed.embedUrl}
                    poster={item.poster || undefined}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <iframe
                    title={label}
                    src={embedUrl}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              ) : (
                <button
                  type="button"
                  className="group relative block h-full w-full overflow-hidden text-left"
                  aria-label={item.title ? `Play ${item.title}` : 'Play video'}
                  onClick={() => setActiveIndex(i)}
                >
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <span className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950" />
                  )}
                  <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/30" />
                  <span className="absolute left-1/2 top-[42%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg ring-4 ring-black/20 transition group-hover:scale-105 group-hover:bg-orange-400">
                    <PlayIcon />
                  </span>
                  <VideoMeta title={item.title} caption={item.caption} variant="overlay" />
                </button>
              )}
            </div>
            {isActive ? <VideoMeta title={item.title} caption={item.caption} variant="footer" /> : null}
          </Reveal>
        )
      })}
    </div>
  )
}
