import { Link } from 'react-router-dom'
import { TorchbearerSection } from '../marketing/TorchbearerSection'
import { Reveal } from '../shared/Reveal'
import { useHomeTorchbearer } from '../../hooks/usePeopleContent'
import { HomeWhoStatsBar } from './HomeWhoStatsBar'
import {
  HOME_BENEFITS,
  HOME_CONTAINER,
  HOME_EYEBROW,
  HOME_FIRE,
  HOME_GROWTH_CYCLE,
  HOME_HEADLINE,
  HOME_PROGRAMS,
  HOME_SECTION_PAD,
  HOME_TESTIMONIALS,
  HOME_TIERS,
  MOVEMENT_CTA_ACTIONS,
  MOVEMENT_CTA_BODY,
  MOVEMENT_CTA_BTN_PRIMARY,
  MOVEMENT_CTA_BTN_SECONDARY,
  MOVEMENT_CTA_EYEBROW,
  MOVEMENT_CTA_GRADIENT,
  MOVEMENT_CTA_HEADLINE,
} from './homeContentData.jsx'

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-orange-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Marketing home sections below the hero (Spark → Join CTA). */
export function HomeBelowFold() {
  const { data: torchbearer } = useHomeTorchbearer()

  return (
    <>
      <section className={`bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-700 ${HOME_SECTION_PAD}`}>
        <div className={`${HOME_CONTAINER} flex flex-col items-center text-center`}>
          <Reveal className="max-w-[640px]">
            <span className={HOME_EYEBROW}>Our Purpose</span>
            <h2 className={`${HOME_HEADLINE} text-white`}>Every Venture Begins With a Spark</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-400">
              Entrepreneurship starts with belief, but growth requires guidance, community and opportunity. The Ember
              Network exists to transform raw ambition into lasting impact.
            </p>
          </Reveal>
          <Reveal delay={150} className="mt-14">
            <div className="relative mx-auto h-28 w-28">
              {[0, 0.6, 1.2].map((delay, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-[pulse-ring_2.4s_ease-out_infinite]"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
              <div
                className="absolute inset-[22%] rounded-full animate-[ember-breathe_3s_ease-in-out_infinite]"
                style={{
                  background: 'radial-gradient(circle, #FBBF24 0%, #F97316 50%, #C2410C 100%)',
                  boxShadow: '0 0 40px rgba(249,115,22,0.8), 0 0 80px rgba(249,115,22,0.4)',
                }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white pt-20 pb-0 md:pt-28 lg:pt-32 dark:bg-zinc-950">
        <div className={HOME_CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={HOME_EYEBROW}>Who We Are</span>
            <h2 className={`${HOME_HEADLINE} text-zinc-900 dark:text-white`}>More Than A Network</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              We are a transformative ecosystem for emerging entrepreneurs, equipping ambitious innovators with
              mentorship, strategic guidance, collaboration and the tools to thrive in today&rsquo;s world.
            </p>
            <p className="mx-auto mt-5 max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              We exist to nurture bold thinkers, resilient builders and purpose-driven founders who are ready to shape
              industries and uplift communities.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Reveal
              as="article"
              delay={100}
              className="rounded-2xl border border-orange-100 bg-orange-50/60 p-8 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className={HOME_EYEBROW}>Our Mission</p>
              <p className="text-[16px] leading-[1.7] text-zinc-700 dark:text-zinc-300">
                To ignite and sustain a thriving entrepreneurial ecosystem that empowers young innovators through
                mentorship, resources and opportunities to transform bold ideas into lasting ventures.
              </p>
            </Reveal>
            <Reveal
              as="article"
              delay={200}
              className="rounded-2xl border border-orange-100 bg-orange-50/60 p-8 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className={HOME_EYEBROW}>Our Vision</p>
              <p className="text-[16px] leading-[1.7] text-zinc-700 dark:text-zinc-300">
                To build a global network of forward-thinking entrepreneurs who drive innovation, lead with resilience
                and create meaningful impact.
              </p>
            </Reveal>
          </div>

          <Reveal className="mt-20 text-center">
            <span className={HOME_EYEBROW}>The FIRE Philosophy</span>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              What Keeps Our Flame Burning
            </h3>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {HOME_FIRE.map(({ letter, title, body }, i) => (
              <Reveal
                key={letter}
                as="article"
                delay={(i + 1) * 100}
                className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-5xl font-black text-orange-500">{letter}</span>
                <div className="mt-2 mb-4 h-[3px] w-10 rounded-full bg-orange-500" />
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="home-stats-torchbearer" data-section="stats-torchbearer" className="mt-20 overflow-hidden">
        <HomeWhoStatsBar />
        <TorchbearerSection content={torchbearer} embedded />
      </section>

      <section className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-700 py-24">
        <Reveal>
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <span
              className="pointer-events-none absolute -top-8 left-0 select-none font-serif text-[9rem] leading-none text-orange-400/30"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <blockquote className="relative z-10 text-2xl font-light italic leading-relaxed text-white md:text-3xl">
              When young people are empowered with guidance and opportunity, they don&rsquo;t just build businesses
              &mdash; they transform communities.
            </blockquote>
            <p className="mt-8 font-semibold text-orange-200">&mdash; Maud Lindsay-Gamrat, Founder</p>
          </div>
        </Reveal>
      </section>

      <section className={`bg-white ${HOME_SECTION_PAD} dark:bg-zinc-950`}>
        <div className={HOME_CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={HOME_EYEBROW}>Programs &amp; Experiences</span>
            <h2 className={`${HOME_HEADLINE} text-zinc-900 dark:text-white`}>How We Build Our Founders</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              The Ember Network combines mentorship, practical learning and collaborative experiences to help
              entrepreneurs move confidently from idea to execution.
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_PROGRAMS.map(({ Icon, title, desc }, i) => (
              <Reveal
                key={title}
                as="article"
                delay={(i % 3) * 100}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="h-[3px] w-full bg-gradient-to-r from-orange-500 to-amber-400" />
                <div className="p-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-colors duration-300 group-hover:bg-orange-100 dark:bg-orange-500/10">
                    <Icon />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-20 text-center">
            <span className={HOME_EYEBROW}>The Growth Cycle</span>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              A Rhythm Built for Momentum
            </h3>
          </Reveal>
          <div className="relative mt-12 flex flex-col gap-8 md:flex-row md:gap-6">
            <div
              className="absolute left-0 right-0 top-6 hidden h-[2px] bg-gradient-to-r from-orange-500/40 via-orange-500/40 to-amber-400/40 md:block"
              aria-hidden="true"
            />
            {HOME_GROWTH_CYCLE.map(({ num, title, tagline, body }, i) => (
              <Reveal
                key={num}
                as="article"
                delay={i * 100}
                className="relative flex-1 rounded-2xl border border-orange-100 bg-orange-50/50 p-7 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-base font-black text-white">
                  {num}
                </span>
                <h4 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">{title}</h4>
                <p className="mt-1 text-sm font-semibold text-orange-600 dark:text-orange-400">{tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`bg-gradient-to-b from-orange-100 to-white ${HOME_SECTION_PAD} dark:from-zinc-900 dark:to-zinc-950`}>
        <div className={HOME_CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={HOME_EYEBROW}>Community &amp; Membership</span>
            <h2 className={`${HOME_HEADLINE} text-zinc-900 dark:text-white`}>Find Your Circle</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              Built for ambitious individuals ready to learn, collaborate and grow within a community of forward-thinking
              entrepreneurs.
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {HOME_TIERS.map(({ name, desc, cta, to, featured }, i) => (
              <Reveal
                key={name}
                as="article"
                delay={(i + 1) * 100}
                className={[
                  'relative flex flex-col rounded-2xl p-8',
                  featured
                    ? 'border-2 border-orange-500 bg-white shadow-[0_10px_40px_rgba(249,115,22,0.18)] dark:bg-zinc-900'
                    : 'border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900',
                ].join(' ')}
              >
                {featured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                    Most Popular
                  </span>
                ) : null}
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{desc}</p>
                <Link
                  to={to}
                  className={[
                    'mt-7 inline-flex min-h-[52px] items-center justify-center rounded-full px-8 text-[15px] font-bold transition-all duration-200 ease-out active:scale-[0.98]',
                    featured
                      ? 'bg-orange-500 text-white hover:bg-orange-400'
                      : 'border-2 border-zinc-300 text-zinc-800 hover:border-orange-500 hover:text-orange-600 dark:border-zinc-700 dark:text-white',
                  ].join(' ')}
                >
                  {cta}
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16">
            <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {HOME_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-[15px] text-zinc-700 dark:text-zinc-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className={`bg-zinc-50 ${HOME_SECTION_PAD} dark:bg-zinc-900`}>
        <div className={HOME_CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={HOME_EYEBROW}>Impact Stories</span>
            <h2 className={`${HOME_HEADLINE} text-zinc-900 dark:text-white`}>Sparks Becoming Success Stories</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              Every entrepreneur begins with potential. Through mentorship, collaboration and opportunity, those sparks
              evolve into stories of growth, resilience and transformation.
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOME_TESTIMONIALS.map(({ name, quote, avatar }, i) => (
              <Reveal
                key={name}
                as="article"
                delay={(i + 1) * 100}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <p className="flex-1 text-[16px] leading-[1.7] text-zinc-700 dark:text-zinc-300">&ldquo;{quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <img src={avatar} alt={`${name} avatar`} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                  <span className="font-semibold text-zinc-900 dark:text-white">{name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={MOVEMENT_CTA_GRADIENT}>
        <div className={`${HOME_CONTAINER} text-center`}>
          <Reveal className="mx-auto max-w-3xl">
            <span className={MOVEMENT_CTA_EYEBROW}>Join The Movement</span>
            <h2 className={MOVEMENT_CTA_HEADLINE}>The Future Needs Builders Like You</h2>
            <p className={MOVEMENT_CTA_BODY}>
              Your ideas matter. Your vision deserves guidance. Your future deserves community. The Ember Network exists
              to help ambitious entrepreneurs ignite their potential and build lasting impact.
            </p>
            <div className={MOVEMENT_CTA_ACTIONS}>
              <Link to="/community" className={MOVEMENT_CTA_BTN_PRIMARY}>
                Become An Ember
              </Link>
              <Link to="/community" className={MOVEMENT_CTA_BTN_SECONDARY}>
                Join The Network
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
