import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageMeta } from '../components/cms/PageMeta'
import { PageHeroSection } from '../components/shared/PageHeroSection'
import { GalleryAlbums } from '../components/shared/GalleryAlbums'
import { GalleryVideoGrid } from '../components/shared/GalleryVideoGrid'
import { useCmsPage } from '../hooks/useCmsPage'
import { resolveGalleryAlbums, resolveGalleryVideos } from '../lib/resolveGalleryAlbums'
import { listPublicGalleryMedia } from '../services/galleryPublic'

export function GalleryPage() {
  const { blocks, hasBlocks, loading, seo } = useCmsPage('gallery')

  const { data: media = [], isLoading: mediaLoading } = useQuery({
    queryKey: ['gallery-media-public'],
    queryFn: () => listPublicGalleryMedia(60),
    staleTime: 1000 * 60 * 5,
  })

  const videoBlock = blocks?.find((b) => b.block_type === 'video_gallery' && b.enabled !== false)
  const galleryBlock = blocks?.find((b) => b.block_type === 'gallery' && b.enabled !== false)

  const photoAlbums = useMemo(
    () =>
      resolveGalleryAlbums({
        galleryBlockContent: galleryBlock?.content,
        mediaRows: media,
      }),
    [galleryBlock?.content, media],
  )

  const videoItems = useMemo(
    () => resolveGalleryVideos({ videoBlockContent: videoBlock?.content }),
    [videoBlock?.content],
  )

  const videoMeta = videoBlock?.content || {}
  const photoMeta = galleryBlock?.content || {}

  if (loading && !hasBlocks) {
    return (
      <GalleryPageShell
        seo={seo}
        loading
        mediaLoading={mediaLoading}
        photoAlbums={photoAlbums}
        videoItems={videoItems}
        videoMeta={videoMeta}
        photoMeta={photoMeta}
      />
    )
  }

  return (
    <>
      <PageMeta title={seo?.title || 'Gallery'} description={seo?.description} robots={seo?.robots} />
      <main id="page-main" data-component="page-main" data-cms-page="gallery" className="overflow-x-hidden">
        <PageHeroSection slug="gallery" />

        {videoItems.length ? (
          <section id="gallery-videos" data-section="gallery-videos" className="mx-auto max-w-7xl px-8 py-16 md:px-12 lg:px-10">
            {videoMeta.eyebrow ? (
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">{videoMeta.eyebrow}</p>
            ) : (
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Videos</p>
            )}
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{videoMeta.title || 'Program highlights'}</h2>
            {videoMeta.subtitle ? (
              <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">{videoMeta.subtitle}</p>
            ) : null}
            <div className="mt-10">
              <GalleryVideoGrid items={videoItems} />
            </div>
          </section>
        ) : null}

        <section
          id="gallery-photos"
          data-section="gallery-photos"
          className={`mx-auto max-w-7xl px-8 py-16 md:px-12 lg:px-10 dark:border-zinc-800 ${videoItems.length ? 'border-t border-zinc-200' : ''}`}
        >
          {photoMeta.eyebrow ? (
            <p className="text-xs uppercase tracking-[0.18em] text-orange-500">{photoMeta.eyebrow}</p>
          ) : (
            <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Photos</p>
          )}
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{photoMeta.title || 'Photo albums'}</h2>
          {photoMeta.subtitle ? (
            <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">{photoMeta.subtitle}</p>
          ) : (
            <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
              Browse collections by theme. Each album includes a caption, description, and individual photo captions.
            </p>
          )}
          {mediaLoading && !photoAlbums.length ? (
            <p className="mt-6 text-sm text-zinc-500">Loading gallery…</p>
          ) : null}
          <div className="mt-10">
            <GalleryAlbums albums={photoAlbums} />
          </div>
        </section>
      </main>
    </>
  )
}

function GalleryPageShell({ seo, loading, mediaLoading, photoAlbums, videoItems, videoMeta, photoMeta }) {
  return (
    <>
      <PageMeta title={seo?.title || 'Gallery'} description={seo?.description} />
      <main id="page-main" data-component="page-main" className="overflow-x-hidden">
        <PageHeroSection slug="gallery" />
        {videoItems.length ? (
          <section className="mx-auto max-w-7xl px-8 py-16 md:px-12 lg:px-10">
            {loading ? <p className="text-sm text-zinc-500">Loading gallery…</p> : <GalleryVideoGrid items={videoItems} />}
          </section>
        ) : null}
        <section className={`mx-auto max-w-7xl px-8 py-16 md:px-12 lg:px-10 dark:border-zinc-800 ${videoItems.length ? 'border-t border-zinc-200' : ''}`}>
          {mediaLoading ? <p className="text-sm text-zinc-500">Loading photos…</p> : <GalleryAlbums albums={photoAlbums} />}
        </section>
      </main>
    </>
  )
}
