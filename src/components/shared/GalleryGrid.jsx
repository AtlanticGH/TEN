import { useCallback, useEffect, useState } from 'react'
import {
  FB_ALBUM_PREVIEW_COUNT,
  facebookCollageLayout,
  facebookHiddenCount,
  facebookShowsMoreTile,
} from '../../lib/galleryFacebookLayout'
import { ImageWithFallback } from '../ui/ImageWithFallback'

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

function CollagePhoto({ item, className, onClick }) {
  return (
    <button
      type="button"
      className={`group relative block min-h-0 h-full w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 ${className}`}
      onClick={onClick}
    >
      <ImageWithFallback
        src={item.src}
        fallbackSrc={item.fallback || ''}
        alt={item.alt || item.caption || 'Gallery image'}
        className="absolute inset-0 h-full w-full object-cover transition duration-200 group-hover:brightness-95"
        loading="lazy"
      />
    </button>
  )
}

function MorePhotosTile({ hiddenCount, previewSrc, onClick }) {
  return (
    <button
      type="button"
      className="group relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-zinc-900"
      onClick={onClick}
      aria-label={`View ${hiddenCount} more photos`}
    >
      {previewSrc ? (
        <img src={previewSrc} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" aria-hidden />
      ) : null}
      <span className="absolute inset-0 bg-black/55 transition group-hover:bg-black/45" aria-hidden />
      <span className="relative flex flex-col items-center gap-0.5 text-white">
        <span className="text-2xl font-semibold tracking-tight md:text-3xl">+{hiddenCount}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">View more</span>
      </span>
    </button>
  )
}

/**
 * Facebook-style gapless album preview with lightbox.
 * @param {{ items: Array<{ src: string, alt?: string, caption?: string, fallback?: string }> }} props
 */
export function GalleryGrid({ items = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  if (!items.length) {
    return <p className="text-center text-sm text-zinc-500">No images in the gallery yet.</p>
  }

  const total = items.length
  const showsMore = facebookShowsMoreTile(total)
  const hiddenCount = facebookHiddenCount(total)
  const previewItems = showsMore ? items.slice(0, FB_ALBUM_PREVIEW_COUNT) : items
  const { gridClass, tiles } = facebookCollageLayout(total)

  const openLightbox = (index) => setLightboxIndex(index)

  return (
    <>
      <div
        className={`grid h-[clamp(13rem,42vw,28rem)] gap-0 overflow-hidden rounded-lg sm:h-[clamp(15rem,38vw,30rem)] md:h-[clamp(17rem,34vw,32rem)] ${gridClass}`}
        role="list"
      >
        {previewItems.map((item, i) => (
          <CollagePhoto
            key={item.src + i}
            item={item}
            className={tiles[i]?.className || 'col-span-1 row-span-1'}
            onClick={() => openLightbox(i)}
          />
        ))}

        {showsMore ? (
          <div className={tiles[4]?.className || 'col-span-1 row-span-1'} role="listitem">
            <MorePhotosTile
              hiddenCount={hiddenCount}
              previewSrc={items[4]?.src || ''}
              onClick={() => openLightbox(FB_ALBUM_PREVIEW_COUNT)}
            />
          </div>
        ) : null}
      </div>

      {showsMore ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 transition hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
            onClick={() => openLightbox(FB_ALBUM_PREVIEW_COUNT)}
          >
            View {hiddenCount} more
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="text-sm text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            onClick={() => openLightbox(0)}
          >
            View all {total} photos
          </button>
        </div>
      ) : total > 1 ? (
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 transition hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
          onClick={() => openLightbox(0)}
        >
          View all {total} photos
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}

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
