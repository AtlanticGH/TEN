import { PageMeta } from '../components/cms/PageMeta'
import {
  FireListSection,
  FounderProfileSection,
  LinkPillsSection,
  MarqueeSection,
  SplitBenefitsSection,
  TeamGridSection,
  VisionMissionSection,
} from '../components/cms/marketing/AboutMarketingBlocks'
import { PageHeroSection } from '../components/shared/PageHeroSection'
import { DEFAULT_ABOUT_PAGE_CONTENT } from '../config/aboutContentDefaults'
import { DEFAULT_ABOUT_FOUNDER, DEFAULT_ABOUT_TEAM } from '../config/peopleContentDefaults'
import { useAboutPageContent } from '../hooks/useAboutPageContent'
import { useCmsPage } from '../hooks/useCmsPage'
import { useAboutFounder, useAboutTeam } from '../hooks/usePeopleContent'

export function AboutPage() {
  const { seo } = useCmsPage('about')
  const { data: content = DEFAULT_ABOUT_PAGE_CONTENT } = useAboutPageContent()
  const { data: founder = DEFAULT_ABOUT_FOUNDER } = useAboutFounder()
  const { data: team = DEFAULT_ABOUT_TEAM } = useAboutTeam()

  return (
    <>
      <PageMeta
        title={seo?.title || 'About'}
        description={seo?.description || 'Who we are and why TEN exists.'}
        robots={seo?.robots}
      />
      <main id="page-main" data-component="page-main" data-cms-page="about" className="overflow-x-hidden">
        <PageHeroSection slug="about" />
        <VisionMissionSection vision={content.vision} mission={content.mission} />
        <FireListSection content={content.fire_values} />
        <SplitBenefitsSection content={content.why_join} />
        <FounderProfileSection content={founder} />
        <TeamGridSection content={team} />
        <LinkPillsSection content={{ external_links: content.social_links, buttons: content.cta_buttons }} />
        <MarqueeSection content={{ items: content.marquee_items }} />
      </main>
    </>
  )
}
