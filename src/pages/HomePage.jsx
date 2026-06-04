import { CmsPageBlocks } from '../components/cms/CmsBlockRenderer'
import { PageMeta } from '../components/cms/PageMeta'
import { HomeBelowFold } from '../components/home/HomeBelowFold'
import { HomeLegacyHero } from '../components/home/HomeLegacyHero'
import { useCmsPage } from '../hooks/useCmsPage'
import { useHomeHero } from '../hooks/useHomeHero'
import { resolveHomeCmsLayout } from '../lib/homeCmsLayout'

export function HomePage() {
  const { hasBlocks, blocks, loading: cmsLoading, seo, page, layoutMode } = useCmsPage('home')

  if (!cmsLoading && hasBlocks && layoutMode !== 'legacy') {
    const layout = resolveHomeCmsLayout(blocks, page)

    return (
      <>
        <PageMeta title={seo?.title || 'Home'} description={seo?.description} robots={seo?.robots} />
        <main
          id="page-main"
          data-component="page-main"
          data-cms-page="home"
          data-home-layout={layout.mode}
          className="overflow-x-hidden bg-white dark:bg-zinc-950"
        >
          {layout.mode === 'full' ? (
            <CmsPageBlocks blocks={layout.blocks} />
          ) : (
            <>
              {layout.heroBlocks?.length ? <CmsPageBlocks blocks={layout.heroBlocks} /> : null}
              {layout.middleBlocks?.length ? <CmsPageBlocks blocks={layout.middleBlocks} /> : null}
              {layout.showLegacy ? <HomeBelowFold /> : null}
            </>
          )}
        </main>
      </>
    )
  }

  return <HomePageLegacy />
}

function HomePageLegacy() {
  const { heroCopy } = useHomeHero()

  return (
    <>
      <PageMeta title="Home" />
      <main id="page-main" data-component="page-main" className="overflow-x-hidden bg-white dark:bg-zinc-950">
        <HomeLegacyHero heroCopy={heroCopy} />
        <HomeBelowFold />
      </main>
    </>
  )
}
