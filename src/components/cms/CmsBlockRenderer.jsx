import { Link } from 'react-router-dom'
import {
  MOVEMENT_CTA_ACTIONS,
  MOVEMENT_CTA_BODY,
  MOVEMENT_CTA_BTN_PRIMARY,
  MOVEMENT_CTA_BTN_SECONDARY,
  MOVEMENT_CTA_EYEBROW,
  MOVEMENT_CTA_GRADIENT,
  MOVEMENT_CTA_HEADLINE,
} from '../home/homeContentData.jsx'
import { HomeGatewayHero } from './HomeGatewayHero'
import { InnerPageHero } from '../shared/InnerPageHero'
import { resolveGalleryAlbums } from '../../lib/resolveGalleryAlbums'
import { GalleryAlbums } from '../shared/GalleryAlbums'
import { GalleryVideoGrid } from '../shared/GalleryVideoGrid'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { Reveal } from '../shared/Reveal'

function isGatewayHero(content) {
  const c = content || {}
  if (c.variant === 'inner') return false
  if (c.variant === 'gateway') return true
  if (c.headline_emphasis) return true
  return false
}

function HeroBlock({ content }) {
  const c = content || {}
  if (isGatewayHero(c)) {
    return <HomeGatewayHero content={c} />
  }
  const heading = [c.headline_before, c.headline_emphasis].filter(Boolean).join(' ') || c.headline || c.title || ''
  return (
    <InnerPageHero
      badge={c.badge || ''}
      heading={heading}
      description={c.subheadline || c.description || ''}
      image={c.image || c.background_image || ''}
    />
  )
}

