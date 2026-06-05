import { Link } from 'react-router-dom'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { Reveal } from '../shared/Reveal'
import {
  HOME_CONTAINER,
  HOME_EYEBROW,
  HOME_HEADLINE,
  HOME_SECTION_PAD,
} from '../home/homeContentData.jsx'

/**
 * @param {object} props
 * @param {object} [props.content] — site_content home.torchbearer.v1 shape
 * @param {boolean} [props.embedded] — render inside a parent section (no extra wrapper gap)
 */
export function TorchbearerSection({ content, embedded = false }) {
  const c = content || {}
  const stats = c.stats || []
  const socials = c.social_links || []

  const body = (
    <div className={HOME_CONTAINER}>
      <Reveal className="flex flex-col items-center gap-10 lg:flex-row lg:items-stretch lg:gap-14">
        <div className="flex w-full justify-center lg:w-1/2 lg:justify-start">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 lg:mx-0 lg:h-full lg:w-auto lg:max-w-none">
            <ImageWithFallback
              src={c.image || ''}
              fallbackSrc={c.image_fallback || ''}
              alt={c.name ? `Portrait of ${c.name}` : 'Torchbearer portrait'}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="w-full lg:flex lg:w-1/2 lg:flex-col lg:justify-center">
          {c.eyebrow ? <span className={HOME_EYEBROW}>{c.eyebrow}</span> : null}
          {c.title ? <h2 className={`${HOME_HEADLINE} text-zinc-900 dark:text-white`}>{c.title}</h2> : null}
          {c.name ? <p className="text-2xl font-bold text-zinc-900 dark:text-white">{c.name}</p> : null}
          {c.tagline ? (
            <p className="mt-2 text-[16px] text-orange-600 dark:text-orange-400">{c.tagline}</p>
          ) : null}
          {c.subtitle ? (
            <p className="mt-1 text-[15px] italic text-zinc-500 dark:text-zinc-400">{c.subtitle}</p>
          ) : null}
          {c.story_link && c.story_link_label ? (
            <Link
              to={c.story_link}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 transition hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
            >
              {c.story_link_label}
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ) : null}
          {stats.length ? (
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-zinc-200 pt-8 dark:border-zinc-800 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {stats.map(({ value, label }) => (
                <div key={label || value}>
                  <p className="text-2xl font-black text-orange-500">{value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {socials.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={`${s.label}-${s.href}`}
                  href={s.href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-zinc-300 px-3 py-1.5 text-xs tracking-[0.12em] text-zinc-600 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300"
                >
                  {s.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </Reveal>
    </div>
  )

  const surfaceClass = `bg-gradient-to-br from-zinc-50 to-orange-50/50 ${HOME_SECTION_PAD} dark:from-zinc-900 dark:to-zinc-950`

  if (embedded) {
    return <div className={surfaceClass}>{body}</div>
  }

  return <section className={surfaceClass}>{body}</section>
}
