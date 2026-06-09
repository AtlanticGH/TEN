import { Link } from 'react-router-dom'
import { useHomePageContent } from '../../hooks/useHomePageContent'
import { enrichFireItems } from '../../lib/homeFireStyles'
import { resolveProgramIcon } from '../../lib/homeProgramIcons'
import { TorchbearerSection } from '../marketing/TorchbearerSection'
import { Reveal } from '../shared/Reveal'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { useHomeTorchbearer } from '../../hooks/usePeopleContent'
import { HomeWhoStatsBar } from './HomeWhoStatsBar'
import {
  HOME_CONTAINER,
  HOME_EYEBROW,
  HOME_HEADLINE,
  HOME_SECTION_PAD,
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
  const { data: page } = useHomePageContent()
  const { data: torchbearer } = useHomeTorchbearer()

  const purpose = page.purpose
  const who = page.who
  const story = who.story
  const fireItems = enrichFireItems(who.fire.items)
  const programs = page.programs
  const growth = programs.growth_cycle
  const community = page.community
  const testimonials = page.testimonials
  const cta = page.cta

  return (
    <>
      <section className={`bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-700 ${HOME_SECTION_PAD}`}>
        <div className={`${HOME_CONTAINER} flex flex-col items-center text-center`}>
          <Reveal className="max-w-[640px]">
            <span className={HOME_EYEBROW}>{purpose.eyebrow}</span>
            <h2 className={`${HOME_HEADLINE} text-white`}>{purpose.title}</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-400">{purpose.description}</p>
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
            <span className={HOME_EYEBROW}>{who.eyebrow}</span>
            <h2 className={`${HOME_HEADLINE} text-zinc-900 dark:text-white`}>{who.title}</h2>
            {who.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="mx-auto mt-5 max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 first:mt-0 dark:text-zinc-400"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal
            as="article"
            delay={100}
            className="group mt-14 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-md shadow-zinc-200/40 ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:ring-zinc-800/70"
          >
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col justify-center gap-10 p-8 md:p-10 lg:p-12">
                {story.sections.map((section, i) => (
                  <div
                    key={section.eyebrow}
                    className={i > 0 ? 'border-t border-zinc-200 pt-10 dark:border-zinc-800' : ''}
                  >
                    <p className={HOME_EYEBROW}>{section.eyebrow}</p>
                    <h3 className="text-2xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white md:text-3xl">
                      {section.title}
                    </h3>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)} className="mt-4 text-[16px] leading-[1.7] text-zinc-600 dark:text-zinc-300">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="relative min-h-[280px] overflow-hidden lg:min-h-full">
                <ImageWithFallback
                  src={story.image.src}
                  fallbackSrc="/assets/images/1520607162513-77705c0f0d4a.jpg"
                  alt={story.image.alt}
                  className="h-full min-h-[280px] w-full object-cover transition duration-700 group-hover:scale-105 lg:min-h-full"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[who.mission, who.vision].map((card) => (
              <Reveal
                key={card.eyebrow}
                as="article"
                delay={card === who.mission ? 100 : 200}
                className="overflow-hidden rounded-2xl border border-orange-100 bg-orange-50/60 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <ImageWithFallback
                  src={card.image}
                  alt={card.image_alt}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-8">
                  <p className={HOME_EYEBROW}>{card.eyebrow}</p>
                  <p className="text-[16px] leading-[1.7] text-zinc-700 dark:text-zinc-300">{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-20 text-center">
            <span className={HOME_EYEBROW}>{who.fire.eyebrow}</span>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              {who.fire.title}
            </h3>
          </Reveal>
        </div>

        <Reveal delay={100} className="mt-10 w-full">
          <div className="grid min-h-[280px] grid-cols-1 sm:grid-cols-2 lg:min-h-[320px] lg:grid-cols-4">
            {fireItems.map(({ letter, title, body, panelClass, letterClass, accentClass, titleClass, bodyClass }) => (
              <article
                key={letter}
                className={`flex h-full flex-col justify-center px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 ${panelClass}`}
              >
                <span className={`text-5xl font-black leading-none lg:text-6xl ${letterClass}`}>{letter}</span>
                <div className={`mt-4 mb-5 h-[3px] w-12 shrink-0 rounded-full ${accentClass}`} />
                <h4 className={`text-lg font-bold lg:text-xl ${titleClass}`}>{title}</h4>
                <p className={`mt-3 max-w-sm text-sm leading-relaxed lg:text-[15px] ${bodyClass}`}>{body}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="home-stats-torchbearer" data-section="stats-torchbearer" className="overflow-hidden">
        <HomeWhoStatsBar stats={who.stats} />
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
              {page.quote.text}
            </blockquote>
            <p className="mt-8 font-semibold text-orange-200">{page.quote.attribution}</p>
          </div>
        </Reveal>
      </section>

      <section className={`bg-white ${HOME_SECTION_PAD} dark:bg-zinc-950`}>
        <div className={HOME_CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={HOME_EYEBROW}>{programs.eyebrow}</span>
            <h2 className={`${HOME_HEADLINE} text-zinc-900 dark:text-white`}>{programs.title}</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              {programs.description}
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.items.map((program, i) => {
              const Icon = resolveProgramIcon(program.icon)
              return (
                <Reveal
                  key={program.title}
                  as="article"
                  delay={(i % 3) * 100}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="h-[3px] w-full bg-gradient-to-r from-orange-500 to-amber-400" />
                  <div className="p-6">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-colors duration-300 group-hover:bg-orange-100 dark:bg-orange-500/10">
                      <Icon />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">{program.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{program.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
          <Reveal className="mt-20 text-center">
            <span className={HOME_EYEBROW}>{growth.eyebrow}</span>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              {growth.title}
            </h3>
          </Reveal>
          <div className="relative mt-12 flex flex-col gap-8 md:flex-row md:gap-6">
            <div
              className="absolute left-0 right-0 top-6 hidden h-[2px] bg-gradient-to-r from-orange-500/40 via-orange-500/40 to-amber-400/40 md:block"
              aria-hidden="true"
            />
            {growth.items.map(({ num, title, tagline, body }, i) => (
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
            <span className={HOME_EYEBROW}>{community.eyebrow}</span>
            <h2 className={`${HOME_HEADLINE} text-zinc-900 dark:text-white`}>{community.title}</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              {community.description}
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {community.tiers.map(({ name, desc, cta: tierCta, to, featured }, i) => (
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
                  {tierCta}
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16">
            <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {community.benefits.map((benefit) => (
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
            <span className={HOME_EYEBROW}>{testimonials.eyebrow}</span>
            <h2 className={`${HOME_HEADLINE} text-zinc-900 dark:text-white`}>{testimonials.title}</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              {testimonials.description}
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.items.map(({ name, quote, avatar }, i) => (
              <Reveal
                key={name}
                as="article"
                delay={(i + 1) * 100}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <p className="flex-1 text-[16px] leading-[1.7] text-zinc-700 dark:text-zinc-300">&ldquo;{quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  {avatar ? (
                    <img src={avatar} alt={`${name} avatar`} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
                      {name.slice(0, 1)}
                    </div>
                  )}
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
            <span className={MOVEMENT_CTA_EYEBROW}>{cta.eyebrow}</span>
            <h2 className={MOVEMENT_CTA_HEADLINE}>{cta.title}</h2>
            <p className={MOVEMENT_CTA_BODY}>{cta.body}</p>
            <div className={MOVEMENT_CTA_ACTIONS}>
              <Link to={cta.primary_href} className={MOVEMENT_CTA_BTN_PRIMARY}>
                {cta.primary_label}
              </Link>
              <Link to={cta.secondary_href} className={MOVEMENT_CTA_BTN_SECONDARY}>
                {cta.secondary_label}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
