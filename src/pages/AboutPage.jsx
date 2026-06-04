import { Link } from 'react-router-dom'
import { CmsPageBlocks } from '../components/cms/CmsBlockRenderer'
import { PageMeta } from '../components/cms/PageMeta'
import {
  FounderProfileSection,
  TeamGridSection,
} from '../components/cms/marketing/AboutMarketingBlocks'
import { PageHeroSection } from '../components/shared/PageHeroSection'
import { blocksWithoutHero } from '../lib/cmsBlocks'
import { Reveal } from '../components/shared/Reveal'
import { useCmsPage } from '../hooks/useCmsPage'
import { useAboutFounder, useAboutTeam } from '../hooks/usePeopleContent'
import { isAboutPeopleCmsBlock } from '../lib/aboutPeopleBlocks'

export function AboutPage() {
  const { blocks, hasBlocks, loading, seo } = useCmsPage('about')
  const { data: founder } = useAboutFounder()
  const { data: team } = useAboutTeam()

  if (loading && !hasBlocks) {
    return <AboutPageFallback founder={founder} team={team} />
  }

  if (hasBlocks) {
    const filtered = blocksWithoutHero((blocks || []).filter((b) => !isAboutPeopleCmsBlock(b)))
    return (
      <>
        <PageMeta title={seo?.title} description={seo?.description} robots={seo?.robots} />
        <main id="page-main" data-component="page-main" data-cms-page="about" className="overflow-x-hidden">
          <PageHeroSection slug="about" />
          {filtered.length ? <CmsPageBlocks blocks={filtered} /> : null}
          {founder ? <FounderProfileSection content={founder} /> : null}
          {team ? <TeamGridSection content={team} /> : null}
        </main>
      </>
    )
  }

  return <AboutPageFallback founder={founder} team={team} />
}

function AboutPeopleSections({ founder, team }) {
  return (
    <>
      {founder ? <FounderProfileSection content={founder} /> : null}
      {team ? <TeamGridSection content={team} /> : null}
    </>
  )
}

function AboutPageFallback({ founder, team }) {
  return (
    <>
      <PageMeta title="About" description="Who we are and why TEN exists." />
      <main id="page-main" data-component="page-main" className="overflow-x-hidden">
        <AboutPageCore />
        <AboutPeopleSections founder={founder} team={team} />
        <AboutPageTail />
      </main>
    </>
  )
}

function AboutPageCore() {
  return (
    <>
      <PageHeroSection slug="about" />

      <section id="vision-mission" data-section="vision-mission" className="mx-auto grid max-w-7xl gap-10 px-8 py-20 md:px-12 lg:grid-cols-2 lg:px-10">
        <Reveal as="article" className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
          <h2 className="text-2xl font-semibold">Vision</h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">
            To build a global network of forward-thinking entrepreneurs who drive innovation, lead with resilience, and create meaningful impact.
          </p>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">
            We envision a world where young founders transform industries, uplift communities and shape the future through purposeful, sustainable businesses.
          </p>
        </Reveal>
        <Reveal as="article" className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
          <h2 className="text-2xl font-semibold">Mission</h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">
            To ignite and sustain a thriving entrepreneurial ecosystem that empowers young innovators through mentorship, resources, and opportunities to transform bold ideas into lasting ventures.
          </p>
        </Reveal>
      </section>

      <section id="fire-values" data-section="fire-values" className="mx-auto max-w-7xl px-8 pb-10 md:px-12 lg:px-10">
        <Reveal as="article" className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">The Ember Circle</p>
          <h2 className="mt-2 text-2xl font-semibold">Our Core Values</h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">We embody the spirit of FIRE, a philosophy that fuels our mission.</p>
          <ul className="mt-5 grid gap-3 text-sm text-zinc-600 dark:text-zinc-300">
            <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
              <p><strong>F - Fostering Potential:</strong> We believe every great entrepreneur starts somewhere. We cultivate an environment where raw potential is refined into real-world success.</p>
            </li>
            <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
              <p><strong>I - Igniting Innovation:</strong> Bold ideas drive change. We encourage creative problem-solving, disruptive thinking, and pioneering leadership.</p>
            </li>
            <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
              <p><strong>R - Resilience in Action:</strong> Every journey has setbacks, but we view challenges as stepping stones. We instill perseverance, adaptability, and a mindset that thrives under pressure.</p>
            </li>
            <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
              <p><strong>E - Empowering Growth:</strong> Mentorship, knowledge, and strategic partnerships ignite success. We equip our members with the tools to elevate themselves and their ventures.</p>
            </li>
          </ul>
        </Reveal>
      </section>

      <section id="why-join-us" data-section="why-join-us" className="mx-auto max-w-7xl px-8 pb-10 md:px-12 lg:px-10">
        <Reveal as="article" className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="min-h-[250px]">
              <img
                src="/assets/images/1520607162513-77705c0f0d4a.jpg"
                alt="Entrepreneurs collaborating in a learning session"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Why Join Us</p>
              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">What members gain at TEN</h2>
              <ul className="mt-5 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300 md:grid-cols-2">
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Access to Mentorship</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Collaborative Network</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Increased Visibility &amp; Business Exposure</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Access to Exclusive Resources</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Access to Funding &amp; Opportunities</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Personal Development</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Hands-on Learning Opportunities</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Networking with Seasoned Industry Professionals &amp; Entrepreneurs</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}

function AboutPageTail() {
  return (
    <>
      <section id="about-cta" data-section="about-cta" className="mx-auto max-w-7xl px-8 pb-20 md:px-12 lg:px-10">
        <div className="mb-6 flex flex-wrap gap-2">
          <a href="https://www.instagram.com/theembernetwork" className="inline-flex rounded-full bg-orange-500 px-4 py-2 text-xs tracking-[0.12em] text-white transition hover:bg-orange-400" target="_blank" rel="noopener noreferrer">
            The Ember Network Instagram
          </a>
          <a href="https://www.linkedin.com/company/theembernetwork" className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs tracking-[0.12em] text-zinc-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300" target="_blank" rel="noopener noreferrer">
            The Ember Network LinkedIn
          </a>
          <a href="https://www.facebook.com/theembernetwork" className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs tracking-[0.12em] text-zinc-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300" target="_blank" rel="noopener noreferrer">
            The Ember Network Facebook
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/programs" className="inline-flex rounded-full bg-orange-500 px-5 py-2 font-medium text-white">
            Continue to Programs
          </Link>
          <Link to="/apply" className="inline-flex rounded-full border border-zinc-300 px-5 py-2 font-medium text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200">
            Apply to Join
          </Link>
          <Link to="/resources" className="inline-flex rounded-full border border-zinc-300 px-5 py-2 font-medium text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200">
            Explore Resources
          </Link>
        </div>
      </section>

      <section id="highlights-ticker" data-section="highlights-ticker" className="overflow-hidden border-y border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="animate-marquee whitespace-nowrap text-sm font-medium text-zinc-500">
          <span className="mx-6">Entrepreneur of the week: Maya - scaling eco logistics</span>
          <span className="mx-6">Testimonial: I found my cofounder in two weeks</span>
          <span className="mx-6">Spotlight: AI mentor circles now open worldwide</span>
          <span className="mx-6">New challenge: Build a social-impact prototype in 30 days</span>
          <span className="mx-6">Entrepreneur of the week: Maya - scaling eco logistics</span>
          <span className="mx-6">Testimonial: I found my cofounder in two weeks</span>
        </div>
      </section>
    </>
  )
}
