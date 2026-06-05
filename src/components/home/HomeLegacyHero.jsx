import { Link } from 'react-router-dom'
import { HeroHeadline } from './HeroHeadlineLines'

const CONTAINER = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-10'
const ORANGE_GRADIENT = { backgroundImage: 'linear-gradient(135deg, #F97316, #FBBF24)' }
const HERO_IMAGE_FALLBACK = '/assets/images/1523240795612-9a054b0db644.jpg'

/** Legacy home gateway hero (used when no CMS hero block). */
export function HomeLegacyHero({ heroCopy, preview = false }) {
  const c = heroCopy || {}
  const heroImage = c.background_image || HERO_IMAGE_FALLBACK
  const heroVideo = c.background_video

  const CtaTag = preview ? 'span' : Link

  return (
    <section
      id={preview ? undefined : 'home-gateway'}
      data-section="hero-gateway"
      data-hero-preview={preview ? '' : undefined}
      className={
        preview
          ? 'relative flex min-h-[32rem] flex-col justify-center overflow-hidden bg-[#0A0A0A]'
          : 'relative flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-[#0A0A0A]'
      }
    >
      {heroVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          poster={heroImage}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        >
          <source src={heroVideo} />
        </video>
      ) : (
        <img
          src={heroImage}
          alt="Entrepreneurs collaborating around a table"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 50%, rgba(10,10,10,0.95) 100%)',
        }}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 ${CONTAINER} ${
          preview ? 'pb-16 pt-24 md:pb-20 md:pt-28' : 'pb-28 pt-36 md:pb-32 md:pt-40'
        }`}
      >
        <div className="max-w-4xl">
          {c.badge ? (
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400">{c.badge}</p>
          ) : null}
          <h1 className="text-[clamp(1.875rem,4.5vw,3.5rem)] font-black leading-[1.08] tracking-tight text-white ten-hero-text-shadow">
            <HeroHeadline
              before={c.headline_before}
              emphasis={c.headline_emphasis}
              emphasisClassName="bg-clip-text text-transparent"
              emphasisStyle={{ ...ORANGE_GRADIENT, WebkitBackgroundClip: 'text' }}
            />
          </h1>
          {c.description ? (
            <p className="mt-7 max-w-[640px] text-[17px] leading-[1.7] text-zinc-200/90">{c.description}</p>
          ) : null}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            {c.cta_primary_label ? (
              <CtaTag
                {...(preview ? {} : { to: c.cta_primary_href || '/community' })}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-orange-500 px-8 text-[15px] font-bold text-white shadow-glow transition-all duration-200 ease-out hover:bg-orange-400 active:scale-[0.98] sm:w-auto"
              >
                {c.cta_primary_label}
              </CtaTag>
            ) : null}
            {c.cta_secondary_label ? (
              <CtaTag
                {...(preview ? {} : { to: c.cta_secondary_href || '/community' })}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white/40 px-8 text-[15px] font-bold text-white backdrop-blur-sm transition-all duration-200 ease-out hover:border-white hover:bg-white/10 active:scale-[0.98] sm:w-auto"
              >
                {c.cta_secondary_label}
              </CtaTag>
            ) : null}
          </div>
        </div>
      </div>

      {preview ? null : (
        <div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-[scroll-bounce_1.5s_ease-in-out_infinite]"
          aria-hidden="true"
        >
          <svg className="h-6 w-6 text-white/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </section>
  )
}