function TextBlock({ content }) {
  const c = content || {}
  const dark = c.variant === 'dark'
  return (
    <section
      className={
        dark
          ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-700 py-20 md:py-28'
          : 'mx-auto max-w-3xl px-8 py-16 md:px-12'
      }
    >
      <div className={dark ? 'mx-auto max-w-3xl px-6 text-center sm:px-8' : ''}>
        {c.eyebrow ? (
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">{c.eyebrow}</span>
        ) : null}
        {c.title ? (
          <h2 className={`text-2xl font-black tracking-tight md:text-4xl ${dark ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {c.title}
          </h2>
        ) : null}
        {c.body ? (
          <p className={`mt-4 whitespace-pre-wrap text-[17px] leading-relaxed ${dark ? 'text-zinc-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
            {c.body}
          </p>
        ) : null}
      </div>
    </section>
  )
}

function RichTextBlock({ content }) {
  const html = content?.html || content?.body || ''
  if (!html) return null
  return (
    <section
      className="cms-rich-text mx-auto max-w-3xl px-8 py-16 prose prose-zinc dark:prose-invert md:px-12"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function FeaturesBlock({ content }) {
  const items = content?.items || []
  if (!items.length) return null
  const variant = content?.variant || 'cards'
  const eyebrow = content?.eyebrow || ''

  if (variant === 'media_split') {
    return (
      <section className="mx-auto max-w-7xl space-y-10 px-8 py-10 md:px-12 lg:px-10">
        {content?.title ? (
          <div>
            {eyebrow ? <p className="text-xs uppercase tracking-[0.2em] text-orange-500">{eyebrow}</p> : null}
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{content.title}</h2>
          </div>
        ) : null}
        {items.map((item, i) => {
          const imageFirst = i % 2 === 0
          return (
            <Reveal
              key={i}
              as="article"
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className={`grid gap-0 lg:grid-cols-2 ${imageFirst ? '' : ''}`}>
                {item.image ? (
                  <div className={`min-h-[260px] ${imageFirst ? '' : 'lg:order-2'}`}>
                    <ImageWithFallback
                      src={item.image}
                      fallbackSrc={item.fallback_image || item.image_fallback || ''}
                      alt={item.title || ''}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className={`p-7 md:p-8 ${imageFirst ? '' : 'lg:order-1'}`}>
                  {item.eyebrow ? (
                    <p className="text-xs uppercase tracking-[0.2em] text-orange-500">{item.eyebrow}</p>
                  ) : null}
                  {item.title ? <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3> : null}
                  {item.description ? (
                    <p className="mt-3 whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">{item.description}</p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          )
        })}
      </section>
    )
  }

  const team = variant === 'team'
  return (
    <section className="mx-auto max-w-7xl px-8 py-16 md:px-12 lg:px-10">
      {(eyebrow || content?.title) && (
        <div className="mb-8">
          {eyebrow ? <p className="text-xs uppercase tracking-[0.18em] text-orange-500">{eyebrow}</p> : null}
          {content?.title ? <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{content.title}</h2> : null}
          {content?.subtitle ? <p className="mt-4 text-zinc-600 dark:text-zinc-300">{content.subtitle}</p> : null}
        </div>
      )}
      <div className={`grid gap-5 ${team ? 'md:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {items.map((item, i) => {
          const position = team ? item.position || item.title : item.title
          return (
          <Reveal
            key={i}
            as="article"
            className={
              team || item.image
                ? 'overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'
                : 'rounded-xl border border-zinc-200 p-6 dark:border-zinc-800'
            }
          >
            {item.image ? (
              <ImageWithFallback
                src={item.image}
                fallbackSrc={item.fallback_image || item.image_fallback || ''}
                alt={team && item.name ? `Portrait of ${item.name}` : position || ''}
                className={team ? 'h-64 w-full object-cover md:h-72' : 'mb-4 aspect-[4/3] w-full rounded-lg object-cover'}
                loading="lazy"
              />
            ) : null}
            <div className={team || item.image ? 'p-5' : ''}>
              {team ? (
                <>
                  {item.name ? <h3 className="text-lg font-semibold">{item.name}</h3> : position ? <h3 className="text-lg font-semibold">{position}</h3> : null}
                  {item.name && position ? <p className="mt-1 text-sm font-semibold text-orange-600 dark:text-orange-400">{position}</p> : null}
                </>
              ) : position ? (
                <h3 className="text-lg font-semibold">{position}</h3>
              ) : null}
              {item.description ? (
                <p className={`text-sm text-zinc-600 dark:text-zinc-300 ${team ? (item.name || position ? 'mt-2' : '') : position ? 'mt-2' : ''}`}>{item.description}</p>
              ) : null}
            </div>
          </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function FaqBlock({ content }) {
  const items = content?.items || []
  return (
    <section className="mx-auto max-w-3xl px-8 py-16 md:px-12">
      {content?.title ? <h2 className="text-2xl font-semibold">{content.title}</h2> : null}
      <dl className="mt-8 space-y-6">
        {items.map((item, i) => (
          <div key={i}>
            <dt className="font-semibold text-zinc-900 dark:text-zinc-100">{item.question}</dt>
            <dd className="mt-2 text-zinc-600 dark:text-zinc-300">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function CtaBlock({ content }) {
  const c = content || {}
  const banner = c.variant === 'banner'
  return (
    <section
      className={banner ? `${MOVEMENT_CTA_GRADIENT} text-center` : 'mx-auto max-w-4xl px-8 py-16 text-center md:px-12'}
    >
      <div className={banner ? 'mx-auto max-w-3xl px-6' : ''}>
        {c.eyebrow ? (
          <span className={banner ? MOVEMENT_CTA_EYEBROW : 'mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500'}>
            {c.eyebrow}
          </span>
        ) : null}
        {c.title ? (
          <h2 className={banner ? MOVEMENT_CTA_HEADLINE : 'text-2xl font-black md:text-4xl'}>{c.title}</h2>
        ) : null}
        {c.body ? (
          <p className={banner ? MOVEMENT_CTA_BODY : 'mt-4 text-[17px] leading-relaxed text-zinc-600 dark:text-zinc-300'}>
            {c.body}
          </p>
        ) : null}
        <div className={banner ? MOVEMENT_CTA_ACTIONS : 'mt-8 flex flex-wrap justify-center gap-3'}>
          {c.primary_label ? (
            <Link
              to={c.primary_href || '#'}
              className={
                banner
                  ? MOVEMENT_CTA_BTN_PRIMARY
                  : 'rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900'
              }
            >
              {c.primary_label}
            </Link>
          ) : null}
          {c.secondary_label ? (
            <Link
              to={c.secondary_href || '#'}
              className={
                banner
                  ? MOVEMENT_CTA_BTN_SECONDARY
                  : 'rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium'
              }
            >
              {c.secondary_label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function StatsBlock({ content }) {
  const items = content?.items || []
  const dark = content?.variant === 'dark' || content?.style === 'dark'
  const Tag = dark ? 'div' : 'section'
  return (
    <Tag className={dark ? 'bg-gradient-to-r from-zinc-900 to-zinc-800 py-12' : 'mx-auto max-w-7xl px-8 py-16 md:px-12'}>
      <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${dark ? 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-10' : ''}`}>
        {items.map((item, i) => (
          <div
            key={i}
            className={
              dark
                ? 'text-center'
                : 'rounded-lg border border-zinc-200 p-6 text-center dark:border-zinc-800'
            }
          >
            <p className={`text-3xl font-black tabular-nums ${dark ? 'text-orange-400 md:text-4xl' : 'font-semibold'}`}>
              {item.value}
            </p>
            <p className={`mt-1 text-sm ${dark ? 'text-xs uppercase tracking-[0.18em] text-zinc-300' : 'text-zinc-500'}`}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </Tag>
  )
}

function TestimonialsBlock({ content }) {
  const items = content?.items || []
  if (!items.length) return null
  return (
    <section className="bg-zinc-50 py-20 md:py-28 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        {content?.title ? (
          <h2 className="text-center text-3xl font-black tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            {content.title}
          </h2>
        ) : null}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <article
              key={i}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              {item.quote ? (
                <p className="flex-1 text-[16px] leading-[1.7] text-zinc-700 dark:text-zinc-300">&ldquo;{item.quote}&rdquo;</p>
              ) : null}
              <div className="mt-6 flex items-center gap-3">
                {item.avatar ? (
                  <img src={item.avatar} alt="" className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                ) : null}
                {item.name ? <span className="font-semibold text-zinc-900 dark:text-white">{item.name}</span> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CustomHtmlBlock({ content }) {
  const html = content?.html || ''
  if (!html) return null
  return <section className="cms-custom-html" dangerouslySetInnerHTML={{ __html: html }} />
}

function VideoGalleryBlock({ content }) {
  const c = content || {}
  const items = (c.items || [])
    .map((item) => ({
      url: item.url || item.video || item.src || '',
      title: item.title || '',
      caption: item.caption || item.description || '',
      poster: item.poster || item.poster_image || '',
    }))
    .filter((item) => item.url)
  return (
    <section className="mx-auto max-w-7xl px-8 py-16 md:px-12 lg:px-10">
      {c.eyebrow ? <p className="text-xs uppercase tracking-[0.18em] text-orange-500">{c.eyebrow}</p> : null}
      {c.title ? <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{c.title}</h2> : null}
      {c.subtitle ? <p className="mt-3 text-zinc-600 dark:text-zinc-300">{c.subtitle}</p> : null}
      <div className={c.title || c.subtitle || c.eyebrow ? 'mt-10' : ''}>
        <GalleryVideoGrid items={items} />
      </div>
    </section>
  )
}

function GalleryBlock({ content }) {
  const c = content || {}
  const albums = resolveGalleryAlbums({ galleryBlockContent: c })
  if (!albums.length) return null
  return (
    <section className="mx-auto max-w-7xl px-8 py-16 md:px-12 lg:px-10">
      {c.eyebrow ? <p className="text-xs uppercase tracking-[0.18em] text-orange-500">{c.eyebrow}</p> : null}
      {c.title ? <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{c.title}</h2> : null}
      {c.subtitle ? <p className="mt-3 text-zinc-600 dark:text-zinc-300">{c.subtitle}</p> : null}
      <div className={c.title || c.subtitle || c.eyebrow ? 'mt-10' : ''}>
        <GalleryAlbums albums={albums} />
      </div>
    </section>
  )
}

const BLOCK_RENDERERS = {
  hero: HeroBlock,
  text: TextBlock,
  rich_text: RichTextBlock,
  features: FeaturesBlock,
  faq: FaqBlock,
  cta: CtaBlock,
  stats: StatsBlock,
  testimonials: TestimonialsBlock,
  gallery: GalleryBlock,
  video_gallery: VideoGalleryBlock,
  team: FeaturesBlock,
  pricing: FeaturesBlock,
  partners: FeaturesBlock,
  custom_html: CustomHtmlBlock,
}

export function CmsBlockRenderer({ block }) {
  if (!block?.block_type) return null
  const Comp = BLOCK_RENDERERS[block.block_type]
  if (!Comp) {
    return (
      <section className="mx-auto max-w-3xl px-8 py-8 text-sm text-zinc-500">
        Unknown block type: {block.block_type}
      </section>
    )
  }
  return <Comp content={block.content} />
}

export function CmsPageBlocks({ blocks }) {
  if (!blocks?.length) return null
  return (
    <>
      {blocks.map((block) => (
        <CmsBlockRenderer key={block.id} block={block} />
      ))}
    </>
  )
}
