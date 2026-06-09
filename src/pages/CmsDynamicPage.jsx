import { Navigate, useParams } from 'react-router-dom'
import { CmsPageBlocks } from '../components/cms/CmsBlockRenderer'
import { PageMeta } from '../components/cms/PageMeta'
import { isReservedPublicSlug } from '../config/reservedSlugs'
import { useCmsPage } from '../hooks/useCmsPage'

/**
 * Renders any published CMS page by slug (Phase C).
 * Static routes in main.jsx take precedence over this route.
 */
export function CmsDynamicPage() {
  const { slug } = useParams()
  const safeSlug = String(slug || '')
  const reserved = !safeSlug || isReservedPublicSlug(safeSlug)
  const { blocks, hasBlocks, loading, seo, isError } = useCmsPage(safeSlug, { enabled: !reserved })

  if (reserved) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    )
  }

  if (isError || !hasBlocks) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <PageMeta title={seo?.title} description={seo?.description} robots={seo?.robots} />
      <main
        id="page-main"
        data-component="page-main"
        data-cms-page={safeSlug}
        className="overflow-x-hidden bg-white dark:bg-zinc-950"
      >
        <CmsPageBlocks blocks={blocks} />
      </main>
    </>
  )
}
