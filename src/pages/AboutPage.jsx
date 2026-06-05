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
import { useAboutPageContent } from '../hooks/useAboutPageContent'
import { useCmsPage } from '../hooks/useCmsPage'
import { useAboutFounder, useAboutTeam } from '../hooks/usePeopleContent'

export function AboutPage() {
  const { seo } = useCmsPage('about')
  const { data: content } = useAboutPageContent()
  const { data: founder } = useAboutFounder()
  const { data: team } = useAboutTeam()

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
        {founder ? <FounderProfileSection content={founder} /> : null}
        {team ? <TeamGridSection content={team} /> : null}
        <LinkPillsSection content={{ external_links: content.social_links, buttons: content.cta_buttons }} />
        <MarqueeSection content={{ items: content.marquee_items }} />
      </main>
    </>
  )
}
