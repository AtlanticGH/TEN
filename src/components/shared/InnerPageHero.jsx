import { LAYOUT_CONTAINER, SITE_HERO_OFFSET } from '../layout/headerTokens'

/**
 * InnerPageHero — reusable hero for inner pages (About, Programs, Resources, Contact…)
 * Replaces the repeated copy-paste hero pattern across inner pages.
 *
 * Props:
 *   badge      – small uppercase label
 *   heading    – h1 text
 *   description – paragraph below heading
 *   image      – background image URL
 *   imageAlt   – alt text (defaults to empty for decorative bg)
 */
export function InnerPageHero({ badge, heading, description, image, className = '' }) {
  return (
    <section
      id="home-gateway"
      data-section="hero-gateway"
      className={['relative overflow-hidden bg-zinc-950', className].join(' ')}
    >
      {/* Background */}
      {image && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('${image}')` }}
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-zinc-950/72 via-zinc-950/60 to-zinc-950/88"
      />

      <div className={`relative ${LAYOUT_CONTAINER} pb-16 md:pb-20 ${SITE_HERO_OFFSET}`}>
        {badge && (
          <p className="mb-5 inline-flex rounded-full border border-white/25 bg-white/[0.08] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-200/90 backdrop-blur">
            {badge}
          </p>
        )}
        <h1 className="max-w-[660px] text-[clamp(1.8rem,5vw,3.5rem)] font-extrabold leading-[1.06] tracking-[-0.02em] text-white">
          {heading}
        </h1>
        {description && (
          <p className="mt-5 max-w-[520px] text-[15px] leading-[1.65] text-zinc-200/80 md:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
