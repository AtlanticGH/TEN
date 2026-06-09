import { Link } from 'react-router-dom'
import { resolveResourceCoverUrl } from '../../lib/resourceCover'
import { ImageWithFallback } from '../ui/ImageWithFallback'

/** Horizontal resource tile — cover left, copy and action right. */
export function ResourceCard({ resource }) {
  const cover = resolveResourceCoverUrl(resource)
  const title = resource.title || 'Resource'

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 sm:min-h-[11rem] sm:flex-row md:min-h-[12rem] lg:min-h-[14rem]">
      <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:min-h-[11rem] sm:w-[38%] md:w-[34%] lg:w-[30%]">
        <ImageWithFallback
          src={cover}
          fallbackSrc="/assets/images/1454165804606-c3d57bc86b40.jpg"
          alt={`${title} cover`}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-zinc-950/25"
          aria-hidden="true"
        />
        {resource.category ? (
          <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {resource.category}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
        <h3 className="text-xl font-bold leading-snug text-zinc-900 dark:text-white md:text-2xl">{title}</h3>
        {resource.description ? (
          <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 md:line-clamp-4">
            {resource.description}
          </p>
        ) : null}
        <div className="mt-5">
          {resource.download_url ? (
            <a
              href={resource.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-bold text-white transition hover:bg-orange-400"
            >
              Download
            </a>
          ) : (
            <Link
              to="/community"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-zinc-300 px-6 text-sm font-bold text-zinc-800 transition hover:border-orange-500 hover:text-orange-600 dark:border-zinc-600 dark:text-white"
            >
              Learn more
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
