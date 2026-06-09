import { useQuery } from '@tanstack/react-query'
import { enabledBlocks, hasVisibleBodyBlocks } from '../lib/cmsBlocks'
import { getPublicPage } from '../services/cms/pages'

export function cmsPageQueryOptions(slug, { enabled = true } = {}) {
  return {
    queryKey: ['cms-page', slug],
    enabled: enabled && Boolean(slug),
    queryFn: async () => {
      try {
        return await getPublicPage(slug)
      } catch (err) {
        if (String(err?.message || '').includes('404') || String(err?.message || '').includes('not found')) {
          return null
        }
        throw err
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  }
}

export function useCmsPage(slug, options = {}) {
  const { data, isLoading, isError, error, isFetching } = useQuery(cmsPageQueryOptions(slug, options))
  const blocks = data?.blocks || []
  const activeBlocks = enabledBlocks(blocks)
  const page = data?.page || null
  return {
    page,
    blocks,
    hasBlocks: activeBlocks.length > 0,
    hasBodyBlocks: hasVisibleBodyBlocks(blocks),
    loading: isLoading,
    isRefreshing: isFetching && !isLoading,
    isError,
    error: error?.message || '',
    layoutMode: page?.layout_mode || 'hybrid',
    seo: page
      ? {
          title: page.seo_title || page.title,
          description: page.seo_description || '',
          ogTitle: page.og_title,
          ogDescription: page.og_description,
          ogImage: page.og_image_url,
          canonical: page.canonical_url,
          robots: page.robots,
        }
      : null,
  }
}
