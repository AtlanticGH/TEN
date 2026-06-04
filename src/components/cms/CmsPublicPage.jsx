import { useCmsPage } from '../../hooks/useCmsPage'
import { useCmsSections } from '../../hooks/useCmsSections'
import { blocksWithoutHero } from '../../lib/cmsBlocks'
import { PageHeroSection } from '../shared/PageHeroSection'
import { CmsPageBlocks } from './CmsBlockRenderer'
import { CmsSectionsRenderer } from './CmsSectionsRenderer'
import { PageMeta } from './PageMeta'

/**
 * Renders CMS blocks, then legacy cms_content sections, then fallback JSX.
 * @deprecated Admin: use page builder only. Public sections bridge until migrated to blocks.
 */
export function CmsPublicPage({ slug, fallback, children }) {
  const { blocks, hasBlocks, loading, seo } = useCmsPage(slug)
  const { sections, hasSections, loading: sectionsLoading } = useCmsSections(slug)

  if ((loading || sectionsLoading) && !hasBlocks && !hasSections) {
    return children || fallback || null
  }

  if (hasBlocks) {
    const bodyBlocks = blocksWithoutHero(blocks)
    return (
      <>
        <PageMeta title={seo?.title} description={seo?.description} robots={seo?.robots} />
        <main id="page-main" data-component="page-main" data-cms-page={slug} className="overflow-x-hidden">
          <PageHeroSection slug={slug} />
          {bodyBlocks.length ? <CmsPageBlocks blocks={bodyBlocks} /> : null}
        </main>
      </>
    )
  }

  if (hasSections) {
    return (
      <>
        <PageMeta title={seo?.title} description={seo?.description} robots={seo?.robots} />
        <main id="page-main" data-component="page-main" data-cms-page={slug} className="overflow-x-hidden">
          <PageHeroSection slug={slug} />
          <CmsSectionsRenderer sections={sections} />
        </main>
      </>
    )
  }

  return (
    <>
      <PageMeta title={seo?.title} description={seo?.description} robots={seo?.robots} />
      {children || fallback || null}
    </>
  )
}
