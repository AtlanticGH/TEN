import { useCallback, useEffect, useState } from 'react'
import { galleryTileClass, galleryTileVariant } from '../../lib/galleryTileLayout'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { Reveal } from './Reveal'

function GalleryLightbox({ items, index, onClose, onIndexChange }) {
  const item = items[index]
  const total = items.length
  const hasMultiple = total > 1

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % total)
  }, [index, total, onIndexChange])

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + total) % total)
  }, [index, total, onIndexChange])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, goNext, goPrev])

  if (!item) return null

  const navBtnClass =
    'absolute top-1/2 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white transition hover:border-orange-400/80 hover:bg-black/70 disabled:opacity-30'

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-[2] rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-sm text-white hover:border-orange-400/80"
        onClick={onClose}
      >
        Close
      </button>

      {hasMultiple ? (
        <>
          <button type="button" className={`${navBtnClass} left-3 sm:left-6`} onClick={goPrev} aria-label="Previous image">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className={`${navBtnClass} right-3 sm:right-6`} onClick={goNext} aria-label="Next image">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="absolute bottom-4 left-1/2 z-[2] -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/90">
            {index + 1} / {total}
          </p>
        </>
      ) : null}

      <figure className="relative z-[1] max-h-[90vh] max-w-4xl px-12 text-center sm:px-16" onMouseDown={(e) => e.stopPropagation()}>
        <img
          key={item.src + index}
          src={item.src}
          alt={item.alt || item.caption || ''}
          className="max-h-[80vh] max-w-full rounded-lg object-contain"
        />
        {item.caption ? <figcaption className="mt-3 text-sm text-zinc-300">{item.caption}</figcaption> : null}
      </figure>
    </div>
  )
}

/**
 * @param {{ items: Array<{ src: string, alt?: string, caption?: string, fallback?: string, tile?: string }> }} props
 */
export function GalleryGrid({ items = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  if (!items.length) {
    return <p className="text-center text-sm text-zinc-500">No images in the gallery yet.</p>
  }

  return (
    <>
      <div
        className="grid grid-flow-dense grid-cols-2 auto-rows-[minmax(9rem,1fr)] gap-3 sm:auto-rows-[minmax(10rem,1fr)] sm:gap-4 md:grid-cols-3 md:auto-rows-[minmax(11rem,1fr)] lg:grid-cols-4 lg:auto-rows-[minmax(12rem,1fr)]"
        role="list"
      >
        {items.map((item, i) => {
          const variant = galleryTileVariant(i, item)
          return (
            <Reveal key={item.src + i} className={`group ${galleryTileClass(variant)}`} role="listitem">
              <button
                type="button"
                className="relative block h-full min-h-[9rem] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 sm:min-h-[10rem]"
                onClick={() => setLightboxIndex(i)}
              >
                <ImageWithFallback
                  src={item.src}
                  fallbackSrc={item.fallback || ''}
                  alt={item.alt || item.caption || 'Gallery image'}
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {item.caption ? (
                  <span className="absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 py-2.5 text-left text-xs text-white">
                    {item.caption}
                  </span>
                ) : null}
              </button>
            </Reveal>
          )
        })}
      </div>

      {lightboxIndex !== null ? (
        <GalleryLightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </>
  )
}
