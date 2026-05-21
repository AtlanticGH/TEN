import { Link } from 'react-router-dom'
import { Reveal } from '../components/shared/Reveal'
import { useHomeHero } from '../hooks/useHomeHero'

export function HomePage() {
  const { heroCopy, bg, bgReady, isRefreshing } = useHomeHero()

  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        id="home-gateway"
        data-section="hero-gateway"
        className="relative min-h-[100dvh] overflow-hidden bg-zinc-950"
      >
        {/* Background image */}
        {bg ? (
          <div
            aria-hidden="true"
            className={[
              'absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out',
              bgReady ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            style={{ backgroundImage: `url('${bg}')` }}
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-zinc-900" />
        )}
        {/* Overlay gradient — slightly more opaque for better text contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-zinc-950/95"
        />

        {/* Content */}
        <div className="relative mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-center px-6 pb-20 pt-32 sm:px-8 md:px-12 md:pb-24 lg:px-10">
          <div
            className={[
              'ten-hero-content max-w-6xl transition-opacity duration-300 ease-out',
              isRefreshing ? 'opacity-[0.98]' : 'opacity-100',
            ].join(' ')}
          >
            {heroCopy.badge ? (
                  <p className="mb-6 inline-block w-fit rounded-full border border-white/25 bg-white/[0.07] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-300/90 backdrop-blur-sm">
                    {heroCopy.badge}
                  </p>
                ) : null}

                <h1 className="text-[clamp(2rem,6vw,4rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-white ten-hero-text-shadow">
                  {heroCopy.headline_before ? (
                    <span className="block text-white">{heroCopy.headline_before}</span>
                  ) : null}
                  {heroCopy.headline_emphasis ? (
                    <span className="mt-1 block bg-gradient-to-r from-orange-300 via-amber-200 to-orange-400 bg-clip-text text-orange-300">
                      {heroCopy.headline_emphasis}
                    </span>
                  ) : null}
                </h1>

                {heroCopy.description ? (
                  <p className="mt-6 max-w-5xl text-balance text-[15px] leading-snug text-zinc-200/85 md:text-[17px] md:leading-snug">
                    {heroCopy.description}
                  </p>
                ) : null}

                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <Link
                    to={heroCopy.cta_primary_href || '/apply'}
                    className="inline-flex min-h-[48px] min-w-[11rem] items-center justify-center rounded-full bg-orange-500 px-7 py-3 text-[15px] font-semibold text-white shadow-glow ring-1 ring-white/10 transition-all duration-200 ease-out hover:bg-orange-400 hover:shadow-[0_0_0_1px_rgba(249,115,22,0.2),0_12px_32px_rgba(249,115,22,0.35)] active:scale-[0.98]"
                  >
                    {heroCopy.cta_primary_label}
                  </Link>
                  <Link
                    to={heroCopy.cta_secondary_href || '/about'}
                    className="inline-flex min-h-[48px] items-center gap-1.5 justify-center rounded-full border border-white/30 bg-transparent px-6 py-3 text-[14px] font-medium text-white/80 backdrop-blur-sm transition-all duration-200 ease-out hover:border-white/50 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
                  >
                    {heroCopy.cta_secondary_label}
                    <svg className="h-3.5 w-3.5 opacity-70" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
          </div>
        </div>

        {/* Bottom wave into orange section */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-px" aria-hidden="true">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="h-16 w-full md:h-24">
            <polygon points="0,20 100,0 100,20" className="fill-orange-500" />
          </svg>
        </div>
      </section>

      {/* ── Orange CTA band ────────────────────────────────────────────── */}
      <section
        id="gateway-actions"
        data-section="gateway-actions"
        className="-mt-16 bg-orange-500 pb-20 pt-24 md:-mt-24 md:pb-28 md:pt-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-100/80">
                Ready to Build?
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Join The Ember Network today
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-orange-50/85">
                Get mentorship, structured programs, and a supportive founder ecosystem designed to help your idea grow into a lasting venture.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/apply"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-orange-600 shadow-sm transition-all duration-200 ease-out hover:bg-orange-50 hover:shadow-md active:scale-[0.98]"
              >
                Apply for Membership
              </Link>
              <Link
                to="/programs"
                className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-2.5 text-sm font-medium text-white/90 transition-all duration-200 ease-out hover:border-white hover:bg-white/10"
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── About preview ──────────────────────────────────────────────── */}
      <section
        id="about-preview"
        data-section="about-preview"
        className="bg-gradient-to-b from-white to-zinc-50/80 py-20 dark:from-zinc-950 dark:to-zinc-900/60 md:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-10">
          <Reveal className="mb-16 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
              About The Ember Network
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 md:text-[2.75rem] md:leading-[1.1]">
              Built to turn early ideas into resilient ventures
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-base">
              We combine mentorship, practical frameworks, and a founder-first community so ambitious builders can move from spark to sustainable growth.
            </p>
          </Reveal>

          <div className="grid gap-6">
            {/* Card 1 */}
            <Reveal
              as="article"
              className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-zinc-800/50"
            >
              <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                <div className="p-8 md:p-10 lg:p-12">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">Who We Are</p>
                  <h3 className="mt-4 text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl">
                    A transformative hub for emerging entrepreneurs
                  </h3>
                  <p className="mt-5 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    The Ember Network is dedicated to turning ambitious ideas into thriving enterprises. We provide mentorship, strategic guidance, and a supportive ecosystem where young visionaries gain the skills, knowledge, and connections they need to succeed.
                  </p>
                  <p className="mt-4 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    More than a network, TEN is a movement where small sparks of potential ignite into powerful flames of achievement.
                  </p>
                </div>
                <div className="relative min-h-[260px] overflow-hidden lg:min-h-full">
                  <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                    alt="Entrepreneurs collaborating in a workshop"
                    className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" aria-hidden="true" />
                </div>
              </div>
            </Reveal>

            {/* Card 2 */}
            <Reveal
              as="article"
              className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-zinc-800/50"
            >
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[260px] overflow-hidden lg:order-1 lg:min-h-full">
                  <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
                    alt="Team discussing business strategy"
                    className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" aria-hidden="true" />
                </div>
                <div className="p-8 md:p-10 lg:order-2 lg:p-12">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">Background</p>
                  <h3 className="mt-4 text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl">
                    Bridging ambition and execution
                  </h3>
                  <p className="mt-5 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Entrepreneurship begins with a spark, but it takes the right environment to turn that spark into a lasting fire. TEN was founded to close the gap between ambition and execution through structured mentorship, hands-on learning, and a strong community.
                  </p>
                  <p className="mt-4 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    We connect aspiring entrepreneurs with experienced mentors and industry leaders, creating a space where ideas are nurtured, resilience is built, and businesses take flight.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section
        id="journey-trust"
        data-section="journey-trust"
        className="mx-auto max-w-7xl px-6 py-20 sm:px-8 md:px-12 md:py-28 lg:px-10"
      >
        <Reveal className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">How It Works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl md:leading-tight">
              Simple path from idea to momentum
            </h2>
          </div>
          <Link
            to="/apply"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-glow-sm transition-all duration-200 ease-out hover:bg-orange-400 active:scale-[0.98]"
          >
            Start Application
          </Link>
        </Reveal>

        {/* Steps */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { num: '01', title: 'Understand Your Stage', body: 'Share your current stage and goals so we can align the right mentorship structure.' },
            { num: '02', title: 'Join Guided Programs',  body: 'Access practical tracks, weekly accountability, and mentor-led growth sessions.' },
            { num: '03', title: 'Build With the Network',  body: 'Grow alongside founders, experts, and peers focused on meaningful impact.' },
          ].map(({ num, title, body }) => (
            <Reveal
              key={num}
              as="article"
              className="rounded-2xl border border-zinc-200 bg-white p-7 transition-shadow duration-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">{num}</p>
              <h3 className="mt-3 text-[1.05rem] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{body}</p>
            </Reveal>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { stat: '1,200+', label: 'Mentorship Sessions' },
            { stat: '320+',   label: 'Founders Supported' },
            { stat: '94%',    label: 'Member Satisfaction' },
          ].map(({ stat, label }) => (
            <Reveal
              key={label}
              as="article"
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900/70"
            >
              <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{stat}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">{label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Highlights ticker ──────────────────────────────────────────── */}
      <section
        id="highlights-ticker"
        data-section="highlights-ticker"
        className="overflow-hidden border-y border-zinc-200 bg-zinc-50 py-4 dark:border-zinc-800 dark:bg-zinc-900/50"
        aria-label="Network highlights"
      >
        <div className="animate-marquee whitespace-nowrap text-sm font-medium text-zinc-500/80 dark:text-zinc-400/70">
          {[
            'Entrepreneur of the week: Maya — scaling eco logistics',
            'Testimonial: I found my co-founder in two weeks',
            'Spotlight: AI mentor circles now open worldwide',
            'New challenge: Build a social-impact prototype in 30 days',
            'Entrepreneur of the week: Maya — scaling eco logistics',
            'Testimonial: I found my co-founder in two weeks',
          ].map((item, i) => (
            <span key={i} className="mx-8">{item}</span>
          ))}
        </div>
      </section>
    </main>
  )
}
