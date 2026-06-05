import { Link } from 'react-router-dom'
import { ImageWithFallback } from '../../ui/ImageWithFallback'
import { Reveal } from '../../shared/Reveal'

const CONTAINER = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-10'
const EYEBROW = 'text-xs uppercase tracking-[0.18em] text-orange-500'

function splitParagraphs(body) {
  return String(body || '')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
}

export function VisionMissionSection({ vision, mission }) {
  const visionParas = splitParagraphs(vision?.body)
  const missionParas = splitParagraphs(mission?.body)
  return (
    <section id="vision-mission" data-section="vision-mission" className={`${CONTAINER} grid gap-10 py-20 lg:grid-cols-2`}>
      <Reveal as="article" className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold">{vision?.title || 'Vision'}</h2>
        {visionParas.map((p, i) => (
          <p key={i} className={`text-zinc-600 dark:text-zinc-300 ${i === 0 ? 'mt-4' : 'mt-4'}`}>
            {p}
          </p>
        ))}
      </Reveal>
      <Reveal as="article" className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold">{mission?.title || 'Mission'}</h2>
        {missionParas.map((p, i) => (
          <p key={i} className={`text-zinc-600 dark:text-zinc-300 ${i === 0 ? 'mt-4' : 'mt-4'}`}>
            {p}
          </p>
        ))}
      </Reveal>
    </section>
  )
}

export function FireListSection({ content }) {
  const items = content?.items || []
  return (
    <section className={`${CONTAINER} pb-10`}>
      <Reveal as="article" className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
        {content?.eyebrow ? <p className={EYEBROW}>{content.eyebrow}</p> : null}
        {content?.title ? <h2 className="mt-2 text-2xl font-semibold">{content.title}</h2> : null}
        {content?.description ? <p className="mt-4 text-zinc-600 dark:text-zinc-300">{content.description}</p> : null}
        <ul className="mt-5 grid gap-3 text-sm text-zinc-600 dark:text-zinc-300">
          {items.map((item) => (
            <li key={item.letter || item.title} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
              <p>
                {item.letter ? <strong>{item.letter} - {item.title}:</strong> : <strong>{item.title}:</strong>}{' '}
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}

export function SplitBenefitsSection({ content }) {
  const benefits = content?.benefits || []
  return (
    <section className={`${CONTAINER} pb-10`}>
      <Reveal as="article" className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          {content?.image ? (
            <div className="min-h-[250px]">
              <img src={content.image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
          ) : null}
          <div className="p-8 md:p-10">
            {content?.eyebrow ? <p className={EYEBROW}>{content.eyebrow}</p> : null}
            {content?.title ? <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{content.title}</h2> : null}
            <ul className="mt-5 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300 md:grid-cols-2">
              {benefits.map((b) => (
                <li key={b} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export function FounderProfileSection({ content }) {
  const c = content || {}
  const parts = String(c.body || '').split('\n\n')
  const socials = c.social_links || []
  return (
    <section className={`${CONTAINER} pb-10`}>
      <Reveal as="article" className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[260px]">
            <ImageWithFallback
              src={c.image || ''}
              fallbackSrc={c.image_fallback || ''}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>
          <div className="p-8 md:p-10">
            {c.eyebrow ? <p className={EYEBROW}>{c.eyebrow}</p> : null}
            {c.title ? <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{c.title}</h2> : null}
            {c.subtitle ? <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{c.subtitle}</p> : null}
            {parts.map((p, i) => (
              <p key={i} className={`text-zinc-600 dark:text-zinc-300 ${i === 0 ? 'mt-5' : 'mt-4'}`}>
                {p}
              </p>
            ))}
            {socials.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
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
        </div>
      </Reveal>
    </section>
  )
}

export function TeamGridSection({ content }) {
  const items = content?.items || []
  return (
    <section className={`${CONTAINER} pb-14`}>
      <div className="mb-6">
        {content?.eyebrow ? <p className={EYEBROW}>{content.eyebrow}</p> : null}
        {content?.title ? <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{content.title}</h2> : null}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((m) => (
          <Reveal key={m.title} as="article" className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <ImageWithFallback
              src={m.image || ''}
              fallbackSrc={m.image_fallback || ''}
              alt=""
              className="h-64 w-full object-cover md:h-72"
              loading="lazy"
            />
            <div className="p-5">
              <h3 className="text-lg font-semibold">{m.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{m.description}</p>
              {(m.social_links || []).length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.social_links.map((s) => (
                    <a
                      key={`${s.label}-${s.href}`}
                      href={s.href || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function LinkPillsSection({ content }) {
  const external = content?.external_links || []
  const buttons = content?.buttons || []
  return (
    <section className={`${CONTAINER} pb-20`}>
      {external.length ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {external.map((link) =>
            link.primary ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-orange-500 px-4 py-2 text-xs tracking-[0.12em] text-white transition hover:bg-orange-400"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs tracking-[0.12em] text-zinc-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300"
              >
                {link.label}
              </a>
            ),
          )}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {buttons.map((btn) => (
          <Link
            key={btn.href}
            to={btn.href || '#'}
            className={
              btn.primary
                ? 'inline-flex rounded-full bg-orange-500 px-5 py-2 font-medium text-white'
                : 'inline-flex rounded-full border border-zinc-300 px-5 py-2 font-medium text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200'
            }
          >
            {btn.label}
          </Link>
        ))}
      </div>
    </section>
  )
}

export function MarqueeSection({ content }) {
  const items = content?.items || []
  const line = items.concat(items).join('   ·   ')
  return (
    <section className="overflow-hidden border-y border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="animate-marquee whitespace-nowrap text-sm font-medium text-zinc-500">
        <span className="mx-6">{line}</span>
      </div>
    </section>
  )
}
