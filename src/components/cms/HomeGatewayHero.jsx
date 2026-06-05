import { Link } from 'react-router-dom'
import { HeroHeadline, HeroHeadlineLines } from '../home/HeroHeadlineLines'

const ORANGE_GRADIENT = { backgroundImage: 'linear-gradient(135deg, #F97316, #FBBF24)' }

/** Full-viewport home hero (matches marketing HomePage gateway). */
export function HomeGatewayHero({ content }) {
  const c = content || {}
  const image = c.background_image || c.image || ''
  const video = c.background_video

  return (
    <section
      id="home-gateway"
      data-section="hero-gateway"
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-[#0A0A0A]"
    >
      {video ? (
        <video className="absolute inset-0 h-full w-full object-cover" poster={image} autoPlay muted loop playsInline aria-hidden="true">
          <source src={video} />
        </video>
      ) : image ? (
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" fetchPriority="high" />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 50%, rgba(10,10,10,0.95) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-36 sm:px-8 md:pb-32 md:pt-40 lg:px-10">
        <div className="max-w-4xl">
          {c.badge ? (
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400">{c.badge}</p>
          ) : null}
          <h1 className="text-[clamp(1.875rem,4.5vw,3.5rem)] font-black leading-[1.08] tracking-tight text-white">
            <HeroHeadline
              before={c.headline_before}
              emphasis={c.headline_emphasis}
              emphasisClassName="bg-clip-text text-transparent"
              emphasisStyle={{ ...ORANGE_GRADIENT, WebkitBackgroundClip: 'text' }}
            />
            {!c.headline_before && !c.headline_emphasis && c.headline ? (
              <HeroHeadlineLines text={c.headline} />
            ) : null}
          </h1>
          {c.description || c.subheadline ? (
            <p className="mt-7 max-w-[640px] text-[17px] leading-[1.7] text-zinc-200/90">{c.description || c.subheadline}</p>
          ) : null}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            {(c.cta_primary_label || c.primary_label) && (
              <Link
                to={c.cta_primary_href || c.primary_href || '/community'}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-orange-500 px-8 text-[15px] font-bold text-white shadow-glow transition hover:bg-orange-400 sm:w-auto"
              >
                {c.cta_primary_label || c.primary_label}
              </Link>
            )}
            {(c.cta_secondary_label || c.secondary_label) && (
              <Link
                to={c.cta_secondary_href || c.secondary_href || '/community'}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white/40 px-8 text-[15px] font-bold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10 sm:w-auto"
              >
                {c.cta_secondary_label || c.secondary_label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
