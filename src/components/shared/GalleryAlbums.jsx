import { GalleryGrid } from './GalleryGrid'
import { Reveal } from './Reveal'

/**
 * @param {{ albums: Array<{ title?: string, caption?: string, description?: string, items: import('../../lib/galleryAlbums').GalleryPhoto[] }> }} props
 */
export function GalleryAlbums({ albums = [] }) {
  if (!albums.length) {
    return <p className="text-center text-sm text-zinc-500">No photo albums yet.</p>
  }

  return (
    <div className="space-y-16 md:space-y-20">
      {albums.map((album, i) => (
        <Reveal key={album.title + i} as="article" className="scroll-mt-28">
          <header className="max-w-3xl">
            {album.caption ? (
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-orange-500">{album.caption}</p>
            ) : null}
            {album.title ? (
              <h3 className={`text-xl font-semibold text-zinc-900 dark:text-zinc-100 md:text-2xl ${album.caption ? 'mt-2' : ''}`}>
                {album.title}
              </h3>
            ) : null}
            {album.description ? (
              <p className="mt-4 whitespace-pre-wrap text-[17px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                {album.description}
              </p>
            ) : null}
          </header>
          <div className={album.title || album.caption || album.description ? 'mt-8' : ''}>
            <GalleryGrid items={album.items || []} />
          </div>
        </Reveal>
      ))}
    </div>
  )
}
