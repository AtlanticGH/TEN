import { InnerPageHero } from '../components/shared/InnerPageHero'
import { ResourceCard } from '../components/resources/ResourceCard'
import { FaqAccordion } from '../components/shared/FaqAccordion'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_RESOURCES_FAQ, RESOURCES_FAQ_KEY } from '../config/faqContentDefaults'
import { useFaqContent } from '../hooks/useFaqContent'
import { listResources } from '../services/resources'

import { CmsPublicPage } from '../components/cms/CmsPublicPage'

export function ResourcesPage() {
  return (
    <CmsPublicPage
      slug="resources"
      fallback={<ResourcesPageContent />}
      fallbackBody={<ResourcesPageBody />}
    />
  )
}

function ResourcesPageContent() {
  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <InnerPageHero
        badge="Resources"
        heading="Practical guides for purposeful growth"
        description="Explore actionable playbooks, templates, and mentorship notes to help you move from idea to measurable progress."
        image=""
      />
      <ResourcesPageBody />
    </main>
  )
}

function ResourcesPageBody() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const { data: faqContent = DEFAULT_RESOURCES_FAQ } = useFaqContent(RESOURCES_FAQ_KEY, DEFAULT_RESOURCES_FAQ)

  useEffect(() => {
    let ignore = false
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listResources({ limit: 200 })
        if (!ignore) setItems(data)
      } catch (err) {
        const msg = err?.message || 'Unable to load resources.'
        if (!ignore) setError(msg)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    queueMicrotask(() => run())
    return () => {
      ignore = true
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set()
    ;(items || []).forEach((r) => {
      const c = String(r.category || '').trim()
      if (c) set.add(c)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  return (
    <>
      <section id="featured-resources" className="mx-auto max-w-7xl px-8 py-14 md:px-12 lg:px-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-orange-400">Featured Resources</p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white md:text-4xl">Learn, apply, and grow consistently</h2>
        </div>
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        ) : loading ? (
          <div className="space-y-6">
            <div className="min-h-[11rem] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-900/40 sm:min-h-[12rem]" />
            <div className="min-h-[11rem] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-900/40 sm:min-h-[12rem]" />
          </div>
        ) : items.length ? (
          <div className="space-y-6">
            {categories.length ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span key={c} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200">
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="flex flex-col gap-6">
              {items.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            No resources published yet.
          </div>
        )}
      </section>

      <FaqAccordion content={faqContent} sectionId="resource-faqs" />
    </>
  )
}

