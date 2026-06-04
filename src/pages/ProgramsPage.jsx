import { Link } from 'react-router-dom'
import { PageMeta } from '../components/cms/PageMeta'
import { PageHeroSection } from '../components/shared/PageHeroSection'
import { ProgramCardMedia } from '../components/shared/ProgramCardMedia'
import { Reveal } from '../components/shared/Reveal'
import { useCmsPage } from '../hooks/useCmsPage'
import { useProgramsContent } from '../hooks/useProgramsContent'

const CONTAINER = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-10'
const EYEBROW = 'mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500'
const HEADLINE = 'text-4xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white md:text-5xl'

export function ProgramsPage() {
  const { seo } = useCmsPage('programs')
  const { content, cards, growthStages } = useProgramsContent()

  return (
    <>
      <PageMeta
        title={seo?.title || 'Programs'}
        description={seo?.description || 'Programs and experiences at The Ember Network.'}
        robots={seo?.robots}
      />
      <main id="page-main" data-component="page-main" data-cms-page="programs" className="overflow-x-hidden">
        <PageHeroSection slug="programs" />
        <ProgramsPageContent cards={cards} growthStages={growthStages} content={content} />
      </main>
    </>
  )
}

function ProgramsPageContent({ cards, growthStages, content }) {
  const cardsSection = content.cards_section
  const growthSection = content.growth_section

  return (
    <>
      <section id="program-cards" data-section="program-cards" className="bg-white py-16 md:py-24 dark:bg-zinc-950">
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>{cardsSection.eyebrow}</span>
            <h2 className={HEADLINE}>{cardsSection.title}</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              {cardsSection.body}
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ Icon, id, title, tagline, description, image, imageAlt, video }, i) => (
              <Reveal
                key={id || title}
                as="article"
                delay={(i % 3) * 80}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative">
                  <ProgramCardMedia
                    image={image}
                    imageAlt={imageAlt}
                    video={video}
                    title={title}
                    aspectClass="aspect-[16/10] transition duration-300 group-hover:scale-[1.02]"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent"
                    aria-hidden="true"
                  />
                  <span className="absolute bottom-3 left-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/90 text-orange-500 shadow-sm backdrop-blur dark:bg-zinc-900/90">
                    <Icon />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-sm font-semibold text-orange-600 dark:text-orange-400">{tagline}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="growth-cycle"
        data-section="growth-cycle"
        className="border-t border-zinc-200 bg-gradient-to-b from-orange-50/80 to-white py-16 md:py-24 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950"
      >
        <div className={CONTAINER}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className={EYEBROW}>{growthSection.eyebrow}</span>
            <h2 className={HEADLINE}>{growthSection.title}</h2>
            <p className="mx-auto max-w-[640px] text-[17px] leading-[1.7] text-zinc-600 dark:text-zinc-400">
              {growthSection.body}
            </p>
          </Reveal>
          <div className="relative mt-12 flex flex-col gap-8 md:flex-row md:gap-6">
            <div
              className="absolute left-0 right-0 top-6 hidden h-[2px] bg-gradient-to-r from-orange-500/40 via-orange-500/40 to-amber-400/40 md:block"
              aria-hidden="true"
            />
            {growthStages.map(({ id, num, stage, title, tagline, description, image, imageAlt, video }, i) => (
              <Reveal
                key={id || num}
                as="article"
                delay={i * 100}
                className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <ProgramCardMedia image={image} imageAlt={imageAlt} video={video} title={title} aspectClass="aspect-[16/9]" />
                <div className="flex flex-1 flex-col p-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">{stage}</p>
                  <span className="relative z-10 mt-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-base font-black text-white">
                    {num}
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-sm font-semibold text-orange-600 dark:text-orange-400">{tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="programs-cta" data-section="programs-cta" className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-10">
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/community"
            className="inline-flex rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-400"
          >
            Apply for Membership
          </Link>
          <Link
            to="/resources"
            className="inline-flex rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-bold text-zinc-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200"
          >
            Learning Resources
          </Link>
        </div>
      </section>
    </>
  )
}
