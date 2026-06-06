import { useCmsPage } from '../../hooks/useCmsPage'
import { useCmsSections } from '../../hooks/useCmsSections'
import { blocksWithoutHero } from '../../lib/cmsBlocks'
import { PageHeroSection } from '../shared/PageHeroSection'
import { CmsPageBlocks } from './CmsBlockRenderer'
import { CmsSectionsRenderer } from './CmsSectionsRenderer'
import { PageMeta } from './PageMeta'

/**
 * Renders CMS blocks, then legacy cms_content sections, then fallback JSX.
 * Fallback body sections are preserved when CMS only has a hero block.
 */
export function CmsPublicPage({ slug, fallback, children }) {
  const { blocks, hasBlocks, hasBodyBlocks, loading, seo } = useCmsPage(slug)
  const { sections, hasSections, loading: sectionsLoading } = useCmsSections(slug)
  const fallbackContent = children || fallback || null
  const bodyBlocks = blocksWithoutHero(blocks)

  if ((loading || sectionsLoading) && !hasBlocks && !hasSections) {
    return fallbackContent
  }

  const meta = (
    <PageMeta title={seo?.title} description={seo?.description} robots={seo?.robots} />
  )

  if (hasBodyBlocks) {
    return (
      <>
        {meta}
        <main id="page-main" data-component="page-main" data-cms-page={slug} className="overflow-x-hidden">
          <PageHeroSection slug={slug} />
          <CmsPageBlocks blocks={bodyBlocks} />
        </main>
      </>
    )
  }

  if (hasSections) {
    return (
      <>
        {meta}
        <main id="page-main" data-component="page-main" data-cms-page={slug} className="overflow-x-hidden">
          <PageHeroSection slug={slug} />
          <CmsSectionsRenderer sections={sections} />
        </main>
      </>
    )
  }

  if (hasBlocks) {
    return (
      <>
        {meta}
        <main id="page-main" data-component="page-main" data-cms-page={slug} className="overflow-x-hidden">
          <PageHeroSection slug={slug} />
          {fallbackContent}
        </main>
      </>
    )
  }

  return (
    <>
      {meta}
      {fallbackContent}
    </>
  )
}
