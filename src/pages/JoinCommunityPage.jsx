import { Link } from 'react-router-dom'
import { PageMeta } from '../components/cms/PageMeta'
import {
  MOVEMENT_CTA_ACTIONS,
  MOVEMENT_CTA_BODY,
  MOVEMENT_CTA_BTN_PRIMARY,
  MOVEMENT_CTA_BTN_SECONDARY,
  MOVEMENT_CTA_EYEBROW,
  MOVEMENT_CTA_FOOTNOTE,
  MOVEMENT_CTA_HEADLINE,
  MOVEMENT_CTA_SOLID,
} from '../components/home/homeContentData.jsx'
import { PageHeroSection } from '../components/shared/PageHeroSection'
import { Reveal } from '../components/shared/Reveal'
import {
  COMMUNITY_APPLY_HREF,
  COMMUNITY_AUDIENCES,
  COMMUNITY_BENEFITS,
  COMMUNITY_MEMBERSHIP_TIERS,
  COMMUNITY_PILLARS,
  COMMUNITY_TESTIMONIALS,
} from '../config/communityPageContent'
import { useCmsPage } from '../hooks/useCmsPage'

const CONTAINER = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-10'
const EYEBROW = 'mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500'
const HEADLINE = 'text-4xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white md:text-5xl'

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

function CommunityHeroActions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      <Link
        to={COMMUNITY_APPLY_HREF}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-bold text-white shadow-glow transition hover:bg-orange-400 sm:w-auto"
      >
        Become an Ember
      </Link>
      <Link
        to="/programs"
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border-2 border-white/40 px-6 text-sm font-bold text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
      >
        Explore Programs
      </Link>
    </div>
  )
}

export function JoinCommunityPage() {
  const { seo } = useCmsPage('community')

  return (
    <>
      <PageMeta
        title={seo?.title || 'Community'}
        description={seo?.description || 'Join The Ember Network community.'}
        robots={seo?.robots}
      />
      <main id="page-main" data-component="page-main" data-cms-page="community" className="overflow-x-hidden">
        <PageHeroSection slug="community" actions={<CommunityHeroActions />} />
        <JoinCommunityPageContent />
      </main>
    </>
  )
}

function JoinCommunityPageContent() {
  return (
    <>
      <section id="who-can-join" data-section="community-audiences" className="bg-zinc-100/80 py-16 md:py-24 dark:bg-zinc-900/60">
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>Community Hub</span>
            <h2 className={HEADLINE}>Who Can Join TEN</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              TEN brings together aspiring entrepreneurs, early-stage founders, and experts in one collaborative
              ecosystem.
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {COMMUNITY_AUDIENCES.map(({ title, summary, detail }, i) => (
              <Reveal
                key={title}
                as="article"
                delay={(i + 1) * 80}
                className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-300">{summary}</p>
                <p className="mt-4 border-t border-zinc-200 pt-4 text-sm leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  {detail}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24 dark:bg-zinc-950">
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>Why Join</span>
            <h2 className={HEADLINE}>A Community Built for Builders</h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {COMMUNITY_PILLARS.map(({ title, body }, i) => (
              <Reveal
                key={title}
                as="article"
                delay={(i + 1) * 100}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-400">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="membership"
        data-section="membership-tiers"
        className="border-t border-zinc-200 bg-gradient-to-b from-orange-50/80 to-white py-16 md:py-24 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950"
      >
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>Membership</span>
            <h2 className={HEADLINE}>Find Your Circle</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              TEN reviews applications for alignment with our mission and FIRE values before onboarding approved
              members.
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {COMMUNITY_MEMBERSHIP_TIERS.map(({ name, desc, cta, featured }, i) => (
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
                  to={COMMUNITY_APPLY_HREF}
                  className={[
                    'mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full px-8 text-[15px] font-bold transition-all duration-200 ease-out active:scale-[0.98]',
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
        </div>
      </section>

      <section className="bg-zinc-950 py-16 md:py-24">
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={`${EYEBROW} text-orange-400`}>Member Benefits</span>
            <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              Everything You Need to Grow
            </h2>
          </Reveal>
          <Reveal className="mt-12">
            <ul className="mx-auto grid max-w-3xl grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {COMMUNITY_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-[15px] text-zinc-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section id="stories" data-section="member-stories" className="bg-white py-16 md:py-24 dark:bg-zinc-950">
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>Member Stories</span>
            <h2 className={HEADLINE}>Real Progress From Our Founder Community</h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {COMMUNITY_TESTIMONIALS.map(({ name, quote }, i) => (
              <Reveal
                key={name}
                as="blockquote"
                delay={(i + 1) * 80}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <p className="text-[15px] leading-[1.7]">&ldquo;{quote}&rdquo;</p>
                <footer className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-orange-600 dark:text-orange-400">
                  {name}
                </footer>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to={COMMUNITY_APPLY_HREF}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-bold text-white transition hover:bg-orange-400"
            >
              Apply to Join
            </Link>
            <Link
              to="/resources"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-zinc-300 px-6 text-sm font-bold text-zinc-800 transition hover:border-orange-500 hover:text-orange-600 dark:border-zinc-700 dark:text-white"
            >
              View Resources
            </Link>
          </Reveal>
        </div>
      </section>

      <section className={MOVEMENT_CTA_SOLID}>
        <div className={`${CONTAINER} text-center`}>
          <Reveal className="mx-auto max-w-3xl">
            <span className={MOVEMENT_CTA_EYEBROW}>Join The Movement</span>
            <h2 className={MOVEMENT_CTA_HEADLINE}>Your Spark Belongs Here</h2>
            <p className={MOVEMENT_CTA_BODY}>
              Take the first step. Apply today and join a community committed to turning bold ideas into thriving
              ventures.
            </p>
            <div className={MOVEMENT_CTA_ACTIONS}>
              <Link to={COMMUNITY_APPLY_HREF} className={MOVEMENT_CTA_BTN_PRIMARY}>
                Become An Ember
              </Link>
              <Link to="/contact" className={MOVEMENT_CTA_BTN_SECONDARY}>
                Talk To Us
              </Link>
            </div>
            <p className={MOVEMENT_CTA_FOOTNOTE}>info@theembernetwork.com &middot; +233 50 940 4673</p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
